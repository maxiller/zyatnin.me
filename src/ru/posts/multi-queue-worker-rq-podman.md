---
layout: layouts/post.njk
title: "Мульти-очередной воркер с RQ и Podman"
excerpt: "Архитектура единого RQ-воркера, слушающего несколько очередей и диспетчеризующего задачи в контейнеры."
date: 2026-03-10
topic: t1
slug: multi-queue-worker-rq-podman
permalink: /ru/blog/multi-queue-worker-rq-podman/
---

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