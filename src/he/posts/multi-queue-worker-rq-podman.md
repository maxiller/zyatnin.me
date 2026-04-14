---
layout: layouts/post.njk
title: "בניית Worker מרובה תורים עם RQ ו-Podman"
excerpt: "ארכיטקטורה של עובד RQ יחיד שמקשיב למספר תורים ומפיץ משימות לקונטיינרים שונים."
date: 2026-03-10
topic: t1
slug: multi-queue-worker-rq-podman
permalink: /he/blog/multi-queue-worker-rq-podman/
---

<h2>מבוא</h2>
            <p>במערכות עם מקורות משימות מרובים — Jira, Asterisk, Telegram — יש צורך בעיבוד מרכזי דרך עובד יחיד. RQ (Redis Queue) מספק מנגנון אלגנטי של האזנה למספר תורים, שאנחנו משלבים עם שליחת קונטיינרים דרך Podman.</p>

            <h2>מבנה התצורה</h2>
            <p>כל ניתוב המשימות מוגדר ב-config.yaml. כל תור ממופה לתמונת קונטיינר ספציפית ופקודה. זה מאפשר גמישות מלאה — שינוי הקונטיינר המעבד דורש רק עדכון קובץ התצורה.</p>
            <pre><code><span class="cm"># config.yaml</span>
queues:
  jira:
    image: localhost/jira-processor:latest
    command: [<span class="str">"python"</span>, <span class="str">"process.py"</span>]
  asterisk:
    image: localhost/asterisk-handler:latest
    command: [<span class="str">"python"</span>, <span class="str">"handle_call.py"</span>]
  telegram:
    image: localhost/tg-worker:latest
    command: [<span class="str">"python"</span>, <span class="str">"tg_task.py"</span>]</code></pre>

            <h2>RoundRobinWorker</h2>
            <p>העובד הסטנדרטי של RQ מעבד תורים לפי עדיפות — התור הראשון תמיד מקבל עדיפות. לחלוקת עומס שווה, אנחנו משתמשים ב-RoundRobinWorker מותאם אישית שמסובב את התורים אחרי עיבוד כל משימה.</p>

            <h2>פונקציית run_container_task</h2>
            <p>פונקציית השליחה המרכזית מקבלת נתוני משימה ומפעילה את הקונטיינר המתאים. הנתונים מועברים דרך stdin בפורמט JSON, והתוצאה נקראת מ-stdout. גישה זו מבטיחה בידוד מלא.</p>

            <h2>העברת נתונים דרך stdin/stdout</h2>
            <p>הבחירה ב-stdin/stdout להחלפת נתונים היא מכוונת. גישה זו מבטיחה בידוד מלא: הקונטיינר לא צריך גישה למערכת הקבצים או לרשת כדי לקבל את המשימה שלו. סריאליזציית JSON מבטיחה תאימות בין שפות ופריימוורקים שונים בתוך הקונטיינרים.</p>

            <h2>טיפול בשגיאות</h2>
            <p>לכל שלב יש מנגנוני טיפול בשגיאות משלו. RQ מספק ניסיונות חוזרים ברמת התור, הקונטיינר מבודד כשלים מהעובד הראשי, ו-subprocess.run עם timeout מונע תקיעות מבעיות בתוך הקונטיינר.</p>

            <h2>תבניות לוגים</h2>
            <p>לוגים מובנים עם הקשר משימה מאפשרים מעקב אחר כל נתיב העיבוד — מכניסה לתור ועד סיום בקונטיינר. אנחנו משתמשים בפורמט JSON ללוגים לניתוח ואגרגציה נוחים.</p>

            <h2>סיכום</h2>
            <p>עובד RQ מרובה תורים עם שליחת קונטיינרים הוא תבנית חזקה לעיבוד משימות הטרוגניות. תצורת YAML מספקת גמישות, Podman מספק בידוד, וה-RoundRobinWorker מבטיח חלוקת עומס שווה.</p>
          </div>
        </div>

        <div class="related-articles">
          <h3 class="related-articles__title">Похожие статьи</h3>
          <div class="related-articles__grid">
          <a href="blog-1.html" class="blog-card" data-blog-id="1">
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