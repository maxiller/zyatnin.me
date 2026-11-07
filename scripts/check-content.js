#!/usr/bin/env node
/* Content integrity self-check, run before `eleventy` from `npm run build`.

   Eleventy and the SEO check say nothing about the mistakes this catches:
   an i18n key that exists only in one language, a template reading a key from
   the other view's branch, and a CSS block that is not closed (browsers then
   swallow every rule after the mistake, which is silent on the page).

   Checks:
   - `ru`, `en`, `he` have identical i18n key trees;
   - every `i18n.<path>` used by a template exists in all three languages;
   - view templates read only their own branch (`leader.*` / `dev.*`) plus the
     shared root keys;
   - every CSS rule is closed and no rule body opens with another selector. */
"use strict";

const fs = require("fs");
const path = require("path");

const LANGS = ["ru", "en", "he"];
const errors = [];

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const i18n = Object.fromEntries(LANGS.map((l) => [l, readJson(`src/_data/i18n/${l}.json`)]));

// --- i18n key trees ---------------------------------------------------------
function keyPaths(node, prefix = "") {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return [prefix];
  return Object.keys(node).flatMap((k) => keyPaths(node[k], prefix ? `${prefix}.${k}` : k));
}

const keySets = Object.fromEntries(LANGS.map((l) => [l, new Set(keyPaths(i18n[l]))]));
for (const lang of LANGS.slice(1)) {
  const missing = [...keySets.ru].filter((k) => !keySets[lang].has(k));
  const extra = [...keySets[lang]].filter((k) => !keySets.ru.has(k));
  for (const k of missing) errors.push(`i18n: ключ ${k} есть в ru, но нет в ${lang}`);
  for (const k of extra) errors.push(`i18n: ключ ${k} есть в ${lang}, но нет в ru`);
}

const hasKey = (tree, dotted) =>
  dotted.split(".").every((part) => {
    if (tree === null || typeof tree !== "object" || !(part in tree)) return false;
    tree = tree[part];
    return true;
  });

// --- templates --------------------------------------------------------------
const templates = walk("src", []).filter((f) => f.endsWith(".njk") || f.endsWith(".md"));

// A template belongs to the dev view when it lives in a dev/ directory of a
// language or of the includes tree; everything else is the leader view (or a
// shared page such as 404, feeds or the root redirect).
const isDevTemplate = (f) => /\/dev\//.test(f) || f.includes(path.join("includes", "layouts", "dev"));

for (const file of templates) {
  const source = fs.readFileSync(file, "utf8");
  const dev = isDevTemplate(file);
  for (const match of source.matchAll(/i18n\.([A-Za-z0-9_.]+)/g)) {
    const key = match[1].replace(/\.$/, "");
    if (!key) continue;
    for (const lang of LANGS) {
      if (!hasKey(i18n[lang], key)) errors.push(`${file}: строка i18n.${key} отсутствует в ${lang}.json`);
    }
    // Branch discipline: a view's template must not read the other view's
    // strings — that is exactly the coupling the branches exist to prevent.
    if (dev && key.startsWith("leader.")) {
      errors.push(`${file}: шаблон вида «Инженер» читает строку вида «Лидер» i18n.${key}`);
    }
    if (!dev && key.startsWith("dev.")) {
      errors.push(`${file}: шаблон вида «Лидер» читает строку вида «Инженер» i18n.${key}`);
    }
  }
}

// --- CSS structure ----------------------------------------------------------
const cssFiles = walk("src/assets", []).filter((f) => f.endsWith(".css"));
const selectorLine = /^\s*[^@\s][^{}]*\{\s*$/; // "a.selector {" without braces inside

for (const file of cssFiles) {
  const source = fs
    .readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "") // comments
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");

  let depth = 0;
  let line = 0;
  for (const ch of source) {
    if (ch === "\n") line++;
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth < 0) {
      errors.push(`${file}:${line}: лишняя закрывающая скобка`);
      depth = 0;
    }
  }
  if (depth !== 0) errors.push(`${file}: ${depth} незакрытых блок(ов) — все правила после ошибки не применятся`);

  // A selector line directly followed by another selector line means a rule
  // body that opens with a selector: the previous rule was never closed.
  const lines = source.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    if (!selectorLine.test(lines[i])) continue;
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;
    if (j < lines.length && selectorLine.test(lines[j])) {
      errors.push(`${file}:${i + 1}: за правилом «${lines[i].trim()}» сразу идёт селектор — блок не закрыт`);
    }
  }
}

// --- report -----------------------------------------------------------------
if (errors.length) {
  console.error(`Content self-check: ${errors.length} проблема(и):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `Content self-check: ok — ${keySets.ru.size} ключей i18n × ${LANGS.length} языка, ` +
    `${templates.length} шаблонов, ${cssFiles.length} CSS-файлов.`
);
