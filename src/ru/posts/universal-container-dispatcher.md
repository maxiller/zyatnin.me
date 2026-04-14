---
layout: layouts/post.njk
title: "Универсальный контейнерный диспетчер на Python"
excerpt: "Паттерн Python-воркера, запускающего произвольные Podman-контейнеры по конфигурации."
date: 2026-02-20
topic: t2
slug: universal-container-dispatcher
permalink: /ru/blog/universal-container-dispatcher/
---

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