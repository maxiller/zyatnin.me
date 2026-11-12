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

module.exports = md;
