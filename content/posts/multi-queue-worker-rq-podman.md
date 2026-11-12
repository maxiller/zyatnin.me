---
slug: multi-queue-worker-rq-podman
view: dev
date: 2025-12-18
tags: ["python", "queues", "podman"]
translations:
  ru:
    title: "Мульти-очередной воркер с RQ и Podman"
    excerpt: "Архитектура единого RQ-воркера, слушающего несколько очередей и диспетчеризующего задачи в контейнеры."
  en:
    title: "Building a Multi-Queue Worker with RQ and Podman"
    excerpt: "Architecture for a single RQ worker listening to multiple queues and dispatching tasks to different containers."
  he:
    title: "בניית Worker מרובה תורים עם RQ ו-Podman"
    excerpt: "ארכיטקטורה של עובד RQ יחיד שמקשיב למספר תורים ומפיץ משימות לקונטיינרים שונים."
---

<!-- lang:ru -->

<h2>Введение</h2>
<p>В системах с несколькими источниками задач — Jira, Asterisk, Telegram — возникает потребность в централизованной обработке через единый воркер. RQ (Redis Queue) предоставляет элегантный механизм мульти-очередного прослушивания, который мы комбинируем с контейнерной диспетчеризацией через Podman.</p>

<h2>Структура конфигурации</h2>
<p>Вся маршрутизация задач определяется в config.yaml. Каждая очередь сопоставлена с конкретным контейнерным образом и командой:</p>

<pre><code><span class="cm"># config.yaml</span>
queues:
  jira:
    image: localhost/jira-processor:latest
    command: [<span class="str">"python"</span>, <span class="str">"process.py"</span>]
    podman_args: [<span class="str">"--pod"</span>, <span class="str">"jira-stack"</span>]
  asterisk:
    image: localhost/asterisk-handler:latest
    command: [<span class="str">"python"</span>, <span class="str">"handle_call.py"</span>]
    podman_args: [<span class="str">"--pod"</span>, <span class="str">"voip-stack"</span>]
  telegram:
    image: localhost/tg-worker:latest
    command: [<span class="str">"python"</span>, <span class="str">"tg_task.py"</span>]
podman_args: []</code></pre>

<h2>RoundRobinWorker</h2>
<p>Стандартный RQ Worker обрабатывает очереди по приоритету — первая очередь всегда имеет преимущество. Для равномерного распределения нагрузки мы используем кастомный RoundRobinWorker:</p>

<pre><code><span class="kw">from</span> rq <span class="kw">import</span> Worker
<span class="kw">from</span> itertools <span class="kw">import</span> cycle

<span class="kw">class</span> <span class="fn">RoundRobinWorker</span>(Worker):
    <span class="kw">def</span> <span class="fn">reorder_queues</span>(self, reference_queue):
        <span class="cm"># Ротация очередей после каждой задачи</span>
        pos = self.queues.index(reference_queue)
self.queues = self.queues[pos+<span class="num">1</span>:] + self.queues[:pos+<span class="num">1</span>]</code></pre>

<h2>Функция run_container_task</h2>
<p>Центральная функция диспетчеризации принимает данные задачи и запускает соответствующий контейнер. Данные передаются через stdin в формате JSON, результат читается из stdout:</p>

<pre><code><span class="kw">import</span> json, subprocess

<span class="kw">def</span> <span class="fn">run_container_task</span>(queue_name, task_data):
    config = load_config()
    runner = config[<span class="str">'queues'</span>][queue_name]

    cmd = [<span class="str">"podman"</span>, <span class="str">"run"</span>, <span class="str">"--rm"</span>, <span class="str">"-i"</span>]
    cmd.extend(runner.get(<span class="str">'podman_args'</span>, []))
    cmd.append(runner[<span class="str">'image'</span>])
    cmd.extend(runner.get(<span class="str">'command'</span>, []))

    result = subprocess.run(
        cmd,
        input=json.dumps(task_data).encode(),
        capture_output=<span class="kw">True</span>,
        timeout=<span class="num">300</span>
    )

    <span class="kw">if</span> result.returncode != <span class="num">0</span>:
        <span class="kw">raise</span> RuntimeError(result.stderr.decode())

<span class="kw">return</span> json.loads(result.stdout)</code></pre>

<h2>Передача данных через stdin/stdout</h2>
<p>Выбор stdin/stdout для обмена данными неслучаен. Этот подход обеспечивает полную изоляцию: контейнеру не нужен доступ к файловой системе или сети для получения задания. JSON-сериализация обеспечивает совместимость между различными языками и фреймворками внутри контейнеров.</p>

<h2>Обработка ошибок</h2>
<p>Каждый этап имеет свои механизмы обработки ошибок. RQ обеспечивает повторные попытки на уровне очереди, контейнер изолирует сбои от основного воркера, а subprocess.run с timeout предотвращает зависание при проблемах внутри контейнера.</p>

<h2>Логирование</h2>
<p>Структурированное логирование с контекстом задачи позволяет отслеживать весь путь обработки — от поступления в очередь до завершения в контейнере. Мы используем JSON-формат логов для удобства парсинга и агрегации.</p>

<h2>Заключение</h2>
<p>Мульти-очередной RQ-воркер с контейнерной диспетчеризацией — мощный паттерн для обработки разнородных задач. Конфигурация через YAML обеспечивает гибкость, Podman — изоляцию, а RoundRobinWorker — равномерное распределение нагрузки.</p>

<!-- lang:en -->

<h2>Introduction</h2>
<p>In systems with multiple task sources — Jira, Asterisk, Telegram — there's a need for centralized processing through a single worker. RQ (Redis Queue) provides an elegant multi-queue listening mechanism, which we combine with container dispatching via Podman.</p>

<h2>Configuration Structure</h2>
<p>All task routing is defined in config.yaml. Each queue is mapped to a specific container image and command:</p>

<pre><code><span class="cm"># config.yaml</span>
queues:
  jira:
    image: localhost/jira-processor:latest
    command: [<span class="str">"python"</span>, <span class="str">"process.py"</span>]
    podman_args: [<span class="str">"--pod"</span>, <span class="str">"jira-stack"</span>]
  asterisk:
    image: localhost/asterisk-handler:latest
    command: [<span class="str">"python"</span>, <span class="str">"handle_call.py"</span>]
    podman_args: [<span class="str">"--pod"</span>, <span class="str">"voip-stack"</span>]
  telegram:
    image: localhost/tg-worker:latest
    command: [<span class="str">"python"</span>, <span class="str">"tg_task.py"</span>]
podman_args: []</code></pre>

<h2>RoundRobinWorker</h2>
<p>The standard RQ Worker processes queues by priority — the first queue always takes precedence. For even load distribution, we use a custom RoundRobinWorker that rotates queues after processing each task, ensuring no single queue monopolizes the worker.</p>

<pre><code><span class="kw">from</span> rq <span class="kw">import</span> Worker

<span class="kw">class</span> <span class="fn">RoundRobinWorker</span>(Worker):
    <span class="kw">def</span> <span class="fn">reorder_queues</span>(self, reference_queue):
        pos = self.queues.index(reference_queue)
self.queues = self.queues[pos+<span class="num">1</span>:] + self.queues[:pos+<span class="num">1</span>]</code></pre>

<h2>The run_container_task Function</h2>
<p>The central dispatching function takes task data and launches the corresponding container. Data is passed via stdin as JSON, and the result is read from stdout. This provides complete isolation — the container doesn't need filesystem or network access to receive its assignment.</p>

<pre><code><span class="kw">def</span> <span class="fn">run_container_task</span>(queue_name, task_data):
    config = load_config()
    runner = config[<span class="str">'queues'</span>][queue_name]

    cmd = [<span class="str">"podman"</span>, <span class="str">"run"</span>, <span class="str">"--rm"</span>, <span class="str">"-i"</span>]
    cmd.extend(runner.get(<span class="str">'podman_args'</span>, []))
    cmd.append(runner[<span class="str">'image'</span>])
    cmd.extend(runner.get(<span class="str">'command'</span>, []))

    result = subprocess.run(
        cmd,
        input=json.dumps(task_data).encode(),
        capture_output=<span class="kw">True</span>,
        timeout=<span class="num">300</span>
    )
<span class="kw">return</span> json.loads(result.stdout)</code></pre>

<h2>Data Passing via stdin/stdout</h2>
<p>The choice of stdin/stdout for data exchange is deliberate. This approach ensures complete isolation: the container doesn't need filesystem or network access to receive its assignment. JSON serialization ensures compatibility between different languages and frameworks inside containers.</p>

<h2>Error Handling</h2>
<p>Each stage has its own error handling mechanisms. RQ provides retries at the queue level, the container isolates failures from the main worker, and subprocess.run with a timeout prevents hangs from problems inside the container. Failed tasks are moved to the failed queue with full context for debugging.</p>

<h2>Logging Patterns</h2>
<p>Structured logging with task context allows tracing the entire processing path — from queue entry to container completion. We use JSON-formatted logs for easy parsing and aggregation by monitoring systems.</p>

<h2>Conclusion</h2>
<p>A multi-queue RQ worker with container dispatching is a powerful pattern for processing heterogeneous tasks. YAML configuration provides flexibility, Podman provides isolation, and the RoundRobinWorker ensures even load distribution across all task sources.</p>

<!-- lang:he -->

<h2>מבוא</h2>
<p>במערכות עם מקורות משימות מרובים — Jira, Asterisk, Telegram — יש צורך בעיבוד מרכזי דרך עובד יחיד. RQ (Redis Queue) מספק מנגנון אלגנטי של האזנה למספר תורים, שאנחנו משלבים עם שליחת קונטיינרים דרך Podman.</p>

<h2>מבנה התצורה</h2>
<p>כל ניתוב המשימות מוגדר ב-config.yaml. כל תור ממופה לתמונת קונטיינר ספציפית ופקודה. זה מאפשר גמישות מלאה — שינוי הקונטיינר המעבד דורש רק עדכון קובץ התצורה.</p>

<pre><code><span class="cm"># config.yaml</span>
queues:
  jira:
    image: localhost/jira-processor:latest
    command: [<span class="str">"python"</span>, <span class="str">"process.py"</span>]
  asterisk:
    image: localhost/asterisk-handler:latest
    command: [<span class="str">"python"</span>, <span class="str">"handle_call.py"</span>]
  telegram:
    image: localhost/tg-worker:latest
command: [<span class="str">"python"</span>, <span class="str">"tg_task.py"</span>]</code></pre>

<h2>RoundRobinWorker</h2>
<p>העובד הסטנדרטי של RQ מעבד תורים לפי עדיפות — התור הראשון תמיד מקבל עדיפות. לחלוקת עומס שווה, אנחנו משתמשים ב-RoundRobinWorker מותאם אישית שמסובב את התורים אחרי עיבוד כל משימה.</p>

<h2>פונקציית run_container_task</h2>
<p>פונקציית השליחה המרכזית מקבלת נתוני משימה ומפעילה את הקונטיינר המתאים. הנתונים מועברים דרך stdin בפורמט JSON, והתוצאה נקראת מ-stdout. גישה זו מבטיחה בידוד מלא.</p>

<h2>העברת נתונים דרך stdin/stdout</h2>
<p>הבחירה ב-stdin/stdout להחלפת נתונים היא מכוונת. גישה זו מבטיחה בידוד מלא: הקונטיינר לא צריך גישה למערכת הקבצים או לרשת כדי לקבל את המשימה שלו. סריאליזציית JSON מבטיחה תאימות בין שפות ופריימוורקים שונים בתוך הקונטיינרים.</p>

<h2>טיפול בשגיאות</h2>
<p>לכל שלב יש מנגנוני טיפול בשגיאות משלו. RQ מספק ניסיונות חוזרים ברמת התור, הקונטיינר מבודד כשלים מהעובד הראשי, ו-subprocess.run עם timeout מונע תקיעות מבעיות בתוך הקונטיינר.</p>

<h2>תבניות לוגים</h2>
<p>לוגים מובנים עם הקשר משימה מאפשרים מעקב אחר כל נתיב העיבוד — מכניסה לתור ועד סיום בקונטיינר. אנחנו משתמשים בפורמט JSON ללוגים לניתוח ואגרגציה נוחים.</p>

<h2>סיכום</h2>
<p>עובד RQ מרובה תורים עם שליחת קונטיינרים הוא תבנית חזקה לעיבוד משימות הטרוגניות. תצורת YAML מספקת גמישות, Podman מספק בידוד, וה-RoundRobinWorker מבטיח חלוקת עומס שווה.</p>
