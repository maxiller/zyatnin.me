---
layout: layouts/dev/post.njk
view: dev
title: "/speckit.converge, the series post-mortem and the next horizon"
excerpt: "The series finale: code-to-spec convergence, an honest three-part retrospective and six action items for the next horizon."
date: 2026-12-17
tags: [spec-driven-dev, ai-agents]
slug: sdd-12-converge-and-series-postmortem
permalink: /en/dev/blog/sdd-12-converge-and-series-postmortem/
---

## Converge: the last check

`/speckit.converge` is the final step of the cycle: reconciling the code with the spec, plan and tasks. Not tests — correspondence.

Result: **0 findings**, all **20 tasks** marked as done, no open SDD steps left for feature `002`. The code and the documents say the same thing.

The feature is committed as one set: `1433449`, contract v4.12, `SRS-04/05/08`, `TROUBLESHOOTING`, the whole spec, sixteen tests and the code.

## Series post-mortem, part 1: what was planned and what came out

The series started with "add a line to the log". It ended like this:

| Metric | Value |
| --- | --- |
| Functional requirements in the feature | 18 |
| Principles in the constitution | 5 (2 inviolable) |
| New tests | 16 |
| `/speckit.analyze` passes | 2 |
| Architecture changes | 1 |
| Specs in the wave | 9 (241 requirements) |

The takeaway worth remembering: a "small feature" is always a bit of a system. The only question is whether you see that system in advance or in pieces in production logs.

## Series post-mortem, part 2: what stayed outside SDD

An honest list of unfinished things:

- **The `worker:dev` container runs an old build.** It needs `make build` and a pod restart: right now the code in the repository is newer than in the container.
- **`markdownlint` runs only in CI (`docs-ci`)** and is not there locally. A linter you cannot run before committing catches errors after it.
- **The empty `59251` filter mystery** is no longer about logs: it needs investigating why the JQL filter is consistently empty. Maybe a wrong config, maybe there really are no tasks.
- **`.specify/feature.json` still points at `002`.** Until a new feature is chosen, the pointer lies.

## Series post-mortem, part 3: action items

Six items for the near future:

1. Pick the next feature — for example `003-pod-infrastructure` — and update `feature.json`.
2. Run `/speckit.plan` for it.
3. Run `/speckit.analyze` over the new specs `003…011`.
4. Add a `## Out of Scope` section to spec `002`.
5. Install markdownlint locally as a devDependency.
6. Commit `specs/003…011` per `docs/GIT-RULES.md`.

Item 6 is the most urgent. Nine spec directories sit untracked in the working tree — exactly the mistake I described myself in the wave post-mortem.

## What I would do differently

Three things the series paid for with time:

**Put emission in the functions from the start.** One plan round and one blog post went into rediscovering the obvious: the payload lives in the function, so let the function log it.

**Check production data before blaming the code.** Half an hour of checking whether Jira returned any tasks at all would have saved the whole detective branch of post 10 — although, honestly, the series would have been less useful without it.

**Commit `specs/` right away instead of keeping nine directories untracked.** A spec outside git is not an artefact but a draft.

## Series numbers

305 FR in 11 specs. 18 FR and 20 tasks in the shipped feature. 16 new tests, 747 in the full run. Contract v4.12. 83 verified links in the spec wave. Two analyze passes, one converge.

## What is next

`001` (`control-plane-config`, 46 FR) has a plan and 40 open tasks. `003…011` have specs for 241 requirements but no plans or tasks. That is a normal pipeline: specify in batches, implement one at a time.

The next series will be about implementing `001` and how the `003…011` wave turns into working modules.

## Verdict

Spec-driven development pays off not on "write a new feature". It pays off on "change your mind": change a product owner decision and get not a day of refactoring with fear, but a rebuilt plan, an updated contract and sixteen tests that keep guarding what they should.

That is exactly where an ordinary project rots silently, and SDD gives a second chance cheaply.

---

[← Post 11: emission in the functions](/en/dev/blog/sdd-11-emission-moves-to-functions/)
