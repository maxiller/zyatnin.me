---
layout: layouts/post.njk
title: "Building a Multi-Queue Worker with RQ and Podman"
excerpt: "Architecture for a single RQ worker listening to multiple queues and dispatching tasks to different containers."
date: 2026-03-10
topic: t1
slug: multi-queue-worker-rq-podman
permalink: /en/blog/multi-queue-worker-rq-podman/
---

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