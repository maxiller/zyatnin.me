---
layout: layouts/post.njk
title: "GitLab Runner в контейнерах: Podman Quadlets и Systemd"
excerpt: "Настройка GitLab CI с контейнеризированными раннерами через Podman quadlets."
date: 2026-01-28
topic: t4
slug: gitlab-runner-podman-quadlets
permalink: /ru/blog/gitlab-runner-podman-quadlets/
---

<h2>Введение</h2>
            <p>GitLab CI — мощная система непрерывной интеграции, но управление раннерами на серверах может быть сложным. Podman Quadlets и systemd предоставляют элегантное решение: раннер работает как systemd-юнит, автоматически перезапускается и управляется стандартными инструментами.</p>

            <h2>Podman Quadlets</h2>
            <p>Quadlets — относительно новая функция Podman, позволяющая описывать контейнеры в формате systemd-юнитов. Файл .container помещается в ~/.config/containers/systemd/ и автоматически преобразуется в systemd-сервис:</p>
            <pre><code><span class="cm"># ~/.config/containers/systemd/gitlab-runner.container</span>
[Container]
Image=docker.io/gitlab/gitlab-runner:latest
Volume=/srv/gitlab-runner/config:/etc/gitlab-runner:Z
Volume=/run/user/1000/podman/podman.sock:/var/run/docker.sock:Z
Environment=DOCKER_HOST=unix:///var/run/docker.sock

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target</code></pre>

            <h2>Интеграция с systemd</h2>
            <p>После создания файла квадлета, systemd автоматически генерирует сервис. Управление происходит через стандартные команды:</p>
            <pre><code>systemctl --user daemon-reload
systemctl --user start gitlab-runner
systemctl --user enable gitlab-runner
systemctl --user status gitlab-runner</code></pre>

            <h2>Конфигурация раннера</h2>
            <p>Конфигурация GitLab Runner хранится в /srv/gitlab-runner/config/config.toml и монтируется в контейнер. Важно настроить executor — для Podman используется executor docker, но с сокетом Podman вместо Docker:</p>
            <pre><code><span class="cm"># config.toml</span>
[[runners]]
  name = <span class="str">"podman-runner"</span>
  url = <span class="str">"https://gitlab.example.com"</span>
  token = <span class="str">"RUNNER_TOKEN"</span>
  executor = <span class="str">"docker"</span>
  [runners.docker]
    image = <span class="str">"python:3.12-slim"</span>
    privileged = <span class="kw">false</span>
    volumes = [<span class="str">"/cache"</span>]</code></pre>

            <h2>Примеры пайплайнов</h2>
            <p>Типичный CI-пайплайн для Python-проекта включает этапы: lint (ruff), test (pytest), build (podman build), deploy (push в реестр). Каждый этап выполняется в изолированном контейнере.</p>

            <h2>Безопасность</h2>
            <p>Rootless Podman обеспечивает дополнительный уровень безопасности. Раннер работает от непривилегированного пользователя, контейнеры CI изолированы user namespace. Для доступа к реестру используются Podman secrets вместо переменных окружения.</p>

            <h2>Мониторинг и логи</h2>
            <p>Логи раннера доступны через journalctl --user -u gitlab-runner. Для мониторинга состояния используется systemctl --user is-active, что интегрируется с существующими системами мониторинга через простые check-скрипты.</p>

            <h2>Заключение</h2>
            <p>Podman Quadlets превращают контейнеры в полноценные systemd-сервисы с автозапуском, перезапуском и стандартным управлением. Для GitLab Runner это означает надёжную, безопасную и легко поддерживаемую CI-инфраструктуру.</p>