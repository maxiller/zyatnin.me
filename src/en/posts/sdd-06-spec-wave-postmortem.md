---
layout: layouts/dev/post.njk
view: dev
title: "Post-mortem on the spec wave: what I learned in hindsight"
excerpt: "Nine specs in one session: what was planned, what came out, and which process defects only showed up once everything sat in one folder."
date: 2026-11-26
topic: t4
slug: sdd-06-spec-wave-postmortem
permalink: /en/dev/blog/sdd-06-spec-wave-postmortem/
---

## What was planned

Split the whole system into specs such that: we do not contradict `docs/SRS/`, do not duplicate the schemas from `docs/CONTRACTS.md`, and get an artefact you can start any module from.

## How it was done

A sequence worth repeating if you attempt the same:

1. Re-read `001` and `002` as the style reference — all specs must look the same.
2. Read the whole `docs/SRS/SRS-00…SRS-09` corpus, `ARCHITECTURE.md` and the constitution.
3. Every spec got a "Context and sources" section linking to **specific** SRS sections and to `CONTRACTS`, not to whole documents.
4. Ran a programmatic check of relative links.

## What came out

Nine specs and nine checklists, all mandatory sections present. Links verified programmatically: **83 relative links — 0 broken files, 0 broken anchors**.

## What did not work

Now the reason this post exists at all.

**A linter you cannot run locally is an illusion of quality.** `markdownlint` is not installed in the project; only the `.markdownlint.json` config exists, while the check lives in CI. Writing nine documents in a row, you regularly introduce small issues around headings and stray blank lines. The error surfaces in CI, after everything is committed and you consider the work done.

**The "current feature" pointer lost focus.** `.specify/feature.json` still points at `002`. With batch spec creation there is no "current" feature, and the agent silently keeps treating the old one as current. A small thing, but commands looked the wrong way because of it.

**An inherited defect in `002` stayed.** `specs/002-next-payload-trace/spec.md` has no `## Out of Scope` section. I found it and recorded it as debt, but did not touch it: editing one old document in a wave of nine new ones is scope creep and a risk of losing something substantial.

**I decided "not to extract" two modules.** SIP telephony and Markdown→Telegram conversion did not become separate specs: they are fully covered by `007` (agent functions) and `008` (providers). The decision is right, but the "why not extracted" needs to be written explicitly — otherwise it reads as an omission.

**Transitional SRS phases went to Edge Cases.** For example, a "soft" warning about an unknown provider — behaviour that will exist some day and does not exist now. A spec describes the present, so such things went to Edge Cases instead of describing the future as a fact.

**The contract version drifts.** Specs in the wave quote **v4.11**, while feature `002` later bumped the contract to **v4.12**. That is not a defect in itself: each spec was correct when written. The defect is the missing habit of re-checking version references before publication and before every planning session.

## Summary table

| What was planned | What came out | What we do differently |
| --- | --- | --- |
| Not contradict SRS | Links to concrete sections, 83 checks | Run the link check in every PR |
| Not duplicate contracts | References to the arbiter instead of copied schemas | Keep the rule in the constitution explicitly |
| Any module can be started | Only `spec.md` + checklist, no plans | Plan one at a time, not in batches |
| Lint across the project | CI-only, not runnable locally | Add lint to devDependencies |
| A single focus source | `feature.json` stuck at `002` | Update the pointer with every feature |

## Conclusion

A post-mortem on documents is as necessary as one on an incident. The most expensive defect in this wave was not a broken link (a script found those) but an unnoticed contradiction between specs: no linter finds that, only reading.

And now back to feature `002` — how a spec turns into a plan.

---

[← Post 5: nine module specs](/en/dev/blog/sdd-05-nine-module-specs/) · [Post 7: `/speckit.plan` →](/en/dev/blog/sdd-07-plan-research-contract/)
