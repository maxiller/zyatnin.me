/* The single Markdown renderer of the build.

   Eleventy renders template Markdown with this instance (`setLibrary("md")`) and
   `lib/content.js` renders the language branches of content files with it, so a
   body looks the same whichever of the two produced it. */

const markdownIt = require("markdown-it");

// HTML passthrough is required: the article bodies are hand-written HTML in
// places (headings, pre/code blocks).
const md = markdownIt({ html: true, linkify: true, typographer: true });

// Fenced ```mermaid blocks get a class on their <pre> so the view stylesheets can
// drop the code-block chrome (dark background, border, padding) and let the
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

// FR-128: an article may link to a page of the same site that this build does
// not publish yet — the next part of a series with a future date. While the
// target is missing from the build, the body keeps the link text and drops the
// anchor: no reader follows a link to a 404 and `check-seo` has no href to
// reject. The same URL, written once, becomes a link in the build where the
// target passes the publication gate — no edit to the article. The two sets come
// from the content model through the render environment:
// `md.render(body, { linkTargets: { known, published } })`.
//
// `known` is why a typo still fails: a URL that belongs to no page is not known
// and stays a link, so `check-seo` reports it.
md.core.ruler.push("gate-scheduled-links", (state) => {
  const targets = state.env && state.env.linkTargets;
  if (!targets || !targets.known) return;
  for (const token of state.tokens) {
    const children = token.children;
    if (!children) continue;
    // Backwards, because unwrapping a link removes its two tokens.
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i].type !== "link_open") continue;
      const href = children[i].attrGet("href") || "";
      // Only the route decides; an anchor or a query on the same page does not.
      const route = href.split("#")[0].split("?")[0];
      if (!targets.known.has(route) || targets.published.has(route)) continue;
      // Images and marks may live inside a link, so find the balanced close.
      let depth = 0;
      let close = -1;
      for (let j = i; j < children.length; j++) {
        if (children[j].type === "link_open") depth++;
        else if (children[j].type === "link_close" && --depth === 0) {
          close = j;
          break;
        }
      }
      if (close < 0) continue;
      children.splice(close, 1);
      children.splice(i, 1);
    }
  }
});

module.exports = md;
