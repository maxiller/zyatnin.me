---
layout: layouts/dev/post.njk
view: dev
title: "The turn: «no exceptions» — emission moves into the functions"
excerpt: "A product owner decision changes the architecture of a finished feature — and SDD makes that cheap. Helper signature, five calls, rewritten tests."
date: 2026-12-14
topic: t4
slug: sdd-11-emission-moves-to-functions
permalink: /en/dev/blog/sdd-11-emission-moves-to-functions/
---

## The question after the investigation

After post 10 an unpleasant question remained: no event is written when a function produces no jobs. That is correct per FR-007. But should there be exceptions for terminal and empty cases at all?

The idea sounded tempting: "we do not log terminal branches, why the noise". I sat down to think about it — and realised it is exactly the kind of exception that later grows into inexplicable behaviour.

The decision: **no exceptions**. If a function picks the next job — the event is always written. If it does not pick one — the call still happened, and that is also worth seeing. And "empty" and "not called" are different situations, and the log must tell them apart.

## What changed in the architecture

The plan (post 7) chose emission in the dispatcher. The reason was that the dispatcher already knows about the cascade and everything related to launching jobs happens in one place.

The problem: the dispatcher knows about the next step only what it was told. The full job payload lives in the function — the function builds it. The dispatcher either has to drag the payload across a layer boundary or make do with what is left.

So the decision moved into the functions. In `uveon/functions/base.py` a helper appeared:

```python
def log_next_payloads(ctx, function: str, next_jobs: list) -> None:
    """Emits function_next_payload for every next job."""
```

And its call — in each of the five functions, before reporting completion:

```python
next_jobs = [build_fetch_issue_job(ctx, issue) for issue in issues]
log_next_payloads(ctx, "search_jql", next_jobs)
await function_done(ctx, ...)
```

Emission from `Dispatcher.dispatch` is removed entirely — not commented out, not left "just in case": two emission points would produce double records.

## A non-obvious consequence: the contract did not change

The elegant part of this reversal: the contract version stayed **v4.12**. Principle I requires recording changes to external behaviour — and external behaviour did not change. The event is called the same, carries the same fields, and is written under the same conditions. Only the place it is emitted from changed — and that is an internal implementation detail.

Had I done this in the usual mode, the first instinct would be "bump the version, we changed the architecture". That is exactly how contracts get MAJOR versions with no changes for consumers, and exactly how consumers stop reading them.

## Why this is cheap

This is where the whole SDD cycle pays off. An architecture change inside a finished feature is not refactoring but a plan rebuild:

- `data-model.md` changes (where the emission point sits);
- the tests that checked "the dispatcher writes the event" change;
- the tasks change, and an explicit item appears in them: "remove emission from the dispatcher";
- `tasks.md` is rewritten, not the code "as it turned out".

Compare with the usual mode: you explain to yourself why the old approach was right, then edit code in three places, then discover the test was about something else. Then you decide rewriting the test is long and adjust it "to match the fact". A month later the test guards something other than the requirement it existed for.

In the SDD cycle sixteen tests are rewritten for the new architecture, including the cascade-of-six-jobs test. Not one is deleted — every one still checks what it should.

And that is the main difference from "fix it as it came out": tests change because the decision changed, not because they get in the way of shipping.

## What it cost

One round against the plan. One extra test run. One blog post — this one.

What I would do differently: put emission in the functions from the start. Why did I not? Because at the plan stage the short path ("one place — one call") looks cheaper, and the price only shows up when you start thinking about the payload. That is normal: a plan is not a prophecy but a revision tool.

The feature is rebuilt. What is left is to check the code and the documents have not drifted apart.

---

[← Post 10: an empty event in production](/en/dev/blog/sdd-10-empty-event-investigation/) · [Post 12: `/speckit.converge` →](/en/dev/blog/sdd-12-converge-and-series-postmortem/)
