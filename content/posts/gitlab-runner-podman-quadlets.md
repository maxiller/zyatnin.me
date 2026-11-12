---
slug: gitlab-runner-podman-quadlets
view: dev
date: 2025-08-21
tags: ["podman", "gitlab", "systemd"]
translations:
  ru:
    title: "GitLab Runner в контейнерах: Podman Quadlets и Systemd"
    excerpt: "Настройка GitLab CI с контейнеризированными раннерами через Podman quadlets."
  en:
    title: "GitLab Runner in Containers: Podman Quadlets and Systemd"
    excerpt: "Setting up GitLab CI with containerized runners using Podman quadlets."
  he:
    title: "GitLab Runner בקונטיינרים: Podman Quadlets ו-Systemd"
    excerpt: "הגדרת GitLab CI עם runners בקונטיינרים באמצעות Podman quadlets."
---

<!-- lang:ru -->

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

<!-- lang:en -->

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

<!-- lang:he -->

<h2>מבוא</h2>
<p>GitLab CI היא מערכת אינטגרציה רציפה חזקה, אך ניהול runners על שרתים יכול להיות מורכב. Podman Quadlets ו-systemd מספקים פתרון אלגנטי: ה-runner פועל כיחידת systemd, מופעל מחדש אוטומטית ומנוהל עם כלים סטנדרטיים.</p>

<h2>Podman Quadlets</h2>
<p>Quadlets הם תכונה חדשה יחסית ב-Podman שמאפשרת לתאר קונטיינרים בפורמט יחידות systemd. קובץ .container ממוקם ב-~/.config/containers/systemd/ ומומר אוטומטית לשירות systemd.</p>

<h2>אינטגרציית Systemd</h2>
<p>לאחר יצירת קובץ ה-quadlet, systemd מייצר אוטומטית שירות. הניהול משתמש בפקודות סטנדרטיות: daemon-reload, start, enable, status — אותו תהליך עבודה כמו כל שירות systemd.</p>

<h2>תצורת Runner</h2>
<p>תצורת GitLab Runner נמצאת ב-config.toml ומותקנת לקונטיינר. המפתח הוא הגדרת ה-executor — עבור Podman, משתמשים ב-executor docker אך עם סוקט Podman במקום.</p>

<h2>דוגמאות צינורות</h2>
<p>צינור CI טיפוסי לפרויקט Python כולל שלבים: lint (ruff), test (pytest), build (podman build) ו-deploy (דחיפה לרגיסטרי). כל שלב רץ בקונטיינר מבודד.</p>

<h2>שיקולי אבטחה</h2>
<p>Podman ללא root מספק שכבת אבטחה נוספת. ה-runner רץ כמשתמש ללא הרשאות, קונטיינרי CI מבודדים על ידי user namespaces.</p>

<h2>ניטור ולוגים</h2>
<p>לוגי runner נגישים דרך journalctl --user. ניטור מצב השירות משתמש ב-systemctl --user is-active, שמשתלב עם מערכות ניטור קיימות.</p>

<h2>סיכום</h2>
<p>Podman Quadlets הופכים קונטיינרים לשירותי systemd מלאים עם הפעלה אוטומטית, הפעלה מחדש וניהול סטנדרטי. עבור GitLab Runner, זה אומר תשתית CI אמינה, מאובטחת וקלה לתחזוקה.</p>
