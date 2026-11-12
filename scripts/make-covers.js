#!/usr/bin/env node
/* Cover images of articles, in two steps.

   `covers/<slug>-<lang>.svg` is the committed source: it is written when the
   content is written, reviewed as text in a diff, and never served.
   `src/assets/covers/<slug>-<lang>.png` is the artifact: it is rasterised from
   the SVG by every build and is not committed.

     npm run covers:svg    rewrite the SVG sources from the content
     npm run check:covers  fail if an SVG no longer matches its content
     npm run covers:png    rasterise the SVG of every published article

   The split is deliberate. Laying out text needs no dependency, so the source
   can be checked on the cheapest CI step; rasterising needs a native renderer,
   so only the build pays for it. And because the PNG set comes from
   `lib/content.js`, a scheduled post or a draft has no PNG until the build that
   publishes it — the image, the page, the sitemap entry and the feed entry
   appear together, and a cover of an unpublished article is never reachable.

   Text and colours come from the same sources the page uses: the language
   branch for the words, `lib/dates.js` for the date, `src/_data/i18n/*.json`
   for tag and view labels, `src/assets/*.css` tokens for the palette. */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const contentModel = require("../lib/content");
const { formatDate } = require("../lib/dates");

const ROOT = path.join(__dirname, "..");
const POSTS = path.join(ROOT, "content", "posts");
const SVG_DIR = path.join(ROOT, "covers");
const PNG_DIR = path.join(ROOT, "src", "assets", "covers");

const LANGS = ["ru", "en", "he"];

const WIDTH = 1200;
const HEIGHT = 630;

// Vendored so a cover rasterises the same way on any machine, offline
// (scripts/fonts). Needed by the PNG step only.
const FONTS = [
  "Inter-Regular.ttf",
  "Inter-Bold.ttf",
  "Inter-ExtraBold.ttf",
  "NotoSansHebrew-Regular.ttf",
  "NotoSansHebrew-Bold.ttf",
].map((name) => path.join(__dirname, "fonts", name));

// The palette of each view, copied from src/assets/style.css and dev.css. A
// cover must look like the page it belongs to, so these are the same tokens.
const PALETTE = {
  leader: {
    background: "#f7f8fa",
    text: "#182231",
    muted: "#5f6d80",
    accent: "#2b5fb0",
    rule: "#2b5fb0",
    chip: "rgba(43, 95, 176, 0.09)",
    chipText: "#1f4a91",
  },
  dev: {
    background: "#0f1115",
    text: "#d7dbe2",
    muted: "#9aa1ad",
    accent: "#61afef",
    rule: "#98c379",
    chip: "rgba(97, 175, 239, 0.14)",
    chipText: "#8ecbff",
  },
};

const i18n = Object.fromEntries(
  LANGS.map((lang) => [lang, require(`../src/_data/i18n/${lang}.json`)])
);

const isRtl = (lang) => lang === "he";
const familyOf = (lang) => (isRtl(lang) ? "Noto Sans Hebrew" : "Inter");
const coverName = (slug, lang) => `${slug}-${lang}`;

// Inter and Noto are close enough to estimate from the character set: a wrong
// estimate only moves a line break, and `titleLines` shrinks the type until the
// block fits anyway.
const NARROW = "iljtfrI.,:;'!|()[]-/";
const WIDE = "mwMWШЩЖЮФ№@%";
function measure(text, size, weight) {
  let units = 0;
  for (const char of text) {
    if (char === " ") units += 0.27;
    else if (NARROW.includes(char)) units += 0.33;
    else if (WIDE.includes(char)) units += 0.86;
    else if (/[0-9]/.test(char)) units += 0.6;
    else if (/[\u0590-\u05FF]/.test(char)) units += 0.56;
    else if (/[A-Z\u0400-\u04FF]/.test(char)) units += 0.62;
    else units += 0.55;
  }
  return units * size * (weight >= 800 ? 1.05 : weight >= 700 ? 1.02 : 1);
}

function wrap(text, size, weight, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next, size, weight) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// Three lines is the target, four the limit: a fifth would run into the chips.
function titleLines(text, maxWidth) {
  for (let size = 66; size >= 38; size -= 4) {
    const lines = wrap(text, size, 800, maxWidth);
    if (lines.length <= 3) return { size, lines };
  }
  let size = 38;
  let lines = wrap(text, size, 800, maxWidth);
  while (lines.length > 4) {
    size -= 2;
    lines = wrap(text, size, 800, maxWidth);
  }
  return { size, lines };
}

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function coverSvg(post) {
  const t = PALETTE[post.view];
  const rtl = isRtl(post.lang);
  const family = familyOf(post.lang);
  const x = rtl ? WIDTH - 96 : 96;
  const anchor = rtl ? "end" : "start";

  const { size, lines } = titleLines(post.title, 960);
  const lineHeight = Math.round(size * 1.1);
  const titleTop = 208;
  const titleBottom = titleTop + (lines.length - 1) * lineHeight;

  // Up to three tags; if their labels are long, the chips shrink rather than
  // run off the canvas.
  const labels = post.tagLabels;
  const totalWidth = (chipSize) =>
    labels.reduce((sum, label) => sum + measure(label, chipSize, 600) + 44, 0) +
    14 * (labels.length - 1);
  let chipSize = 26;
  for (const candidate of [26, 24, 22, 20, 18]) {
    chipSize = candidate;
    if (totalWidth(candidate) <= 1008 || candidate === 18) break;
  }
  const chipsY = Math.min(titleBottom + 66, HEIGHT - 190);
  const step = rtl ? -1 : 1;
  let cursor = x;
  const chips = labels
    .map((label) => {
      const width = measure(label, chipSize, 600) + 44;
      const left = step > 0 ? cursor : cursor - width;
      cursor += step * (width + 14);
      return `  <rect x="${left.toFixed(1)}" y="${chipsY}" width="${width.toFixed(1)}" height="52" rx="26" fill="${t.chip}"/>
  <text x="${(left + width / 2).toFixed(1)}" y="${chipsY + 35}" text-anchor="middle" font-family="${family}" font-size="${chipSize}" font-weight="600" fill="${t.chipText}">${escapeXml(label)}</text>`;
    })
    .join("\n");

  const titleSvg = lines
    .map(
      (line, index) =>
        `  <text x="${x}" y="${titleTop + index * lineHeight}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="800" fill="${t.text}">${escapeXml(line)}</text>`
    )
    .join("\n");

  // A date starts with a digit, so its bidi base would be LTR and the Hebrew
  // month would land on the wrong side. RLE/PDF isolate the run.
  const dateText = rtl ? `\u202B${post.dateLabel}\u202C` : post.dateLabel;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${t.background}"/>

  <text x="${x}" y="92" text-anchor="${anchor}" font-family="${family}" font-size="24" font-weight="700" letter-spacing="4" fill="${t.accent}">${escapeXml(post.viewLabel.toUpperCase())}</text>
  <text x="${rtl ? 96 : WIDTH - 96}" y="92" text-anchor="${rtl ? "start" : "end"}" font-family="${family}" font-size="24" font-weight="400" fill="${t.muted}">${escapeXml(dateText)}</text>
  <rect x="${rtl ? WIDTH - 96 - 72 : 96}" y="112" width="72" height="6" rx="3" fill="${t.rule}"/>

${titleSvg}
${chips}

  <text x="${x}" y="${HEIGHT - 74}" text-anchor="${anchor}" font-family="Inter" font-size="24" font-weight="700" fill="${t.accent}">zyatnin.me</text>
  <text x="${x}" y="${HEIGHT - 42}" text-anchor="${anchor}" font-family="Inter" font-size="22" font-weight="400" fill="${t.muted}">${escapeXml(post.path)}</text>
</svg>`;
}

// Every SVG the content implies: one per article and language, drafts and
// scheduled posts included — the source is written together with the text.
function expectedSources() {
  const sources = new Map();
  for (const name of fs.readdirSync(POSTS).filter((file) => file.endsWith(".md")).sort()) {
    const { data } = matter(fs.readFileSync(path.join(POSTS, name), "utf8"));
    for (const lang of LANGS) {
      const branch = (data.translations && data.translations[lang]) || {};
      if (!branch.title) continue;
      sources.set(
        coverName(data.slug, lang),
        coverSvg({
          lang,
          view: data.view,
          title: branch.title,
          dateLabel: formatDate(data.date, lang),
          viewLabel: i18n[lang].views[data.view],
          tagLabels: (data.tags || []).map((tag) => i18n[lang].tags.names[tag]),
          path: `/${lang}/${data.view === "dev" ? "dev/" : ""}blog/${data.slug}/`,
        })
      );
    }
  }
  return sources;
}

const exists = (file) => fs.existsSync(file);
const svgFiles = () => (exists(SVG_DIR) ? fs.readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg")) : []);

function writeSources() {
  fs.mkdirSync(SVG_DIR, { recursive: true });
  const expected = expectedSources();
  const stale = svgFiles().filter((file) => !expected.has(file.replace(/\.svg$/, "")));
  for (const file of stale) fs.rmSync(path.join(SVG_DIR, file));
  let written = 0;
  for (const [name, svg] of expected) {
    const file = path.join(SVG_DIR, `${name}.svg`);
    if (!exists(file) || fs.readFileSync(file, "utf8") !== svg) {
      fs.writeFileSync(file, svg);
      written += 1;
    }
  }
  console.log(
    `Источники обложек: ${expected.size} SVG в covers/, обновлено ${written}, удалено устаревших ${stale.length}`
  );
}

// Runs on the cheap CI step: text layout needs no rasteriser, so staleness is
// caught before the build starts, not by a reviewer wondering why a cover shows
// an old title.
function checkSources() {
  const expected = expectedSources();
  const problems = [];
  for (const [name, svg] of expected) {
    const file = path.join(SVG_DIR, `${name}.svg`);
    if (!exists(file)) problems.push(`covers/${name}.svg отсутствует`);
    else if (fs.readFileSync(file, "utf8") !== svg) problems.push(`covers/${name}.svg устарел относительно контента`);
  }
  for (const file of svgFiles()) {
    if (!expected.has(file.replace(/\.svg$/, ""))) problems.push(`covers/${file} не соответствует ни одному посту`);
  }
  if (problems.length) {
    console.error(`Обложки: ${problems.length} проблема(и):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error("Обновите исходники: npm run covers:svg");
    process.exit(1);
  }
  console.log(`Источники обложек: ok — ${expected.size} SVG соответствуют контенту`);
}

function renderPng() {
  const { Resvg } = require("@resvg/resvg-js");
  // The published set comes from the model, so the gate decides which covers
  // exist — and a cover that is no longer published disappears with it.
  const pages = contentModel.load().pages.filter((page) => page.kind === "posts");
  fs.rmSync(PNG_DIR, { recursive: true, force: true });
  fs.mkdirSync(PNG_DIR, { recursive: true });

  const missing = [];
  let bytes = 0;
  for (const page of pages) {
    const name = coverName(page.slug, page.lang);
    const source = path.join(SVG_DIR, `${name}.svg`);
    if (!exists(source)) {
      missing.push(`covers/${name}.svg`);
      continue;
    }
    const png = new Resvg(fs.readFileSync(source, "utf8"), {
      fitTo: { mode: "width", value: WIDTH },
      font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Inter" },
    })
      .render()
      .asPng();
    fs.writeFileSync(path.join(PNG_DIR, `${name}.png`), png);
    bytes += png.length;
  }

  if (missing.length) {
    console.error(`Обложки: нет исходников для ${missing.length} опубликованных страниц:`);
    for (const file of missing) console.error(`  - ${file}`);
    process.exit(1);
  }
  const done = pages.length;
  console.log(
    `Обложки: ${done} PNG отрендерено (${(bytes / done / 1024).toFixed(0)} КБ в среднем, ` +
      `${(bytes / 1024 / 1024).toFixed(1)} МБ) — src/assets/covers/`
  );
}

const mode = process.argv[2];
if (mode === "svg") writeSources();
else if (mode === "check") checkSources();
else if (mode === "png") renderPng();
else {
  console.error("Использование: node scripts/make-covers.js svg|check|png");
  process.exit(2);
}
