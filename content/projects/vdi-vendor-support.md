---
slug: vdi-vendor-support
view: leader
order: 4
status: in_progress
icon: "🎧"
translations:
  ru:
    title: "Вендор VDI, РФ"
    excerpt: "Поддержка L2–L3 для вендора VDI: структура команды, процессы, метрики и инженерный инструментарий."
    tags: ["VDI", "Техподдержка", "L2–L3", "KCS", "KPI"]
    points:
      - "Действующая команда L2–L3: структура работы, матрица компетенций, расчёт мощности"
      - "Контуры сервиса: триаж, контроль SLA без тихих нарушений, эскалация в L3 с пакетом"
      - "KCS: база знаний растёт в момент решения; Shift Left пилотом на нескольких сценариях"
      - "KPI: взвешенный SLA с коэффициентами сложности, сбор данных через Jira API"
      - "Инструментарий: оповещения Jira → Telegram, мульти-очередной воркер в Podman-подах"
  en:
    title: "VDI Vendor, Russia"
    excerpt: "L2–L3 support for a VDI vendor: team structure, processes, metrics and engineering tooling."
    tags: ["VDI", "Tech Support", "L2–L3", "KCS", "KPI"]
    points:
      - "An existing L2–L3 team: working structure, competency matrix, capacity planning"
      - "Service loops: triage, SLA control without silent breaches, L3 escalation with a package"
      - "KCS: the knowledge base grows at the moment of resolution; a Shift Left pilot on several scenarios"
      - "KPI: weighted SLA with complexity modifiers, data collected through the Jira API"
      - "Tooling: Jira → Telegram alerts, a multi-queue worker in Podman pods"
  he:
    title: "ספק VDI, רוסיה"
    excerpt: "תמיכה L2–L3 לספק VDI: מבנה הצוות, תהליכים, מדדים וערכת כלים הנדסית."
    tags: ["VDI", "תמיכה טכנית", "L2–L3", "KCS", "KPI"]
    points:
      - "צוות L2–L3 קיים: מבנה עבודה, מטריצת כישורים, תכנון כוח אדם"
      - "מעגלי השירות: טריאז', בקרת SLA ללא הפרות שקטות, אסקלציה ל-L3 עם חבילת מידע"
      - "KCS: בסיס הידע גדל ברגע הפתרון; פיילוט Shift Left על כמה תרחישים"
      - "KPI: SLA משוקלל עם מקדמי מורכבות, איסוף נתונים דרך Jira API"
      - "ערכת כלים: התראות Jira → Telegram, worker רב-תורי ב-Podman pods"
---

<!-- lang:ru -->

Клиент — вендор VDI. Продукт поставляется в банки, промышленность и госсектор, поэтому поддержка здесь часть продукта, а не приложение к нему: за инцидент на тысячах рабочих мест клиент спрашивает с вендора. Задача проекта — выстроить службу поддержки L2–L3, которая держит SLA в разнородной инфраструктуре клиента — от проприетарных ОС собственной разработки до сертифицированных сборок — и говорит с клиентом от лица продукта.

Начали не с регламентов, а с диагностики: прошли путём клиента по каждому каналу и замерили фактическую реакцию — откуда на самом деле приходят обращения и сколько человек ждёт на каждом шаге ([карта сервиса и точка А](/ru/blog/support-lead-service-map-baseline/)). Из этой точки А выросли три контура: [триаж при первом касании](/ru/blog/support-lead-triage-first-touch/) — критичность, категория и владелец до начала работы; [еженедельный контроль очереди](/ru/blog/support-lead-no-silent-sla/), при котором нарушение SLA прогнозируется, а не выясняется из письма клиента; [эскалация в L3](/ru/blog/support-lead-l3-escalation/) с пакетом и договором о сроке, но без передачи ответственности за клиента.

Команда не набиралась с нуля — инженеры уже были, и первым делом пришлось навести порядок в их работе: [матрица компетенций](/ru/blog/support-lead-competency-matrix/) показала одноточечные риски и дала норматив «критичный навык минимум у двух инженеров»; [оценка по наблюдаемым фактам](/ru/blog/support-lead-facts-based-assessment/) заменила разговоры «кажется, слабо или сильно» на QA-выборку по чек-листу; [расчёт мощности](/ru/blog/support-lead-capacity-planning/) превратил перегрузку в дефицит часов, с которым можно идти за ресурсом. Оценка — [двухблочная KPI-система](/ru/blog/kpi-system-technical-support/): взвешенный SLA с коэффициентами сложности P1–P4 и ответственность на персональном, групповом и корпоративном уровнях, данные собираются через Jira API.

Знания организованы по [KCS](/ru/blog/support-lead-kcs-workflow/): база растёт в момент решения, а не «когда разгребём очередь». [Shift Left](/ru/blog/support-lead-shift-left-pilot/) прошёл пилотом на нескольких сценариях с измерением до и после, повторяющиеся проблемы уходят в продукт карточками со статусом. [AI-агентов](/ru/blog/ai-agents-in-support/) взяли на триаж и черновики ответов — там, где цену ошибки ограничивает проверка человеком.

Инженерная часть проекта — то, без чего процессы остаются документом: [оповещения по Jira API в Telegram](/ru/dev/blog/jira-api-automation/), [мульти-очередной воркер](/ru/dev/blog/multi-queue-worker-rq-podman/) для Jira, телефонии и Telegram поверх [Podman-подов](/ru/dev/blog/podman-vs-docker/), [измеримый SLA на реакцию](/ru/blog/email-only-response-sla/) там, где на старте был только общий ящик. Итог года измерялся не числом закрытых заявок, а [пятью результатами](/ru/blog/support-lead-five-results/): предсказуемостью сервиса, качеством решений, устойчивостью команды, базой знаний и обратной связью в продукт.

<!-- lang:en -->

The client is a VDI vendor. The product is delivered to banks, industry and the public sector, so support here is part of the product rather than an add-on: for an incident across thousands of workstations the customer holds the vendor accountable. The project goal was to build an L2–L3 support service that keeps its SLA across heterogeneous customer infrastructure — from proprietary in-house operating systems to certified builds — and speaks to the customer on behalf of the product.

We started not with regulations but with diagnostics: walked the customer path through every channel and measured the actual response — where requests really come from and how long people wait at each step ([service map and baseline](/en/blog/support-lead-service-map-baseline/)). From that baseline three loops grew: [triage at first touch](/en/blog/support-lead-triage-first-touch/) — criticality, category and owner before work starts; [weekly queue control](/en/blog/support-lead-no-silent-sla/), where an SLA breach is predicted rather than learned from the customer's email; [L3 escalation](/en/blog/support-lead-l3-escalation/) with a package and an agreed deadline, but without handing over responsibility for the customer.

The team was not built from scratch — the engineers were already there, and the first job was to bring order to their work: the [competency matrix](/en/blog/support-lead-competency-matrix/) exposed single-point risks and set the rule of at least two engineers per critical skill; [assessment on observable facts](/en/blog/support-lead-facts-based-assessment/) replaced “seems weak or strong” with a QA sample against a checklist; [capacity planning](/en/blog/support-lead-capacity-planning/) turned overload into a deficit of hours you can take to management. Performance is measured by a [two-block KPI system](/en/blog/kpi-system-technical-support/): a weighted SLA with P1–P4 complexity modifiers and responsibility at personal, group and corporate levels, with data collected through the Jira API.

Knowledge is organised around [KCS](/en/blog/support-lead-kcs-workflow/): the base grows at the moment of resolution, not “when the queue clears”. [Shift Left](/en/blog/support-lead-shift-left-pilot/) ran as a pilot on several scenarios with before-and-after measurement, and recurring problems go to the product as cards with a status. [AI agents](/en/blog/ai-agents-in-support/) were adopted for triage and reply drafts — where a human check limits the cost of an error.

The engineering part of the project is what keeps the processes from staying on paper: [Jira API alerts to Telegram](/en/dev/blog/jira-api-automation/), a [multi-queue worker](/en/dev/blog/multi-queue-worker-rq-podman/) for Jira, telephony and Telegram on top of [Podman pods](/en/dev/blog/podman-vs-docker/), and a [measurable response SLA](/en/blog/email-only-response-sla/) where at the start there was only a shared mailbox. The year was measured not by closed tickets but by [five outcomes](/en/blog/support-lead-five-results/): service predictability, quality of resolutions, team resilience, the knowledge base and feedback into the product.

<!-- lang:he -->

הלקוח הוא ספק VDI. המוצר נמכר לבנקים, לתעשייה ולמגזר הציבורי, ולכן התמיכה כאן היא חלק מהמוצר ולא תוספת: על תקלה באלפי עמדות עבודה הלקוח פונה לספק. מטרת הפרויקט הייתה לבנות שירות תמיכה L2–L3 שעומד ב-SLA בסביבות לקוח הטרוגניות — ממערכות הפעלה קנייניות שפותחו בבית ועד מהדורות מוסמכות — ומדבר עם הלקוח בשם המוצר.

לא התחלנו מתקנונים אלא מאבחון: עברנו את המסלול של הלקוח בכל ערוץ ומדדנו את זמן התגובה בפועל — מאיפה באמת מגיעות הפניות וכמה אדם ממתין בכל שלב ([מפת השירות ונקודת הפתיחה](/he/blog/support-lead-service-map-baseline/)). מנקודת הפתיחה הזו צמחו שלושה מעגלים: [טריאז' במגע הראשון](/he/blog/support-lead-triage-first-touch/) — דחיפות, קטגוריה ובעלים לפני תחילת העבודה; [בקרת תור שבועית](/he/blog/support-lead-no-silent-sla/), שבה הפרת SLA נחזית מראש ולא נלמדת מהמייל של הלקוח; [אסקלציה ל-L3](/he/blog/support-lead-l3-escalation/) עם חבילת מידע והסכמה על מועד, אך בלי להעביר את האחריות על הלקוח.

הצוות לא נבנה מאפס — המהנדסים כבר היו, והמשימה הראשונה הייתה לעשות סדר בעבודה שלהם: [מטריצת הכישורים](/he/blog/support-lead-competency-matrix/) חשפה סיכונים של נקודה יחידה וקבעה את הכלל «כישור קריטי אצל שני מהנדסים לפחות»; [הערכה לפי עובדות נצפות](/he/blog/support-lead-facts-based-assessment/) החליפה את «נראה לי חלש או חזק» במדגם QA לפי צ'קליסט; [תכנון כוח אדם](/he/blog/support-lead-capacity-planning/) הפך עומס יתר למחסור בשעות שאפשר להביא להנהלה. המדידה — [מערכת KPI דו-בלוקית](/he/blog/kpi-system-technical-support/): SLA משוקלל עם מקדמי מורכבות P1–P4 ואחריות ברמה האישית, הקבוצתית והארגונית, כשהנתונים נאספים דרך Jira API.

הידע מאורגן לפי [KCS](/he/blog/support-lead-kcs-workflow/): בסיס הידע גדל ברגע הפתרון ולא «כשהתור יתפנה». [Shift Left](/he/blog/support-lead-shift-left-pilot/) הופעל כפיילוט על כמה תרחישים עם מדידה לפני ואחרי, ובעיות חוזרות עוברות למוצר ככרטיסים עם סטטוס. [סוכני AI](/he/blog/ai-agents-in-support/) נלקחו לטריאז' ולטיוטות תשובות — במקום שבו בדיקה אנושית מגבילה את מחיר הטעות.

החלק ההנדסי של הפרויקט — מה שמונע מהתהליכים להישאר על הנייר: [התראות Jira API לטלגרם](/he/dev/blog/jira-api-automation/), [worker רב-תורי](/he/dev/blog/multi-queue-worker-rq-podman/) ל-Jira, לטלפוניה ולטלגרם מעל [Podman pods](/he/dev/blog/podman-vs-docker/), ו[SLA מדיד על זמן תגובה](/he/blog/email-only-response-sla/) במקום שבו בהתחלה היה רק תיבת דואר משותפת. תוצאת השנה נמדדה לא במספר הפניות שנסגרו אלא ב[חמישה תוצאות](/he/blog/support-lead-five-results/): יכולת חיזוי של השירות, איכות הפתרונות, יציבות הצוות, בסיס הידע ומשוב למוצר.
