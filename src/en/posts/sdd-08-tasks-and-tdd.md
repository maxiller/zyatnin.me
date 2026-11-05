---
layout: layouts/dev/post.njk
view: dev
title: "/speckit.tasks + /speckit.implement: TDD by phases"
excerpt: "Twenty tasks in four phases: contract and docs first, then tests, only then code. And the numbers from the run after implementation."
date: 2026-12-03
topic: t4
slug: sdd-08-tasks-and-tdd
permalink: /en/dev/blog/sdd-08-tasks-and-tdd/
---

## From plan to tasks

`/speckit.tasks` takes the spec and the plan and produces `tasks.md` — a list of tasks with dependencies. The key difference from a "build the feature" checklist: every task has an identifier, a phase and — if it can run in parallel — a `[P]` marker.

## Four phases

The structure we arrived at:

```text
Phase 1: Contract and documentation
Phase 2: Tests (before code)
Phase 3: Implementation
Phase 4: Validation
```

A fragment of `tasks.md` with dependencies:

```text
- [ ] T001 [blocking] Update docs/CONTRACTS.md to v4.12
- [ ] T002 [P] Update SRS-04 (worker) and SRS-05 (functions)
- [ ] T003 [P] Update SRS-08 (observability), TROUBLESHOOTING
- [ ] T004 [P] Docstrings of public functions
- [ ] T005 [after T001] Tests: suppression on INFO/DEBUG
- [ ] T006 [after T001] Tests: single format for all five functions
- [ ] T007 [after T001] Tests: cascade of 6 jobs, one root_job_id
- [ ] T008 [after T001] Tests: independence from deduplication
- [ ] T009 [after T001] Tests: long payload without truncation
- [ ] T010 [after T005-T009] Emission helper
- [ ] T011 [after T010] Calls in five functions
- [ ] T012 [after T010] Remove emission from the dispatcher
- [ ] T013 [after T012] Full test run
```

Task `T001` blocks everything else — and rightly so. Until the contract is at v4.12, any line of code breaks principle I.

## Phase 1: documentation ahead of code

`docs/CONTRACTS.md`, `SRS-04/05/08`, `TROUBLESHOOTING` and docstrings change. It looks like "writing docs for a tick", but there is a concrete effect: by the time the agent reaches the code, it has read the requirement wording three times. The code comes out more accurate.

## Phase 2: seven test groups before code

TDD here is not dogma but a way to check the spec is verifiable. Tests are written against a helper that does not exist yet and five call sites:

1. suppression at INFO/DEBUG — no events at those levels;
2. single format for all five functions — same fields, same types;
3. cascade of six jobs under one `root_job_id` — cascade connectivity is visible in the log;
4. independence from deduplication — the event exists even if the job was not enqueued;
5. long payload — no truncation;
6. no logger in the context — do not crash;
7. empty `next_jobs` list — no event written.

The seventh test matters: it checks FR-007 directly, and it is exactly what saves me later during the production investigation.

## Phase 3: implementation

Everything here is boring and that is good: the emission helper, five calls, removal of emission from the dispatcher. The last item is not refactoring for cleanliness but a requirement to avoid double records: writing both in the dispatcher and in the functions would produce duplicates in the log.

## Phase 4: full run

Result: **747 passed, 22 skipped** across the project. New tests: sixteen, in `test_function_next_payload.py`, 334 lines.

Commit `1433449`: 22 files, `+1462/−13`. The whole feature in it — contract v4.12, documentation, spec, tests and code. Not three commits, not as-it-becomes-ready: one set with no intermediate state of "tests exist but the contract does not".

## What it gave compared to the usual mode

In the usual mode I would have added the call in the dispatcher, checked by hand, committed, then found a month later that it does not work in three of five functions. In SDD mode I wrote the "single format for all five functions" test first — and once it was ready, the code could no longer end up in three of five.

`[P]` markers are useful separately. It is not decoration: the marker means the task can run in parallel with its neighbours because they do not share files. `T002` and `T003` edit different documents, so they run together. `T010` waits for all tests (`T005–T009`), because writing implementation while no test is described is exactly the old mode with a piece of paper.

A funny consequence of such discipline: first you write seven test groups for a non-existent function and feel strange. Half an hour later, when the first test fails with a clear message, the strangeness is gone.

## What this is not

This is not TDD for TDD's sake. Some tasks (documentation updates, docstrings) are not about tests at all. The real discipline here is one: every task has a verifiable outcome, and `tasks.md` shows whether it depends on others.

Green tests, however, say nothing about working in production. The next two posts are about that.

---

[← Post 7: `/speckit.plan`](/en/dev/blog/sdd-07-plan-research-contract/) · [Post 9: `/speckit.analyze` →](/en/dev/blog/sdd-09-analyze-findings/)
