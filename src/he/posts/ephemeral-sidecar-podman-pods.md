---
layout: layouts/post.njk
title: "תבנית Sidecar זמנית: ניהול מנהרות SSH בפודים של Podman"
excerpt: "איך להפעיל ולעצור קונטיינרים דינמית בתוך פוד Podman באמצעות Python."
date: 2026-03-15
topic: t1
slug: ephemeral-sidecar-podman-pods
permalink: /he/blog/ephemeral-sidecar-podman-pods/
---

<h2>מבוא</h2>
            <p>כשעובדים עם ארכיטקטורת מיקרו-שירותים המבוססת על Podman, לעיתים קרובות נדרש לנהל באופן דינמי קונטיינרים עזר בתוך פוד. אחד התרחישים הנפוצים ביותר כולל מנהרות SSH לשירותים מרוחקים: מסדי נתונים, ממשקי API ומערכות ניטור. במאמר זה אתאר את תבנית "קונטיינר sidecar זמני" ואת המימוש שלה ב-Python.</p>

            <h2>ארכיטקטורת הפוד</h2>
            <p>הפוד שלנו ב-Podman מורכב משלושה רכיבים עיקריים: Valkey (fork של Redis) לתור המשימות, עובד RQ לעיבוד משימות, ומנהרת SSH זמנית שמופעלת לפי דרישה. כל הקונטיינרים נמצאים בפוד אחד, מה שמשמעו מרחב רשת משותף — מנהרה שנפתחת בקונטיינר ה-sidecar נגישה לעובד דרך localhost.</p>
            <pre><code><span class="cm"># יצירת פוד עם העברת פורטים</span>
<span class="fn">podman</span> pod create --name jira-stack   -p 6379:6379   -p 8080:8080

<span class="cm"># הפעלת Valkey בפוד</span>
<span class="fn">podman</span> run -d --pod jira-stack   --name valkey   docker.io/valkey/valkey:8

<span class="cm"># הפעלת העובד</span>
<span class="fn">podman</span> run -d --pod jira-stack   --name worker   localhost/jira-worker:latest</code></pre>

            <h2>מנהל הקשר של Python למחזור חיי הקונטיינר</h2>
            <p>המרכיב המרכזי של תבנית זו הוא מנהל הקשר (context manager) של Python שמטפל בהפעלה ועצירה של קונטיינר ה-sidecar. זה מבטיח ניקוי נכון של משאבים גם כשמתרחשות שגיאות.</p>
            <pre><code><span class="kw">class</span> <span class="fn">EphemeralContainer</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, name, pod_name):
        self.name = name
        self.pod_name = pod_name
    
    <span class="kw">def</span> <span class="fn">__enter__</span>(self):
        subprocess.run(
            [<span class="str">"podman"</span>, <span class="str">"start"</span>, self.name],
            check=<span class="kw">True</span>
        )
        self._wait_healthy()
        <span class="kw">return</span> self
    
    <span class="kw">def</span> <span class="fn">__exit__</span>(self, *args):
        subprocess.run(
            [<span class="str">"podman"</span>, <span class="str">"stop"</span>, <span class="str">"-t"</span>, <span class="str">"5"</span>, self.name]
        )</code></pre>

            <h2>שימוש במשימות RQ</h2>
            <p>כעת אנחנו יכולים להשתמש במנהל ההקשר בעיבוד משימות. העובד מפעיל את מנהרת ה-SSH לפני ביצוע משימה ומבטיח את כיבויה לאחר סיום. מנהרת ה-SSH פעילה רק כשנדרשת, מה שחוסך משאבי מערכת.</p>

            <h2>Containerfile למנהרת SSH</h2>
            <p>קונטיינר המנהרה כולל לקוח SSH וסקריפט חיבור עם חיבור מחדש אוטומטי. ה-HEALTHCHECK מבטיח שהמנהרה פעילה לפני שהעובד מנסה להשתמש בה.</p>

            <h2>בדיקות תקינות וניטור</h2>
            <p>חיוני להגדיר בדיקות תקינות לקונטיינרי sidecar. Podman תומך בהוראות healthcheck מובנות ב-Containerfile. מנהל ההקשר שלנו ממתין לעבור את בדיקת התקינות לפני שממשיך — זה מונע מצבים שבהם העובד מנסה להשתמש בחיבור שטרם הוקם.</p>

            <h2>טיפול בשגיאות והפעלה מחדש של העובד</h2>
            <p>כשעובד מופעל מחדש, כל הקונטיינרים הזמניים חייבים להיעצר כראוי. אנחנו מוסיפים מטפל סיגנלים ותהליך ניקוי בהפעלה שעוצר קונטיינרי sidecar שנשארו מהסשן הקודם. שיטת <code>__exit__</code> של מנהל ההקשר מבטיחה ניקוי בסיום רגיל וגם בחריגות.</p>

            <h2>סיכום</h2>
            <p>תבנית ה-sidecar הזמני מאפשרת לחסוך משאבים על ידי הפעלת שירותי עזר רק כשנדרש. מנהל ההקשר של Python מבטיח ניהול מחזור חיים אמין, ופודים של Podman מספקים מרחב רשת משותף לתקשורת בין קונטיינרים. גישה זו יעילה במיוחד למנהרות SSH, חיבורי מסד נתונים וחיבורים אחרים עתירי משאבים.</p>
          </div>
        </div>

        <div class="related-articles">
          <h3 class="related-articles__title">Похожие статьи</h3>
          <div class="related-articles__grid">
          <a href="blog-2.html" class="blog-card" data-blog-id="2">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-3.html" class="blog-card" data-blog-id="3">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-5.html" class="blog-card" data-blog-id="5">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          </div>
        </div>