---
slug: ephemeral-sidecar-podman-pods
view: dev
date: 2026-01-04
tags: ["podman", "containers", "ssh"]
translations:
  ru:
    title: "Паттерн эфемерных sidecar-контейнеров: управление SSH-туннелями в Podman-подах"
    excerpt: "Как динамически запускать и останавливать контейнеры внутри Podman-пода с помощью Python."
  en:
    title: "Ephemeral Sidecar Pattern: Managing SSH Tunnels in Podman Pods"
    excerpt: "How to dynamically start and stop containers within a Podman pod using Python context managers."
  he:
    title: "תבנית Sidecar זמנית: ניהול מנהרות SSH בפודים של Podman"
    excerpt: "איך להפעיל ולעצור קונטיינרים דינמית בתוך פוד Podman באמצעות Python."
---

<!-- lang:ru -->

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

<!-- lang:en -->

<h2>Introduction</h2>
<p>When working with microservice architecture based on Podman, you often need to dynamically manage auxiliary containers within a pod. One of the most common scenarios involves SSH tunnels to remote services: databases, APIs, and monitoring systems. In this article, I'll describe the "ephemeral sidecar container" pattern and its Python implementation.</p>

<h2>Pod Architecture</h2>
<p>Our Podman pod consists of three main components: Valkey (a Redis fork) for the task queue, an RQ worker for processing tasks, and an ephemeral SSH tunnel that starts on demand. All containers share a pod, which means a shared network namespace — a tunnel opened in the sidecar container is accessible to the worker via localhost.</p>

<pre><code><span class="cm"># Create pod with forwarded ports</span>
<span class="fn">podman</span> pod create --name jira-stack \
  -p 6379:6379 \
  -p 8080:8080

<span class="cm"># Start Valkey in the pod</span>
<span class="fn">podman</span> run -d --pod jira-stack \
  --name valkey \
  docker.io/valkey/valkey:8

<span class="cm"># Start the worker</span>
<span class="fn">podman</span> run -d --pod jira-stack \
  --name worker \
localhost/jira-worker:latest</code></pre>

<h2>Python Context Manager for Container Lifecycle</h2>
<p>The key element of this pattern is a Python context manager that handles starting and stopping the sidecar container. This guarantees proper resource cleanup even when errors occur.</p>

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

<h2>Usage in RQ Tasks</h2>
<p>Now we can use the context manager when processing tasks. The worker starts the SSH tunnel before executing a task and guarantees its shutdown after completion:</p>

<pre><code><span class="kw">def</span> <span class="fn">process_jira_task</span>(issue_key):
    <span class="kw">with</span> EphemeralContainer(<span class="str">"ssh-tunnel"</span>, <span class="str">"jira-stack"</span>):
        <span class="cm"># Tunnel is active, connect to Jira via localhost</span>
        jira = JIRA(server=<span class="str">"http://localhost:8080"</span>, ...)
        issue = jira.issue(issue_key)
        <span class="cm"># Process the issue</span>
        process_issue(issue)
<span class="cm"># Tunnel is automatically stopped</span></code></pre>

<h2>Containerfile for the SSH Tunnel</h2>
<p>The tunnel container includes an SSH client and a connection script with automatic reconnection:</p>

<pre><code><span class="kw">FROM</span> docker.io/library/alpine:3.19
<span class="kw">RUN</span> apk add --no-cache openssh-client
<span class="kw">COPY</span> tunnel.sh /tunnel.sh
<span class="kw">RUN</span> chmod +x /tunnel.sh
<span class="kw">HEALTHCHECK</span> --interval=5s --timeout=3s \
  CMD nc -z localhost 8080 || exit 1
<span class="kw">ENTRYPOINT</span> ["/tunnel.sh"]</code></pre>

<h2>Health Checks and Monitoring</h2>
<p>It's critical to configure health checks for sidecar containers. Podman supports built-in healthcheck directives in Containerfiles. Our context manager waits for the health check to pass before continuing — this prevents situations where the worker tries to use a connection that hasn't been established yet.</p>

<h2>Error Handling and Worker Restart</h2>
<p>When a worker restarts, all ephemeral containers must be properly stopped. We add a signal handler and a startup cleanup procedure that stops any leftover sidecar containers from the previous session. The context manager's <code>__exit__</code> method ensures cleanup on both normal completion and exceptions.</p>

<h2>Conclusion</h2>
<p>The ephemeral sidecar pattern lets you save resources by starting auxiliary services only when needed. Python's context manager ensures reliable lifecycle management, and Podman pods provide a shared network namespace for container communication. This approach is especially effective for SSH tunnels, database connections, and other resource-intensive connections.</p>

<!-- lang:he -->

<h2>מבוא</h2>
<p>כשעובדים עם ארכיטקטורת מיקרו-שירותים המבוססת על Podman, לעיתים קרובות נדרש לנהל באופן דינמי קונטיינרים עזר בתוך פוד. אחד התרחישים הנפוצים ביותר כולל מנהרות SSH לשירותים מרוחקים: מסדי נתונים, ממשקי API ומערכות ניטור. במאמר זה אתאר את תבנית "קונטיינר sidecar זמני" ואת המימוש שלה ב-Python.</p>

<h2>ארכיטקטורת הפוד</h2>
<p>הפוד שלנו ב-Podman מורכב משלושה רכיבים עיקריים: Valkey (fork של Redis) לתור המשימות, עובד RQ לעיבוד משימות, ומנהרת SSH זמנית שמופעלת לפי דרישה. כל הקונטיינרים נמצאים בפוד אחד, מה שמשמעו מרחב רשת משותף — מנהרה שנפתחת בקונטיינר ה-sidecar נגישה לעובד דרך localhost.</p>

<pre><code><span class="cm"># יצירת פוד עם העברת פורטים</span>
<span class="fn">podman</span> pod create --name jira-stack   -p 6379:6379   -p 8080:8080

<span class="cm"># הפעלת Valkey בפוד</span>
<span class="fn">podman</span> run -d --pod jira-stack   --name valkey   docker.io/valkey/valkey:8

<span class="cm"># הפעלת העובד</span>
<span class="fn">podman</span> run -d --pod jira-stack   --name worker   localhost/jira-worker:latest</code></pre>

<h2>מנהל הקשר של Python למחזור חיי הקונטיינר</h2>
<p>המרכיב המרכזי של תבנית זו הוא מנהל הקשר (context manager) של Python שמטפל בהפעלה ועצירה של קונטיינר ה-sidecar. זה מבטיח ניקוי נכון של משאבים גם כשמתרחשות שגיאות.</p>

<pre><code><span class="kw">class</span> <span class="fn">EphemeralContainer</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, name, pod_name):
        self.name = name
        self.pod_name = pod_name

    <span class="kw">def</span> <span class="fn">__enter__</span>(self):
        subprocess.run(
            [<span class="str">"podman"</span>, <span class="str">"start"</span>, self.name],
            check=<span class="kw">True</span>
        )
        self._wait_healthy()
        <span class="kw">return</span> self

    <span class="kw">def</span> <span class="fn">__exit__</span>(self, *args):
        subprocess.run(
            [<span class="str">"podman"</span>, <span class="str">"stop"</span>, <span class="str">"-t"</span>, <span class="str">"5"</span>, self.name]
)</code></pre>

<h2>שימוש במשימות RQ</h2>
<p>כעת אנחנו יכולים להשתמש במנהל ההקשר בעיבוד משימות. העובד מפעיל את מנהרת ה-SSH לפני ביצוע משימה ומבטיח את כיבויה לאחר סיום. מנהרת ה-SSH פעילה רק כשנדרשת, מה שחוסך משאבי מערכת.</p>

<h2>Containerfile למנהרת SSH</h2>
<p>קונטיינר המנהרה כולל לקוח SSH וסקריפט חיבור עם חיבור מחדש אוטומטי. ה-HEALTHCHECK מבטיח שהמנהרה פעילה לפני שהעובד מנסה להשתמש בה.</p>

<h2>בדיקות תקינות וניטור</h2>
<p>חיוני להגדיר בדיקות תקינות לקונטיינרי sidecar. Podman תומך בהוראות healthcheck מובנות ב-Containerfile. מנהל ההקשר שלנו ממתין לעבור את בדיקת התקינות לפני שממשיך — זה מונע מצבים שבהם העובד מנסה להשתמש בחיבור שטרם הוקם.</p>

<h2>טיפול בשגיאות והפעלה מחדש של העובד</h2>
<p>כשעובד מופעל מחדש, כל הקונטיינרים הזמניים חייבים להיעצר כראוי. אנחנו מוסיפים מטפל סיגנלים ותהליך ניקוי בהפעלה שעוצר קונטיינרי sidecar שנשארו מהסשן הקודם. שיטת <code>__exit__</code> של מנהל ההקשר מבטיחה ניקוי בסיום רגיל וגם בחריגות.</p>

<h2>סיכום</h2>
<p>תבנית ה-sidecar הזמני מאפשרת לחסוך משאבים על ידי הפעלת שירותי עזר רק כשנדרש. מנהל ההקשר של Python מבטיח ניהול מחזור חיים אמין, ופודים של Podman מספקים מרחב רשת משותף לתקשורת בין קונטיינרים. גישה זו יעילה במיוחד למנהרות SSH, חיבורי מסד נתונים וחיבורים אחרים עתירי משאבים.</p>
