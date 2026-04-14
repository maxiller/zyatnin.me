---
layout: layouts/post.njk
title: "GitLab Runner בקונטיינרים: Podman Quadlets ו-Systemd"
excerpt: "הגדרת GitLab CI עם runners בקונטיינרים באמצעות Podman quadlets."
date: 2026-01-28
topic: t4
slug: gitlab-runner-podman-quadlets
permalink: /he/blog/gitlab-runner-podman-quadlets/
---

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
          </div>
        </div>

        <div class="related-articles">
          <h3 class="related-articles__title">Похожие статьи</h3>
          <div class="related-articles__grid">
          <a href="blog-3.html" class="blog-card" data-blog-id="3">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-10.html" class="blog-card" data-blog-id="10">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-11.html" class="blog-card" data-blog-id="11">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          </div>
        </div>