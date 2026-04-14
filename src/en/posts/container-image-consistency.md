---
layout: layouts/post.njk
title: "From Development to Production: Container Image Consistency"
excerpt: "CI/CD practices ensuring the same OCI image runs in dev and prod environments."
date: 2026-03-05
topic: t1
slug: container-image-consistency
permalink: /en/blog/container-image-consistency/
---

<h2>Introduction</h2>
            <p>One of the key challenges in DevOps is ensuring that the container image tested in the dev environment is identical to what runs in production. Differences in build environments, CPU architecture, and container runtimes can lead to subtle bugs. In this article, I'll discuss practices we use to ensure OCI image consistency.</p>

            <h2>CI Builds on Linux with Podman</h2>
            <p>Our GitLab CI pipeline builds images on a Linux runner using Podman. This ensures native builds for amd64 — our servers' primary architecture:</p>
            <pre><code><span class="cm"># .gitlab-ci.yml</span>
build:
  stage: build
  script:
    - podman build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - podman push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - podman tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - podman push $CI_REGISTRY_IMAGE:latest</code></pre>

            <h2>Local Development: Podman-machine on Mac</h2>
            <p>Many developers use macOS. Podman-machine provides a Linux VM for running containers. The key point is that we don't build images locally — we pull them from the registry. This guarantees that the developer works with the same image as CI.</p>
            <pre><code><span class="cm"># Pull from registry (don't build locally!)</span>
podman pull registry.example.com/app:latest
podman run --rm -it registry.example.com/app:latest</code></pre>

            <h2>Multi-Architecture Considerations</h2>
            <p>With Apple's transition to ARM (M1/M2/M3), architecture mismatch becomes an issue. CI builds for amd64, while the local machine is arm64. Solutions include QEMU emulation in Podman-machine or multi-architecture builds via buildx manifests.</p>

            <h2>Apple Containers as an Alternative</h2>
            <p>Starting with macOS 26, Apple introduced native Apple Containers for running Linux containers. It works through lightweight virtualization and supports OCI images. However, it's arm64-only — running amd64 images still requires emulation.</p>

            <h2>Containerfile Best Practices</h2>
            <p>For consistency, follow these rules: pin base image versions via digest instead of tags, use multi-stage builds to minimize the final image, copy requirements.txt separately from code for layer caching, and never install dev dependencies in the production image.</p>
            <pre><code><span class="kw">FROM</span> docker.io/library/python:3.12-slim@sha256:abc123...
<span class="kw">WORKDIR</span> /app
<span class="kw">COPY</span> requirements.txt .
<span class="kw">RUN</span> pip install --no-cache-dir -r requirements.txt
<span class="kw">COPY</span> . .
<span class="kw">CMD</span> ["python", "main.py"]</code></pre>

            <h2>Runtime Comparison</h2>
            <p>Docker, Podman, and Apple Containers use different runtimes but all work with OCI-compatible images. Podman runs containers without a daemon (daemonless), simplifying systemd integration. Docker requires the docker daemon. Apple Containers use native macOS virtualization.</p>

            <h2>Conclusion</h2>
            <p>Image consistency is achieved through discipline: build only in CI, pull from registry for local development, pin versions via digest, and use multi-architecture builds when needed. This approach eliminates the entire class of "works on my machine" errors.</p>