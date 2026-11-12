---
slug: sdd-07-plan-research-contract
view: dev
date: 2026-08-14
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "/speckit.plan: research, data-model и контракт до кода"
    excerpt: "План фичи как четыре документа: research, data-model, контракт события и quickstart. И главная развилка — где эмитить событие."
  en:
    title: "/speckit.plan: research, data-model and the contract before code"
    excerpt: "A feature plan as four documents: research, data-model, event contract and quickstart. And the main fork — where to emit the event."
  he:
    title: "/speckit.plan: research, data-model וחוזה לפני הקוד"
    excerpt: "תוכנית פיצ'ר כארבעה מסמכים: research, data-model, חוזה האירוע ו-quickstart. והפיצול המרכזי — מאיפה לפלוט את האירוע."
---

<!-- lang:ru -->

## Спека отвечает «что», план — «как»

После `/speckit.specify` у фичи есть восемнадцать требований и три user story. Ни одного решения о том, как это устроить в коде. Этим занимается `/speckit.plan`, и результат — не один документ, а четыре.

## `research.md`: сначала посмотреть, как уже сделано

Первый артефакт плана — исследования. Не «как правильно вообще», а «как у нас уже работает».

Вопросы, на которые пришлось ответить:

- воркер уже логирует `function_payload` и `job_result` — где именно и в каком формате?
- где живёт контекст задания (`ctx`) и что в нём есть на момент вызова функции?
- как из контекста достать `job_id` и `root_job_id` — идентификатор корневого задания каскада?

Последний вопрос оказался ключевым. В проекте есть понятие каскада: одно корневое задание порождает дочерние, и все они связаны одним `root_job_id`. Без этого поля событие бесполезно: по логу нельзя восстановить, какие задания относятся к одной цепочке.

Ещё один вывод из research: уровни логирования в проекте — не однородная шкала, а два разных режима. INFO и DEBUG включены всегда, TRACE включается руками на время расследования. Значит, дорогая сериализация payload допустима только на TRACE — иначе фича превратится в тормоз для всех инсталляций разом.

## `data-model.md`: одно событие и его поля

Событие называется `function_next_payload`. Поля:

| Поле | Тип | Смысл |
| --- | --- | --- |
| `next_function` | string | имя функции, выбранной следующим шагом |
| `next_job_id` | string | идентификатор созданного задания |
| `payload` | object | полный payload задания, без усечения |
| `dedupe_key` | string? | условное: только когда задание дедуплицируется |
| `dedupe_ttl_s` | int? | условное: TTL дедупликации, если он был |
| `level` | string | всегда `TRACE` |

Условные поля — это не лень, а точность: если дедупликации не было, `dedupe_key` отсутствует, а не равен `null`. Разница важна для потребителей: «поля нет» и «поле пустое» несут разный смысл.

Ещё одно решение того же рода: `payload` пишется целиком, без маскировки секретов и без обрезки длинных строк. Соблазн обработать его «на всякий случай» был, но маскировка делает лог бесполезным: именно в payload и живёт причина, почему функция выбрала именно это задание. Здесь мы сознательно выбираем диагностику и компенсируем риск политикой: TRACE не включается постоянно и его выводы не выкладываются.

## Главная развилка: где эмитить

Вот тут план отработал свою главную пользу — заставил явно выбрать.

Вариант первый: **в диспетчере**. Диспетчер (`Dispatcher.dispatch`) централизованно решает, что запускать дальше, и именно он знает всё про каскад. Одно место — один вызов, легко тестировать.

Вариант второй: **в самих функциях**. Каждая из пяти функций (`search_jql`, `fetch_jira_issue`, `generate_text`, `synthesize_speech`, `place_phone_call`) сама вызывает хелпер перед тем, как сообщить о завершении.

План выбрал диспетчер. Аргумент был таким: одна точка эмиссии = меньше шансов забыть, чем при пяти точках.

В посте 11 я расскажу, почему это решение пришлось развернуть. Пока просто запомните: план зафиксировал выбор и его обоснование — через полгода можно будет прочитать, почему код устроен так, а не иначе.

## `contracts/function-next-payload.md` и версия v4.12

По принципу I изменение внешнего поведения сначала фиксируется в контракте. В плане появляется файл описания события, а `docs/CONTRACTS.md` поднимается до **v4.12** — до первой строчки кода.

Выдержка из контракта:

```text
### function_next_payload  (added in 4.12)

Пример:
  {
    "event": "function_next_payload",
    "next_function": "fetch_jira_issue",
    "next_job_id": "4f1c9a24-...",
    "payload": { "issue_key": "PROJ-1042", "fields": ["summary", "status"] },
    "level": "TRACE"
  }

Событие аддитивное: потребители, не знающие о нём, игнорируют его.
```

Поля в примере вымышленные — и это не случайно: в реальных TRACE-логах светятся токены и содержимое задач. Об этом в посте про расследование.

## `quickstart.md`: как проверить руками

Последний артефакт плана — короткая инструкция для человека: «включи TRACE, выполни этот запрос, посмотри в `journalctl` такую-то строку». Пять строк, которые через месяц сэкономят полчаса поисков.

План готов. Дальше — как он превращается в задачи и тесты.

---

[← Пост 6: пост-мортем по волне](/ru/dev/blog/sdd-06-spec-wave-postmortem/) · [Пост 8: `/speckit.tasks` →](/ru/dev/blog/sdd-08-tasks-and-tdd/)

<!-- lang:en -->

## The spec answers "what", the plan answers "how"

After `/speckit.specify` a feature has eighteen requirements and three user stories. Not a single decision about how to build it in code. That is `/speckit.plan`'s job, and the result is not one document but four.

## `research.md`: look at how it is already done

The first plan artefact is research. Not "how should it be done in general", but "how does it already work for us".

The questions that had to be answered:

- the worker already logs `function_payload` and `job_result` — where exactly and in what format?
- where does the job context (`ctx`) live and what is in it at function call time?
- how do we get `job_id` and `root_job_id` — the identifier of the cascade's root job — out of the context?

The last question turned out to be key. The project has the notion of a cascade: one root job spawns children, and all of them share one `root_job_id`. Without that field the event is useless: you cannot reconstruct which jobs belong to one chain from the log.

Another research finding: log levels in the project are not a uniform scale but two different modes. INFO and DEBUG are always on, TRACE is switched on by hand for an investigation. So expensive payload serialisation is acceptable on TRACE only — otherwise the feature becomes a brake for every installation at once.

## `data-model.md`: one event and its fields

The event is called `function_next_payload`. Fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `next_function` | string | name of the function picked as the next step |
| `next_job_id` | string | identifier of the created job |
| `payload` | object | full job payload, without truncation |
| `dedupe_key` | string? | conditional: only when the job is deduplicated |
| `dedupe_ttl_s` | int? | conditional: dedupe TTL, if there was one |
| `level` | string | always `TRACE` |

Conditional fields are not laziness but precision: if there was no deduplication, `dedupe_key` is absent rather than `null`. The difference matters to consumers: "no field" and "empty field" carry different meanings.

Another decision of the same kind: `payload` is written in full, without masking secrets and without cutting long strings. There was a temptation to "handle it just in case", but masking makes the log useless: the payload is exactly where the reason a function picked this particular job lives. Here we consciously choose diagnostics and offset the risk with policy: TRACE is never on permanently and its output is never published.

## The main fork: where to emit

This is where the plan delivered its main value — it forced an explicit choice.

Option one: **in the dispatcher**. The dispatcher (`Dispatcher.dispatch`) centrally decides what to run next, and it is the one that knows everything about the cascade. One place, one call, easy to test.

Option two: **in the functions themselves**. Each of the five functions (`search_jql`, `fetch_jira_issue`, `generate_text`, `synthesize_speech`, `place_phone_call`) calls a helper itself before reporting completion.

The plan chose the dispatcher. The argument: one emission point means fewer chances to forget than five points.

In post 11 I will explain why that decision had to be reversed. For now just remember: the plan recorded the choice and its reasoning — in six months you can read why the code is shaped that way and not otherwise.

## `contracts/function-next-payload.md` and version v4.12

By principle I, a change to external behaviour is first recorded in the contract. A description file for the event appears in the plan, and `docs/CONTRACTS.md` is bumped to **v4.12** — before the first line of code.

An excerpt from the contract:

```text
### function_next_payload  (added in 4.12)

Example:
  {
    "event": "function_next_payload",
    "next_function": "fetch_jira_issue",
    "next_job_id": "4f1c9a24-...",
    "payload": { "issue_key": "PROJ-1042", "fields": ["summary", "status"] },
    "level": "TRACE"
  }

Additive event: consumers unaware of it ignore it.
```

The fields in the example are fictional — and not by accident: real TRACE logs leak tokens and task content. More on that in the investigation post.

## `quickstart.md`: how to check by hand

The last plan artefact is a short instruction for a human: "turn on TRACE, run this request, look for that line in `journalctl`". Five lines that will save half an hour a month later.

The plan is ready. Next: how it turns into tasks and tests.

---

[← Post 6: post-mortem on the wave](/en/dev/blog/sdd-06-spec-wave-postmortem/) · [Post 8: `/speckit.tasks` →](/en/dev/blog/sdd-08-tasks-and-tdd/)

<!-- lang:he -->

## המפרט עונה "מה", התוכנית — "איך"

אחרי `/speckit.specify` לפיצ'ר יש שמונה-עשרה דרישות ושלוש user stories. אף החלטה על האופן שבו בונים את זה בקוד. בזה עוסק `/speckit.plan`, והתוצאה היא לא מסמך אחד אלא ארבעה.

## `research.md`: קודם לראות איך זה כבר עשוי

הארטיפקט הראשון של התוכנית הוא המחקר. לא "איך נכון לעשות בכלל", אלא "איך זה כבר עובד אצלנו".

השאלות שהיה צריך לענות עליהן:

- ה-worker כבר כותב לוגים `function_payload` ו-`job_result` — איפה בדיוק ובאיזה פורמט?
- איפה חי הקשר של המשימה (`ctx`) ומה יש בו ברגע קריאת הפונקציה?
- איך מוציאים מההקשר `job_id` ו-`root_job_id` — המזהה של משימת השורש במפל?

השאלה האחרונה התבררה כמרכזית. בפרויקט יש מושג של מפל: משימת שורש אחת מולידה ילדים, וכולם קשורים ב-`root_job_id` אחד. בלי השדה הזה האירוע חסר תועלת: אי אפשר לשחזר מהלוג אילו משימות שייכות לאותה שרשרת.

עוד מסקנה מה-research: רמות הלוגים בפרויקט הן לא סקאלה אחידה אלא שני מצבים שונים. INFO ו-DEBUG דלוקים תמיד, TRACE מדליקים ביד לזמן חקירה. כלומר סידור יקר של ה-payload מותר רק ב-TRACE — אחרת הפיצ'ר הופך לבלם לכל ההתקנות בבת אחת.

## `data-model.md`: אירוע אחד והשדות שלו

האירוע נקרא `function_next_payload`. שדות:

| שדה | סוג | משמעות |
| --- | --- | --- |
| `next_function` | string | שם הפונקציה שנבחרה כצעד הבא |
| `next_job_id` | string | מזהה המשימה שנוצרה |
| `payload` | object | ה-payload המלא של המשימה, בלי קיצור |
| `dedupe_key` | string? | מותנה: רק כשהמשימה עוברת deduplication |
| `dedupe_ttl_s` | int? | מותנה: TTL של ה-dedupe, אם היה |
| `level` | string | תמיד `TRACE` |

שדות מותנים הם לא עצלות אלא דיוק: אם לא היה deduplication, `dedupe_key` נעדר ולא שווה ל-`null`. ההבדל חשוב לצרכנים: "אין שדה" ו"שדה ריק" נושאים משמעות שונה.

החלטה נוספת מאותו סוג: ה-`payload` נכתב במלואו, בלי מיסוך סודות ובלי לקצץ מחרוזות ארוכות. היה פיתוי "לטפל בזה ליתר ביטחון", אבל המיסוך הופך את הלוג לחסר תועלת: דווקא ב-payload חי הסיבה לכך שהפונקציה בחרה במשימה הזאת. כאן אנחנו בוחרים במודע בדיאגנוסטיקה ומפצים על הסיכון במדיניות: TRACE לא דלוק קבוע והפלט שלו לא מפורסם.

## למה plan הוא לא פרוצדורה

התוכנית הזאת לא נועדה לחסום עבודה אלא למנוע שני סוגי טעויות יקרות: לכתוב קוד לפני שהחוזה ברור, ולבחור ארכיטקטורה בלי לרשום למה. הרישום הוא החלק החשוב: כשבעוד חצי שנה מישהו ישאל "למה הפליטה יושבת דווקא כאן", התשובה לא תהיה "ככה יצא", אלא סעיף בתוכנית עם נימוק.

עלות התוכנית בפועל: שעה-שעתיים של קריאת קוד וכתיבה. מול יום של ריפקטורינג אחרי בחירה שגויה.

## הפיצול המרכזי: מאיפה לפלוט

כאן התוכנית סיפקה את ערכה העיקרי — היא הכריחה בחירה מפורשת.

אפשרות ראשונה: **ב-dispatcher**. ה-dispatcher (`Dispatcher.dispatch`) מחליט באופן מרכזי מה להריץ הלאה, והוא זה שיודע הכל על המפל. מקום אחד, קריאה אחת, קל לטסט.

אפשרות שנייה: **בפונקציות עצמן**. כל אחת מחמש הפונקציות (`search_jql`, `fetch_jira_issue`, `generate_text`, `synthesize_speech`, `place_phone_call`) קוראת בעצמה ל-helper לפני שהיא מדווחת על סיום.

התוכנית בחרה ב-dispatcher. הנימוק: נקודת פליטה אחת משמעה פחות סיכויים לשכוח לעומת חמש נקודות.

בפוסט 11 אסביר למה את ההחלטה הזאת היה צריך להפוך. בינתיים רק זכרו: התוכנית תיעדה את הבחירה ואת הנימוק שלה — בעוד חצי שנה אפשר לקרוא למה הקוד בנוי כך ולא אחרת.

## `contracts/function-next-payload.md` וגרסה v4.12

לפי עקרון I, שינוי בהתנהגות חיצונית נרשם קודם בחוזה. בתוכנית מופיע קובץ תיאור לאירוע, ו-`docs/CONTRACTS.md` עולה ל-**v4.12** — לפני שורת הקוד הראשונה.

קטע מהחוזה:

```text
### function_next_payload  (added in 4.12)

Example:
  {
    "event": "function_next_payload",
    "next_function": "fetch_jira_issue",
    "next_job_id": "4f1c9a24-...",
    "payload": { "issue_key": "PROJ-1042", "fields": ["summary", "status"] },
    "level": "TRACE"
  }

Additive event: consumers unaware of it ignore it.
```

השדות בדוגמה בדויים — וזה לא במקרה: בלוגי TRACE אמיתיים מופיעים טוקנים ותוכן משימות. על כך בפוסט החקירה.

## `quickstart.md`: איך לבדוק ביד

הארטיפקט האחרון של התוכנית הוא הוראה קצרה לאדם: "הדלק TRACE, הרץ את הבקשה הזאת, חפש ב-`journalctl` את השורה הזאת". חמש שורות שיחסכו חצי שעה בעוד חודש.

התוכנית מוכנה. בהמשך — איך היא הופכת למשימות וטסטים.

---

[← פוסט 6: פוסט-מורטם על הגל](/he/dev/blog/sdd-06-spec-wave-postmortem/) · [פוסט 8: `/speckit.tasks` →](/he/dev/blog/sdd-08-tasks-and-tdd/)
