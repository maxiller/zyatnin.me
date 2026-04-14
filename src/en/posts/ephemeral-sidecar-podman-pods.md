---
layout: layouts/post.njk
title: "Ephemeral Sidecar Pattern: Managing SSH Tunnels in Podman Pods"
excerpt: "How to dynamically start and stop containers within a Podman pod using Python context managers."
date: 2026-03-15
topic: t1
slug: ephemeral-sidecar-podman-pods
permalink: /en/blog/ephemeral-sidecar-podman-pods/
---

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