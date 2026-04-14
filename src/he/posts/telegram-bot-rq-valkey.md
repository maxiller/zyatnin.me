---
layout: layouts/post.njk
title: "שילוב בוטים של Telegram עם תורי משימות: aiogram + RQ + Valkey"
excerpt: "ארכיטקטורה מלאה לבוט Telegram אסינכרוני עם עיבוד משימות ברקע."
date: 2026-02-28
topic: t2
slug: telegram-bot-rq-valkey
permalink: /he/blog/telegram-bot-rq-valkey/
---

<h2>מבוא</h2>
            <p>בוטים של Telegram הם כלי רב-עוצמה לאוטומציה של תהליכי עבודה. עם זאת, עיבוד משימות כבדות ישירות במטפלי הבוט חוסם את לולאת האירועים ומוביל לעיכובים בתגובות. הפתרון הוא להפריד את הבוט האסינכרוני (aiogram) מעובדי הרקע (RQ + Valkey).</p>

            <h2>ארכיטקטורת המערכת</h2>
            <p>מחזור עיבוד הבקשה המלא עובד כך: משתמש שולח הודעה → הבוט מקבל אותה דרך aiogram → הבוט שם משימה בתור RQ דרך Valkey → עובד RQ מעבד את המשימה → העובד שולח את התוצאה בחזרה דרך Telegram API, מקושר להודעה המקורית.</p>

            <h2>הבוט: קבלה והכנסה לתור</h2>
            <p>הבוט מקבל הודעות דרך aiogram ומכניס משימות לתור RQ. התגובה המיידית מאשרת את קבלת הבקשה, והעיבוד בפועל מתבצע ברקע על ידי העובד.</p>

            <h2>העובד: עיבוד ותגובה</h2>
            <p>העובד מעבד את המשימה ושולח את התוצאה בחזרה דרך Telegram API. פונקציית העזר <code>_run_async_task</code> מאפשרת להריץ קוד אסינכרוני מתוך עובד RQ סינכרוני.</p>

            <h2>ValkeyPersistence לאחסון מצב</h2>
            <p>למעקב אחר סטטוס משימות, אנחנו משתמשים ב-Valkey (תואם Redis). FinishedJobRegistry מאפשר לבוט לבדוק מעת לעת משימות שהושלמו ולהודיע למשתמשים על תוצאות.</p>

            <h2>reply_to_message_id לשרשורים</h2>
            <p>פרט חשוב הוא שמירת ה-message_id המקורי והעברתו ל-reply_to_message_id בעת התגובה. זה יוצר שרשור טבעי בצ'אט ועוזר למשתמש לקשר את התגובה לבקשה שלו.</p>

            <h2>קונטיינריזציה</h2>
            <p>הבוט והעובדים רצים בקונטיינרים נפרדים בתוך פוד Podman יחיד. Valkey גם רץ בפוד, מספק תקשורת דרך localhost.</p>

            <h2>סיכום</h2>
            <p>הפרדת בוט Telegram לפרונטאנד (aiogram) ובקאנד (עובדי RQ) מבטיחה תגובתיות של הבוט וסקלביליות עיבוד. Valkey משמש גם כמתווך הודעות וגם כמאגר מצב.</p>
          </div>
        </div>

        <div class="related-articles">
          <h3 class="related-articles__title">Похожие статьи</h3>
          <div class="related-articles__grid">
          <a href="blog-5.html" class="blog-card" data-blog-id="5">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-6.html" class="blog-card" data-blog-id="6">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-2.html" class="blog-card" data-blog-id="2">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          </div>
        </div>