---
layout: layouts/dev/post.njk
view: dev
title: "/speckit.analyze: when the checks find what you missed"
excerpt: "A cross-check of spec, plan and tasks found a coverage gap before production did. A breakdown of findings and what to do with them."
date: 2026-12-07
topic: t4
slug: sdd-09-analyze-findings
permalink: /en/dev/blog/sdd-09-analyze-findings/
---

## What analyze does

`/speckit.analyze` is a cross-check of three documents: the spec, the plan and the tasks. It looks for three things: inconsistent wording between documents, requirements without test coverage, and tasks unrelated to anything.

That sounds boring. In practice this is the only SDD artefact that found a defect invisible to the other three.

## What the run found

Two classes of findings.

**Inconsistent wording.** The spec said "the event is written on every selection of the next job", while `data-model.md` said "the event is emitted at the moment the job is enqueued". On paper the difference is microscopic; in code these are two different call sites. Had we written by the plan and checked by the spec, the "every decision" test would have failed with no explanation.

**A coverage gap for FR-014.** The requirement reads: "the event is written in all branches of function execution: success, empty result, error". `tasks.md` had tests for success and for the empty result. There was no test for the error branch.

That one is a real finding. The defect is not in the code but in the test plan — and it would have reached production unnoticed.

## What the findings look like

Findings are ranked by severity:

| Level | Finding | Action |
| --- | --- | --- |
| HIGH | FR-014 without an error test | Test added |
| MEDIUM | The "emitted at enqueue time" wording | `data-model.md` edited |
| LOW | Different field names in spec and plan | Spec edited |

They are closed in two fundamentally different ways: HIGH by code (write the test), MEDIUM and LOW by wording. It matters not to confuse them: fixing a HIGH by rewording simply removes the requirement from the list while the defect stays.

## Why this works

Analyze's main value is not in reading code but in indifference to the author. It does not remember that I discussed "that branch is obvious anyway" yesterday. It compares the list of requirements with the list of tasks and finds a requirement without a task.

Human review finds that too — if done a month later with a blank sheet. The problem is that reviewing your own documents is almost never done with a blank sheet: you read what you meant to write, not what you wrote.

## What analyze is not

It replaces neither tests, nor code review, nor production investigation. All three findings above are about documents. It does not check how the code works at all.

## Two subtleties without which it hardly helps

**Run it before implementation, not after.** Analyze over finished code is hopelessly soft: the code is written, the tests are green, and any finding reads as "come on, it works as it is". The healthy place for it is between `tasks.md` and the first implementation task.

**Do not close findings by rewording if the code needs the fix.** The fastest way to a green report is to reword the requirement. That is exactly how specs are born that describe what is already written rather than what is needed. The rule is simple: HIGH is closed by a test, and only MEDIUM/LOW by wording. And if a HIGH cannot be closed by a test, the requirement is not verifiable and that is a different fix.

## What analyze did not catch

It found the FR-014 coverage gap and the wording difference. It could not find what appeared in production: an empty Jira filter and code working correctly with an empty list. That is not its job — and that is exactly why it is too early to celebrate after a green analyze.

Which is why the next post starts with a line that still annoys me: "the spec is clean, the tasks are closed, the tests are green, and production has no event".

---

[← Post 8: tasks and TDD](/en/dev/blog/sdd-08-tasks-and-tdd/) · [Post 10: where are my logs? →](/en/dev/blog/sdd-10-empty-event-investigation/)
