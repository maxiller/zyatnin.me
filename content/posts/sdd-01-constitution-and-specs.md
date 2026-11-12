---
slug: sdd-01-constitution-and-specs
view: dev
date: 2026-04-17
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "Зачем персональному проекту конституция и спеки"
    excerpt: "Агент пишет код быстро, а проект разваливается. Как 11 спек и 305 требований вернули pet-проекту управляемость и предсказуемость."
  en:
    title: "Why a personal project needs a constitution and specs"
    excerpt: "Agents write code fast and projects fall apart. How 11 specs and 305 requirements brought a pet project back under control."
  he:
    title: "למה פרויקט אישי צריך חוקה ומפרטים"
    excerpt: "סוכני AI כותבים קוד מהר והפרויקט מתפרק. כך 11 מפרטים ו-305 דרישות החזירו לפרויקט האישי שליטה וצפינויות."
---

<!-- lang:ru -->

## Проект, который живёт дольше, чем помнит его автор

У меня есть pet-проект `uveonbot`. Это Jira-ассистент: ходит в Jira по API, рассылает уведомления в Telegram, умеет звонить по телефону через SIP, а вся работа крутится в Podman-поде — приёмник событий, воркер с очередью заданий, набор функций-агентов, которые и делают всю полезную работу.

Проекту несколько лет. Он пережил три переезда инфраструктуры, две смены провайдера телефонии и бесконечное число «давай перепишем этот модуль по-человечески». Я открываю его раз в несколько недель, и каждый раз приходится заново вспоминать: где живёт конфиг, почему у задания есть `root_job_id`, кто принимает решение о следующем шаге.

Полгода назад в этот процесс пришли LLM-агенты. И именно тогда проект начал разваливаться быстрее, чем я успевал его чинить.

## Симптом: «агент знает лучше»

Проблема не в том, что агент пишет плохой код. Проблема в том, что он пишет *уверенный* код. Три сценария, которые повторялись с завидной регулярностью:

- **Молчаливое изменение контракта.** Прошу добавить поле в событие — получаю заодно переименованное поле в соседнем событии, потому что «так логичнее».
- **Сломанное логирование.** Логи — это единственный способ понять, что происходит в проде. Агент «оптимизирует» формат записи, и вот уже парсер логов в моих же скриптах ничего не находит.
- **Дублирование решений.** Каждая функция-агент заново решает, как сериализовать payload. Через полгода в кодовой базе пять разных способов — и ни одного правильного.

Каждый такой случай в отдельности — мелочь на пятнадцать минут. Вместе они складываются в проект, который нельзя предсказать: я больше не могу сказать, что произойдёт, если попросить агента «добавить одну строчку».

## Масштаб, который набрался незаметно

К моменту, когда я начал эту серию, в репозитории лежало **11 спек и 305 функциональных требований**. Из них:

| Что | Сколько |
| --- | --- |
| Фич доведено до продакшена | 1 |
| Фич распланировано до задач | 1 |
| Модулей описано спеками | 9 |

Цифры не потому, что я люблю документы. Спеки появились как ответ на конкретную боль: агент без формальных требований каждый раз придумывает систему заново.

## Что я собираюсь показать в серии

Дальше будет полный spec-driven цикл на одной реальной фиче — от конституции проекта до отладки в проде. А потом — как из этого вырастает спека всего проекта, модуль за модулем.

Фича выбрана скучная и маленькая: в TRACE-режиме лог должен включать содержимое payload функций, которые выбирают следующее задание. «Добавить строчку в лог», не иначе. Посмотрим, во что это превратится.

А закончится серия вот чем. Спека сказала, что событие будет. Прод показал, что события нет. Оказалось, спека была права, а прод — просто пустой. Но это будет десятый пост, а пока — установка инструмента.

## Кому это может быть интересно

Если у вас есть личный проект, который живёт дольше вашей памяти о нём, и вы пробовали заводить в него LLM-агентов — вы узнаете эти грабли. Если агентов пока нет, серия всё равно полезна: spec-driven development придуман не для агентов, просто с ними он окупается быстрее.

## Три вопроса, на которые должна отвечать любая фича

Прежде чем перейти к инструментам, стоит зафиксировать, что именно будет проверяться в течение всей серии. Любая фича в проекте должна давать три ответа:

1. **Что именно меняется снаружи?** Не «внутри кода стало чище», а конкретное событие, поле, поведение, которое можно наблюдать извне.
2. **Как это проверить без живого Jira и телефонии?** Если проверка требует боевых данных — вы будете проверять её только в проде, и узнаете о дефекте оттуда же.
3. **Что будет, если это не работает?** Не «вернём как было», а какой след останется в логах, чтобы починка была поиском, а не гаданием.

Звучит как детский сад, пока не попробуешь ответить на эти три вопроса для «добавить строчку в лог». Ответы занимают несколько страниц — и именно они станут спекой.

Дальше — как поставить speckit в живой проект, не переписывая его с нуля.

---

[Пост 2: вживляем speckit в существующий проект →](/ru/dev/blog/sdd-02-speckit-integration/)

<!-- lang:en -->

## A project that outlives its author's memory

I have a pet project called `uveonbot`. It is a Jira assistant: it talks to Jira over the API, sends notifications to Telegram, can place phone calls over SIP, and the whole thing runs in a Podman pod — an event receiver, a worker with a job queue, and a set of agent functions that do the actual work.

The project is several years old. It has survived three infrastructure moves, two telephony providers and an endless number of "let's rewrite this module properly". I open it every few weeks, and every single time I have to remember: where the config lives, why a job has a `root_job_id`, who decides what the next step is.

Six months ago LLM agents entered that process. That is when the project started to fall apart faster than I could fix it.

## The symptom: "the agent knows better"

The problem is not that the agent writes bad code. The problem is that it writes *confident* code. Three scenarios kept repeating:

- **Silent contract changes.** I ask to add a field to an event and get a renamed field in a neighbouring event as a bonus, because "it makes more sense that way".
- **Broken logging.** Logs are the only way to understand what is happening in production. The agent "optimises" the record format, and the log parser in my own scripts finds nothing.
- **Duplicated decisions.** Every agent function re-invents how to serialise a payload. Six months later the codebase has five different ways — and not one correct one.

Each case alone is a fifteen-minute annoyance. Together they add up to a project you cannot predict: I can no longer say what will happen if I ask the agent to "add one line".

## The scale that crept up unnoticed

By the time I started this series, the repository held **11 specs and 305 functional requirements**. Of those:

| Item | Count |
| --- | --- |
| Features shipped to production | 1 |
| Features planned down to tasks | 1 |
| Modules described by specs | 9 |

The numbers are not there because I love documents. The specs appeared as an answer to a concrete pain: without formal requirements the agent re-invents the system every time.

## What this series will show

What follows is a full spec-driven cycle on one real feature — from the project constitution to production debugging. And then how a whole-project spec grows out of it, module by module.

The feature is boring and small: in TRACE mode the log must include the payload of the functions that pick the next job. "Add a line to the log", nothing more. Let's see what it turns into.

And here is how the series ends. The spec said the event would be there. Production showed no event. It turned out the spec was right and production was simply empty. But that is post ten; for now, installing the tool.

## Who this may be useful for

If you have a personal project that outlives your memory of it, and you have tried bringing LLM agents into it, you will recognise the rake. If you have no agents yet, the series still helps: spec-driven development was not invented for agents, they just make it pay off faster.

## Three questions any feature must answer

Before we get to tools, it is worth fixing what this series will actually check. Any feature in a project has to answer three questions:

1. **What changes on the outside?** Not "the code got cleaner", but a concrete event, field or behaviour observable from outside.
2. **How do we verify it without live Jira and telephony?** If verification needs production data, you will only verify in production — and learn about defects there too.
3. **What happens if it does not work?** Not "we roll back", but what trace is left in the logs, so that fixing it is a search rather than a guess.

It sounds trivial until you try answering those three questions for "add a line to the log". The answers take a few pages — and those pages become the spec.

Next up: putting speckit into a live project without rewriting it from scratch.

---

[Post 2: plugging speckit into an existing project →](/en/dev/blog/sdd-02-speckit-integration/)

<!-- lang:he -->

## פרויקט שחי יותר מהזיכרון של הכותב שלו

יש לי פרויקט צד בשם `uveonbot`. זה עוזר Jira: פונה ל-Jira דרך ה-API, שולח התראות לטלגרם, יודע להתקשר דרך SIP, וכל המערכת רצה בפוד של Podman — מקבל אירועים, worker עם תור משימות וקבוצה של פונקציות סוכן שעושות את העבודה עצמה.

הפרויקט בן כמה שנים. הוא שרד שלושה מעברי תשתית, שני ספקי טלפוניה ומספר אינסופי של "בואו נכתוב את המודול הזה מחדש כמו שצריך". אני פותח אותו פעם בכמה שבועות, ובכל פעם צריך להיזכר מחדש: איפה הקונפיג, למה למשימה יש `root_job_id`, ומי מחליט מה הצעד הבא.

לפני חצי שנה נכנסו סוכני LLM לתהליך הזה. ואז הפרויקט התחיל להתפרק מהר יותר משהייתי מספיק לתקן.

## הסימפטום: "הסוכן יודע טוב יותר"

הבעיה היא לא שהסוכן כותב קוד גרוע. הבעיה היא שהוא כותב קוד *בטוח בעצמו*. שלושה תרחישים חזרו שוב ושוב:

- **שינוי חוזה בשקט.** מבקש להוסיף שדה לאירוע — ומקבל גם שדה שמשונה שם באירוע שכן, כי "ככה יותר הגיוני".
- **לוגים שבורים.** לוגים הם הדרך היחידה להבין מה קורה בפרודקשן. הסוכן "מייעל" את פורמט הרשומה, ועכשיו הפארסר של הלוגים בסקריפטים שלי לא מוצא כלום.
- **החלטות משוכפלות.** כל פונקציית סוכן ממציאה מחדש איך לסדר payload. אחרי חצי שנה בקוד יש חמש דרכים שונות — ואף אחת לא נכונה.

כל מקרה בנפרד הוא מטרד של רבע שעה. יחד הם מצטברים לפרויקט שאי אפשר לחזות: אני כבר לא יכול לומר מה יקרה אם אבקש מהסוכן "להוסיף שורה אחת".

## ההיקף שהצטבר בלי ששמתי לב

עד שפתחתי את הסדרה הזאת, במאגר היו **11 מפרטים ו-305 דרישות פונקציונליות**. מתוכן:

| מה | כמה |
| --- | --- |
| פיצ'רים שיצאו לפרודקשן | 1 |
| פיצ'רים שתוכננו עד משימות | 1 |
| מודולים שמתוארים במפרט | 9 |

המספרים לא שם בגלל שאני אוהב מסמכים. המפרטים נולדו כתשובה לכאב קונקרטי: בלי דרישות פורמליות הסוכן ממציא את המערכת מחדש בכל פעם.

## מה הסדרה תראה

בהמשך יהיה מחזור spec-driven מלא על פיצ'ר אמיתי אחד — מהחוקה של הפרויקט ועד דיבאג בפרודקשן. ואחר כך איך מתוכו גדל המפרט של כל הפרויקט, מודול אחרי מודול.

הפיצ'ר נבחר משעמם וקטן: במצב TRACE הלוג צריך לכלול את תוכן ה-payload של הפונקציות שבוחרות את המשימה הבאה. "להוסיף שורה ללוג", לא פחות ולא יותר. נראה למה זה יתפתח.

ואיך הסדרה נגמרת: המפרט אמר שהאירוע יהיה. הפרודקשן הראה שאין אירוע. מתברר שהמפרט צדק, והפרודקשן פשוט ריק. אבל זה הפוסט העשירי; בינתיים — התקנת הכלי.

## למי זה יכול לעניין

אם יש לכם פרויקט אישי שחי יותר מהזיכרון שלכם עליו, ואם ניסיתם להכניס לו סוכני LLM — אתם תזהו את המלכודות. אם עדיין אין סוכנים, הסדרה עדיין מועילה: spec-driven development לא הומצא בשביל סוכנים, אבל איתם הוא משתלם מהר יותר.

## שלוש שאלות שכל פיצ'ר חייב לענות עליהן

לפני שעוברים לכלים, כדאי לקבוע מה בדיוק הסדרה בודקת. כל פיצ'ר בפרויקט צריך לתת שלוש תשובות:

1. **מה משתנה מבחוץ?** לא "הקוד נהיה מסודר יותר", אלא אירוע, שדה או התנהגות שאפשר לראות מבחוץ.
2. **איך מאמתים בלי Jira וטלפוניה חיה?** אם האימות דורש נתוני ייצור — תאמתו רק בפרודקשן, ושם גם תגלו את התקלות.
3. **מה יקרה אם זה לא עובד?** לא "נחזיר כמו שהיה", אלא איזה עקבות יישארו בלוגים כדי שהתיקון יהיה חיפוש ולא ניחוש.

נשמע כמו דבר טריוויאלי, עד שמנסים לענות על שלוש השאלות האלה עבור "להוסיף שורה ללוג". התשובות תופסות כמה עמודים — והם הופכים למפרט.

בהמשך — איך מכניסים speckit לפרויקט חי בלי לכתוב אותו מחדש מאפס.

---

[פוסט 2: משתילים את speckit בפרויקט קיים →](/he/dev/blog/sdd-02-speckit-integration/)
