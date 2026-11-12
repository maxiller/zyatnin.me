---
slug: container-image-consistency
view: dev
date: 2025-12-01
tags: ["containers", "ci-cd"]
translations:
  ru:
    title: "От разработки до продакшена: консистентность образов контейнеров"
    excerpt: "CI/CD-практики для обеспечения идентичности OCI-образов в dev и prod средах."
  en:
    title: "From Development to Production: Container Image Consistency"
    excerpt: "CI/CD practices ensuring the same OCI image runs in dev and prod environments."
  he:
    title: "מפיתוח לייצור: עקביות תמונות קונטיינר"
    excerpt: "שיטות CI/CD שמבטיחות שאותה תמונת OCI רצה בסביבות פיתוח וייצור."
---

<!-- lang:ru -->

<h2>Введение</h2>
<p>Одна из ключевых проблем в DevOps — обеспечение того, что контейнерный образ, протестированный в dev-среде, идентичен тому, что работает в продакшене. Различия в сборке, архитектуре CPU и рантайме контейнеров могут приводить к трудноуловимым багам. В этой статье я расскажу о практиках, которые мы используем для обеспечения консистентности OCI-образов.</p>

<h2>CI-сборка на Linux с Podman</h2>
<p>Наш CI-пайплайн в GitLab собирает образы на Linux-раннере с использованием Podman. Это обеспечивает нативную сборку для amd64 — основной архитектуры наших серверов:</p>

<pre><code><span class="cm"># .gitlab-ci.yml</span>
build:
  stage: build
  script:
    - podman build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - podman push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - podman tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - podman push $CI_REGISTRY_IMAGE:latest</code></pre>

<h2>Локальная разработка: Podman-machine на Mac</h2>
<p>Многие разработчики используют macOS. Podman-machine предоставляет Linux VM для запуска контейнеров. Ключевой момент — мы не собираем образы локально, а пулим их из реестра. Это гарантирует, что разработчик работает с тем же образом, что и CI.</p>

<pre><code><span class="cm"># Инициализация Podman-machine</span>
podman machine init --cpus <span class="num">4</span> --memory <span class="num">4096</span>
podman machine start

<span class="cm"># Пулим образ из реестра (не собираем локально!)</span>
podman pull registry.example.com/app:latest
podman run --rm -it registry.example.com/app:latest</code></pre>

<h2>Мульти-архитектурные соображения</h2>
<p>С переходом Apple на ARM (M1/M2/M3) возникает проблема несовпадения архитектур. CI собирает для amd64, а локальная машина — arm64. Решения: использование QEMU-эмуляции в Podman-machine или сборка мульти-архитектурных образов через buildx manifest.</p>

<h2>Apple Containers как альтернатива</h2>
<p>С macOS 26 появился нативный инструмент Apple Containers для запуска Linux-контейнеров. Он работает через легковесную виртуализацию и поддерживает OCI-образы. Однако это только arm64 — для запуска amd64-образов всё ещё нужна эмуляция.</p>

<h2>Best Practices для Containerfile</h2>
<p>Для обеспечения консистентности следуйте правилам:</p>
<ul>
<li>Фиксируйте версии базовых образов через digest, а не тег</li>
<li>Используйте multi-stage builds для минимизации финального образа</li>
<li>Копируйте requirements.txt отдельно от кода для кеширования слоёв</li>
<li>Не устанавливайте dev-зависимости в продакшен-образ</li>
</ul>

<pre><code><span class="kw">FROM</span> docker.io/library/python:3.12-slim@sha256:abc123...
<span class="kw">WORKDIR</span> /app
<span class="kw">COPY</span> requirements.txt .
<span class="kw">RUN</span> pip install --no-cache-dir -r requirements.txt
<span class="kw">COPY</span> . .
<span class="kw">CMD</span> ["python", "main.py"]</code></pre>

<h2>Сравнение рантаймов</h2>
<p>Docker, Podman и Apple Containers используют разные рантаймы, но все работают с OCI-совместимыми образами. Podman запускает контейнеры без демона (daemonless), что упрощает интеграцию с systemd. Docker требует docker daemon. Apple Containers используют нативную виртуализацию macOS.</p>

<h2>Заключение</h2>
<p>Консистентность образов достигается через дисциплину: сборка только в CI, пулл из реестра для локальной разработки, фиксация версий через digest и использование мульти-архитектурных сборок при необходимости. Этот подход устраняет класс ошибок «у меня работает, а на сервере — нет».</p>

<!-- lang:en -->

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

<!-- lang:he -->

<h2>מבוא</h2>
<p>אחד האתגרים המרכזיים ב-DevOps הוא להבטיח שתמונת הקונטיינר שנבדקה בסביבת הפיתוח זהה למה שרץ בייצור. הבדלים בסביבות בנייה, ארכיטקטורת CPU וזמני ריצה של קונטיינרים יכולים להוביל לבאגים עדינים. במאמר זה אדון בשיטות שאנחנו משתמשים בהן להבטחת עקביות תמונות OCI.</p>

<h2>בניית CI על Linux עם Podman</h2>
<p>צינור ה-CI שלנו ב-GitLab בונה תמונות על runner של Linux באמצעות Podman. זה מבטיח בנייה מקורית ל-amd64 — הארכיטקטורה העיקרית של השרתים שלנו. התמונה נבנית פעם אחת ונדחפת לרגיסטרי.</p>

<h2>פיתוח מקומי: Podman-machine על Mac</h2>
<p>מפתחים רבים משתמשים ב-macOS. Podman-machine מספק VM של Linux להרצת קונטיינרים. הנקודה המרכזית היא שאנחנו לא בונים תמונות מקומית — אנחנו מושכים אותן מהרגיסטרי. זה מבטיח שהמפתח עובד עם אותה תמונה כמו CI.</p>

<h2>שיקולים רב-ארכיטקטוריים</h2>
<p>עם המעבר של Apple ל-ARM (M1/M2/M3), חוסר התאמה בארכיטקטורה הופך לבעיה. CI בונה ל-amd64, בעוד המכונה המקומית היא arm64. פתרונות כוללים אמולציית QEMU ב-Podman-machine או בניות רב-ארכיטקטוריות.</p>

<h2>Apple Containers כחלופה</h2>
<p>החל מ-macOS 26, Apple הציגה Apple Containers מקוריים להרצת קונטיינרים של Linux. זה עובד דרך וירטואליזציה קלת משקל ותומך בתמונות OCI. עם זאת, זה רק arm64 — הרצת תמונות amd64 עדיין דורשת אמולציה.</p>

<h2>שיטות מומלצות ל-Containerfile</h2>
<p>להבטחת עקביות, יש לפעול לפי הכללים: לנעול גרסאות תמונות בסיס דרך digest, להשתמש בבניות multi-stage למזעור התמונה הסופית, להעתיק requirements.txt בנפרד מהקוד לשמירת מטמון שכבות.</p>

<h2>השוואת זמני ריצה</h2>
<p>Docker, Podman ו-Apple Containers משתמשים בזמני ריצה שונים אך כולם עובדים עם תמונות תואמות OCI. Podman מריץ קונטיינרים ללא daemon, מה שמפשט את האינטגרציה עם systemd.</p>

<h2>סיכום</h2>
<p>עקביות תמונות מושגת דרך משמעת: בנייה רק ב-CI, משיכה מרגיסטרי לפיתוח מקומי, נעילת גרסאות דרך digest ושימוש בבניות רב-ארכיטקטוריות בעת הצורך. גישה זו מסלקת את סוג השגיאות "עובד על המכונה שלי".</p>
