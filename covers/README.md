# Cover sources

One SVG per article and language: `<slug>-<lang>.svg`. These are the committed
sources of the Open Graph images — the PNG the site serves is rendered from
them by `npm run covers:png` on every build into `src/assets/covers/` and is
git-ignored.

Because generation is a text layout, the sources need no native renderer: the
build checks with `npm run check:covers` that every file still matches its
content, and fails when a post was edited without re-running
`npm run covers:svg`.

This directory is not served: keeping the sources outside `src/` means the SVG
of a scheduled post is in the repository but never deployed.
