---
slug: bank-vdi
view: leader
order: 3
status: in_progress
icon: "🖥️"
translations:
  ru:
    title: "Крупный банк: L2 вместо партнёра"
    excerpt: "Замена партнёрской команды L2 на собственную: партнёр пробрасывал обращения без анализа, вендор забрал разбор, перестроил процессы и вернул доверие банка."
    tags: ["VDI", "150 000 пользователей", "L2", "Передача сервиса", "Клиентский успех"]
    points:
      - "Собственная L2 вместо партнёрской: матрица компетенций, расчёт мощности, набор и перевод инженеров"
      - "Передача знаний как условие выхода партнёра: регламенты, теневые смены, обратная проверка на реальных сценариях"
      - "Тот же состав для клиента при меньшем суммарном числе людей — слой, который только пересылал обращения, исчез"
      - "Переключение сценарий за сценарием с критериями готовности, без «большого взрыва»"
      - "Возврат доверия: один владелец у каждого вопроса, прогноз вместо обещаний, карточки проблем в продукт"
  en:
    title: "Major Bank: L2 without the partner"
    excerpt: "Replacing a partner L2 team with the vendor's own: the partner forwarded tickets without analysis, the vendor took over triage, rebuilt processes and won the bank's trust back."
    tags: ["VDI", "150,000 users", "L2", "Service transfer", "Customer success"]
    points:
      - "Our own L2 instead of the partner's: competency matrix, capacity planning, hiring and internal transfers"
      - "Knowledge handover as a condition of the partner's exit: runbooks, shadow shifts, a reverse check on real scenarios"
      - "The same headcount for the client with fewer people overall — the layer that only forwarded tickets is gone"
      - "Cutover scenario by scenario with readiness criteria, no big bang"
      - "Trust restored: one owner per question, a forecast instead of promises, problem cards into the product"
  he:
    title: "בנק גדול: L2 בלי השותף"
    excerpt: "החלפת צוות L2 של שותף בצוות של הספק: השותף העביר פניות בלי ניתוח, הספק לקח את הטיפול, בנה מחדש תהליכים והחזיר את אמון הבנק."
    tags: ["VDI", "150,000 משתמשים", "L2", "העברת שירות", "הצלחת לקוח"]
    points:
      - "L2 משלנו במקום של השותף: מטריצת כישורים, תכנון כוח אדם, גיוס והעברות פנימיות"
      - "העברת ידע כתנאי ליציאת השותף: נהלים, משמרות צל ובדיקה הפוכה על תרחישים אמיתיים"
      - "אותו מספר עובדים מבחינת הלקוח עם פחות אנשים בסך הכול — השכבה שרק העבירה פניות נעלמה"
      - "מעבר תרחיש אחר תרחיש עם קריטריונים למוכנות, בלי מהפך חד-פעמי"
      - "החזרת האמון: בעלים אחד לכל שאלה, תחזית במקום הבטחות, כרטיסי בעיות למוצר"
---

<!-- lang:ru -->

Клиент — крупный банк, VDI на 150 000 рабочих мест. Поддержку второго уровня вёл партнёр, и к концу договора стало видно, что слоя между клиентом и вендором фактически нет: партнёр не занимался анализом обращений, а молча пробрасывал их в вендора. Формально сроки держались; фактически разбор, диагностику и эскалацию делали инженеры вендора — без очереди, без SLA и без владельца, с которого можно спросить. Клиент платил за поддержку и не получал разбора, вендор отвечал за продукт и не имел данных о том, что у клиента происходит. Задача формулировалась не как «принять услугу», а как три вещи сразу: собрать собственную команду L2 от вендора, перестроить процессы под продукт и вернуть доверие клиента.

Начали не с оргструктуры, а с диагностики: прошли путём клиента по каждому каналу и замерили фактическую реакцию — откуда на самом деле приходят обращения и сколько человек ждёт на каждом шаге ([карта сервиса и точка А](/ru/blog/support-lead-service-map-baseline/)). Точка А оказалась хуже отчётности: часть обращений шла мимо очереди, нарушения SLA выяснялись из письма клиента, а не из собственных данных, а знание о конфигурации конкретного банка жило в головах людей, которых в любой момент могли перевести на другой проект.

Команду не набирали на пустом месте и не перекупали у партнёра целиком: [матрица компетенций](/ru/blog/support-lead-competency-matrix/) показала, какие навыки критичны именно для VDI, а [расчёт мощности](/ru/blog/support-lead-capacity-planning/) превратил «нам мало людей» в дефицит часов, с которым можно идти за ресурсом. Набор и перевод шли под этот дефицит, а не под желание закрыть вакансии. Знания забирали у партнёра как условие выхода из договора: регламенты и runbook'и, теневые смены на реальных инцидентах и обратная проверка — инженер вендора самостоятельно закрывает сценарий, партнёр только наблюдает. [KCS](/ru/blog/support-lead-kcs-workflow/) сделали не «хорошей практикой», а способом удержать знание: карточка пишется в момент решения, а не когда освободится очередь.

Переключались сценарий за сценарием, с параллельной работой и явными критериями готовности: очередь, категория обращений, дежурство, доступы, эскалация. Ответственность переходила не по дате в договоре, а по факту проверенного сценария. Пока собственной L2 не было, эскалация шла внутри вендора, и L3 фактически тянул задачи второго уровня — разбор обращений, воспроизведение, сбор контекста. Нагрузка на L3 выросла, сроки ответа клиенту поплыли, и это оказалось лучшим аргументом, что L2 — не «глупая» работа, которую можно довалить сильным инженерам. Именно на втором уровне держится качество коммуникации: клиент получает ответ в своём контексте и на своём языке, а L3 — пакет, а не сырое обращение. [Эскалация в L3](/ru/blog/support-lead-l3-escalation/) заработала только когда у неё появилась эта граница — с пакетом и договором о сроке, но без передачи ответственности за клиента продукту. Для клиента число инженеров не изменилось; суммарно людей стало меньше, потому что исчез слой, который только пересылал обращения.

Дальше процессы строились под продукт: [триаж при первом касании](/ru/blog/support-lead-triage-first-touch/) — критичность, категория и владелец до начала работы; [еженедельный контроль очереди](/ru/blog/support-lead-no-silent-sla/), где нарушение SLA прогнозируется; повторяющиеся дефекты уходят в продукт [карточками со статусом](/ru/blog/support-lead-problem-card/), разборы идут [без поиска виноватых](/ru/blog/support-lead-blameless-postmortem/). Для клиента это выразилось в простом изменении: у каждого вопроса появился один владелец ([матрица взаимодействий](/ru/blog/support-lead-interaction-matrix/)) и [статус на одну страницу](/ru/blog/support-lead-management-status/) вместо обещаний «разберёмся».

Итог измерялся не числом закрытых заявок: партнёр выведен по плану без просадки сервиса, L2 работает собственной командой вендора, SLA вернулся в целевые значения и удерживается, а разговор с банком сместился с претензий на развитие — уровень доверия к вендору вырос.

<!-- lang:en -->

The client is a major bank running VDI for 150,000 workstations. Level 2 support was handled by a partner, and by the end of the contract it was clear that the layer between the client and the vendor did not really exist: the partner did no analysis, silently forwarding tickets to the vendor. Formally, deadlines were met; in practice, triage, diagnostics and escalation were done by vendor engineers — with no queue, no SLA and no owner to be held accountable. The client paid for support and got no analysis; the vendor owned the product and had no data on what was happening at the client. The task was not framed as "take over a service" but as three things at once: build our own L2 team at the vendor, rebuild the processes around the product, and win the client's trust back.

We started not with an org chart but with diagnostics: we walked the customer path through every channel and measured the actual response — where requests really come from and how long people wait at each step ([service map and baseline](/en/blog/support-lead-service-map-baseline/)). The baseline was worse than the reporting: some requests bypassed the queue, SLA breaches were learned from the client's email rather than from our own data, and knowledge of this particular bank's configuration lived in the heads of people who could be moved to another project at any moment.

The team was neither built from scratch nor bought wholesale from the partner: the [competency matrix](/en/blog/support-lead-competency-matrix/) showed which skills mattered for VDI specifically, and [capacity planning](/en/blog/support-lead-capacity-planning/) turned "we are short of people" into a deficit of hours you can take to management. Hiring and transfers followed that deficit rather than the urge to close vacancies. Knowledge was taken from the partner as a condition of its exit: runbooks and procedures, shadow shifts on real incidents, and a reverse check — a vendor engineer closes the scenario alone while the partner only watches. [KCS](/en/blog/support-lead-kcs-workflow/) became a way to retain knowledge rather than a "good practice": the article is written at the moment of resolution, not when the queue clears.

We cut over scenario by scenario, with parallel work and explicit readiness criteria: queue, request categories, on-call, access, escalation. Responsibility moved not by a date in the contract but by a verified scenario. While we had no L2 of our own, escalation ran inside the vendor and L3 effectively carried level-two work — triage, reproduction, context gathering. The load on L3 grew and response times to the client started to drift, which turned out to be the best argument that L2 is not "dumb" work to be piled onto strong engineers. It is at level two that communication quality lives: the client gets an answer in their own context and language, and L3 gets a package rather than a raw ticket. [L3 escalation](/en/blog/support-lead-l3-escalation/) only started working once that boundary existed — with a package and an agreed deadline, but without handing responsibility for the client over to the product. For the client the number of engineers did not change; overall there are fewer people, because the layer that only forwarded tickets is gone.

From there the processes were built around the product: [triage at first touch](/en/blog/support-lead-triage-first-touch/) — criticality, category and owner before work starts; [weekly queue control](/en/blog/support-lead-no-silent-sla/), where an SLA breach is predicted; recurring defects go to the product as [cards with a status](/en/blog/support-lead-problem-card/), and reviews run [blameless](/en/blog/support-lead-blameless-postmortem/). For the client it came down to a simple change: every question got one owner ([interaction matrix](/en/blog/support-lead-interaction-matrix/)) and a [one-page status](/en/blog/support-lead-management-status/) instead of "we'll look into it".

The outcome was measured not by closed tickets: the partner was exited on plan without a service dip, L2 runs as the vendor's own team, SLA is back within target and holding, and the conversation with the bank moved from complaints to development — the vendor's standing with the client went up.

<!-- lang:he -->

הלקוח הוא בנק גדול עם VDI ל-150,000 עמדות עבודה. את תמיכת הרמה השנייה הפעיל שותף, ועד סוף החוזה התברר שהשכבה בין הלקוח לספק למעשה אינה קיימת: השותף לא עסק בניתוח הפניות אלא העביר אותן בשקט לספק. פורמלית עמדו בלוחות הזמנים; בפועל את הטריאז', האבחון והאסקלציה ביצעו מהנדסי הספק — בלי תור, בלי SLA ובלי בעלים שאפשר לדרוש ממנו. הלקוח שילם על תמיכה ולא קיבל ניתוח, והספק היה אחראי למוצר בלי נתונים על מה שקורה אצל הלקוח. המשימה לא נוסחה כ«לקבל שירות» אלא כשלושה דברים בבת אחת: להקים צוות L2 משלנו בספק, לבנות מחדש את התהליכים סביב המוצר ולהחזיר ללקוח את האמון.

לא התחלנו ממבנה ארגוני אלא מאבחון: עברנו את המסלול של הלקוח בכל ערוץ ומדדנו את זמן התגובה בפועל — מאיפה באמת מגיעות הפניות וכמה אדם ממתין בכל שלב ([מפת השירות ונקודת הפתיחה](/he/blog/support-lead-service-map-baseline/)). נקודת הפתיחה הייתה גרועה מהדיווח: חלק מהפניות עברו מחוץ לתור, הפרות SLA נלמדו מהמייל של הלקוח ולא מהנתונים שלנו, והידע על התצורה של הבנק הזה חי בראשים של אנשים שאפשר להעביר לפרויקט אחר בכל רגע.

את הצוות לא בנינו מאפס ולא קנינו מהשותף כולו: [מטריצת הכישורים](/he/blog/support-lead-competency-matrix/) הראתה אילו כישורים קריטיים דווקא ל-VDI, ו[תכנון כוח האדם](/he/blog/support-lead-capacity-planning/) הפך את «אין לנו אנשים» למחסור בשעות שאפשר להביא להנהלה. גיוס והעברות פנימיות הלכו לפי המחסור הזה ולא לפי הרצון לסגור משרות. את הידע לקחנו מהשותף כתנאי ליציאה מהחוזה: נהלים ו-runbooks, משמרות צל על תקלות אמיתיות ובדיקה הפוכה — מהנדס של הספק סוגר את התרחיש לבדו והשותף רק צופה. [KCS](/he/blog/support-lead-kcs-workflow/) הפך מדרך «נכונה» לאמצעי לשמור ידע: המאמר נכתב ברגע הפתרון ולא כשהתור יתפנה.

המעבר בוצע תרחיש אחר תרחיש, עם עבודה במקביל וקריטריונים ברורים למוכנות: תור, קטגוריות פניות, כוננות, הרשאות, אסקלציה. האחריות עברה לא לפי תאריך בחוזה אלא לפי תרחיש שנבדק. כל עוד לא היה לנו L2 משלנו, האסקלציה רצה בתוך הספק ו-L3 למעשה נשא את עבודת הרמה השנייה — טריאז', שחזור, איסוף הקשר. העומס על L3 גדל וזמני התגובה ללקוח החלו לזוז, וזה התברר כטיעון הטוב ביותר ש-L2 אינו «עבודה מטומטמת» שאפשר לשפוך על מהנדסים חזקים. דווקא ברמה השנייה יושבת איכות התקשורת: הלקוח מקבל תשובה בהקשר ובשפה שלו, ו-L3 מקבל חבילת מידע ולא פנייה גולמית. [אסקלציה ל-L3](/he/blog/support-lead-l3-escalation/) עבדה רק כשהגבול הזה נוצר — עם חבילה והסכמה על מועד, אך בלי להעביר למוצר את האחריות על הלקוח. מבחינת הלקוח מספר המהנדסים לא השתנה; בסך הכול מספר האנשים קטן, כי השכבה שרק העבירה פניות נעלמה.

מכאן והלאה התהליכים נבנו סביב המוצר: [טריאז' במגע הראשון](/he/blog/support-lead-triage-first-touch/) — דחיפות, קטגוריה ובעלים לפני תחילת העבודה; [בקרת תור שבועית](/he/blog/support-lead-no-silent-sla/), שבה הפרת SLA נחזית מראש; פגמים חוזרים עוברים למוצר [ככרטיסים עם סטטוס](/he/blog/support-lead-problem-card/), והתחקירים נערכים [בלי חיפוש אשמים](/he/blog/support-lead-blameless-postmortem/). מבחינת הלקוח זה התבטא בשינוי פשוט: לכל שאלה יש בעלים אחד ([מטריצת האינטראקציות](/he/blog/support-lead-interaction-matrix/)) ו[סטטוס בעמוד אחד](/he/blog/support-lead-management-status/) במקום הבטחות «נבדוק».

התוצאה נמדדה לא במספר הפניות שנסגרו: השותף יצא לפי התוכנית בלי ירידה בשירות, L2 פועל כצוות של הספק עצמו, ה-SLA חזר ליעד ונשמר, והשיחה עם הבנק עברה מתלונות לפיתוח — רמת האמון בספק עלתה.
