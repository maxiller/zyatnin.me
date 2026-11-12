/* Page data for one content page.

   `src/content-page.njk` paginates over `content.pages`, so every page it writes
   is one language branch of one content file (`entry`). The page data below is
   that entry: the layouts keep reading plain `title`, `date`, `tags`, `order`…
   and are unaware that a page is now generated instead of being a file. */

const i18nByLang = {
  ru: require("./_data/i18n/ru.json"),
  en: require("./_data/i18n/en.json"),
  he: require("./_data/i18n/he.json"),
};

// Entry fields that become page data under the same name.
const FIELDS = [
  "title",
  "excerpt",
  "description",
  "date",
  "updated",
  "tags",
  "slug",
  // "posts" or "projects": templates need it to tell an article from a project
  // page (article Open Graph type, structured data).
  "kind",
  "view",
  "order",
  "status",
  "icon",
  "points",
  "cover",
];

module.exports = {
  eleventyComputed: {
    // The interface strings of the entry's language, which other pages get from
    // their language directory (`src/{lang}/{lang}.11tydata.js`).
    i18n: (data) => i18nByLang[data.entry.lang],
    // The view picks the frame (leader desk / IDE), the kind picks the article
    // or project layout.
    layout: (data) =>
      `layouts/${data.entry.view === "dev" ? "dev/" : ""}${
        data.entry.kind === "projects" ? "project" : "post"
      }.njk`,
    ...Object.fromEntries(FIELDS.map((field) => [field, (data) => data.entry[field]])),
  },
};
