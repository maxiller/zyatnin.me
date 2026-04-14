---
layout: layouts/post.njk
title: "Автоматизация Jira API: от оповещений к действиям"
excerpt: "Использование Python для автоматизации рабочих процессов Jira с контейнеризированными демонами."
date: 2026-02-15
topic: t2
slug: jira-api-automation
permalink: /ru/blog/jira-api-automation/
---

<h2>Введение</h2>
            <p>Jira — центральный инструмент для отслеживания задач в команде поддержки. Но стандартные уведомления Jira часто теряются в потоке email. Мы решили эту проблему, создав контейнеризированный Python-демон, который мониторит Jira API и отправляет умные оповещения в Telegram.</p>

            <h2>Подключение к Jira API</h2>
            <pre><code><span class="kw">from</span> jira <span class="kw">import</span> JIRA

<span class="kw">def</span> <span class="fn">get_jira_client</span>():
    <span class="kw">return</span> JIRA(
        server=<span class="str">"https://jira.example.com"</span>,
        basic_auth=(JIRA_USER, JIRA_TOKEN)
    )

<span class="kw">def</span> <span class="fn">get_urgent_issues</span>(jira):
    <span class="cm"># JQL-запрос для неназначенных P1/P2 задач</span>
    jql = (<span class="str">'project = SUPPORT AND priority in (P1, P2) '</span>
           <span class="str">'AND status = Open AND assignee is EMPTY '</span>
           <span class="str">'ORDER BY priority ASC, created DESC'</span>)
    <span class="kw">return</span> jira.search_issues(jql, maxResults=<span class="num">50</span>)</code></pre>

            <h2>Мониторинг задач</h2>
            <p>Демон периодически опрашивает Jira API, проверяя новые задачи, изменения статусов и просроченные SLA. Для каждого типа события формируется соответствующее уведомление с контекстом — приоритет, время в очереди, назначенный инженер.</p>

            <h2>Отправка оповещений в Telegram</h2>
            <p>Для разных уровней критичности используются разные каналы: P1-задачи отправляются в общий канал с mention ответственных, P2 — в рабочий чат, P3/P4 — в персональные уведомления назначенному инженеру.</p>
            <pre><code><span class="kw">async def</span> <span class="fn">send_alert</span>(issue, alert_type):
    message = format_alert(issue, alert_type)
    channel = get_channel_for_priority(issue.fields.priority.name)
    
    <span class="kw">await</span> bot.send_message(
        chat_id=channel,
        text=message,
        parse_mode=<span class="str">"HTML"</span>
    )</code></pre>

            <h2>Архитектура демона</h2>
            <p>Демон работает внутри Podman-пода вместе с Valkey для хранения состояния (какие задачи уже обработаны, когда было последнее оповещение). SSH-туннель к Jira запускается как sidecar-контейнер по паттерну эфемерных контейнеров.</p>

            <h2>Стратегия логирования</h2>
            <p>Структурированные JSON-логи содержат: timestamp, уровень, issue_key, alert_type, результат отправки. Логи выводятся в stdout контейнера и собираются через podman logs или journald. Ротация логов настроена через systemd.</p>

            <h2>Развёртывание с Podman-подами</h2>
            <pre><code><span class="cm"># Создание пода</span>
podman pod create --name jira-alert-pod -p <span class="num">6379</span>:<span class="num">6379</span>

<span class="cm"># Valkey для хранения состояния</span>
podman run -d --pod jira-alert-pod --name valkey \
  docker.io/valkey/valkey:8

<span class="cm"># Демон оповещений</span>
podman run -d --pod jira-alert-pod --name alerter \
  -e JIRA_USER=bot@example.com \
  -e BOT_TOKEN=... \
  localhost/jira-alert-daemon:latest</code></pre>

            <h2>Защита от дублирования</h2>
            <p>Valkey хранит хеш последних обработанных событий. Перед отправкой оповещения демон проверяет, не было ли оно уже отправлено. TTL на ключах автоматически очищает старые записи.</p>

            <h2>Заключение</h2>
            <p>Автоматизация Jira через Python и контейнеризированный демон позволяет создать надёжную систему оповещений, не зависящую от встроенных механизмов Jira. Podman-поды обеспечивают изоляцию и простоту развёртывания.</p>