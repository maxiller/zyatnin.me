/* Publication gate for posts.

   A post is published when its `date` has arrived. Dates are parsed from YAML
   as UTC midnight, so `date: 2027-03-01` opens at 00:00 UTC that day — the
   granularity of a scheduled publication is therefore one build. On GitHub
   Pages nothing rebuilds by itself, so `deploy.yml` also runs on a daily cron;
   without that a scheduled post would wait for the next push.

   The gate lives where the content files are read (`lib/content.js`): a post the
   gate hides produces no page and no collection entry at all, so no list, tag
   page, feed or sitemap entry can mention it. Templates need no changes.

   Preview: `npm run dev` (eleventy --serve) shows scheduled posts and drafts,
   production builds hide them. `INCLUDE_FUTURE=1` does the same for a build.
*/

const previewing = () =>
  process.env.INCLUDE_FUTURE === "1" || process.argv.includes("--serve");

// `date` is validated when the content file is read, so a post that reaches this
// point always has a usable publication date.
const isPublished = ({ date, draft }) => {
  if (previewing()) return true;
  if (draft === true) return false;
  return new Date(date).getTime() <= Date.now();
};

module.exports = { isPublished };
