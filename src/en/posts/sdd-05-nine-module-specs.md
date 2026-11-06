---
layout: layouts/dev/post.njk
view: dev
title: "A spec as a unit of work: splitting the system into 9 module specs"
excerpt: "One session — nine specs and 241 new requirements. Why describe the whole project module by module, and what that buys in practice."
date: 2026-11-23
tags: [spec-driven-dev, ai-agents]
slug: sdd-05-nine-module-specs
permalink: /en/dev/blog/sdd-05-nine-module-specs/
---

## The trigger: SRS exists, but it does not help

The project had long had a `docs/SRS/` corpus — `SRS-00`…`SRS-09`, one per module. A decent corpus, but it has a property: it describes the system the way it was **designed to be**, and nobody kept it in sync with the code. A year later its articles diverge from reality in details, and details are where defects live.

After the good experience with a spec for one line, a hypothesis appeared: if every module spec references its SRS section and the contracts, then SRS stops being a dead document — it becomes the source of requirements, while the spec is its verifiable refinement for a specific module.

## What came out of one session

Nine new directories in `specs/`:

| Module | SRS | FR | Artefacts |
| --- | --- | --- | --- |
| `003-pod-infrastructure` | SRS-01 | 26 | spec + checklist |
| `004-instance-config` | SRS-02 | 24 | spec + checklist |
| `005-job-broker` | SRS-03 | 21 | spec + checklist |
| `006-worker-runtime` | SRS-04 | 25 | spec + checklist |
| `007-agent-functions` | SRS-05 | 32 | spec + checklist |
| `008-provider-adapters` | SRS-06 | 32 | spec + checklist |
| `009-cron-scheduler` | SRS-07 | 23 | spec + checklist |
| `010-observability-testbed` | SRS-08 | 27 | spec + checklist |
| `011-docs-standard` | SRS-09 | 31 | spec + checklist |

Nine modules add up to **241 requirements**. Together with the existing `001` (46 FR) and `002` (18 FR) that is **305 functional requirements across 11 specs**.

## Slicing principles

This is easy to get wrong, and the mistake is expensive: a wrong module boundary turns it into a dump of requirements.

**By SRS module, not by layer.** Layers (database, API, DAO) change from task to task. A module is a part of the system with its own responsibilities: the job broker knows nothing about providers, providers know nothing about cron. A module boundary is stable for years, so its spec lives long too.

**One SRS per module.** Each spec references a concrete SRS section in its "Context and sources" section, not the whole corpus. A link to a whole document is useless: the agent will not find the right line in it and will start inventing.

**Contracts are the arbiter.** Everything about message and event formats is not re-described in the spec — only referenced via `docs/CONTRACTS.md`.

**Adjacent features reference each other.** `011-docs-standard` describes the documentation update cascade and therefore explicitly links to the other ten. That is not a formality: when any module changes, the agent sees which documents must be updated along the chain.

## The honest status

An important detail I am not going to hide: all nine modules currently have only `spec.md` and `checklists/requirements.md`, all marked `Status: Draft`. None of them has a plan (`/speckit.plan`), research or tasks (`/speckit.tasks`).

That is a deliberate stop, not "everything is done". The point of the wave was to get the full requirements map and see contradictions between modules. Writing plans and tasks for nine modules at once guarantees wasting half of it: until you start working on a module, its plan goes stale before you need it.

## What the corpus buys

Beyond the obvious "now everything is described", there are three practical effects:

1. **Any order of work.** You can take module `006-worker-runtime` and start with it — the requirements and boundaries are already there.
2. **Visible duplicates.** Two modules often describe the same incoming message validation. Either extract it into a shared module or explicitly decide these are two different contracts. The corpus forces the choice.
3. **Visible contradictions.** `004-instance-config` and `006-worker-runtime` answered the question "who knows about the instance" differently. In practice that would have become a bug rather than a document dispute.

Next: an honest hindsight review of the wave — what worked and what did not.

---

[← Post 4: a spec for one line](/en/dev/blog/sdd-04-spec-for-one-log-line/) · [Post 6: post-mortem on the wave →](/en/dev/blog/sdd-06-spec-wave-postmortem/)
