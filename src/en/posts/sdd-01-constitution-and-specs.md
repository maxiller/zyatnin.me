---
layout: layouts/dev/post.njk
view: dev
title: "Why a personal project needs a constitution and specs"
excerpt: "Agents write code fast and projects fall apart. How 11 specs and 305 requirements brought a pet project back under control."
date: 2026-11-09
tags: [spec-driven-dev, ai-agents]
slug: sdd-01-constitution-and-specs
permalink: /en/dev/blog/sdd-01-constitution-and-specs/
---

## A project that outlives its author's memory

I have a pet project called `uveonbot`. It is a Jira assistant: it talks to Jira over the API, sends notifications to Telegram, can place phone calls over SIP, and the whole thing runs in a Podman pod — an event receiver, a worker with a job queue, and a set of agent functions that do the actual work.

The project is several years old. It has survived three infrastructure moves, two telephony providers and an endless number of "let's rewrite this module properly". I open it every few weeks, and every single time I have to remember: where the config lives, why a job has a `root_job_id`, who decides what the next step is.

Six months ago LLM agents entered that process. That is when the project started to fall apart faster than I could fix it.

## The symptom: "the agent knows better"

The problem is not that the agent writes bad code. The problem is that it writes *confident* code. Three scenarios kept repeating:

- **Silent contract changes.** I ask to add a field to an event and get a renamed field in a neighbouring event as a bonus, because "it makes more sense that way".
- **Broken logging.** Logs are the only way to understand what is happening in production. The agent "optimises" the record format, and the log parser in my own scripts finds nothing.
- **Duplicated decisions.** Every agent function re-invents how to serialise a payload. Six months later the codebase has five different ways — and not one correct one.

Each case alone is a fifteen-minute annoyance. Together they add up to a project you cannot predict: I can no longer say what will happen if I ask the agent to "add one line".

## The scale that crept up unnoticed

By the time I started this series, the repository held **11 specs and 305 functional requirements**. Of those:

| Item | Count |
| --- | --- |
| Features shipped to production | 1 |
| Features planned down to tasks | 1 |
| Modules described by specs | 9 |

The numbers are not there because I love documents. The specs appeared as an answer to a concrete pain: without formal requirements the agent re-invents the system every time.

## What this series will show

What follows is a full spec-driven cycle on one real feature — from the project constitution to production debugging. And then how a whole-project spec grows out of it, module by module.

The feature is boring and small: in TRACE mode the log must include the payload of the functions that pick the next job. "Add a line to the log", nothing more. Let's see what it turns into.

And here is how the series ends. The spec said the event would be there. Production showed no event. It turned out the spec was right and production was simply empty. But that is post ten; for now, installing the tool.

## Who this may be useful for

If you have a personal project that outlives your memory of it, and you have tried bringing LLM agents into it, you will recognise the rake. If you have no agents yet, the series still helps: spec-driven development was not invented for agents, they just make it pay off faster.

## Three questions any feature must answer

Before we get to tools, it is worth fixing what this series will actually check. Any feature in a project has to answer three questions:

1. **What changes on the outside?** Not "the code got cleaner", but a concrete event, field or behaviour observable from outside.
2. **How do we verify it without live Jira and telephony?** If verification needs production data, you will only verify in production — and learn about defects there too.
3. **What happens if it does not work?** Not "we roll back", but what trace is left in the logs, so that fixing it is a search rather than a guess.

It sounds trivial until you try answering those three questions for "add a line to the log". The answers take a few pages — and those pages become the spec.

Next up: putting speckit into a live project without rewriting it from scratch.

---

[Post 2: plugging speckit into an existing project →](/en/dev/blog/sdd-02-speckit-integration/)
