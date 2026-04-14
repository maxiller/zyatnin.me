---
layout: layouts/post.njk
title: "SSH Tunnels in Containers: Secure Access to Remote Services"
excerpt: "Containerized SSH tunnels for accessing Asterisk ARI, databases, and APIs."
date: 2026-01-15
topic: t5
slug: ssh-tunnels-containers
permalink: /en/blog/ssh-tunnels-containers/
---

<h2>Introduction</h2>
            <p>Accessing remote services through SSH tunnels is standard practice in enterprise environments. Containerizing these tunnels adds isolation, simplifies management, and enables integration into Podman pod infrastructure.</p>

            <h2>Containerfile for SSH Tunnel</h2>
            <pre><code><span class="kw">FROM</span> docker.io/library/alpine:3.19
<span class="kw">RUN</span> apk add --no-cache openssh-client netcat-openbsd
<span class="kw">COPY</span> tunnel.sh /tunnel.sh
<span class="kw">RUN</span> chmod +x /tunnel.sh
<span class="kw">HEALTHCHECK</span> --interval=10s --timeout=5s --retries=3 \
  CMD nc -z localhost 8088 || exit 1
<span class="kw">ENTRYPOINT</span> ["/tunnel.sh"]</code></pre>

            <h2>Tunnel Script (tunnel.sh)</h2>
            <pre><code><span class="cm">#!/bin/sh</span>
<span class="kw">set</span> -euo pipefail

mkdir -p /root/.ssh
ssh-keyscan -H <span class="str">"$REMOTE_HOST"</span> >> /root/.ssh/known_hosts

<span class="kw">while</span> true; <span class="kw">do</span>
    ssh -N -o ServerAliveInterval=<span class="num">30</span> \
        -o ExitOnForwardFailure=yes \
        -L 0.0.0.0:<span class="str">"$LOCAL_PORT"</span>:<span class="str">"$TARGET_HOST"</span>:<span class="str">"$TARGET_PORT"</span> \
        -i /secrets/ssh_key \
        <span class="str">"$SSH_USER"</span>@<span class="str">"$REMOTE_HOST"</span> || true
    sleep <span class="num">5</span>
<span class="kw">done</span></code></pre>

            <h2>Health Checks</h2>
            <p>Netcat-based healthcheck verifies the tunnel's local port is accessible. This allows other containers in the pod to wait for tunnel establishment before starting work. Podman exposes health status via podman healthcheck run.</p>

            <h2>Port Forwarding (-L 0.0.0.0:port)</h2>
            <p>A critical detail — binding to 0.0.0.0 instead of localhost. Inside a Podman pod, containers communicate through a shared network namespace. A tunnel bound to 0.0.0.0 is accessible to all pod containers. Binding to 127.0.0.1 makes it available only to the tunnel container itself.</p>

            <h2>known_hosts Management</h2>
            <p>ssh-keyscan at container startup automatically adds the remote host key. For enhanced security, provide a static known_hosts via volume or Podman secret. StrictHostKeyChecking can remain yes when using preloaded keys.</p>

            <h2>Use Cases</h2>
            <p>We use containerized SSH tunnels for accessing Asterisk ARI (telephony REST interface), PostgreSQL databases in secured networks, and API services accessible only from specific network segments.</p>

            <h2>Automatic Reconnection</h2>
            <p>The infinite while true loop with sleep provides automatic recovery on connection loss. ServerAliveInterval and ServerAliveCountMax detect "dead" connections. ExitOnForwardFailure ensures clean exit when port forwarding fails.</p>

            <h2>Conclusion</h2>
            <p>Containerized SSH tunnels are a reliable and convenient way to provide secure access to remote services. Health checks, auto-reconnection, and Podman pod integration make this solution production-ready.</p>