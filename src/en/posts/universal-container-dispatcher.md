---
layout: layouts/post.njk
title: "Building a Universal Container Dispatcher in Python"
excerpt: "Pattern where a Python worker launches arbitrary Podman containers based on config."
date: 2026-02-20
topic: t2
slug: universal-container-dispatcher
permalink: /en/blog/universal-container-dispatcher/
---

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