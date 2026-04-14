---
layout: layouts/post.njk
title: "בניית Dispatcher קונטיינרים אוניברסלי ב-Python"
excerpt: "תבנית שבה עובד Python מפעיל קונטיינרים שרירותיים של Podman לפי קונפיגורציה."
date: 2026-02-20
topic: t2
slug: universal-container-dispatcher
permalink: /he/blog/universal-container-dispatcher/
---

<h2>מבוא</h2>
            <p>כשמבצעים אוטומציה של משימות הטרוגניות, נוצרת תבנית נפוצה שבה עובד Python צריך להפעיל קונטיינרים שונים בהתאם לסוג המשימה. במקום לקודד כל קונטיינר, אנחנו יוצרים dispatcher אוניברסלי המונע על ידי תצורת YAML.</p>

            <h2>תצורת YAML עם סעיף Runners</h2>
            <p>כל ניתוב המשימות מוגדר בקובץ config.yaml. כל runner ממופה לתמונת קונטיינר, פקודה, ארגומנטי Podman ו-timeout. הוספת סוג משימה חדש דורשת רק הוספת ערך חדש בתצורה.</p>

            <h2>מנהל הקשר EphemeralContainer</h2>
            <p>מנהל ההקשר מטפל במחזור החיים המלא של הקונטיינר — מיצירה ועד הסרה. הוא מייצר שם ייחודי לכל הרצה, מעביר נתונים דרך stdin ומבטיח ניקוי בבלוק finally.</p>

            <h2>העברת JSON דרך stdin</h2>
            <p>נתוני המשימה מסודרים ל-JSON ומועברים דרך stdin של הקונטיינר. הקונטיינר קורא stdin, מעבד את הנתונים וכותב את התוצאה ל-stdout. גישה זו מבטיחה בידוד מלא ואוניברסליות.</p>

            <h2>לכידת תוצאות מ-stdout</h2>
            <p>תוצאת העיבוד מנותחת מ-stdout של הקונטיינר. Stderr משמש ללוגים ודיבאג. בקודי החזרה שאינם אפס, נזרקת חריגה עם תוכן stderr.</p>

            <h2>טיפול בשגיאות עם בלוקי finally</h2>
            <p>בלוק ה-finally במנהל ההקשר מבטיח הסרת קונטיינר גם במהלך חריגות. זה מונע דליפת משאבים.</p>

            <h2>אינטגרציה עם RQ</h2>
            <p>המשימה האוניברסלית ל-RQ היא טריוויאלית — היא מקבלת שם runner ונתונים, טוענת את התצורה ומפעילה את הקונטיינר המתאים.</p>

            <h2>סיכום</h2>
            <p>dispatcher קונטיינרים אוניברסלי הוא פתרון אלגנטי למערכות עם משימות הטרוגניות. תצורת YAML, מנהלי הקשר והעברת נתונים דרך stdin/stdout מספקים גמישות, אמינות ובידוד ביצוע מלא.</p>
          </div>
        </div>

        <div class="related-articles">
          <h3 class="related-articles__title">Похожие статьи</h3>
          <div class="related-articles__grid">
          <a href="blog-4.html" class="blog-card" data-blog-id="4">
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
          <a href="blog-1.html" class="blog-card" data-blog-id="1">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          </div>
        </div>