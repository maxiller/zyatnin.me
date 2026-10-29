// Atom feeds: one per (language × view) pair — /{lang}/feed.xml for the
// leader view and /{lang}/dev/feed.xml for the dev view. Consumed by
// src/feed.njk via pagination. Titles mirror the <link rel="alternate">
// declarations in both layouts, so a feed name never drifts from its link.
const i18n = {
  ru: require("./i18n/ru.json"),
  en: require("./i18n/en.json"),
  he: require("./i18n/he.json")
};

const langs = ["ru", "en", "he"];
const views = [
  { id: "leader", dir: "" },
  { id: "dev", dir: "dev/" }
];

module.exports = langs.flatMap((lang) =>
  views.map((view) => ({
    lang,
    view: view.id,
    path: `/${lang}/${view.dir}`,
    title: `${i18n[lang].name} — ${i18n[lang].views[view.id]}`,
    author: i18n[lang].name
  }))
);