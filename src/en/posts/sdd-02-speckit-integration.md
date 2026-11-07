---
layout: layouts/dev/post.njk
view: dev
title: "Plugging speckit into an existing project"
excerpt: "Spec-driven development is not only for greenfield projects. How to put speckit into a live repository with history, contracts and a running production."
date: 2026-05-04
tags: [spec-driven-dev, ai-agents]
slug: sdd-02-speckit-integration
permalink: /en/dev/blog/sdd-02-speckit-integration/
---

## Why not rewrite from scratch

The first thought when a project starts falling apart is to rewrite it. It is almost always wrong, and here is why in my case:

- The project **runs in production**. It delivers value every day, and time spent on a rewrite is time without value.
- It has **decision history**. Every strange workaround is an answer to a real incident, and a rewrite loses that memory.
- A rewrite rarely fixes the process. Six months later the new project falls apart the same way if the rules of the game are unchanged.

Spec-driven development is about rules, not about a clean slate. So I did not rewrite the project — I grafted a tool into it.

## `specify init` into a live repository

Installing speckit takes a minute and breaks nothing: it adds a `.specify/` directory to the repository root.

```text
.specify/
├── memory/            # project constitution
├── templates/         # spec, plan, tasks templates
├── scripts/           # artefact creation and validation
├── workflows/         # /speckit.* command descriptions
└── feature.json       # pointer to the "current" feature
```

The idea is simple: every feature lives in its own `specs/<NNN>-<slug>/` directory with the same set of artefacts — spec, requirements checklist, plan, research, tasks, contracts. Nothing greenfield-specific: this works in a project that is four years old.

## The nuance: the project already had a source of truth

This is where it got interesting. `uveonbot` already had `docs/CONTRACTS.md` — a document describing the formats of events and messages between components. When a second source of truth appears, one of them must be the authority, otherwise they contradict each other within a month.

The solution: the project constitution (next post) declared contracts the arbiter of external behaviour. The spec describes *what* and *why*, the contract describes *how it looks on the wire*. A spec cannot contradict a contract; to change external behaviour, the contract changes first.

## Feature numbering

The sequence numbers in `specs/` are not cosmetic — links and sorting of artefacts depend on them:

```text
specs/
├── 001-control-plane-config/
├── 002-next-payload-trace/
└── ... 003…011
```

`001` is the control module (per-instance bot config), the first module planned down to tasks. `002` is the "one line in the log" feature, and the whole series is built on it.

The number is assigned when the feature is created and never changes. If a feature is cancelled, its directory is not reused — numbers only go forward. That is boring, and that is exactly why it works: `002` will never start meaning something else.

## Specs are artefacts too

The most annoying mistake here is treating `specs/` as "documentation on the side". It is not. A spec changes together with the code and lives in git by the same rules: its own commit, a clear message, a reviewed diff.

As I write this post, nine new `specs/003…011` directories sit in my working tree untracked. The content is ready, the commit is not. That is not a detail: until a spec is in git it cannot be reviewed, cannot be referenced from code, and the agent will not find it in history next time.

That is why committing those directories is a separate action item in the series post-mortem. Spec-driven development breaks not when specs are written badly, but when they are forgotten in the working tree.

## What came out of it

The repository tree now clearly splits into four layers, each with its own role:

| Layer | Answers the question |
| --- | --- |
| `.specify/memory/` (constitution) | How do we work at all? |
| `specs/<NNN>/spec.md` | What and why are we doing in this feature? |
| `docs/CONTRACTS.md` | What does external behaviour look like? |
| code and tests | How does it actually work? |

And the most important part: the agent has context on every request that does not need re-explaining. The constitution and the spec live in the repository, not in my head.

But specs without rules are just documentation. The five rules the agent must read before acting are the next topic.

---

[← Post 1: why a project needs a constitution](/en/dev/blog/sdd-01-constitution-and-specs/) · [Post 3: `/speckit.constitution` →](/en/dev/blog/sdd-03-constitution-five-principles/)
