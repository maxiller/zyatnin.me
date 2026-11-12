#!/usr/bin/env node
/* SEO self-check, run after every `eleventy` build.

   Requirement FR-117: SEO artefacts must always reflect the current content.
   The sitemap and feeds are generated from the same Eleventy collections that
   render the pages, so they cannot drift by construction; this script proves
   it for the built output and fails the build otherwise (locally and in CI).

   Checks: sitemap coverage (indexable pages in, noindex pages out), every
   sitemap URL resolves to a file, robots.txt references the sitemap, all six
   Atom feeds exist, every internal href resolves, titles are unique and every
   indexable page carries canonical/description/og:image.

   Plus the article-specific metadata of FR-62, FR-63, FR-69 and FR-126: a post
   page declares `og:type=article` and `article:published_time`, its JSON-LD
   parses to an `Article` whose URL and image agree with the page, and it carries
   a `BreadcrumbList` ending on its own address. */
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
const articlePaths = new Set();

// An article is a post page of either view: /en/blog/<slug>/ or
// /en/dev/blog/<slug>/. The blog index and the tag pages are not articles.
const isArticlePath = (urlPath) => /^\/[a-z]{2}\/(?:dev\/)?blog\/[^/]+\/$/.test(urlPath);

// Every JSON-LD payload of a page, parsed. A template that emits broken JSON is
// a broken page, so a parse failure is an error and not a skipped check.
function structuredData(html, ownPath) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return blocks.flatMap((m) => {
    try {
      return [JSON.parse(m[1])];
    } catch (error) {
      errors.push(`${ownPath}: JSON-LD не разбирается как JSON (${error.message})`);
      return [];
    }
  });
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const ownPath = toUrlPath(file);
  const noindex = /<meta\s+name="robots"[^>]*noindex/i.test(html);
  if (noindex) noindexPaths.add(ownPath);

  const canonical = stripHost((html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [])[1]);
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  const description = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || "";
  const ogImage = (html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) || [])[1] || "";
  const ogType = (html.match(/<meta\s+property="og:type"\s+content="([^"]*)"/i) || [])[1] || "";
  const published = (html.match(/<meta\s+property="article:published_time"\s+content="([^"]+)"/i) || [])[1] || "";
  // A redirect stub keeps the old /{lang}/blog/{slug}/ address, so the path
  // alone does not make a page an article: a noindex stub answers there instead
  // (FR-114), and it carries neither Open Graph nor structured data.
  const article = isArticlePath(ownPath) && !noindex;
  if (article) articlePaths.add(ownPath);

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
    // FR-62: only a post page is an article.
    if (article && ogType !== "article") errors.push(`${ownPath}: og:type «${ogType}» у статьи, ожидается article`);
    if (!article && ogType !== "website") errors.push(`${ownPath}: og:type «${ogType}», ожидается website`);
    // FR-62: og:locale:alternate exists exactly for the translations the page
    // actually has, so the social preview never offers a language that 404s.
    const ownLang = (ownPath.match(/^\/([a-z]{2})\//) || [])[1];
    const translatedLangs = [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((lang) => lang !== "x-default" && lang !== ownLang);
    const altLocales = [...html.matchAll(/<meta\s+property="og:locale:alternate"\s+content="([^"]+)"/g)];
    if (altLocales.length !== translatedLangs.length) {
      errors.push(
        `${ownPath}: og:locale:alternate ${altLocales.length}, а переводов ${translatedLangs.length}`
      );
    }
  }

  // --- structured data (FR-69, FR-126) --------------------------------------
  const blocks = structuredData(html, ownPath);
  const ldArticle = blocks.find((b) => b && b["@type"] === "Article");
  const ldBreadcrumbs = blocks.find((b) => b && b["@type"] === "BreadcrumbList");

  if (article) {
    if (!published) errors.push(`${ownPath}: нет article:published_time`);
    if (!ldArticle) {
      errors.push(`${ownPath}: нет JSON-LD Article`);
    } else {
      for (const field of ["headline", "description", "datePublished", "dateModified", "inLanguage", "url", "image"]) {
        if (!ldArticle[field]) errors.push(`${ownPath}: JSON-LD Article без «${field}»`);
      }
      if (!ldArticle.author || !ldArticle.author.name) errors.push(`${ownPath}: JSON-LD Article без автора`);
      if (!ldArticle.publisher || !ldArticle.publisher.name) errors.push(`${ownPath}: JSON-LD Article без publisher`);
      if (ldArticle.url && stripHost(ldArticle.url) !== ownPath) {
        errors.push(`${ownPath}: JSON-LD url ${ldArticle.url} ведёт не на эту страницу`);
      }
      if (ldArticle.image && !fileForPath(stripHost(ldArticle.image))) {
        errors.push(`${ownPath}: JSON-LD image ${ldArticle.image} не найден в сборке`);
      }
    }
    if (!ldBreadcrumbs) {
      errors.push(`${ownPath}: нет JSON-LD BreadcrumbList`);
    } else {
      const items = Array.isArray(ldBreadcrumbs.itemListElement) ? ldBreadcrumbs.itemListElement : [];
      const last = items[items.length - 1];
      if (items.length < 2) errors.push(`${ownPath}: BreadcrumbList короче двух элементов`);
      else if (!last || stripHost(last.item) !== ownPath) {
        errors.push(`${ownPath}: последняя крошка BreadcrumbList ведёт не на эту страницу`);
      }
    }
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
  `${noindexPaths.size} noindex, ${articlePaths.size} статей с JSON-LD, 6 лент, ` +
  `все ссылки и метаданные целы.`
);