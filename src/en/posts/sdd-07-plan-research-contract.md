---
layout: layouts/dev/post.njk
view: dev
title: "/speckit.plan: research, data-model and the contract before code"
excerpt: "A feature plan as four documents: research, data-model, event contract and quickstart. And the main fork — where to emit the event."
date: 2026-08-14
tags: [spec-driven-dev, ai-agents]
slug: sdd-07-plan-research-contract
permalink: /en/dev/blog/sdd-07-plan-research-contract/
---

## The spec answers "what", the plan answers "how"

After `/speckit.specify` a feature has eighteen requirements and three user stories. Not a single decision about how to build it in code. That is `/speckit.plan`'s job, and the result is not one document but four.

## `research.md`: look at how it is already done

The first plan artefact is research. Not "how should it be done in general", but "how does it already work for us".

The questions that had to be answered:

- the worker already logs `function_payload` and `job_result` — where exactly and in what format?
- where does the job context (`ctx`) live and what is in it at function call time?
- how do we get `job_id` and `root_job_id` — the identifier of the cascade's root job — out of the context?

The last question turned out to be key. The project has the notion of a cascade: one root job spawns children, and all of them share one `root_job_id`. Without that field the event is useless: you cannot reconstruct which jobs belong to one chain from the log.

Another research finding: log levels in the project are not a uniform scale but two different modes. INFO and DEBUG are always on, TRACE is switched on by hand for an investigation. So expensive payload serialisation is acceptable on TRACE only — otherwise the feature becomes a brake for every installation at once.

## `data-model.md`: one event and its fields

The event is called `function_next_payload`. Fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `next_function` | string | name of the function picked as the next step |
| `next_job_id` | string | identifier of the created job |
| `payload` | object | full job payload, without truncation |
| `dedupe_key` | string? | conditional: only when the job is deduplicated |
| `dedupe_ttl_s` | int? | conditional: dedupe TTL, if there was one |
| `level` | string | always `TRACE` |

Conditional fields are not laziness but precision: if there was no deduplication, `dedupe_key` is absent rather than `null`. The difference matters to consumers: "no field" and "empty field" carry different meanings.

Another decision of the same kind: `payload` is written in full, without masking secrets and without cutting long strings. There was a temptation to "handle it just in case", but masking makes the log useless: the payload is exactly where the reason a function picked this particular job lives. Here we consciously choose diagnostics and offset the risk with policy: TRACE is never on permanently and its output is never published.

## The main fork: where to emit

This is where the plan delivered its main value — it forced an explicit choice.

Option one: **in the dispatcher**. The dispatcher (`Dispatcher.dispatch`) centrally decides what to run next, and it is the one that knows everything about the cascade. One place, one call, easy to test.

Option two: **in the functions themselves**. Each of the five functions (`search_jql`, `fetch_jira_issue`, `generate_text`, `synthesize_speech`, `place_phone_call`) calls a helper itself before reporting completion.

The plan chose the dispatcher. The argument: one emission point means fewer chances to forget than five points.

In post 11 I will explain why that decision had to be reversed. For now just remember: the plan recorded the choice and its reasoning — in six months you can read why the code is shaped that way and not otherwise.

## `contracts/function-next-payload.md` and version v4.12

By principle I, a change to external behaviour is first recorded in the contract. A description file for the event appears in the plan, and `docs/CONTRACTS.md` is bumped to **v4.12** — before the first line of code.

An excerpt from the contract:

```text
### function_next_payload  (added in 4.12)

Example:
  {
    "event": "function_next_payload",
    "next_function": "fetch_jira_issue",
    "next_job_id": "4f1c9a24-...",
    "payload": { "issue_key": "PROJ-1042", "fields": ["summary", "status"] },
    "level": "TRACE"
  }

Additive event: consumers unaware of it ignore it.
```

The fields in the example are fictional — and not by accident: real TRACE logs leak tokens and task content. More on that in the investigation post.

## `quickstart.md`: how to check by hand

The last plan artefact is a short instruction for a human: "turn on TRACE, run this request, look for that line in `journalctl`". Five lines that will save half an hour a month later.

The plan is ready. Next: how it turns into tasks and tests.

---

[← Post 6: post-mortem on the wave](/en/dev/blog/sdd-06-spec-wave-postmortem/) · [Post 8: `/speckit.tasks` →](/en/dev/blog/sdd-08-tasks-and-tdd/)
