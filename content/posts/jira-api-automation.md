---
slug: jira-api-automation
view: dev
date: 2025-10-11
tags: ["python", "jira", "automation"]
translations:
  ru:
    title: "Автоматизация Jira API: от оповещений к действиям"
    excerpt: "Использование Python для автоматизации рабочих процессов Jira с контейнеризированными демонами."
  en:
    title: "Jira API Automation: From Alerts to Action"
    excerpt: "Using Python to automate Jira workflows with containerized daemons."
  he:
    title: "אוטומציית Jira API: מהתראות לפעולה"
    excerpt: "שימוש ב-Python לאוטומציה של תהליכי עבודה ב-Jira עם דימונים בקונטיינרים."
---

<!-- lang:ru -->

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

<!-- lang:en -->

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

<!-- lang:he -->

<h2>מבוא</h2>
<p>Jira הוא כלי מרכזי למעקב משימות בצוותי תמיכה. אך ההתראות הסטנדרטיות של Jira לעיתים קרובות הולכות לאיבוד בשטפון האימייל. פתרנו זאת על ידי יצירת דימון Python בקונטיינר שמנטר את ה-API של Jira ושולח התראות חכמות לטלגרם.</p>

<h2>חיבור ל-Jira API</h2>
<p>אנחנו משתמשים בספריית jira-python לחיבור ל-Jira. שאילתות JQL מאפשרות סינון מדויק של משימות דחופות — לפי עדיפות, סטטוס, משימה ללא שיוך.</p>

<h2>ניטור משימות</h2>
<p>הדימון מדגום מעת לעת את ה-API של Jira, בודק משימות חדשות, שינויי סטטוס ו-SLA שעבר. לכל סוג אירוע הוא מעצב התראה מתאימה עם הקשר — עדיפות, זמן בתור, מהנדס מוקצה.</p>

<h2>שליחת התראות לטלגרם</h2>
<p>רמות חומרה שונות משתמשות בערוצים שונים: משימות P1 נשלחות לערוץ הכללי עם ציון האחראים, P2 לצ'אט העבודה, P3/P4 כהתראות אישיות למהנדס המוקצה.</p>

<h2>ארכיטקטורת הדימון</h2>
<p>הדימון רץ בתוך פוד Podman לצד Valkey לאחסון מצב. מנהרת SSH ל-Jira מופעלת כקונטיינר sidecar באמצעות תבנית הקונטיינר הזמני.</p>

<h2>אסטרטגיית לוגים</h2>
<p>לוגים מובנים בפורמט JSON מכילים: timestamp, רמה, issue_key, סוג התראה ותוצאת שליחה. הלוגים מוצגים ב-stdout של הקונטיינר ונאספים דרך podman logs או journald.</p>

<h2>פריסה עם Podman Pods</h2>
<p>כל ה-stack נפרס כפוד Podman יחיד: Valkey למצב, דימון ההתראות, ומנהרת SSH sidecar אופציונלית.</p>

<h2>הגנה מכפילויות</h2>
<p>Valkey שומר hash של אירועים שעובדו לאחרונה. לפני שליחת התראה, הדימון בודק אם היא כבר נשלחה. TTL על מפתחות מנקה אוטומטית ערכים ישנים.</p>

<h2>סיכום</h2>
<p>אוטומציית Jira דרך Python ודימון בקונטיינר יוצרת מערכת התראות אמינה ובלתי תלויה במנגנונים המובנים של Jira. פודים של Podman מספקים בידוד ופשטות פריסה.</p>
