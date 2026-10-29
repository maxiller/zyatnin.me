#!/usr/bin/env node
/* SEO self-check, run after every `eleventy` build.

   Requirement FR-117: SEO artefacts must always reflect the current content.
   The sitemap and feeds are generated from the same Eleventy collections that
   render the pages, so they cannot drift by construction; this script proves
   it for the built output and fails the build otherwise (locally and in CI).

   Checks: sitemap coverage (indexable pages in, noindex pages out), every
   sitemap URL resolves to a file, robots.txt references the sitemap, all six
   Atom feeds exist, every internal href resolves, titles are unique and every
   indexable page carries canonical/description/og:image. */
"use strict";

const fs = require("fs");
const path = require("path");

const SITE = "_site";
const errors = [];

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function toUrlPath(file) {
  const rel = path.relative(SITE, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  return "/" + rel.replace(/index\.html$/, "");
}

function stripHost(url) {
  return String(url || "").replace(/^https?:\/\/[^/]+/i, "");
}

function fileForPath(urlPath) {
  const rel = urlPath.replace(/^\//, "");
  const direct = path.join(SITE, rel);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const asDir = path.join(SITE, rel, "index.html");
  return fs.existsSync(asDir) ? asDir : null;
}

const files = walk(SITE, []);
const htmlFiles = files.filter(f => f.endsWith(".html"));

// --- sitemap ---------------------------------------------------------------
const sitemapFile = path.join(SITE, "sitemap.xml");
if (!fs.existsSync(sitemapFile)) {
  errors.push("sitemap.xml отсутствует в сборке");
}
const sitemapPaths = new Set(
  (fs.existsSync(sitemapFile) ? fs.readFileSync(sitemapFile, "utf8") : "")
    .match(/<loc>[^<]+<\/loc>/g)
    ?.map(m => stripHost(m.replace(/<\/?loc>/g, ""))) || []
);
if (!sitemapPaths.size) errors.push("sitemap.xml не содержит ни одного <loc>");

// --- robots.txt ------------------------------------------------------------
const robotsFile = path.join(SITE, "robots.txt");
const robots = fs.existsSync(robotsFile) ? fs.readFileSync(robotsFile, "utf8") : "";
if (!/Sitemap:\s*https:\/\//i.test(robots)) {
  errors.push("robots.txt отсутствует или не содержит строку Sitemap:");
}

// --- per-page metadata -----------------------------------------------------
const titles = new Map();
const descriptions = new Map();
const noindexPaths = new Set();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const ownPath = toUrlPath(file);
  const noindex = /<meta\s+name="robots"[^>]*noindex/i.test(html);
  if (noindex) noindexPaths.add(ownPath);

  const canonical = stripHost((html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [])[1]);
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  const description = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || "";
  const ogImage = (html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) || [])[1] || "";

  if (sitemapPaths.has(ownPath) && noindex) {
    errors.push(`${ownPath}: noindex-страница присутствует в sitemap`);
  }

  if (!noindex) {
    if (!canonical) errors.push(`${ownPath}: нет canonical`);
    else if (!sitemapPaths.has(canonical)) errors.push(`${ownPath}: canonical ${canonical} отсутствует в sitemap`);
    if (description.trim().length < 10) errors.push(`${ownPath}: пустое или короткое meta description`);
    else if (descriptions.has(description)) errors.push(`${ownPath}: дублирующееся description (ещё у ${descriptions.get(description)})`);
    else descriptions.set(description, ownPath);
    if (!ogImage) errors.push(`${ownPath}: нет og:image`);
    else if (!fileForPath(stripHost(ogImage))) errors.push(`${ownPath}: og:image ${ogImage} не найден в сборке`);
    if (!title.trim()) errors.push(`${ownPath}: пустой <title>`);
    else if (titles.has(title)) errors.push(`${ownPath}: дублирующийся title «${title}» (ещё у ${titles.get(title)})`);
    else titles.set(title, ownPath);
  }

  // --- internal links ------------------------------------------------------
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1].split("#")[0].split("?")[0];
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("data:")) continue;
    if (!href.startsWith("/")) continue; // relative hrefs are not used by the templates
    if (!fileForPath(stripHost(href))) errors.push(`${ownPath}: битая ссылка ${href}`);
  }
}

// --- sitemap URLs resolve --------------------------------------------------
for (const urlPath of sitemapPaths) {
  if (!fileForPath(urlPath)) errors.push(`sitemap: ${urlPath} не соответствует файлу сборки`);
}

// --- feeds -----------------------------------------------------------------
for (const lang of ["ru", "en", "he"]) {
  for (const dir of ["", "dev/"]) {
    const feed = path.join(SITE, lang, dir, "feed.xml");
    const rel = `${lang}/${dir}feed.xml`;
    if (!fs.existsSync(feed)) {
      errors.push(`нет Atom-ленты ${rel}`);
      continue;
    }
    const body = fs.readFileSync(feed, "utf8");
    if (!body.includes("</feed>")) errors.push(`${rel}: лента не завершена (</feed> отсутствует)`);
    if (!/<entry>/.test(body)) errors.push(`${rel}: лента не содержит записей`);
  }
}

// --- report ----------------------------------------------------------------
if (errors.length) {
  console.error(`SEO self-check: ${errors.length} проблема(и):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `SEO self-check: ok — ${htmlFiles.length} страниц, ${sitemapPaths.size} URL в sitemap, ` +
  `${noindexPaths.size} noindex, 6 лент, все ссылки и метаданные целы.`
);