---
view: leader
layout: layouts/post.njk
title: "Response-time SLA when all you have is email"
excerpt: "How to measure first-response time without a ticketing system: Exchange email threads, FRT calculated in Power BI, and escalations through PagerDuty."
date: 2026-10-28
topic: t6
slug: email-only-response-sla
permalink: /en/blog/email-only-response-sla/
---
## Introduction

Not every team starts with an ITSM platform. Requests arrive in a shared mailbox, engineers reply from Outlook, and the response-time SLA exists mostly on paper: there is nothing to measure it with. But the absence of a ticketing system does not cancel measurability — email already keeps everything you need, once you agree on what counts as a response.

## What counts as a response

First, we fix the definition: the metric is first response time (FRT), the interval between the client's email and the first substantive reply from an engineer. "Substantive" — because an auto-reply of "we received your message" is not a response. The definition must be agreed with the client in advance: if the SLA says "response within 2 business hours", both sides must understand the same thing about what qualifies.

## The data is already there: email threads

Messages in Exchange carry everything needed to reconstruct the timeline: ConversationId ties a thread together, From/ToRecipients show the participants, and every message has a timestamp. The algorithm is simple:

1. Group messages by ConversationId.
2. Mark inbound messages from the client's domain and outbound ones from engineers.
3. Thread FRT = first outbound message from an engineer minus first inbound from the client.
4. Subsequent reactions are computed by the same rule further down the thread.

Filtering works on headers, not on message bodies: signatures, quoted fragments and mailing-list footers break text parsing but not headers. Auto-replies (usually detected by the X-Autoreply and precedence headers) and internal messages are cut off separately.

## Power BI as ETL and reporting

Power BI comes next. Power Query pulls mail from Exchange (the built-in Exchange connector or Graph API) and normalizes it into two tables: messages and threads. On top of them — DAX measures: FRT median and 90th percentile, the share of threads within SLA, breakdowns by engineer and weekday. The report refreshes on a schedule, and the dashboard is visible to both the team and management — which is discipline in itself.

## PagerDuty: reaction outside business hours

Email cannot wake up the on-call engineer. The bridge between a message and a person is PagerDuty: an inbound email to the critical mailbox creates an event in PagerDuty (via its built-in email integration or a lightweight mailbox monitor), and from there its escalation schedule takes over. The division of responsibility is clean: PagerDuty answers "who heard about it and when", Power BI — "in how many minutes and with what quality". The time from event creation to acknowledgement is the second metric alongside FRT.

## Pitfalls

- Time zones and business hours: counting calendar hours or support-window hours must be decided before rollout, otherwise the metric will be contested.
- Distribution groups: a message to a group creates a thread with several participants; the engineer is whoever actually replied.
- Forwards: if a message was forwarded to an external system, the conversation breaks; such threads are marked separately.
- Outliers: one email on a holiday ruins the median — look at percentiles, not the average.

## Result

The Exchange + Power BI + PagerDuty stack delivers a measurable response SLA without buying an ITSM platform: actual FRT figures, SLA compliance share and escalation points. The main gain, though, is a basis for decisions: where the bottleneck is, which weekday is overloaded, whether a second line is needed. Measurability is the precondition for manageability.
