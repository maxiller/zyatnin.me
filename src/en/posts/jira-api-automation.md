---
layout: layouts/post.njk
title: "Jira API Automation: From Alerts to Action"
excerpt: "Using Python to automate Jira workflows with containerized daemons."
date: 2026-02-15
topic: t2
slug: jira-api-automation
permalink: /en/blog/jira-api-automation/
---

<h2>Introduction</h2>
            <p>Jira is a central tool for task tracking in support teams. But standard Jira notifications often get lost in the email flood. We solved this by creating a containerized Python daemon that monitors the Jira API and sends smart alerts to Telegram.</p>

            <h2>Connecting to Jira API</h2>
            <pre><code><span class="kw">from</span> jira <span class="kw">import</span> JIRA

<span class="kw">def</span> <span class="fn">get_jira_client</span>():
    <span class="kw">return</span> JIRA(
        server=<span class="str">"https://jira.example.com"</span>,
        basic_auth=(JIRA_USER, JIRA_TOKEN)
    )

<span class="kw">def</span> <span class="fn">get_urgent_issues</span>(jira):
    jql = (<span class="str">'project = SUPPORT AND priority in (P1, P2) '</span>
           <span class="str">'AND status = Open AND assignee is EMPTY'</span>)
    <span class="kw">return</span> jira.search_issues(jql, maxResults=<span class="num">50</span>)</code></pre>

            <h2>Issue Monitoring</h2>
            <p>The daemon periodically polls the Jira API, checking for new issues, status changes, and overdue SLAs. For each event type, it formats a corresponding notification with context — priority, queue time, assigned engineer.</p>

            <h2>Sending Alerts to Telegram</h2>
            <p>Different severity levels use different channels: P1 issues go to the general channel with responsible mentions, P2 to the work chat, P3/P4 as personal notifications to the assigned engineer.</p>

            <h2>Daemon Architecture</h2>
            <p>The daemon runs inside a Podman pod alongside Valkey for state storage (which issues have been processed, when the last alert was sent). The SSH tunnel to Jira launches as a sidecar container using the ephemeral container pattern.</p>

            <h2>Logging Strategy</h2>
            <p>Structured JSON logs contain: timestamp, level, issue_key, alert_type, and send result. Logs output to the container's stdout and are collected via podman logs or journald. Log rotation is configured through systemd.</p>

            <h2>Deployment with Podman Pods</h2>
            <p>The entire stack deploys as a single Podman pod: Valkey for state, the alert daemon, and an optional SSH tunnel sidecar. Environment variables configure Jira credentials and Telegram bot tokens.</p>

            <h2>Deduplication Protection</h2>
            <p>Valkey stores a hash of recently processed events. Before sending an alert, the daemon checks if it was already sent. TTL on keys automatically cleans old entries, preventing memory growth.</p>

            <h2>Conclusion</h2>
            <p>Automating Jira through Python and a containerized daemon creates a reliable alerting system independent of Jira's built-in mechanisms. Podman pods provide isolation and deployment simplicity.</p>