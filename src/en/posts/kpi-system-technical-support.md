---
layout: layouts/post.njk
title: "Designing KPI Systems for Technical Support Teams"
excerpt: "ITIL-based approach to measuring L3 support engineer performance."
date: 2026-01-20
topic: t4
slug: kpi-system-technical-support
permalink: /en/blog/kpi-system-technical-support/
---

<h2>Introduction</h2>
            <p>Measuring L3 support team effectiveness is a non-trivial task. Standard metrics (closed tickets, response time) don't account for incident complexity and solution quality. In this article, I present a comprehensive KPI system based on ITIL methodology.</p>

            <h2>Block A (70%): Weighted SLA with Complexity Coefficients</h2>
            <p>The main evaluation block accounts for task priority and complexity. Each priority has its target SLA and weight:</p>
            <ul>
              <li><strong>P1 (Critical)</strong> — SLA 4 hours, weight 4.0. Complete service failure.</li>
              <li><strong>P2 (High)</strong> — SLA 8 hours, weight 2.5. Significant functionality reduction.</li>
              <li><strong>P3 (Medium)</strong> — SLA 24 hours, weight 1.5. Partial degradation.</li>
              <li><strong>P4 (Low)</strong> — SLA 72 hours, weight 1.0. Cosmetic issues.</li>
            </ul>

            <h2>Complexity Modifiers</h2>
            <p>Additional coefficients account for task specifics:</p>
            <ul>
              <li><strong>R&D Interaction</strong> (×1.3) — tasks requiring coordination with the development team</li>
              <li><strong>Astra Linux Security Modules</strong> (×1.5) — working with certified security systems</li>
              <li><strong>Multi-service Incident</strong> (×1.4) — affecting multiple TermiDesk components</li>
              <li><strong>Proactive Detection</strong> (×1.2) — engineer discovered the issue before customer report</li>
            </ul>

            <h2>Proactivity Scoring</h2>
            <p>Proactivity is a separate metric in Block A. It measures incidents prevented or discovered independently: log analysis, metric monitoring, automated checks. This encourages engineers to be proactive rather than purely reactive.</p>

            <h2>Block B (30%): Personal, Group, and Corporate Responsibility</h2>
            <p>Block B is divided into three levels: Personal (40%) covers schedule adherence, documentation quality, and training. Group (35%) covers peer assistance, knowledge sharing, and mentoring. Corporate (25%) covers process improvement, initiatives, and feedback.</p>

            <h2>Pilot Period</h2>
            <p>KPI system implementation requires a 2-3 month pilot. During this period, metrics are collected but don't affect evaluation. The goal is coefficient and threshold calibration on the team's actual data.</p>

            <h2>Data Collection Methodology</h2>
            <p>Block A data is collected automatically via Jira API: response time, resolution time, priority, category. Block B data comes through regular manager evaluations and peer review. Collection automation is critical for objectivity.</p>

            <h2>Conclusion</h2>
            <p>A two-block KPI system with weighted SLA and complexity modifiers provides fair evaluation that accounts for the real complexity of L3 engineering work. Pilot periods and iterative calibration ensure metric adequacy.</p>