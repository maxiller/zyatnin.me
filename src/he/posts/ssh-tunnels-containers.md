---
layout: layouts/post.njk
title: "מנהרות SSH בקונטיינרים: גישה מאובטחת לשירותים מרוחקים"
excerpt: "מנהרות SSH בקונטיינרים לגישה ל-Asterisk ARI, מסדי נתונים ו-API."
date: 2026-01-15
topic: t5
slug: ssh-tunnels-containers
permalink: /he/blog/ssh-tunnels-containers/
---

<h2>מבוא</h2>
            <p>גישה לשירותים מרוחקים דרך מנהרות SSH היא שיטה סטנדרטית בסביבות ארגוניות. קונטיינריזציה של מנהרות אלו מוסיפה בידוד, מפשטת ניהול ומאפשרת אינטגרציה בתשתית Podman pods.</p>

            <h2>Containerfile למנהרת SSH</h2>
            <p>הקונטיינר מבוסס על Alpine עם לקוח OpenSSH ו-netcat. סקריפט המנהרה מטפל בחיבור ובחיבור מחדש אוטומטי. HEALTHCHECK מאמת שהפורט המקומי נגיש.</p>

            <h2>סקריפט מנהרה (tunnel.sh)</h2>
            <p>הסקריפט משתמש ב-set -euo pipefail לטיפול קפדני בשגיאות. ssh-keyscan מוסיף אוטומטית את מפתח המארח המרוחק. לולאת while אינסופית עם sleep מבטיחה חיבור מחדש אוטומטי.</p>

            <h2>בדיקות תקינות</h2>
            <p>בדיקת תקינות מבוססת netcat מאמתת שהפורט המקומי של המנהרה נגיש. זה מאפשר לקונטיינרים אחרים בפוד להמתין להקמת המנהרה לפני תחילת העבודה.</p>

            <h2>העברת פורטים (-L 0.0.0.0:port)</h2>
            <p>פרט קריטי — קשירה ל-0.0.0.0 במקום localhost. בתוך פוד Podman, קונטיינרים מתקשרים דרך מרחב רשת משותף. מנהרה הקשורה ל-0.0.0.0 נגישה לכל קונטיינרי הפוד.</p>

            <h2>ניהול known_hosts</h2>
            <p>ssh-keyscan בהפעלת הקונטיינר מוסיף אוטומטית את מפתח המארח המרוחק. לאבטחה משופרת, ניתן לספק known_hosts סטטי דרך volume או Podman secret.</p>

            <h2>מקרי שימוש</h2>
            <p>אנחנו משתמשים במנהרות SSH בקונטיינרים לגישה ל-Asterisk ARI, מסדי נתונים PostgreSQL ברשתות מאובטחות, ושירותי API הנגישים רק מסגמנטי רשת ספציפיים.</p>

            <h2>סיכום</h2>
            <p>מנהרות SSH בקונטיינרים הן דרך אמינה ונוחה לספק גישה מאובטחת לשירותים מרוחקים. בדיקות תקינות, חיבור מחדש אוטומטי ואינטגרציית Podman pod הופכים פתרון זה למוכן לייצור.</p>
          </div>
        </div>

        <div class="related-articles">
          <h3 class="related-articles__title">Похожие статьи</h3>
          <div class="related-articles__grid">
          <a href="blog-12.html" class="blog-card" data-blog-id="12">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-1.html" class="blog-card" data-blog-id="1">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-9.html" class="blog-card" data-blog-id="9">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          </div>
        </div>