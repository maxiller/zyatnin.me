---
layout: layouts/dev/post.njk
view: dev
title: "/speckit.constitution: five principles read by humans and agents alike"
excerpt: "What a project constitution is, how it differs from a README, and why the agent stopped \"improving\" the API without asking."
date: 2026-05-21
tags: [spec-driven-dev, ai-agents]
slug: sdd-03-constitution-five-principles
permalink: /en/dev/blog/sdd-03-constitution-five-principles/
---

## Why yet another document

By that point the project already had a README, `ARCHITECTURE.md` and an agent instruction file. Why a constitution?

Because these are documents of **different genres**. A README describes the project for someone who just walked in. Agent instructions say how to format commits and which files not to touch. A constitution is a normative document: it sets rules that must not be broken even when a task really asks for it.

The difference shows in the language. A README may say "we usually prefer X". A constitution says "X is mandatory" and explains what happens if you do Y. A spec describes one feature and has no right to change the rules of the game.

## What is in it now

The constitution lives in `.specify/memory/` and consists of five principles. The headings verbatim:

1. **I. Contracts First** — NON-NEGOTIABLE
2. **II. Configuration Is Data, Never Code**
3. **III. Offline-Testable By Default**
4. **IV. One Pod, Instance-Scoped Names**
5. **V. Durable Jobs, Observable Failures** — NON-NEGOTIABLE

Two of the five are marked inviolable: if a task requires breaking I or V, the right answer is to revisit the task, not to make an exception.

Here is a fragment of the first principle:

```text
### I. Contracts First (NON-NEGOTIABLE)

Any change to external behaviour is first recorded in docs/CONTRACTS.md
and only then implemented in code.

- Additive change (new field, new event) — MINOR version.
- Incompatible change — MAJOR version and a consumer migration.
- Code diverging from the contract is a defect, not
  an underdocumented feature.
```

The last line matters most. Before the constitution it was the opposite: if code diverged from `CONTRACTS.md`, I edited the document "to match reality". Now a divergence is either a code bug or a contract bug — there is no third option.

## Principle I in practice

Take the feature of the series. We add a `function_next_payload` event that, in TRACE mode, shows which jobs a function picked next.

The order of operations is strict:

1. `docs/CONTRACTS.md` describes the new event and its fields.
2. The contract version goes from **v4.11** to **v4.12** — the change is additive, so MINOR.
3. Only then does the first line of code appear.

Step 2 sounds bureaucratic, but it answers the compatibility question for free: any consumer sees in the contract changelog that nothing broke, and that a new event was added which can be ignored.

## What changed in working with an agent

The main effect is not in the code but in the conversation. Previously any request to "add a field to an event" could end with a rewritten neighbouring event because it looked more logical to the agent. Now the work can be stopped with one phrase: "that is against principle I".

The agent reads the constitution at session start and says on its own: "For this change we need to update `docs/CONTRACTS.md` and bump the MINOR version first — shall I?"

Principles III and V are valuable too. The third forbids a solution that cannot be verified locally without live Jira and telephony — that is where the love for seventeen tests on an event nobody asked for came from. The fifth says a background job cannot be lost silently: any crash must leave an observable trace.

What the other three are about, briefly:

- **II. Configuration Is Data, Never Code.** Instance config is data, not a branch in the code. One codebase — many instances, each with its own config.
- **III. Offline-Testable By Default.** A test must not require the network or live services: providers are replaced with fakes, not with mocks "just in case".
- **IV. One Pod, Instance-Scoped Names.** Everything lives in one pod, resource names are bound to the instance. A second instance cannot overwrite the first one's data by accident.

Those three are not marked inviolable, but they are enforced just as strictly: diverging from them is a spec defect, not a matter of taste.

## The rule that is easy to underestimate

The constitution works only while it is short. Five principles take two minutes to read and you remember them. Twenty principles are read by nobody — neither human nor agent — and then a normative document turns into decoration.

If you want a sixth, first try to find the principle it refines. Most of the time it is a refinement, not a new principle.

The foundation is there. Next: what a spec for one small feature looks like on top of it, and why it takes eighteen requirements.

---

[← Post 2: plugging speckit in](/en/dev/blog/sdd-02-speckit-integration/) · [Post 4: `/speckit.specify` →](/en/dev/blog/sdd-04-spec-for-one-log-line/)
