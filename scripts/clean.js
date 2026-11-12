#!/usr/bin/env node
/* Remove the previous build before a production build.

   Eleventy never deletes files it no longer writes, and a preview
   (`npm start` / `npm run dev`) writes scheduled posts and drafts into the same
   `_site`. Without a clean, those pages survive into the next production build
   and `scripts/check-seo.js` fails on pages that are deliberately not in the
   sitemap — so a preview would break the build that follows it. */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

fs.rmSync(path.join(__dirname, "..", "_site"), { recursive: true, force: true });
