---
slug: email-only-response-sla
view: leader
date: 2026-02-07
tags: ["sla", "support-management"]
translations:
  ru:
    title: "SLA на реакцию, имея только почту"
    excerpt: "Как измерить время первой реакции инженера без тикет-системы: цепочки писем Exchange, расчёт FRT в PowerBI и эскалации через PagerDuty."
  en:
    title: "Response-time SLA when all you have is email"
    excerpt: "How to measure first-response time without a ticketing system: Exchange email threads, FRT calculated in Power BI, and escalations through PagerDuty."
  he:
    title: "SLA לזמן תגובה כשיש רק אימייל"
    excerpt: "איך למדוד זמן תגובה ראשונה בלי מערכת טיקטים: שרשורי אימייל ב-Exchange, חישוב FRT ב-Power BI והסלמות דרך PagerDuty."
---

<!-- lang:ru -->

## Введение

Не у каждой команды на старте есть ITSM-система. Обращения приходят в общий ящик, инженеры отвечают из Outlook, и SLA на реакцию существует скорее на бумаге: измерять его нечем. Но отсутствие тикет-системы не отменяет измеримость — в почте уже есть всё необходимое, если договориться, что считать ответом.

## Что считать реакцией

Сначала фиксируем определение: метрика — first response time (FRT), интервал от письма клиента до первого содержательного ответа инженера. «Содержательного» — потому что автоответ «ваше письмо получено» реакцией не считается. Это определение важно согласовать с клиентом заранее: если в SLA написано «реакция за 2 рабочих часа», обе стороны должны одинаково понимать, что засчитывается.

## Данные уже есть: цепочки писем

У писем в Exchange есть всё для восстановления хронологии: ConversationId связывает цепочку, From/ToRecipients показывают участников, у каждого сообщения есть timestamp. Алгоритм простой:

1. Группируем сообщения по ConversationId.
2. Помечаем входящие от домена клиента и исходящие от инженеров.
3. FRT цепочки = первое исходящее письмо инженера минус первое входящее от клиента.
4. Повторные реакции считаем по тому же правилу дальше по цепочке.

Фильтрация — по заголовкам, а не по телам писем: подписи, цитируемые фрагменты и рассылки ломают разбор текста, но не заголовков. Автоответы (обычно определяются по заголовкам X-Autoreply и precedence) и внутренние письма отсекаем отдельно.

## PowerBI как ETL и отчётность

Дальше подключается PowerBI. Power Query забирает письма из Exchange (штатный коннектор Exchange или Graph API) и приводит их к двум таблицам: сообщения и цепочки. Поверх — меры на DAX: медиана и 90-й перцентиль FRT, доля цепочек в пределах SLA, разбивка по инженерам и дням недели. Отчёт обновляется по расписанию, дашборд виден и команде, и руководству — это само по себе дисциплинирует.

## PagerDuty: реакция вне рабочих часов

Почта не умеет будить дежурного. Мост между письмом и человеком — PagerDuty: входящее письмо в критический ящик создаёт событие в PagerDuty (штатная email-интеграция или лёгкий монитор ящика), дальше работает его график эскалаций. Разделение ответственности получается чистым: PagerDuty отвечает на вопрос «кто услышал и когда», PowerBI — «за сколько минут и с каким качеством». Время от создания события до подтверждения (acknowledge) — вторая метрика рядом с FRT.

## Подводные камни

- Часовые пояса и рабочее время: считать календарные часы или только окно поддержки — решается до внедрения, иначе метрику будут оспаривать.
- Группы рассылки: письмо в группу создаёт цепочку с несколькими участниками; инженером считаем того, кто реально ответил.
- Пересылки: если письмо ушло во внешнюю систему, цепочка рвётся; такие цепочки помечаем отдельно.
- Выбросы: одно письмо в праздник ломает медиану — смотрим перцентили, а не среднее.

## Результат

Связка Exchange + PowerBI + PagerDuty даёт измеримый SLA на реакцию без закупки ITSM: фактические FRT, долю соблюдения SLA и точки эскалации. Главное же — появляется основа для решений: где узкое место, какой день недели перегружен, нужна ли вторая линия. Измеримость — предпосылка управляемости.

<!-- lang:en -->

## Introduction

Not every team starts with an ITSM platform. Requests arrive in a shared mailbox, engineers reply from Outlook, and the response-time SLA exists mostly on paper: there is nothing to measure it with. But the absence of a ticketing system does not cancel measurability — email already keeps everything you need, once you agree on what counts as a response.

## What counts as a response

First, we fix the definition: the metric is first response time (FRT), the interval between the client's email and the first substantive reply from an engineer. "Substantive" — because an auto-reply of "we received your message" is not a response. The definition must be agreed with the client in advance: if the SLA says "response within 2 business hours", both sides must understand the same thing about what qualifies.

## The data is already there: email threads

Messages in Exchange carry everything needed to reconstruct the timeline: ConversationId ties a thread together, From/ToRecipients show the participants, and every message has a timestamp. The algorithm is simple:

1. Group messages by ConversationId.
2. Mark inbound messages from the client's domain and outbound ones from engineers.
3. Thread FRT = first outbound message from an engineer minus first inbound from the client.
4. Subsequent reactions are computed by the same rule further down the thread.

Filtering works on headers, not on message bodies: signatures, quoted fragments and mailing-list footers break text parsing but not headers. Auto-replies (usually detected by the X-Autoreply and precedence headers) and internal messages are cut off separately.

## Power BI as ETL and reporting

Power BI comes next. Power Query pulls mail from Exchange (the built-in Exchange connector or Graph API) and normalizes it into two tables: messages and threads. On top of them — DAX measures: FRT median and 90th percentile, the share of threads within SLA, breakdowns by engineer and weekday. The report refreshes on a schedule, and the dashboard is visible to both the team and management — which is discipline in itself.

## PagerDuty: reaction outside business hours

Email cannot wake up the on-call engineer. The bridge between a message and a person is PagerDuty: an inbound email to the critical mailbox creates an event in PagerDuty (via its built-in email integration or a lightweight mailbox monitor), and from there its escalation schedule takes over. The division of responsibility is clean: PagerDuty answers "who heard about it and when", Power BI — "in how many minutes and with what quality". The time from event creation to acknowledgement is the second metric alongside FRT.

## Pitfalls

- Time zones and business hours: counting calendar hours or support-window hours must be decided before rollout, otherwise the metric will be contested.
- Distribution groups: a message to a group creates a thread with several participants; the engineer is whoever actually replied.
- Forwards: if a message was forwarded to an external system, the conversation breaks; such threads are marked separately.
- Outliers: one email on a holiday ruins the median — look at percentiles, not the average.

## Result

The Exchange + Power BI + PagerDuty stack delivers a measurable response SLA without buying an ITSM platform: actual FRT figures, SLA compliance share and escalation points. The main gain, though, is a basis for decisions: where the bottleneck is, which weekday is overloaded, whether a second line is needed. Measurability is the precondition for manageability.

<!-- lang:he -->

## מבוא

לא לכל צוות יש מערכת ITSM בהתחלה. פניות מגיעות לתיבה משותפת, המהנדסים עונים מ-Outlook, ו-SLA לזמן תגובה קיים בעיקר על הנייר: אין במה למדוד אותו. אבל היעדר מערכת טיקטים לא מבטל מדידה — באימייל כבר יש את כל מה שצריך, אם מגדירים מה נחשב לתשובה.

## מה נחשב לתגובה

קודם קובעים: המדד הוא first response time (FRT), המרווח בין האימייל של הלקוח לתשובה הראשונה המהותית של מהנדס. "מהותית" — כי תשובה אוטומטית "קיבלנו את ההודעה" אינה תגובה. את ההגדרה חשוב לתאם עם הלקוח מראש: אם ב-SLA כתוב "תגובה תוך 2 שעות עבודה", שני הצדדים צריכים להבין אותו דבר לגבי מה נספר.

## הנתונים כבר קיימים: שרשורי אימייל

בהודעות ב-Exchange יש את כל מה שצריך לשחזור ציר הזמן: ConversationId מקשר שרשור, From/ToRecipients מראים משתתפים, ולכל הודעה יש timestamp. האלגוריתם פשוט:

1. מקבצים הודעות לפי ConversationId.
2. מסמנים הודעות נכנסות מדומיין הלקוח ויוצאות מהמהנדסים.
3. FRT של השרשור = ההודעה היוצאת הראשונה ממהנדס פחות ההודעה הנכנסת הראשונה מהלקוח.
4. תגובות נוספות מחושבות באותו כלל בהמשך השרשור.

הסינון עובד על כותרות ולא על גוף ההודעה: חתימות, ציטוטים ותוספות דיוור שוברים ניתוח טקסט אבל לא כותרות. תשובות אוטומטיות (בדרך כלל לפי כותרות X-Autoreply ו-precedence) והודעות פנימיות מסוננות בנפרד.

## Power BI כ-ETL וכדוח

אחר כך נכנס Power BI. Power Query שולף דואר מ-Exchange (המחבר המובנה של Exchange או Graph API) ומנרמל אותו לשתי טבלאות: הודעות ושרשורים. מעליהן — מדדי DAX: חציון ואחוזון 90 של FRT, אחוז השרשורים בתוך SLA, פילוח לפי מהנדס ויום בשבוע. הדוח מתעדכן בלוח זמנים, והדשבורד גלוי גם לצוות וגם להנהלה — וזה כשלעצמו יוצר משמעת.

## PagerDuty: תגובה מחוץ לשעות העבודה

אימייל לא יודע להעיר את תורן המשמרת. הגשר בין הודעה לאדם הוא PagerDuty: אימייל נכנס לתיבה הקריטית יוצר אירוע ב-PagerDuty (דרך שילוב האימייל המובנה או מוניטור קל לתיבה), ומשם ממשיך לוח ההסלמות שלו. חלוקת האחריות נקייה: PagerDuty עונה על "מי שמע ומתי", Power BI — "תוך כמה דקות ובאיזו איכות". הזמן מיצירת האירוע ועד האישור (acknowledge) הוא המדד השני לצד FRT.

## מלכודות

- אזורי זמן ושעות עבודה: ספירה בשעון יומי או בחלון התמיכה — מחליטים לפני ההטמעה, אחרת המדד יאותגר.
- קבוצות דיוור: הודעה לקבוצה יוצרת שרשור עם כמה משתתפים; המהנדס הוא מי שבאמת ענה.
- העברות (forwards): אם הודעה הועברה למערכת חיצונית, השרשור נקטע; שרשורים כאלה מסומנים בנפרד.
- חריגים: אימייל אחד בחג הורס את החציון — מסתכלים על אחוזונים ולא על ממוצע.

## תוצאה

מחסנית Exchange + Power BI + PagerDuty נותנת SLA מדיד לזמן תגובה בלי לקנות ITSM: FRT בפועל, אחוז עמידה ב-SLA ונקודות הסלמה. אבל העיקר — בסיס להחלטות: איפה הצווארון, איזה יום בשבוע עמוס, האם צריך קו שני. מדידה היא התנאי לניהול.
