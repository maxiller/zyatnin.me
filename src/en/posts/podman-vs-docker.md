---
view: dev
layout: layouts/dev/post.njk
title: "Why I prefer Podman over Docker"
excerpt: "Rootless containers without a daemon and pods with an isolated environment: why Podman is my default choice over Docker."
date: 2026-10-28
topic: t1
slug: podman-vs-docker
permalink: /en/dev/blog/podman-vs-docker/
---
## Introduction

Choosing a runtime is an engineering question, not a matter of faith: what matters is the security model, integration with the environment and the cost of maintenance. For my tasks — support infrastructure, automation, local and server environments — Podman is my default. Two reasons: rootless operation and pods.

## Rootless: containers without root

In Docker the daemon runs as root and clients talk to it through docker.sock. Whoever has access to the socket effectively has root on the host — a well-known compromise vector. In Podman containers run as an unprivileged user: rootless mode is not an option but the default behavior. Practical consequences:

- no background root daemon, a much smaller attack surface;
- the container lives within the user's rights and the user namespace;
- services integrate cleanly with systemd through `systemctl --user` and quadlets — no root in the startup chain.

Rootless does not solve everything: subuid/subgid need configuring, and some images have quirks with ports below 1024. But the setup is one-time and the security gain is permanent.

## Pods: an isolated environment instead of sidecars on the host

The second reason is pods. A Podman pod is a group of containers sharing one network namespace around an infra container: a local interface, shared ports. Everything that interacts lives inside one pod.

This changes how auxiliary processes are handled. In docker-compose a sidecar sits next to the main service on the host: it communicates through the host's user-defined network, and ports open onto the host itself. In Podman the sidecar lives inside the pod: an SSH tunnel, a local proxy, an ephemeral worker — components invisible to the host, with the pod as a closed environment. In my work this looks like: a queue worker and an ephemeral sidecar container with an SSH tunnel start and die inside the pod without touching the host network configuration.

More on this pattern in the articles on [ephemeral sidecar pods](/en/blog/ephemeral-sidecar-podman-pods/) and [multi-queue workers](/en/blog/multi-queue-worker-rq-podman/).

## Daemonless and systemd

Podman works without a central daemon: every container is a plain process managed by the surrounding init system. Hence the natural systemd integration: quadlet units describe containers and pods as ordinary services — dependencies, restarts and journals are all native. My GitLab Runner lives exactly this way.

## Compatibility

The migration is painless: the CLI is compatible (`alias docker=podman` works in most cases), OCI images are interchangeable, compose files are supported. Migration usually amounts to touching CI scripts, not rewriting infrastructure.

## When Docker still makes sense

To be fair: if a project is tied to Docker Swarm, specific ecosystem tooling or corporate policies, Docker is a legitimate choice. I am describing my default for new work, not a ban.

## Conclusion

Podman wins where minimal privileges and careful isolation of auxiliary processes matter: rootless by default, and pods with an isolated environment instead of sidecars on the host. That makes it my default choice for support infrastructure and automation.
