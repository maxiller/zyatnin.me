/* Content model: one file per page, three language branches inside it.

   A page — a post or a project — lives in exactly one file:

     content/posts/<slug>.md
     content/projects/<slug>.md

   The YAML front matter holds the metadata: the fields that are the same in every
   language (`slug`, `view`, post `date` and `tags`, project `order`/`status`/
   `icon`, optional `draft`/`updated`). Everything a translator can change lives in
   the `translations` bush with one branch per language, and the Markdown body
   after the front matter is cut into the same three branches by
   `<!-- lang:xx -->` markers:

     ---
     slug: container-image-consistency
     view: dev
     date: 2025-12-01
     tags: [containers, ci-cd]
     translations:
       ru: { title: "…", excerpt: "…" }
       en: { title: "…", excerpt: "…" }
       he: { title: "…", excerpt: "…" }
     ---

     <!-- lang:ru -->
     Russian body

     <!-- lang:en -->
     English body

     <!-- lang:he -->
     Hebrew body

   Writing a page once means a shared field cannot drift between languages: a
   project's `status` or a post's `tags` is edited in one place, and the shared
   `slug`/`view`/`date`/`order` exist once instead of three times. The three
   language branches stay mandatory — the build fails if one is missing.

   This module is the single source of truth for the model: it parses and
   validates the files, renders the Markdown, applies the publication gate and
   derives the URL of every page. `.eleventy.js` only wires the result into
   collections and `src/content-page.njk` renders the pages. */

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const md = require("./markdown");
const { isPublished } = require("./published");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");

const LANGS = ["ru", "en", "he"];
const VIEWS = ["leader", "dev"];

// URL segment of a view inside a language, and of a page kind inside a view.
const VIEW_DIRS = { leader: "", dev: "dev/" };
const KIND_DIRS = { posts: "blog", projects: "projects" };

// Page URL: /ru/blog/x/, /ru/dev/blog/x/, /ru/projects/x/, /ru/dev/projects/x/
// (DR-07, DR-12). Derived from slug and view, so it cannot disagree with them.
const pageUrl = (kind, view, lang, slug) =>
  `/${lang}/${VIEW_DIRS[view]}${KIND_DIRS[kind]}/${slug}/`;

// Tag page URL: /ru/tags/x/ or /ru/dev/tags/x/ (FR-120).
const tagUrl = (view, lang, tag) => `/${lang}/${VIEW_DIRS[view]}tags/${tag}/`;

const i18n = Object.fromEntries(
  LANGS.map((lang) => [lang, require(`../src/_data/i18n/${lang}.json`)])
);

// Metadata (shared by all languages) and translated fields of each page kind.
// `tags` means two things on purpose, as in the templates: for a post they are
// vocabulary keys that lead to tag pages, for a project they are display labels
// of the technologies used.
const KINDS = {
  posts: {
    metadata: { required: ["slug", "view", "date", "tags"], optional: ["draft", "updated"] },
    translated: { required: ["title", "excerpt"], optional: ["description", "cover"] },
  },
  projects: {
    metadata: { required: ["slug", "view", "order", "icon"], optional: ["status"] },
    translated: { required: ["title", "excerpt", "tags"], optional: ["points"] },
  },
};

const SECTION_MARKER = /^<!--\s*lang:([A-Za-z-]+)\s*-->[ \t]*$/gm;
const SLUG = /^[a-z0-9-]+$/;

// The Markdown body is one document per language, separated by the markers. Text
// before the first marker would belong to no language and is reported instead of
// silently dropped.
function splitBody(body) {
  const sections = {};
  const problems = [];
  const markers = [...body.matchAll(SECTION_MARKER)];
  const preamble = body.slice(0, markers.length ? markers[0].index : body.length).trim();
  if (preamble) {
    problems.push("текст перед первым маркером <!-- lang:xx --> не относится ни к одному языку");
  }
  markers.forEach((marker, i) => {
    const lang = marker[1].toLowerCase();
    if (!LANGS.includes(lang)) {
      problems.push(`неизвестный язык в маркере тела: "${marker[1]}" (ожидаются ${LANGS.join(", ")})`);
      return;
    }
    if (lang in sections) {
      problems.push(`ветвь тела "${lang}" повторяется`);
      return;
    }
    const start = marker.index + marker[0].length;
    const end = i + 1 < markers.length ? markers[i + 1].index : body.length;
    sections[lang] = body.slice(start, end).trim();
  });
  return { sections, problems };
}

function parsePage(kind, file, state) {
  const rel = path.relative(ROOT, file);
  const fail = (message) => state.errors.push(`${rel}: ${message}`);
  const spec = KINDS[kind];
  const { data, content } = matter(fs.readFileSync(file, "utf8"));

  // --- metadata: fields shared by every language ----------------------------
  // `translations` holds the language branches and is validated below.
  const knownMeta = [...spec.metadata.required, ...spec.metadata.optional, "translations"];
  for (const key of Object.keys(data)) {
    if (!knownMeta.includes(key)) {
      fail(`неизвестное поле метаданных "${key}" (допустимы: ${knownMeta.join(", ")})`);
    }
  }
  for (const key of spec.metadata.required) {
    if (data[key] === undefined || data[key] === null || data[key] === "") {
      fail(`нет обязательного поля метаданных "${key}"`);
    }
  }

  const slug = data.slug;
  if (typeof slug === "string" && !SLUG.test(slug)) {
    fail(`slug "${slug}" не соответствует шаблону [a-z0-9-]+`);
  }
  if (typeof slug === "string" && slug !== path.basename(file, ".md")) {
    fail(`slug "${slug}" не совпадает с именем файла`);
  }
  if (data.view !== undefined && !VIEWS.includes(data.view)) {
    fail(`view "${data.view}" — ожидается leader или dev`);
  }

  if (kind === "posts") {
    // FR-123: a post cannot be scheduled without a usable date, and failing the
    // build is the only signal a static site can give.
    const time = new Date(data.date).getTime();
    if (data.date !== undefined && isNaN(time)) {
      fail(`date "${data.date}" не разбирается как дата (ожидается YYYY-MM-DD)`);
    }
    const tags = data.tags;
    if (tags !== undefined) {
      if (!Array.isArray(tags) || tags.length < 1 || tags.length > 3) {
        fail("FR-118 — ожидается от 1 до 3 ключей меток в tags");
      } else {
        for (const tag of tags) {
          const missing = LANGS.filter((lang) => !i18n[lang].tags.names[tag]);
          if (!SLUG.test(tag)) fail(`метка "${tag}" должна иметь вид [a-z0-9-]+`);
          if (missing.length) fail(`метка "${tag}" отсутствует в tags.names (${missing.join(", ")})`);
        }
      }
    }
  }

  if (kind === "projects") {
    if (data.order !== undefined) {
      if (!Number.isInteger(data.order) || data.order < 1) {
        fail(`order "${data.order}" должен быть целым числом больше нуля`);
      } else if (state.orders.has(data.order)) {
        fail(`order ${data.order} уже занят проектом "${state.orders.get(data.order)}"`);
      } else {
        state.orders.set(data.order, slug);
      }
    }
    if (data.status !== undefined && !["done", "in_progress"].includes(data.status)) {
      fail(`status "${data.status}" — ожидается done или in_progress`);
    }
  }

  // --- translations: the three language branches ----------------------------
  const translations = data.translations;
  if (!translations || typeof translations !== "object") {
    fail("нет куста translations с тремя языковыми ветвями");
  } else {
    for (const key of Object.keys(translations)) {
      if (!LANGS.includes(key)) {
        fail(`лишняя ветвь translations."${key}" (ожидаются ${LANGS.join(", ")})`);
      }
    }
    for (const lang of LANGS) {
      const branch = translations[lang];
      if (!branch || typeof branch !== "object") {
        fail(`в translations нет ветви "${lang}"`);
        continue;
      }
      const known = [...spec.translated.required, ...spec.translated.optional];
      for (const key of Object.keys(branch)) {
        if (!known.includes(key)) fail(`неизвестное поле перевода "${lang}.${key}"`);
      }
      for (const key of spec.translated.required) {
        if (branch[key] === undefined || branch[key] === null || branch[key] === "") {
          fail(`нет обязательного поля перевода "${lang}.${key}"`);
        }
      }
    }
  }

  // --- body: one Markdown branch per language -------------------------------
  const { sections, problems } = splitBody(content);
  for (const problem of problems) fail(problem);
  for (const lang of LANGS) {
    if (!(lang in sections)) {
      fail(`нет ветви тела для языка "${lang}" (ожидается маркер <!-- lang:${lang} -->)`);
    }
  }

  // --- per-language field rules ---------------------------------------------
  for (const lang of LANGS) {
    const branch = (translations && translations[lang]) || {};
    const where = `translations.${lang}`;
    // DR-08: the excerpt is the card text and the meta description.
    if (kind === "posts" && typeof branch.excerpt === "string") {
      const length = [...branch.excerpt].length;
      if (length < 40 || length > 200) {
        fail(`${where}.excerpt: ${length} символов, допустимо 40–200`);
      }
    }
    // FR-63: the cover becomes og:image and the JSON-LD image, both built as
    // "https://" + site.domain + cover — so it must be a path from the site
    // root, not a full URL, or the head would hold a doubled origin.
    if (kind === "posts" && branch.cover !== undefined) {
      const cover = branch.cover;
      if (typeof cover !== "string" || !cover.startsWith("/") || cover.startsWith("//")) {
        fail(`${where}.cover: ожидается путь от корня сайта, например /assets/covers/${slug}.png`);
      }
    }
    if (kind === "projects") {
      for (const key of ["tags", "points"]) {
        const value = branch[key];
        if (value === undefined) continue;
        if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
          fail(`${where}.${key}: ожидается массив непустых строк`);
        } else if (key === "tags" && !value.length) {
          fail(`${where}.tags: нужен хотя бы один тег`);
        }
      }
    }
  }

  const shared = {
    kind,
    slug,
    view: data.view,
    date: data.date,
    updated: data.updated,
    order: data.order,
    status: data.status,
    icon: data.icon,
    inputPath: rel,
  };

  // An unpublished post has no page and no collection entry at all, so it cannot
  // leak into a list, tag page, feed or sitemap (FR-89, FR-123).
  if (kind === "posts" && !isPublished({ date: data.date, draft: data.draft })) return [];

  return LANGS.map((lang) => {
    const branch = (translations && translations[lang]) || {};
    return {
      ...shared,
      lang,
      url: pageUrl(kind, data.view, lang, slug),
      title: branch.title,
      excerpt: branch.excerpt,
      description: branch.description,
      cover: branch.cover,
      // A post carries vocabulary keys, a project carries displayed labels.
      tags: kind === "projects" ? branch.tags : data.tags,
      points: branch.points,
      body: md.render(sections[lang] || ""),
    };
  });
}

function readKind(kind, state) {
  const dir = path.join(CONTENT_DIR, kind);
  if (!fs.existsSync(dir)) {
    state.errors.push(`content/${kind}: каталог не найден`);
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .flatMap((name) => parsePage(kind, path.join(dir, name), state));
}

// One page object per (content file × language): everything a template needs.
// Re-read on every call so `eleventy --serve` picks up edits to content files
// without restarting the process.
function load() {
  const state = { errors: [], orders: new Map() };
  const pages = [...readKind("posts", state), ...readKind("projects", state)];

  // One tag page per (language × view × tag used by a published post) triple:
  // a tag label must always lead to a page that lists the posts carrying it
  // (FR-119, FR-120).
  const tagPages = [];
  for (const lang of LANGS) {
    for (const view of VIEWS) {
      const used = new Set(
        pages
          .filter((page) => page.kind === "posts" && page.lang === lang && page.view === view)
          .flatMap((page) => page.tags || [])
      );
      for (const tag of [...used].sort()) {
        tagPages.push({ lang, view, tag, url: tagUrl(view, lang, tag), label: i18n[lang].tags.names[tag] });
      }
    }
  }

  if (state.errors.length) {
    throw new Error(
      `Content model: ${state.errors.length} проблема(и):\n  - ${state.errors.join("\n  - ")}`
    );
  }
  return { pages, tagPages };
}

module.exports = { LANGS, VIEWS, tagUrl, load };
