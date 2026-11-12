---
slug: universal-container-dispatcher
view: dev
date: 2025-10-28
tags: ["python", "containers", "automation"]
translations:
  ru:
    title: "Универсальный контейнерный диспетчер на Python"
    excerpt: "Паттерн Python-воркера, запускающего произвольные Podman-контейнеры по конфигурации."
  en:
    title: "Building a Universal Container Dispatcher in Python"
    excerpt: "Pattern where a Python worker launches arbitrary Podman containers based on config."
  he:
    title: "בניית Dispatcher קונטיינרים אוניברסלי ב-Python"
    excerpt: "תבנית שבה עובד Python מפעיל קונטיינרים שרירותיים של Podman לפי קונפיגורציה."
---

<!-- lang:ru -->

<h2>Введение</h2>
<p>При автоматизации разнородных задач часто возникает паттерн, когда Python-воркер должен запускать различные контейнеры в зависимости от типа задачи. Вместо хардкодинга каждого контейнера мы создаём универсальный диспетчер, управляемый YAML-конфигурацией.</p>

<h2>YAML-конфигурация с секцией runners</h2>

<pre><code><span class="cm"># config.yaml</span>
runners:
  jira-processor:
    image: localhost/jira-proc:latest
    command: [<span class="str">"python"</span>, <span class="str">"process.py"</span>]
    podman_args:
      - <span class="str">"--pod"</span>
      - <span class="str">"main-stack"</span>
      - <span class="str">"--secret"</span>
      - <span class="str">"jira-token"</span>
    timeout: <span class="num">300</span>

  asterisk-handler:
    image: localhost/asterisk-ari:latest
    command: [<span class="str">"python"</span>, <span class="str">"handle.py"</span>]
    podman_args:
      - <span class="str">"--pod"</span>
      - <span class="str">"voip-stack"</span>
    timeout: <span class="num">60</span>

  report-generator:
    image: localhost/reports:latest
    command: [<span class="str">"python"</span>, <span class="str">"generate.py"</span>]
    podman_args: []
timeout: <span class="num">600</span></code></pre>

<h2>EphemeralContainer Context Manager</h2>
<p>Контекстный менеджер управляет полным жизненным циклом контейнера — от создания до удаления:</p>

<pre><code><span class="kw">import</span> subprocess, json, uuid

<span class="kw">class</span> <span class="fn">EphemeralContainer</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, runner_config):
        self.config = runner_config
        self.name = <span class="str">f"task-</span>{uuid.uuid4().hex[:8]}<span class="str">"</span>
        self.process = <span class="kw">None</span>

    <span class="kw">def</span> <span class="fn">__enter__</span>(self):
        <span class="kw">return</span> self

    <span class="kw">def</span> <span class="fn">run</span>(self, input_data):
        cmd = [<span class="str">"podman"</span>, <span class="str">"run"</span>, <span class="str">"--rm"</span>, <span class="str">"-i"</span>,
               <span class="str">"--name"</span>, self.name]
        cmd.extend(self.config.get(<span class="str">'podman_args'</span>, []))
        cmd.append(self.config[<span class="str">'image'</span>])
        cmd.extend(self.config.get(<span class="str">'command'</span>, []))

        result = subprocess.run(
            cmd,
            input=json.dumps(input_data).encode(),
            capture_output=<span class="kw">True</span>,
            timeout=self.config.get(<span class="str">'timeout'</span>, <span class="num">300</span>)
        )

        <span class="kw">if</span> result.returncode != <span class="num">0</span>:
            <span class="kw">raise</span> RuntimeError(
                <span class="str">f"Container failed: </span>{result.stderr.decode()}<span class="str">"</span>
            )
        <span class="kw">return</span> json.loads(result.stdout)

    <span class="kw">def</span> <span class="fn">__exit__</span>(self, *args):
        <span class="cm"># Гарантируем остановку при ошибке</span>
        subprocess.run(
            [<span class="str">"podman"</span>, <span class="str">"rm"</span>, <span class="str">"-f"</span>, self.name],
            capture_output=<span class="kw">True</span>
)</code></pre>

<h2>Передача JSON через stdin</h2>
<p>Данные задачи сериализуются в JSON и передаются через stdin контейнера. Контейнер читает stdin, обрабатывает данные и записывает результат в stdout. Этот подход обеспечивает полную изоляцию и универсальность — контейнер не зависит от конкретного транспорта.</p>

<h2>Захват результатов из stdout</h2>
<p>Результат обработки парсится из stdout контейнера. Stderr используется для логов и отладки. При ненулевом коде возврата выбрасывается исключение с содержимым stderr.</p>

<h2>Обработка ошибок с блоком finally</h2>
<p>Блок finally в контекстном менеджере гарантирует удаление контейнера даже при исключениях. Это предотвращает утечку ресурсов — зависшие контейнеры не будут накапливаться после сбоев.</p>

<h2>Интеграция с RQ</h2>
<p>Универсальная задача для RQ выглядит элементарно — она принимает имя раннера и данные, загружает конфигурацию и запускает соответствующий контейнер. Это позволяет добавлять новые типы задач без изменения кода воркера.</p>

<h2>Заключение</h2>
<p>Универсальный контейнерный диспетчер — элегантное решение для систем с разнородными задачами. YAML-конфигурация, context manager и передача данных через stdin/stdout обеспечивают гибкость, надёжность и полную изоляцию выполнения.</p>

<!-- lang:en -->

<h2>Introduction</h2>
<p>When automating heterogeneous tasks, a common pattern emerges where a Python worker needs to launch different containers depending on the task type. Instead of hardcoding each container, we create a universal dispatcher driven by YAML configuration.</p>

<h2>YAML Configuration with Runners Section</h2>

<pre><code><span class="cm"># config.yaml</span>
runners:
  jira-processor:
    image: localhost/jira-proc:latest
    command: [<span class="str">"python"</span>, <span class="str">"process.py"</span>]
    podman_args: [<span class="str">"--pod"</span>, <span class="str">"main-stack"</span>]
    timeout: <span class="num">300</span>
  asterisk-handler:
    image: localhost/asterisk-ari:latest
    command: [<span class="str">"python"</span>, <span class="str">"handle.py"</span>]
timeout: <span class="num">60</span></code></pre>

<h2>EphemeralContainer Context Manager</h2>
<p>The context manager handles the complete container lifecycle — from creation to removal. It generates a unique name for each run, passes data via stdin, and ensures cleanup in the finally block.</p>

<pre><code><span class="kw">class</span> <span class="fn">EphemeralContainer</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, runner_config):
        self.config = runner_config
        self.name = <span class="str">f"task-</span>{uuid.uuid4().hex[:8]}<span class="str">"</span>

    <span class="kw">def</span> <span class="fn">run</span>(self, input_data):
        cmd = [<span class="str">"podman"</span>, <span class="str">"run"</span>, <span class="str">"--rm"</span>, <span class="str">"-i"</span>,
               <span class="str">"--name"</span>, self.name]
        cmd.extend(self.config.get(<span class="str">'podman_args'</span>, []))
        cmd.append(self.config[<span class="str">'image'</span>])
        cmd.extend(self.config.get(<span class="str">'command'</span>, []))

        result = subprocess.run(cmd,
            input=json.dumps(input_data).encode(),
            capture_output=<span class="kw">True</span>,
            timeout=self.config.get(<span class="str">'timeout'</span>, <span class="num">300</span>))
<span class="kw">return</span> json.loads(result.stdout)</code></pre>

<h2>Passing JSON via stdin</h2>
<p>Task data is serialized to JSON and passed via the container's stdin. The container reads stdin, processes the data, and writes the result to stdout. This approach ensures complete isolation and universality — the container doesn't depend on a specific transport mechanism.</p>

<h2>Capturing Results from stdout</h2>
<p>The processing result is parsed from the container's stdout. Stderr is used for logs and debugging. On non-zero return codes, an exception is thrown with stderr contents.</p>

<h2>Error Handling with finally Blocks</h2>
<p>The finally block in the context manager guarantees container removal even during exceptions. This prevents resource leaks — stuck containers won't accumulate after failures.</p>

<h2>Integration with RQ</h2>
<p>The universal RQ task is trivial — it accepts a runner name and data, loads the config, and launches the corresponding container. This allows adding new task types without changing worker code.</p>

<h2>Conclusion</h2>
<p>A universal container dispatcher is an elegant solution for systems with heterogeneous tasks. YAML configuration, context managers, and stdin/stdout data passing provide flexibility, reliability, and complete execution isolation.</p>

<!-- lang:he -->

<h2>מבוא</h2>
<p>כשמבצעים אוטומציה של משימות הטרוגניות, נוצרת תבנית נפוצה שבה עובד Python צריך להפעיל קונטיינרים שונים בהתאם לסוג המשימה. במקום לקודד כל קונטיינר, אנחנו יוצרים dispatcher אוניברסלי המונע על ידי תצורת YAML.</p>

<h2>תצורת YAML עם סעיף Runners</h2>
<p>כל ניתוב המשימות מוגדר בקובץ config.yaml. כל runner ממופה לתמונת קונטיינר, פקודה, ארגומנטי Podman ו-timeout. הוספת סוג משימה חדש דורשת רק הוספת ערך חדש בתצורה.</p>

<h2>מנהל הקשר EphemeralContainer</h2>
<p>מנהל ההקשר מטפל במחזור החיים המלא של הקונטיינר — מיצירה ועד הסרה. הוא מייצר שם ייחודי לכל הרצה, מעביר נתונים דרך stdin ומבטיח ניקוי בבלוק finally.</p>

<h2>העברת JSON דרך stdin</h2>
<p>נתוני המשימה מסודרים ל-JSON ומועברים דרך stdin של הקונטיינר. הקונטיינר קורא stdin, מעבד את הנתונים וכותב את התוצאה ל-stdout. גישה זו מבטיחה בידוד מלא ואוניברסליות.</p>

<h2>לכידת תוצאות מ-stdout</h2>
<p>תוצאת העיבוד מנותחת מ-stdout של הקונטיינר. Stderr משמש ללוגים ודיבאג. בקודי החזרה שאינם אפס, נזרקת חריגה עם תוכן stderr.</p>

<h2>טיפול בשגיאות עם בלוקי finally</h2>
<p>בלוק ה-finally במנהל ההקשר מבטיח הסרת קונטיינר גם במהלך חריגות. זה מונע דליפת משאבים.</p>

<h2>אינטגרציה עם RQ</h2>
<p>המשימה האוניברסלית ל-RQ היא טריוויאלית — היא מקבלת שם runner ונתונים, טוענת את התצורה ומפעילה את הקונטיינר המתאים.</p>

<h2>סיכום</h2>
<p>dispatcher קונטיינרים אוניברסלי הוא פתרון אלגנטי למערכות עם משימות הטרוגניות. תצורת YAML, מנהלי הקשר והעברת נתונים דרך stdin/stdout מספקים גמישות, אמינות ובידוד ביצוע מלא.</p>
