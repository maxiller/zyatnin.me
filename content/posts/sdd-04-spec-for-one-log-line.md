---
slug: sdd-04-spec-for-one-log-line
view: dev
date: 2026-06-24
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "/speckit.specify: спека на «всего лишь добавить строчку в лог»"
    excerpt: "Задача звучала как одна строчка. Спека выросла до 18 требований и трёх user story — и это не бюрократия, а карта граблей."
  en:
    title: "/speckit.specify: a spec for «just one line in the log»"
    excerpt: "The task sounded like a single line. The spec grew to 18 requirements and three user stories — and that is a map of the rake, not bureaucracy."
  he:
    title: "/speckit.specify: מפרט ל«עוד שורה אחת בלוג»"
    excerpt: "המשימה נשמעה כמו שורה אחת. המפרט גדל ל-18 דרישות ולשלוש user stories — וזהו מפת מלכודות, לא ביורוקרטיה."
---

<!-- lang:ru -->

## Задача на одну строчку

Формулировка, с которой всё началось, звучала так: «в TRACE-режиме лог должен включать содержимое payload функций next».

Функции в проекте называются `next_*` (по-хорошему — следующие шаги): они смотрят на текущее задание и решают, что запускать дальше. Хочется видеть в логе, какой payload они выбрали. Казалось бы: взять `logger.trace(...)` и вставить в диспетчер — полчаса работы.

`/speckit.specify` на эту формулировку выдал документ на несколько страниц. Спорить с ним я не стал и вот почему.

## Что реально описала спека

`specs/002-next-payload-trace/spec.md` — это:

- **3 user story** с приоритетами P1–P3;
- **18 функциональных требований** (FR-001…FR-018);
- список edge cases;
- критерии успеха (success criteria).

На первый взгляд это выглядит как раздувание. Но почти каждое требование закрывает конкретный случай, который в «однострочной» реализации был бы сломан молча.

## Требования, которые всплыли на этом этапе

Вот несколько выдержек из спеки — и почему каждая из них неочевидна:

> **FR-005.** Событие пишется для каждого следующего задания, даже если дедупликация подавляет повторную постановку в очередь.

Дедупликация удаляет дубли заданий до запуска. Если писать событие только для реально поставленных задач, из лога пропадёт информация: функция-то выбрала эти задания, и именно это мы хотим видеть. Лог — про решения функции, а не про то, что выжило после фильтра.

> **FR-008.** При уровне логирования INFO или DEBUG событие не пишется и не замедляет горячий путь.

TRACE — самый дорогой уровень: payload сериализуется целиком. В проекте есть инсталляции, где TRACE включён постоянно, и есть те, где он включается на десять минут для расследования. Вторым нельзя платить за первое.

> **FR-011.** Payload пишется целиком, без усечения и маскировки.

Соблазн обрезать длинные строки есть всегда — «чтобы лог не разбухал». Но усечённый payload в расследовании бесполезен: по нему не отличить «JQL короткий» от «мы его сами обрезали». Это, кстати, тот самый пункт, который потом задаст вопрос о безопасности — в посте про расследование в проде.

> **FR-014.** Событие пишется во всех ветвях выполнения функции: успех, пустой результат, ошибка.

Именно это требование позже окажется самым спорным и приведёт к смене архитектуры (пост 11), а на этапе спеки оно выглядело абсолютно естественным.

## Почему требований так много

Соблазн был написать три штуки: пишем событие, пишем в TRACE, пишем payload. Получилось восемнадцать по простой причине: каждое требование должно быть проверяемым.

Разница между двумя формулировками:

- «Лог должен быть информативным» — не проверяется никаким тестом.
- «Каждая запись события содержит `next_function`, `next_job_id` и `payload`» — проверяется одним assert'ом.

Первое остаётся в голове автора и исчезает при первой же переделке. Второе превращается в тест, а тест — в защиту от регрессии. Именно поэтому в следующей части спека станет не документом, а планом работ.

## Кто читает спеку

Спека пишется не только для агента. У неё три читателя, и у каждого свой сценарий:

- **Агент** читает её на старте работы и возвращается к ней, когда нужно решение по спорному случаю.
- **Я через полгода** читаю её, чтобы понять, почему код устроен именно так.
- **Чек-лист требований** читается при каждом ревью: по нему видно, закрыто ли требование тестом.

Когда документ нужен сразу трём разным читателям, ссылки на конкретные разделы и проверяемые формулировки перестают быть бюрократией. Они — единственный способ, чтобы один и тот же текст работал для всех трёх.

## Сколько это заняло

Несколько часов чтения кода и разговора с самим собой в формате «а что будет, если…». Дорого ли? Сравните с ценой расследования из поста 10: искать причину, по которой события нет в проде, дороже, чем заранее решить, когда оно должно быть.

Спека на одну строчку готова. Следующий вопрос — а стоит ли так расписывать остальные девять модулей проекта. Спойлер: я решил, что стоит.

---

[← Пост 3: конституция](/ru/dev/blog/sdd-03-constitution-five-principles/) · [Пост 5: девять модульных спек →](/ru/dev/blog/sdd-05-nine-module-specs/)

<!-- lang:en -->

## A one-line task

The wording it all started with: "in TRACE mode the log must include the payload of the next functions".

Functions in the project are called `next_*`: they look at the current job and decide what to run next. I want to see in the log which payload they picked. Surely: take `logger.trace(...)`, drop it into the dispatcher, half an hour of work.

`/speckit.specify` produced several pages for that wording. I did not argue with it, and here is why.

## What the spec actually describes

`specs/002-next-payload-trace/spec.md` is:

- **3 user stories** with priorities P1–P3;
- **18 functional requirements** (FR-001…FR-018);
- a list of edge cases;
- success criteria.

At first glance it looks inflated. But almost every requirement closes a concrete case that a "one-line" implementation would break silently.

## Requirements that surfaced at that stage

Here are a few excerpts from the spec, and why each is non-obvious:

> **FR-005.** The event is written for every next job, even when deduplication suppresses the repeated enqueue.

Deduplication drops duplicates before they run. If the event were written only for jobs actually enqueued, the log would lose information: the function did pick those jobs, and that is exactly what we want to see. The log is about the function's decisions, not about what survived the filter.

> **FR-008.** At INFO or DEBUG level the event is not written and does not slow down the hot path.

TRACE is the most expensive level: the payload is serialised in full. Some installations keep TRACE on permanently, others switch it on for ten minutes during an investigation. The latter must not pay for the former.

> **FR-011.** The payload is written in full, without truncation or masking.

There is always a temptation to cut long strings "so the log does not bloat". But a truncated payload is useless during an investigation: you cannot tell "the JQL was short" from "we cut it ourselves". That is also the item that later raises the security question — in the post about production investigation.

> **FR-014.** The event is written in all branches of function execution: success, empty result, error.

This requirement later becomes the most contested one and leads to an architecture change (post 11), while at the spec stage it looked perfectly natural.

## Why there are so many requirements

The temptation was to write three: write the event, write in TRACE, write the payload. It ended up as eighteen for a simple reason: every requirement has to be verifiable.

The difference between two wordings:

- "The log must be informative" — no test can check it.
- "Every event record contains `next_function`, `next_job_id` and `payload`" — one assert checks it.

The first stays in the author's head and disappears at the first rework. The second becomes a test, and a test becomes protection against regressions. That is exactly why in the next part the spec stops being a document and becomes a work plan.

## Who reads a spec

A spec is not written only for the agent. It has three readers, each with a scenario:

- **The agent** reads it at the start of work and comes back to it when a disputed case needs a decision.
- **Me in six months** reads it to understand why the code is built this way.
- **The requirements checklist** is read at every review: it shows whether a requirement is covered by a test.

When a document is needed by three different readers at once, links to specific sections and verifiable wording stop being bureaucracy. They are the only way for the same text to work for all three.

## How long it took

A few hours of reading code and talking to myself in the "what if…" format. Expensive? Compare it with the cost of the investigation in post 10: finding out why an event is missing in production is more expensive than deciding in advance when it should be there.

The spec for one line is ready. The next question: is it worth describing the other nine project modules this way. Spoiler: I decided it was.

---

[← Post 3: the constitution](/en/dev/blog/sdd-03-constitution-five-principles/) · [Post 5: nine module specs →](/en/dev/blog/sdd-05-nine-module-specs/)

<!-- lang:he -->

## משימה של שורה אחת

הניסוח שממנו הכל התחיל: "במצב TRACE הלוג צריך לכלול את תוכן ה-payload של פונקציות ה-next".

הפונקציות בפרויקט נקראות `next_*`: הן מסתכלות על המשימה הנוכחית ומחליטות מה להריץ הלאה. אני רוצה לראות בלוג איזה payload הן בחרו. לכאורה: לקחת `logger.trace(...)`, לדחוף ל-dispatcher, חצי שעה עבודה.

`/speckit.specify` הפיק על הניסוח הזה כמה עמודים. לא התווכחתי, והנה למה.

## מה המפרט באמת מתאר

`specs/002-next-payload-trace/spec.md` הוא:

- **3 user stories** עם עדיפויות P1–P3;
- **18 דרישות פונקציונליות** (FR-001…FR-018);
- רשימת edge cases;
- קריטריוני הצלחה.

במבט ראשון זה נראה מנופח. אבל כמעט כל דרישה סוגרת מקרה קונקרטי שמימוש "בשורה אחת" היה שובר בשקט.

## דרישות שעלו בשלב הזה

הנה כמה קטעים מהמפרט, ולמה כל אחד מהם לא מובן מאליו:

> **FR-005.** האירוע נכתב עבור כל משימה הבאה, גם כשה-deduplication מדכא הצבה חוזרת לתור.

Deduplication מסיר כפילויות לפני שהן רצות. אם האירוע היה נכתב רק למשימות שבאמת הוכנסו לתור, הלוג היה מאבד מידע: הפונקציה כן בחרה את המשימות האלה, וזה בדיוק מה שאנחנו רוצים לראות. הלוג הוא על החלטות של הפונקציה, לא על מה שרד את הסינון.

> **FR-008.** ברמת INFO או DEBUG האירוע לא נכתב ולא מאט את ה-hot path.

TRACE היא הרמה היקרה ביותר: ה-payload מסודר במלואו. יש התקנות שבהן TRACE דלוק קבוע, ויש כאלה שמדליקות אותו לעשר דקות בחקירה. השנייה לא צריכה לשלם עבור הראשונה.

> **FR-011.** ה-payload נכתב במלואו, בלי קיצור ובלי מיסוך.

תמיד יש פיתוי לקצץ מחרוזות ארוכות "כדי שהלוג לא יתנפח". אבל payload מקוצץ חסר תועלת בחקירה: אי אפשר להבדיל בין "ה-JQL היה קצר" ל"אנחנו קיצצנו אותו בעצמנו". זה גם הפריט שמעלה אחר כך את שאלת האבטחה — בפוסט על החקירה בפרודקשן.

> **FR-014.** האירוע נכתב בכל ענפי ההרצה של הפונקציה: הצלחה, תוצאה ריקה, שגיאה.

הדרישה הזאת תהיה אחר כך השנויה במחלוקת ביותר ותוביל לשינוי ארכיטקטורה (פוסט 11), ובשלב המפרט היא נראתה טבעית לגמרי.

## למה כל כך הרבה דרישות

הפיתוי היה לכתוב שלוש: לכתוב אירוע, לכתוב ב-TRACE, לכתוב payload. יצאו שמונה-עשרה מסיבה פשוטה: כל דרישה צריכה להיות ניתנת לאימות.

ההבדל בין שני ניסוחים:

- "הלוג צריך להיות אינפורמטיבי" — שום טסט לא בודק את זה.
- "כל רשומת אירוע מכילה `next_function`, `next_job_id` ו-`payload`" — assert אחד בודק את זה.

הראשון נשאר בראש של הכותב ונעלם בשינוי הראשון. השני הופך לטסט, וטסט הופך להגנה מפני רגרסיות. בדיוק בגלל זה בחלק הבא המפרט מפסיק להיות מסמך והופך לתוכנית עבודה.

## מי קורא מפרט

מפרט לא נכתב רק בשביל הסוכן. יש לו שלושה קוראים, ולכל אחד תרחיש משלו:

- **הסוכן** קורא אותו בתחילת העבודה וחוזר אליו כשצריך החלטה במקרה שנוי במחלוקת.
- **אני בעוד חצי שנה** קורא אותו כדי להבין למה הקוד בנוי דווקא כך.
- **צ'ק-ליסט הדרישות** נקרא בכל review: ממנו רואים אם דרישה מכוסה בטסט.

כשמסמך נדרש בבת אחת לשלושה קוראים שונים, קישורים לסעיפים מדויקים וניסוחים שניתנים לאימות מפסיקים להיות ביורוקרטיה. הם הדרך היחידה שאותו טקסט יעבוד עבור שלושתם.

## כמה זה לקח

כמה שעות של קריאת קוד ושיחה עם עצמי בפורמט "ומה אם…". יקר? השוו לעלות החקירה בפוסט 10: למצוא למה אין אירוע בפרודקשן יקר יותר מלהחליט מראש מתי הוא אמור להיות.

המפרט לשורה אחת מוכן. השאלה הבאה: האם כדאי לתאר ככה גם את תשעת המודולים האחרים. ספוילר: החלטתי שכן.

---

[← פוסט 3: החוקה](/he/dev/blog/sdd-03-constitution-five-principles/) · [פוסט 5: תשעה מפרטי מודול →](/he/dev/blog/sdd-05-nine-module-specs/)
