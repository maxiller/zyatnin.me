/* Publication gate for articles.

   A post is published when its `date` has arrived. Dates are parsed from YAML
   as UTC midnight, so `date: 2027-03-01` opens at 00:00 UTC that day — the
   granularity of a scheduled publication is therefore one build. On GitHub
   Pages nothing rebuilds by itself, so `deploy.yml` also runs on a daily cron;
   without that a scheduled post would wait for the next push.

   The gate is applied through `src/{lang}/posts/posts.11tydata.js`: an
   unpublished post gets `permalink: false` (no page is written, so the URL does
   not exist until publication day) and `eleventyExcludeFromCollections: true`
   (no list, tag page, feed or sitemap entry). Templates need no changes.

   Preview: `npm run dev` (eleventy --serve) shows scheduled posts and drafts,
   production builds hide them. `INCLUDE_FUTURE=1` does the same for a build.
*/

const previewing = () =>
  process.env.INCLUDE_FUTURE === "1" || process.argv.includes("--serve");

const isPublished = (data) => {
  if (previewing()) return true;
  if (data.draft === true) return false;
  const time = new Date(data.date).getTime();
  // A post cannot be scheduled without a date; failing the build is the only
  // signal a static site can give, and it beats silently dropping the article.
  if (isNaN(time)) {
    const file = (data.page && data.page.inputPath) || "posts/*.md";
    throw new Error(`${file}: нет поля date (или оно неверно) — статью не назначить на дату`);
  }
  return time <= Date.now();
};

// Directory data for src/{lang}/posts: the whole publication rule in one place.
const postData = {
  eleventyComputed: {
    permalink: (data) => (isPublished(data) ? data.permalink : false),
    eleventyExcludeFromCollections: (data) => !isPublished(data),
  },
};

module.exports = { isPublished, postData };
