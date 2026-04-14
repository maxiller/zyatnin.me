---
layout: layouts/post.njk
title: "SSH-туннели в контейнерах: безопасный доступ к удалённым сервисам"
excerpt: "Контейнеризированные SSH-туннели для доступа к Asterisk ARI и базам данных."
date: 2026-01-15
topic: t5
slug: ssh-tunnels-containers
permalink: /ru/blog/ssh-tunnels-containers/
---

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