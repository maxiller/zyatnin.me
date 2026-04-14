---
layout: layouts/post.njk
title: "Паттерн эфемерных sidecar-контейнеров: управление SSH-туннелями в Podman-подах"
excerpt: "Как динамически запускать и останавливать контейнеры внутри Podman-пода с помощью Python."
date: 2026-03-15
topic: t1
slug: ephemeral-sidecar-podman-pods
permalink: /ru/blog/ephemeral-sidecar-podman-pods/
---

<h2>Введение</h2>
            <p>При работе с микросервисной архитектурой на базе Podman часто возникает потребность в динамическом управлении вспомогательными контейнерами внутри пода. Один из самых распространённых сценариев — SSH-туннели к удалённым сервисам: базам данных, API, системам мониторинга. В этой статье я расскажу о паттерне «эфемерных sidecar-контейнеров» и его реализации на Python.</p>

            <h2>Архитектура пода</h2>
            <p>Наш Podman-под состоит из трёх основных компонентов: Valkey (форк Redis) для очереди задач, RQ-воркер для обработки задач и эфемерный SSH-туннель, который запускается по требованию. Все контейнеры находятся в одном поде, что означает общее сетевое пространство — туннель, открытый в sidecar-контейнере, доступен воркеру через localhost.</p>
            <pre><code><span class="cm"># Создание пода с проброшенными портами</span>
<span class="fn">podman</span> pod create --name jira-stack \
  -p 6379:6379 \
  -p 8080:8080

<span class="cm"># Запуск Valkey в поде</span>
<span class="fn">podman</span> run -d --pod jira-stack \
  --name valkey \
  docker.io/valkey/valkey:8

<span class="cm"># Запуск воркера</span>
<span class="fn">podman</span> run -d --pod jira-stack \
  --name worker \
  localhost/jira-worker:latest</code></pre>

            <h2>Python Context Manager для жизненного цикла контейнера</h2>
            <p>Ключевой элемент паттерна — Python context manager, который управляет запуском и остановкой sidecar-контейнера. Это гарантирует корректную очистку ресурсов даже при возникновении ошибок.</p>
            <pre><code><span class="kw">import</span> subprocess
<span class="kw">import</span> logging

logger = logging.getLogger(__name__)

<span class="kw">class</span> <span class="fn">EphemeralContainer</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, name, pod_name):
        self.name = name
        self.pod_name = pod_name
    
    <span class="kw">def</span> <span class="fn">__enter__</span>(self):
        logger.info(<span class="str">f"Starting container {self.name}"</span>)
        subprocess.run(
            [<span class="str">"podman"</span>, <span class="str">"start"</span>, self.name],
            check=<span class="kw">True</span>,
            capture_output=<span class="kw">True</span>
        )
        self._wait_healthy()
        <span class="kw">return</span> self
    
    <span class="kw">def</span> <span class="fn">__exit__</span>(self, *args):
        logger.info(<span class="str">f"Stopping container {self.name}"</span>)
        subprocess.run(
            [<span class="str">"podman"</span>, <span class="str">"stop"</span>, <span class="str">"-t"</span>, <span class="str">"5"</span>, self.name],
            capture_output=<span class="kw">True</span>
        )
    
    <span class="kw">def</span> <span class="fn">_wait_healthy</span>(self):
        <span class="kw">for</span> _ <span class="kw">in</span> range(<span class="num">30</span>):
            result = subprocess.run(
                [<span class="str">"podman"</span>, <span class="str">"healthcheck"</span>, <span class="str">"run"</span>, self.name],
                capture_output=<span class="kw">True</span>
            )
            <span class="kw">if</span> result.returncode == <span class="num">0</span>:
                <span class="kw">return</span>
            time.sleep(<span class="num">1</span>)
        <span class="kw">raise</span> TimeoutError(<span class="str">"Container health check failed"</span>)</code></pre>

            <h2>Использование в задачах RQ</h2>
            <p>Теперь мы можем использовать контекстный менеджер при обработке задач. Воркер запускает SSH-туннель перед выполнением задачи и гарантирует его остановку после завершения:</p>
            <pre><code><span class="kw">def</span> <span class="fn">process_jira_task</span>(issue_key):
    <span class="kw">with</span> EphemeralContainer(<span class="str">"ssh-tunnel"</span>, <span class="str">"jira-stack"</span>):
        <span class="cm"># Туннель активен, подключаемся к Jira через localhost</span>
        jira = JIRA(server=<span class="str">"http://localhost:8080"</span>, ...)
        issue = jira.issue(issue_key)
        <span class="cm"># Обрабатываем задачу</span>
        process_issue(issue)
    <span class="cm"># Туннель автоматически остановлен</span></code></pre>

            <h2>Containerfile для SSH-туннеля</h2>
            <p>Контейнер туннеля содержит SSH-клиент и скрипт подключения с автоматическим переподключением:</p>
            <pre><code><span class="kw">FROM</span> docker.io/library/alpine:3.19
<span class="kw">RUN</span> apk add --no-cache openssh-client
<span class="kw">COPY</span> tunnel.sh /tunnel.sh
<span class="kw">RUN</span> chmod +x /tunnel.sh
<span class="kw">HEALTHCHECK</span> --interval=5s --timeout=3s \
  CMD nc -z localhost 8080 || exit 1
<span class="kw">ENTRYPOINT</span> ["/tunnel.sh"]</code></pre>

            <h2>Health Checks и мониторинг</h2>
            <p>Критически важно настроить проверки здоровья для sidecar-контейнеров. Podman поддерживает встроенные healthcheck-директивы в Containerfile. Наш контекстный менеджер ожидает прохождения проверки перед продолжением работы — это предотвращает ситуации, когда воркер пытается использовать ещё не установленное соединение.</p>

            <h2>Обработка ошибок и перезапуск воркера</h2>
            <p>При перезапуске воркера все эфемерные контейнеры должны быть корректно остановлены. Для этого мы добавляем обработчик сигналов и процедуру очистки при запуске, которая останавливает все оставшиеся sidecar-контейнеры из предыдущей сессии. Метод <code>__exit__</code> контекстного менеджера обеспечивает очистку при нормальном завершении и при исключениях.</p>

            <h2>Заключение</h2>
            <p>Паттерн эфемерных sidecar-контейнеров позволяет экономить ресурсы, запуская вспомогательные сервисы только при необходимости. Python context manager обеспечивает надёжное управление жизненным циклом, а Podman-поды предоставляют общее сетевое пространство для взаимодействия контейнеров. Этот подход особенно эффективен для SSH-туннелей, подключений к базам данных и других ресурсоёмких соединений.</p>