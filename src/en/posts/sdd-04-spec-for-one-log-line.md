---
layout: layouts/dev/post.njk
view: dev
title: "/speckit.specify: a spec for «just one line in the log»"
excerpt: "The task sounded like a single line. The spec grew to 18 requirements and three user stories — and that is a map of the rake, not bureaucracy."
date: 2026-06-24
tags: [spec-driven-dev, ai-agents]
slug: sdd-04-spec-for-one-log-line
permalink: /en/dev/blog/sdd-04-spec-for-one-log-line/
---

## A one-line task

The wording it all started with: "in TRACE mode the log must include the payload of the next functions".

Functions in the project are called `next_*`: they look at the current job and decide what to run next. I want to see in the log which payload they picked. Surely: take `logger.trace(...)`, drop it into the dispatcher, half an hour of work.

`/speckit.specify` produced several pages for that wording. I did not argue with it, and here is why.

## What the spec actually describes

`specs/002-next-payload-trace/spec.md` is:

- **3 user stories** with priorities P1–P3;
- **18 functional requirements** (FR-001…FR-018);
- a list of edge cases;
- success criteria.

At first glance it looks inflated. But almost every requirement closes a concrete case that a "one-line" implementation would break silently.

## Requirements that surfaced at that stage

Here are a few excerpts from the spec, and why each is non-obvious:

> **FR-005.** The event is written for every next job, even when deduplication suppresses the repeated enqueue.

Deduplication drops duplicates before they run. If the event were written only for jobs actually enqueued, the log would lose information: the function did pick those jobs, and that is exactly what we want to see. The log is about the function's decisions, not about what survived the filter.

> **FR-008.** At INFO or DEBUG level the event is not written and does not slow down the hot path.

TRACE is the most expensive level: the payload is serialised in full. Some installations keep TRACE on permanently, others switch it on for ten minutes during an investigation. The latter must not pay for the former.

> **FR-011.** The payload is written in full, without truncation or masking.

There is always a temptation to cut long strings "so the log does not bloat". But a truncated payload is useless during an investigation: you cannot tell "the JQL was short" from "we cut it ourselves". That is also the item that later raises the security question — in the post about production investigation.

> **FR-014.** The event is written in all branches of function execution: success, empty result, error.

This requirement later becomes the most contested one and leads to an architecture change (post 11), while at the spec stage it looked perfectly natural.

## Why there are so many requirements

The temptation was to write three: write the event, write in TRACE, write the payload. It ended up as eighteen for a simple reason: every requirement has to be verifiable.

The difference between two wordings:

- "The log must be informative" — no test can check it.
- "Every event record contains `next_function`, `next_job_id` and `payload`" — one assert checks it.

The first stays in the author's head and disappears at the first rework. The second becomes a test, and a test becomes protection against regressions. That is exactly why in the next part the spec stops being a document and becomes a work plan.

## Who reads a spec

A spec is not written only for the agent. It has three readers, each with a scenario:

- **The agent** reads it at the start of work and comes back to it when a disputed case needs a decision.
- **Me in six months** reads it to understand why the code is built this way.
- **The requirements checklist** is read at every review: it shows whether a requirement is covered by a test.

When a document is needed by three different readers at once, links to specific sections and verifiable wording stop being bureaucracy. They are the only way for the same text to work for all three.

## How long it took

A few hours of reading code and talking to myself in the "what if…" format. Expensive? Compare it with the cost of the investigation in post 10: finding out why an event is missing in production is more expensive than deciding in advance when it should be there.

The spec for one line is ready. The next question: is it worth describing the other nine project modules this way. Spoiler: I decided it was.

---

[← Post 3: the constitution](/en/dev/blog/sdd-03-constitution-five-principles/) · [Post 5: nine module specs →](/en/dev/blog/sdd-05-nine-module-specs/)
