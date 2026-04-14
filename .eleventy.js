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
  eleventyConfig.addFilter("dateDisplay", (dateStr) => {
    if (!dateStr) return "";
    return String(dateStr).split('T')[0].substring(0, 10);
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
