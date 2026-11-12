const { EleventyI18nPlugin } = require("@11ty/eleventy");
const contentModel = require("./lib/content");
const { previewing } = require("./lib/published");
const { formatDate } = require("./lib/dates");

module.exports = function(eleventyConfig) {
  // i18n plugin
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "ru",
  });

  // Markdown: the same renderer renders template Markdown and the language
  // branches of content files (lib/markdown.js).
  eleventyConfig.setLibrary("md", require("./lib/markdown"));

  // Passthrough assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Content files are data, not templates: the parsed model is rebuilt whenever
  // one of them changes.
  eleventyConfig.addWatchTarget("content/");

  // A preview serves scheduled posts and drafts while `npm run build` does not
  // (FR-91). Say it out loud: the extra pages otherwise look like a broken
  // publication gate.
  if (previewing()) {
    console.log(
      "[preview] видны отложенные статьи и черновики; сборка (npm run build) их не пишет"
    );
  }

  // Custom filters
  // Dates arrive as Date objects (gray-matter parses YAML dates) or ISO strings.
  // lib/dates.js formats them in UTC, for the pages and for cover images alike.

  // ISO week label for cards: "2026-W14". Computed in UTC so a date stored as
  // UTC midnight keeps its ISO week regardless of the local timezone.
  eleventyConfig.addFilter("dateWeek", (dateVal) => {
    if (!dateVal) return "";
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    if (isNaN(d)) return "";
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = t.getUTCDay() || 7; // Mon=1 … Sun=7
    t.setUTCDate(t.getUTCDate() + 4 - day); // shift to the ISO week's Thursday
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
    return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  });
  eleventyConfig.addFilter("dateDisplay", (dateVal, lang = "en") => formatDate(dateVal, lang));

  eleventyConfig.addFilter("readingTime", (content) => {
    const words = (content || "").replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.ceil(words / 200);
  });

  // limit filter (alternative to slice)
  eleventyConfig.addFilter("limit", (arr, n) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, n);
  });

  // Language code from a URL path ("/ru/blog/x/" -> "ru"), defaulting to "en"
  eleventyConfig.addFilter("langFromPath", (url) => {
    const m = typeof url === "string" ? url.match(/^\/(ru|en|he)(\/|$)/) : null;
    return m ? m[1] : "en";
  });

  // byView filter: keep only entries that have content for the given view
  // ("leader" or "dev"). Entries without a `view` field are shown in no view.
  eleventyConfig.addFilter("byView", (arr, view) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(p => p.data && p.data.view === view);
  });

  // byTag filter: entries carrying the tag key in their `tags` front matter.
  eleventyConfig.addFilter("byTag", (arr, tag) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(p => Array.isArray(p.data && p.data.tags) && p.data.tags.includes(tag));
  });

  // altUrl: URL of this page in another language, or "" when no translation
// exists. Used for <link rel="alternate" hreflang>, which must only point at
// real pages (these are absolute URLs, so the build-time link check does not
// see them).
eleventyConfig.addFilter("altUrl", (pages, url, targetLang) => {
  if (typeof url !== "string") return "";
  const m = url.match(/^\/(ru|en|he)\//);
  if (!m) return "";
  const target = `/${targetLang}/` + url.slice(m[0].length);
  return Array.isArray(pages) && pages.some(p => p && p.url === target) ? target : "";
});

// switchLangUrl: language-switcher target. The same page when its translation
// exists, otherwise that language's section index and finally its home page,
// so the switcher never links to a missing page (FR-07).
eleventyConfig.addFilter("switchLangUrl", (pages, url, targetLang) => {
  if (typeof url !== "string") return `/${targetLang}/`;
  const m = url.match(/^\/(ru|en|he)\//);
  const rest = m ? url.slice(m[0].length) : "";
  const target = `/${targetLang}/${rest}`;
  if (Array.isArray(pages) && pages.some(p => p && p.url === target)) return target;
  if (rest.startsWith("dev/blog/")) return `/${targetLang}/dev/blog/`;
  if (rest.startsWith("blog/")) return `/${targetLang}/blog/`;
  if (rest.startsWith("dev/")) return `/${targetLang}/dev/`;
  return `/${targetLang}/`;
});

// switchViewUrl: URL of the same page in the other view ("leader" <-> "dev").
  // A target page "exists" only when it carries that view's content (its `view`
  // front matter matches), so redirect stubs and index pages never confuse it.
  // Falls back to the other view's blog index or home when the exact page
  // has no content there, so the switcher never links to a 404.
  eleventyConfig.addFilter("switchViewUrl", (pages, url, lang, targetView) => {
    if (typeof url !== "string") return "/";
    const langPrefix = `/${lang}/`;
    const devPrefix = `${langPrefix}dev/`;
    const isDev = url.startsWith(devPrefix);
    const rest = isDev ? url.slice(devPrefix.length) : url.slice(langPrefix.length);
    const base = targetView === "dev" ? devPrefix : langPrefix;
    const target = base + rest;
    const exists = Array.isArray(pages) &&
      pages.some(p => p && p.url === target && p.data && p.data.view === targetView);
    if (exists) return target;
    // Index pages of both views always exist; deep pages fall back.
    if (rest === "" || rest === "blog/") return target;
    if (rest.startsWith("blog/")) return `${base}blog/`;
    return base;
  });

  // ISO 8601 date (YYYY-MM-DD) for sitemap <lastmod>
  eleventyConfig.addFilter("isoDate", (dateVal) => {
    if (!dateVal) return "";
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    return isNaN(d) ? "" : d.toISOString().slice(0, 10);
  });

  // Full ISO 8601 datetime for Atom feeds and JSON-LD
  eleventyConfig.addFilter("isoDateTime", (dateVal) => {
    if (!dateVal) return "";
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    return isNaN(d) ? "" : d.toISOString();
  });

  // JSON serialization for JSON-LD blocks. Escapes <, > and & so the payload
  // can never terminate the surrounding <script> element.
  eleventyConfig.addFilter("toJson", (value) =>
    JSON.stringify(value)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026"));

  // Newest entry date of a list, for the Atom <updated> element.
  // An empty feed reports the build time, which is what "regenerated now" means.
  eleventyConfig.addFilter("feedUpdated", (arr) => {
    const times = (Array.isArray(arr) ? arr : [])
      .map(p => new Date((p.data && p.data.date) || 0).getTime())
      .filter(t => !isNaN(t) && t > 0);
    if (!times.length) return new Date().toISOString();
    return new Date(Math.max(...times)).toISOString();
  });

  // Collections: posts per language, sorted by date desc
  const toItem = (page) => ({
    url: page.url,
    date: page.date,
    data: {
      title: page.title,
      excerpt: page.excerpt,
      description: page.description,
      date: page.date,
      updated: page.updated,
      tags: page.tags,
      slug: page.slug,
      view: page.view,
      lang: page.lang,
      kind: page.kind,
      order: page.order,
      status: page.status,
      icon: page.icon,
      points: page.points,
    },
  });

  for (const lang of contentModel.LANGS) {
    // Posts of a language, newest first (AR-05, FR-22).
    eleventyConfig.addCollection(`posts_${lang}`, () =>
      contentModel.load().pages
        .filter((page) => page.kind === "posts" && page.lang === lang)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(toItem)
    );

    // Projects of a language, in the order given by `order` (FR-105).
    eleventyConfig.addCollection(`projects_${lang}`, () =>
      contentModel.load().pages
        .filter((page) => page.kind === "projects" && page.lang === lang)
        .sort((a, b) => a.order - b.order)
        .map(toItem)
    );
  }

  // Tag navigation. A post's `tags` are keys of the tag vocabulary; the labels
  // come from `tags.names` of the current language. A tag label must always
  // lead to a page that lists the posts carrying it, so one page exists per
  // (language × view × tag actually used) triple, and lib/content.js is the only
  // place that decides their URLs (FR-119, FR-120).
  const tagUrl = (lang, view, tag) => contentModel.tagUrl(view, lang, tag);
  eleventyConfig.addFilter("tagUrl", tagUrl);

  for (const lang of contentModel.LANGS) {
    for (const view of contentModel.VIEWS) {
      eleventyConfig.addCollection(`tagPages_${lang}_${view}`, () =>
        contentModel
          .load()
          .tagPages.filter((tag) => tag.lang === lang && tag.view === view)
      );
    }
  }

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
