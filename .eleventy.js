const markdownIt = require("markdown-it");
const { EleventyI18nPlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
  // i18n plugin
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "ru",
  });

  // Markdown with HTML passthrough
  const md = markdownIt({ html: true, linkify: true, typographer: true });

  // Fenced ```mermaid blocks get a class on their <pre> so the view stylesheets
  // can drop the code-block chrome (dark background, border, padding) and let the
  // drawn diagram sit directly on the page background. Marking happens at build
  // time; rendering itself is done by the lazy mermaid loader in app.js.
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const output = defaultFence
      ? defaultFence(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options);
    const info = String(tokens[idx].info || "").trim().split(/\s+/)[0];
    return info === "mermaid" ? output.replace("<pre>", '<pre class="diagram-block">') : output;
  };

  eleventyConfig.setLibrary("md", md);

  // Passthrough assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Custom filters
  // Dates arrive as Date objects (gray-matter parses YAML dates) or ISO strings.
  // Format in UTC so a YYYY-MM-DD date never shifts to the neighbouring day.
  const dateLocales = { ru: "ru-RU", en: "en-GB", he: "he-IL" };

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
  eleventyConfig.addFilter("dateDisplay", (dateVal, lang = "en") => {
    if (!dateVal) return "";
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    if (isNaN(d)) return "";
    return new Intl.DateTimeFormat(dateLocales[lang] || lang, {
      day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
    }).format(d);
  });

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
  for (const lang of ["ru", "en", "he"]) {
    eleventyConfig.addCollection(`posts_${lang}`, function(collectionApi) {
      return collectionApi.getFilteredByGlob(`src/${lang}/posts/*.md`)
        .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    });
  }

  // Collections: projects per language, sorted by explicit front matter order
  for (const lang of ["ru", "en", "he"]) {
    eleventyConfig.addCollection(`projects_${lang}`, function(collectionApi) {
      return collectionApi.getFilteredByGlob(`src/${lang}/projects/*.md`)
        .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
    });
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
