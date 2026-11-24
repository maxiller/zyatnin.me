---
slug: oil-sector-digital-twin
view: leader
order: 2
status: done
icon: "🏭"
translations:
  ru:
    title: "Нефтяной сектор, РФ"
    excerpt: "Поддержка цифрового двойника в закрытом контуре: SLA через юридического посредника и интегратора клиента, расчёт по цепочкам писем в Power BI и защищённые границы вендора."
    tags: ["Цифровой двойник", "Закрытый контур", "SLA", "Вендор-менеджмент", "Power BI"]
    points:
      - "Процесс выстроен до перехода команды внедрения в стадию поддержки клиента"
      - "Два посредника: партнёр — только юридический, операционная работа шла напрямую с интегратором клиента под НДА"
      - "SLA считается по цепочкам писем в Microsoft Power BI — без интеграций, тикет-системы и личного кабинета вендора"
      - "Оповещение об инцидентах, дежурства и операционный регламент с ключевыми артефактами"
      - "Защита от ошибок клиента в расчёте SLA: спорная цепочка не превращается в нарушение вендора и юридический риск"
  en:
    title: "Oil Sector, Russia"
    excerpt: "Supporting a digital twin inside a closed perimeter: SLA across a legal intermediary and the client's integrator, calculated from email threads in Power BI, with protected vendor boundaries."
    tags: ["Digital Twin", "Closed Perimeter", "SLA", "Vendor Management", "Power BI"]
    points:
      - "The process was built before the implementation team moved into the client support stage"
      - "Two intermediaries: the partner was legal only, the operational work ran directly with the client's integrator under an NDA"
      - "SLA calculated from email threads in Microsoft Power BI — no integrations, no ticketing system, no vendor portal"
      - "Incident alerting, on-call shifts and an operational regulation with every key artifact"
      - "Client-error protection in the SLA calculation: a disputed thread never becomes a vendor breach or a legal risk"
  he:
    title: "ענף הנפט, רוסיה"
    excerpt: "תמיכה בתאומה דיגיטלית בסביבה סגורה: SLA דרך מתווך משפטי והאינטגרטור של הלקוח, חישוב משרשורי אימייל ב-Power BI וגבולות אחריות מוגנים לספק."
    tags: ["תאומה דיגיטלית", "סביבה סגורה", "SLA", "ניהול ונדורים", "Power BI"]
    points:
      - "התהליך נבנה לפני מעבר צוות ההטמעה לשלב תמיכת הלקוח"
      - "שני מתווכים: השותף היה משפטי בלבד, והעבודה התפעולית התנהלה ישירות מול האינטגרטור של הלקוח תחת NDA"
      - "SLA מחושב משרשורי אימייל ב-Microsoft Power BI — בלי אינטגרציות, מערכת טיקטים ופורטל ונדור"
      - "התראות על תקלות, משמרות כוננות ותקנון תפעולי עם כל החפצים המרכזיים"
      - "הגנה מפני טעויות של הלקוח בחישוב SLA: שרשור שנוי במחלוקת אינו הופך להפרה של הספק או לסיכון משפטי"
---

<!-- lang:ru -->

Клиент — компания нефтяного сектора в России, решение — цифровой двойник критической производственной инфраструктуры. Внедрение подходит к концу, и команда, которая его вела, — с планом, этапами и приёмкой — переходит в стадию поддержки клиента. Это другой режим работы: проект заканчивается по плану, поддержка начинается с чужого письма и не заканчивается никогда. Задача — выстроить процесс до передачи, пока у команды ещё есть контекст внедрения.

Конструкцию процесса задали ограничения, а не лучшие практики. Контур закрытый: никаких интеграций, тикет-систему подключить нельзя, личный кабинет вендора для этого клиента недоступен, единственный канал — почта. Глобальный вендор менять свои процессы под одного клиента отказался — значит, всё, что нужно, строилось внутри команды и поверх почты, без правок в стандартном процессе вендора.

Вторая особенность — схема доступа к клиенту. Партнёр в ней был только юридическим посредником: сторона договора, формальная приёмка, получатель отчётности. Операционно всё шло зеркально: вендор под НДА работал напрямую с интегратором клиента, а партнёру уходила только отчётность. Из этого сразу следует неприятное: срок, за который вендор отвечает, записан в договоре с партнёром, а фактическое время реакции живёт в переписке с интегратором — измерять нужно второе, отвечать за первое.

Отсюда главное следствие: SLA нельзя взять из системы, его нужно вычислять. Механизм расчёта построен на аналитике по цепочкам писем в Microsoft Power BI: сообщения группируются по ConversationId, входящие от домена клиента отделяются от исходящих, реакция считается от первого письма клиента до первого содержательного ответа инженера, дальше — медиана и 90-й перцентиль, доля цепочек в пределах SLA и разбивка по людям и дням ([как это устроено](/ru/blog/email-only-response-sla/)). Почта как источник данных даёт то, чего не даёт отчётность вслух: фактическое время, а не «мы ответили быстро».

Почта не будит дежурного и не сообщает об инциденте, поэтому рядом с расчётом появились оповещение об инцидентах и дежурства: письмо в критический ящик должно находить конкретного человека, а не очередь, в которую оно упало в пятницу вечером. Из тех же данных вырос еженедельный контроль очереди — нарушение SLA прогнозируется по цепочке до того, как клиент напишет об этом сам ([ни одного тихого нарушения SLA](/ru/blog/support-lead-no-silent-sla/)).

Выравнивание SLA в такой схеме — отдельная работа именно потому, что срок в договоре и срок в переписке не одно и то же. Пришлось письменно зафиксировать, что считается реакцией, какое окно рабочих часов берётся в расчёт и кто на какой вопрос отвечает: интегратор клиента принимает обращение, ведёт коммуникацию и согласует приоритеты; команда разбирает и решает; глобальный вендор отвечает за продукт; партнёр остаётся стороной договора и получает отчётность. Для работы с клиентом разработан операционный регламент с подробным описанием процесса и всех ключевых артефактов: от того, как оформляется обращение, до того, как выглядят эскалация и отчёт ([границы ответственности](/ru/blog/support-lead-boundaries/), [матрица взаимодействий](/ru/blog/support-lead-interaction-matrix/)).

Не рассчитывая на исполнительность клиента, в механизм расчёта заложена защита от его ошибок — тех, что могли обернуться юридическими последствиями для вендора как раз потому, что претензия приходит по договору через партнёра, а не из переписки: письмо не в тот ящик, ответ, обрывающий цепочку, повторная постановка того же вопроса, простой контура по вине клиента, изменения на его стороне без уведомления. Такие цепочки не считаются нарушением SLA вендора: они помечаются в расчёте и разбираются по фактам, а правило классификации записано в регламенте заранее, а не придумывается в момент спора.

Результат — работающий процесс в закрытом контуре, который не потребовал ни интеграций, ни изменений в процессах глобального вендора: SLA измеряется по фактическим данным переписки, нарушения видны до письма клиента, партнёр получает отчётность из тех же цифр, а у вендора есть защищённая позиция в спорах о сроках.

<!-- lang:en -->

The client is a company in the Russian oil sector; the solution is a digital twin of critical production infrastructure. The rollout is coming to an end, and the team that ran it — with a plan, milestones and acceptance — is moving into the client support stage. That is a different mode of work: a project ends on plan, while support starts with somebody else's email and never ends. The task was to build the process before the handover, while the team still holds the implementation context.

The process was shaped by constraints rather than best practices. The perimeter is closed: no integrations, no way to connect a ticketing system, the vendor's customer portal unavailable for this client, and email as the only channel. The global vendor refused to change its processes for a single client — so everything needed was built inside the team and on top of email, without touching the vendor's standard process.

The second feature was the access scheme. The partner in it was purely a legal intermediary: the contracting party, the formal acceptance, the recipient of reporting. Operationally everything ran mirrored: under an NDA the vendor worked directly with the client's integrator, and only reporting went to the partner. One awkward consequence follows immediately: the deadline the vendor is bound to is written in the contract with the partner, while the actual response time lives in the correspondence with the integrator — the second has to be measured, the first is what you answer for.

Hence the main consequence: an SLA cannot be taken from a system, it has to be calculated. The calculation runs on analytics over email threads in Microsoft Power BI: messages are grouped by ConversationId, inbound messages from the client's domain are separated from outbound ones, response time is measured from the client's first email to the engineer's first substantive reply, and on top of that come the median and the 90th percentile, the share of threads within SLA, and breakdowns by engineer and weekday ([how it works](/en/blog/email-only-response-sla/)). Email as a data source gives what spoken reporting never does: actual time, not "we answered quickly".

Email does not wake an on-call engineer and does not announce an incident, so incident alerting and on-call shifts were built next to the calculation: an email to the critical mailbox has to reach a specific person, not a queue it landed in on Friday evening. The same data grew into weekly queue control — an SLA breach is predicted from the thread before the client writes about it ([not one silent SLA breach](/en/blog/support-lead-no-silent-sla/)).

Aligning the SLA in such a scheme is a separate piece of work precisely because a deadline in the contract and a deadline in the correspondence are not the same thing. It had to be fixed in writing what counts as a response, which business-hours window is used and who answers which question: the client's integrator takes the request, runs the communication and agrees priorities; the team does the analysis and the resolution; the global vendor owns the product; the partner stays the contracting party and receives the reporting. For the client we wrote an operational regulation describing the process and every key artifact in detail: from how a request is raised to what escalation and reporting look like ([responsibility boundaries](/en/blog/support-lead-boundaries/), [interaction matrix](/en/blog/support-lead-interaction-matrix/)).

Not relying on the client's diligence, the calculation carries protection against the client's own mistakes — the ones that could turn into legal consequences for the vendor precisely because a claim arrives through the partner, by contract, rather than out of the correspondence: an email sent to the wrong mailbox, a reply that breaks the thread, the same question raised again, perimeter downtime caused by the client, changes on the client side without notice. Such threads are not counted as a vendor SLA breach: they are flagged in the calculation and reviewed on the facts, and the classification rule is written into the regulation in advance rather than invented at the moment of a dispute.

The outcome is a working process inside a closed perimeter that required neither integrations nor changes to the global vendor's processes: the SLA is measured on the actual data of the correspondence, breaches are visible before the client's email arrives, the partner receives reporting from the same figures, and the vendor holds a protected position in disputes about deadlines.

<!-- lang:he -->

הלקוח הוא חברה בענף הנפט ברוסיה, והפתרון — תאומה דיגיטלית של תשתית ייצור קריטית. ההטמעה מתקרבת לסיומה, והצוות שהוביל אותה — עם תוכנית, אבני דרך וקבלה — עובר לשלב תמיכת הלקוח. זהו מצב עבודה אחר: פרויקט נגמר לפי תוכנית, והתמיכה מתחילה מהמייל של מישהו אחר ולעולם לא נגמרת. המשימה — לבנות את התהליך לפני המסירה, כל עוד לצוות יש את הקשר של ההטמעה.

את מבנה התהליך קבעו האילוצים ולא שיטות העבודה הטובות. הסביבה סגורה: אין אינטגרציות, אי אפשר לחבר מערכת טיקטים, הפורטל האישי של הוונדור אינו זמין ללקוח הזה, וערוץ התקשורת היחיד הוא אימייל. הוונדור הגלובלי סירב לשנות את תהליכיו עבור לקוח אחד — ולכן כל מה שהיה צריך נבנה בתוך הצוות ומעל האימייל, בלי שינויים בתהליך הסטנדרטי של הוונדור.

המאפיין השני היה סכמת הגישה ללקוח. השותף בה היה מתווך משפטי בלבד: צד לחוזה, קבלה פורמלית, נמען הדיווח. תפעולית הכול התנהל במקביל: תחת NDA עבד הוונדור ישירות עם האינטגרטור של הלקוח, ורק הדיווח עבר לשותף. ומכך נובע מיד דבר לא נוח: המועד שבו הוונדור מחויב רשום בחוזה עם השותף, וזמן התגובה בפועל חי בהתכתבות עם האינטגרטור — את השני צריך למדוד, ועל הראשון לענות.

מכאן המסקנה המרכזית: אי אפשר לקחת SLA ממערכת — צריך לחשב אותו. מנגנון החישוב נבנה על אנליטיקה של שרשורי אימייל ב-Microsoft Power BI: הודעות מקובצות לפי ConversationId, נכנסות מדומיין הלקוח מופרדות מיוצאות, זמן התגובה נמדד מהמייל הראשון של הלקוח עד התשובה המהותית הראשונה של מהנדס, ומעל זה — חציון ואחוזון 90, אחוז השרשורים בתוך SLA ופילוח לפי אנשים וימים ([איך זה בנוי](/he/blog/email-only-response-sla/)). האימייל כמקור נתונים נותן את מה שדיווח בעל פה לא נותן: זמן בפועל ולא «ענינו מהר».

אימייל לא מעיר את התורן ולא מודיע על תקלה, ולכן לצד החישוב נוספו התראות על תקלות ומשמרות כוננות: מייל לתיבה הקריטית צריך להגיע לאדם מסוים ולא לתור שאליו נפל בשישי בערב. מאותם נתונים צמחה גם בקרת תור שבועית — הפרת SLA נחזית מראש לפי השרשור, לפני שהלקוח כותב עליה בעצמו ([אף הפרה שקטה אחת](/he/blog/support-lead-no-silent-sla/)).

יישור ה-SLA בסכמה כזו הוא עבודה בפני עצמה, בדיוק מפני שמועד בחוזה ומועד בהתכתבות אינם אותו דבר. היינו צריכים לקבוע בכתב מה נחשב לתגובה, איזה חלון שעות עבודה נלקח בחשבון ומי עונה על איזו שאלה: האינטגרטור של הלקוח מקבל את הפנייה, מנהל את התקשורת ומסכם עדיפויות; הצוות מנתח ופותר; הוונדור הגלובלי אחראי למוצר; השותף נשאר צד לחוזה ומקבל את הדיווח. לעבודה מול הלקוח נכתב תקנון תפעולי עם תיאור מפורט של התהליך ושל כל החפצים המרכזיים: מאופן פתיחת הפנייה ועד לצורת האסקלציה והדוח ([גבולות האחריות](/he/blog/support-lead-boundaries/), [מטריצת האינטראקציות](/he/blog/support-lead-interaction-matrix/)).

בלי להניח שהלקוח יעמוד בכללים, במנגנון החישוב הוטמעה הגנה מפני טעויות שלו — כאלה שיכלו להפוך להשלכות משפטיות עבור הוונדור בדיוק מפני שהתביעה מגיעה דרך השותף, לפי החוזה, ולא מתוך ההתכתבות: מייל שנשלח לתיבה הלא נכונה, תשובה שקוטעת את השרשור, פנייה חוזרת של אותה שאלה, השבתה של הסביבה באשמת הלקוח, שינויים בצד הלקוח בלי הודעה. שרשורים כאלה אינם נחשבים להפרת SLA של הוונדור: הם מסומנים בחישוב ומנותחים לפי עובדות, וכלל הסיווג כתוב בתקנון מראש ולא מומצא ברגע המחלוקת.

התוצאה — תהליך עובד בסביבה סגורה, שלא דרש לא אינטגרציות ולא שינויים בתהליכים של הוונדור הגלובלי: SLA נמדד לפי הנתונים בפועל של ההתכתבות, הפרות נראות לפני המייל של הלקוח, השותף מקבל דיווח מאותם מספרים, ולספק יש עמדה מוגנת במחלוקות על מועדים.
