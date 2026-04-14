---
layout: layouts/post.njk
title: "אוטומציית Jira API: מהתראות לפעולה"
excerpt: "שימוש ב-Python לאוטומציה של תהליכי עבודה ב-Jira עם דימונים בקונטיינרים."
date: 2026-02-15
topic: t2
slug: jira-api-automation
permalink: /he/blog/jira-api-automation/
---

<h2>מבוא</h2>
            <p>Jira הוא כלי מרכזי למעקב משימות בצוותי תמיכה. אך ההתראות הסטנדרטיות של Jira לעיתים קרובות הולכות לאיבוד בשטפון האימייל. פתרנו זאת על ידי יצירת דימון Python בקונטיינר שמנטר את ה-API של Jira ושולח התראות חכמות לטלגרם.</p>

            <h2>חיבור ל-Jira API</h2>
            <p>אנחנו משתמשים בספריית jira-python לחיבור ל-Jira. שאילתות JQL מאפשרות סינון מדויק של משימות דחופות — לפי עדיפות, סטטוס, משימה ללא שיוך.</p>

            <h2>ניטור משימות</h2>
            <p>הדימון מדגום מעת לעת את ה-API של Jira, בודק משימות חדשות, שינויי סטטוס ו-SLA שעבר. לכל סוג אירוע הוא מעצב התראה מתאימה עם הקשר — עדיפות, זמן בתור, מהנדס מוקצה.</p>

            <h2>שליחת התראות לטלגרם</h2>
            <p>רמות חומרה שונות משתמשות בערוצים שונים: משימות P1 נשלחות לערוץ הכללי עם ציון האחראים, P2 לצ'אט העבודה, P3/P4 כהתראות אישיות למהנדס המוקצה.</p>

            <h2>ארכיטקטורת הדימון</h2>
            <p>הדימון רץ בתוך פוד Podman לצד Valkey לאחסון מצב. מנהרת SSH ל-Jira מופעלת כקונטיינר sidecar באמצעות תבנית הקונטיינר הזמני.</p>

            <h2>אסטרטגיית לוגים</h2>
            <p>לוגים מובנים בפורמט JSON מכילים: timestamp, רמה, issue_key, סוג התראה ותוצאת שליחה. הלוגים מוצגים ב-stdout של הקונטיינר ונאספים דרך podman logs או journald.</p>

            <h2>פריסה עם Podman Pods</h2>
            <p>כל ה-stack נפרס כפוד Podman יחיד: Valkey למצב, דימון ההתראות, ומנהרת SSH sidecar אופציונלית.</p>

            <h2>הגנה מכפילויות</h2>
            <p>Valkey שומר hash של אירועים שעובדו לאחרונה. לפני שליחת התראה, הדימון בודק אם היא כבר נשלחה. TTL על מפתחות מנקה אוטומטית ערכים ישנים.</p>

            <h2>סיכום</h2>
            <p>אוטומציית Jira דרך Python ודימון בקונטיינר יוצרת מערכת התראות אמינה ובלתי תלויה במנגנונים המובנים של Jira. פודים של Podman מספקים בידוד ופשטות פריסה.</p>
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
          <a href="blog-5.html" class="blog-card" data-blog-id="5">
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