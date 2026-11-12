// The content model as Eleventy data: `contentModel.pages` is the flat list of
// pages (content file × language) that `src/content-page.njk` paginates over.
// (`content` is a reserved Eleventy property name, hence the longer data key.)
// A function export is re-invoked on every build, so `eleventy --serve` picks up
// edits in content/ without a restart.
const content = require("../../lib/content");

module.exports = () => content.load();
