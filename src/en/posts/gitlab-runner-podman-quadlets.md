---
layout: layouts/post.njk
title: "GitLab Runner in Containers: Podman Quadlets and Systemd"
excerpt: "Setting up GitLab CI with containerized runners using Podman quadlets."
date: 2026-01-28
topic: t4
slug: gitlab-runner-podman-quadlets
permalink: /en/blog/gitlab-runner-podman-quadlets/
---

<h2>Introduction</h2>
            <p>GitLab CI is a powerful continuous integration system, but managing runners on servers can be complex. Podman Quadlets and systemd provide an elegant solution: the runner operates as a systemd unit, auto-restarts, and is managed with standard tools.</p>

            <h2>Podman Quadlets</h2>
            <p>Quadlets are a relatively new Podman feature that lets you describe containers in systemd unit format. A .container file is placed in ~/.config/containers/systemd/ and automatically transformed into a systemd service:</p>
            <pre><code><span class="cm"># ~/.config/containers/systemd/gitlab-runner.container</span>
[Container]
Image=docker.io/gitlab/gitlab-runner:latest
Volume=/srv/gitlab-runner/config:/etc/gitlab-runner:Z
Volume=/run/user/1000/podman/podman.sock:/var/run/docker.sock:Z

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target</code></pre>

            <h2>Systemd Integration</h2>
            <p>After creating the quadlet file, systemd automatically generates a service. Management uses standard commands: daemon-reload, start, enable, status — the same workflow as any systemd service.</p>

            <h2>Runner Configuration</h2>
            <p>GitLab Runner configuration lives in config.toml and is mounted into the container. The key is configuring the executor — for Podman, use the docker executor but with the Podman socket instead.</p>

            <h2>Pipeline Examples</h2>
            <p>A typical CI pipeline for a Python project includes stages: lint (ruff), test (pytest), build (podman build), and deploy (push to registry). Each stage runs in an isolated container.</p>

            <h2>Security Considerations</h2>
            <p>Rootless Podman provides an additional security layer. The runner runs as an unprivileged user, CI containers are isolated by user namespaces. Registry credentials use Podman secrets instead of environment variables.</p>

            <h2>Monitoring and Logs</h2>
            <p>Runner logs are accessible via journalctl --user. Service status monitoring uses systemctl --user is-active, which integrates with existing monitoring systems through simple check scripts.</p>

            <h2>Conclusion</h2>
            <p>Podman Quadlets turn containers into full systemd services with auto-start, restart, and standard management. For GitLab Runner, this means reliable, secure, and easily maintainable CI infrastructure.</p>