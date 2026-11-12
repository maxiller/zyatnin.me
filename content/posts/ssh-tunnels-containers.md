---
slug: ssh-tunnels-containers
view: dev
date: 2025-07-18
tags: ["containers", "ssh", "networking"]
translations:
  ru:
    title: "SSH-туннели в контейнерах: безопасный доступ к удалённым сервисам"
    excerpt: "Контейнеризированные SSH-туннели для доступа к Asterisk ARI и базам данных."
  en:
    title: "SSH Tunnels in Containers: Secure Access to Remote Services"
    excerpt: "Containerized SSH tunnels for accessing Asterisk ARI, databases, and APIs."
  he:
    title: "מנהרות SSH בקונטיינרים: גישה מאובטחת לשירותים מרוחקים"
    excerpt: "מנהרות SSH בקונטיינרים לגישה ל-Asterisk ARI, מסדי נתונים ו-API."
---

<!-- lang:ru -->

<h2>Введение</h2>
<p>Доступ к удалённым сервисам через SSH-туннели — стандартная практика в enterprise-среде. Контейнеризация этих туннелей добавляет изоляцию, упрощает управление и позволяет интегрировать их в инфраструктуру Podman-подов.</p>

<h2>Containerfile для SSH-туннеля</h2>

<pre><code><span class="kw">FROM</span> docker.io/library/alpine:3.19
<span class="kw">RUN</span> apk add --no-cache openssh-client netcat-openbsd
<span class="kw">COPY</span> tunnel.sh /tunnel.sh
<span class="kw">COPY</span> ssh_config /etc/ssh/ssh_config
<span class="kw">RUN</span> chmod +x /tunnel.sh
<span class="kw">HEALTHCHECK</span> --interval=10s --timeout=5s --retries=3 \
  CMD nc -z localhost 8088 || exit 1
<span class="kw">ENTRYPOINT</span> ["/tunnel.sh"]</code></pre>

<h2>Скрипт туннеля (tunnel.sh)</h2>

<pre><code><span class="cm">#!/bin/sh</span>
<span class="kw">set</span> -euo pipefail

<span class="cm"># Добавляем ключ хоста</span>
mkdir -p /root/.ssh
ssh-keyscan -H <span class="str">"$REMOTE_HOST"</span> >> /root/.ssh/known_hosts <span class="num">2</span>>/dev/null

<span class="cm"># Цикл переподключения</span>
<span class="kw">while</span> true; <span class="kw">do</span>
    echo <span class="str">"[$(date)] Connecting to $REMOTE_HOST..."</span>
    ssh -N -o ServerAliveInterval=<span class="num">30</span> \
        -o ServerAliveCountMax=<span class="num">3</span> \
        -o ExitOnForwardFailure=yes \
        -L 0.0.0.0:<span class="str">"$LOCAL_PORT"</span>:<span class="str">"$TARGET_HOST"</span>:<span class="str">"$TARGET_PORT"</span> \
        -i /secrets/ssh_key \
        <span class="str">"$SSH_USER"</span>@<span class="str">"$REMOTE_HOST"</span> || true

    echo <span class="str">"[$(date)] Disconnected. Reconnecting in 5s..."</span>
    sleep <span class="num">5</span>
<span class="kw">done</span></code></pre>

<h2>Health Checks</h2>
<p>Healthcheck через netcat проверяет, что локальный порт туннеля доступен. Это позволяет другим контейнерам в поде дождаться установления туннеля перед началом работы. Podman выставляет статус здоровья через podman healthcheck run.</p>

<h2>Проброс портов (-L 0.0.0.0:port)</h2>
<p>Важный момент — привязка к 0.0.0.0 вместо localhost. Внутри Podman-пода контейнеры общаются через общий сетевой namespace. Туннель, привязанный к 0.0.0.0, доступен всем контейнерам пода. При привязке к 127.0.0.1 — только самому контейнеру туннеля.</p>

<h2>Управление known_hosts</h2>
<p>ssh-keyscan при запуске контейнера автоматически добавляет ключ удалённого хоста. Для повышения безопасности можно предоставить статический known_hosts через volume или Podman secret. StrictHostKeyChecking можно оставить yes при использовании предзагруженных ключей.</p>

<h2>Примеры использования</h2>
<p>Мы используем контейнеризированные SSH-туннели для доступа к Asterisk ARI (REST-интерфейс телефонии), базам данных PostgreSQL в защищённых сетях и API-сервисам, доступным только из определённых сегментов сети.</p>

<h2>Автоматическое переподключение</h2>
<p>Бесконечный цикл while true с sleep обеспечивает автоматическое восстановление при разрыве соединения. ServerAliveInterval и ServerAliveCountMax обнаруживают "мёртвые" соединения. ExitOnForwardFailure гарантирует корректный выход при невозможности проброса порта.</p>

<h2>Заключение</h2>
<p>Контейнеризированные SSH-туннели — надёжный и удобный способ обеспечения безопасного доступа к удалённым сервисам. Healthcheck, автопереподключение и интеграция с Podman-подами делают это решение production-ready.</p>

<!-- lang:en -->

<h2>Introduction</h2>
<p>Accessing remote services through SSH tunnels is standard practice in enterprise environments. Containerizing these tunnels adds isolation, simplifies management, and enables integration into Podman pod infrastructure.</p>

<h2>Containerfile for SSH Tunnel</h2>

<pre><code><span class="kw">FROM</span> docker.io/library/alpine:3.19
<span class="kw">RUN</span> apk add --no-cache openssh-client netcat-openbsd
<span class="kw">COPY</span> tunnel.sh /tunnel.sh
<span class="kw">RUN</span> chmod +x /tunnel.sh
<span class="kw">HEALTHCHECK</span> --interval=10s --timeout=5s --retries=3 \
  CMD nc -z localhost 8088 || exit 1
<span class="kw">ENTRYPOINT</span> ["/tunnel.sh"]</code></pre>

<h2>Tunnel Script (tunnel.sh)</h2>

<pre><code><span class="cm">#!/bin/sh</span>
<span class="kw">set</span> -euo pipefail

mkdir -p /root/.ssh
ssh-keyscan -H <span class="str">"$REMOTE_HOST"</span> >> /root/.ssh/known_hosts

<span class="kw">while</span> true; <span class="kw">do</span>
    ssh -N -o ServerAliveInterval=<span class="num">30</span> \
        -o ExitOnForwardFailure=yes \
        -L 0.0.0.0:<span class="str">"$LOCAL_PORT"</span>:<span class="str">"$TARGET_HOST"</span>:<span class="str">"$TARGET_PORT"</span> \
        -i /secrets/ssh_key \
        <span class="str">"$SSH_USER"</span>@<span class="str">"$REMOTE_HOST"</span> || true
    sleep <span class="num">5</span>
<span class="kw">done</span></code></pre>

<h2>Health Checks</h2>
<p>Netcat-based healthcheck verifies the tunnel's local port is accessible. This allows other containers in the pod to wait for tunnel establishment before starting work. Podman exposes health status via podman healthcheck run.</p>

<h2>Port Forwarding (-L 0.0.0.0:port)</h2>
<p>A critical detail — binding to 0.0.0.0 instead of localhost. Inside a Podman pod, containers communicate through a shared network namespace. A tunnel bound to 0.0.0.0 is accessible to all pod containers. Binding to 127.0.0.1 makes it available only to the tunnel container itself.</p>

<h2>known_hosts Management</h2>
<p>ssh-keyscan at container startup automatically adds the remote host key. For enhanced security, provide a static known_hosts via volume or Podman secret. StrictHostKeyChecking can remain yes when using preloaded keys.</p>

<h2>Use Cases</h2>
<p>We use containerized SSH tunnels for accessing Asterisk ARI (telephony REST interface), PostgreSQL databases in secured networks, and API services accessible only from specific network segments.</p>

<h2>Automatic Reconnection</h2>
<p>The infinite while true loop with sleep provides automatic recovery on connection loss. ServerAliveInterval and ServerAliveCountMax detect "dead" connections. ExitOnForwardFailure ensures clean exit when port forwarding fails.</p>

<h2>Conclusion</h2>
<p>Containerized SSH tunnels are a reliable and convenient way to provide secure access to remote services. Health checks, auto-reconnection, and Podman pod integration make this solution production-ready.</p>

<!-- lang:he -->

<h2>מבוא</h2>
<p>גישה לשירותים מרוחקים דרך מנהרות SSH היא שיטה סטנדרטית בסביבות ארגוניות. קונטיינריזציה של מנהרות אלו מוסיפה בידוד, מפשטת ניהול ומאפשרת אינטגרציה בתשתית Podman pods.</p>

<h2>Containerfile למנהרת SSH</h2>
<p>הקונטיינר מבוסס על Alpine עם לקוח OpenSSH ו-netcat. סקריפט המנהרה מטפל בחיבור ובחיבור מחדש אוטומטי. HEALTHCHECK מאמת שהפורט המקומי נגיש.</p>

<h2>סקריפט מנהרה (tunnel.sh)</h2>
<p>הסקריפט משתמש ב-set -euo pipefail לטיפול קפדני בשגיאות. ssh-keyscan מוסיף אוטומטית את מפתח המארח המרוחק. לולאת while אינסופית עם sleep מבטיחה חיבור מחדש אוטומטי.</p>

<h2>בדיקות תקינות</h2>
<p>בדיקת תקינות מבוססת netcat מאמתת שהפורט המקומי של המנהרה נגיש. זה מאפשר לקונטיינרים אחרים בפוד להמתין להקמת המנהרה לפני תחילת העבודה.</p>

<h2>העברת פורטים (-L 0.0.0.0:port)</h2>
<p>פרט קריטי — קשירה ל-0.0.0.0 במקום localhost. בתוך פוד Podman, קונטיינרים מתקשרים דרך מרחב רשת משותף. מנהרה הקשורה ל-0.0.0.0 נגישה לכל קונטיינרי הפוד.</p>

<h2>ניהול known_hosts</h2>
<p>ssh-keyscan בהפעלת הקונטיינר מוסיף אוטומטית את מפתח המארח המרוחק. לאבטחה משופרת, ניתן לספק known_hosts סטטי דרך volume או Podman secret.</p>

<h2>מקרי שימוש</h2>
<p>אנחנו משתמשים במנהרות SSH בקונטיינרים לגישה ל-Asterisk ARI, מסדי נתונים PostgreSQL ברשתות מאובטחות, ושירותי API הנגישים רק מסגמנטי רשת ספציפיים.</p>

<h2>סיכום</h2>
<p>מנהרות SSH בקונטיינרים הן דרך אמינה ונוחה לספק גישה מאובטחת לשירותים מרוחקים. בדיקות תקינות, חיבור מחדש אוטומטי ואינטגרציית Podman pod הופכים פתרון זה למוכן לייצור.</p>
