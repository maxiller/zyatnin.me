const markdownIt = require("markdown-it");
const { EleventyI18nPlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
  // i18n plugin
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "ru",
  });

  // Markdown with HTML passthrough
  const md = markdownIt({ html: true, linkify: true, typographer: true });
  eleventyConfig.setLibrary("md", md);

  // Passthrough assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Custom filters
  // Dates arrive as Date objects (gray-matter parses YAML dates) or ISO strings.
  // Format in UTC so a YYYY-MM-DD date never shifts to the neighbouring day.
  const dateLocales = { ru: "ru-RU", en: "en-GB", he: "he-IL" };
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

  // filterByTopic filter
  eleventyConfig.addFilter("filterByTopic", (arr, topic) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(p => p.data && p.data.topic === topic);
  });

  // Collections: posts per language, sorted by date desc
  for (const lang of ["ru", "en", "he"]) {
    eleventyConfig.addCollection(`posts_${lang}`, function(collectionApi) {
      return collectionApi.getFilteredByGlob(`src/${lang}/posts/*.md`)
        .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
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
