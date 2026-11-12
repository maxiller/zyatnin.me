---
slug: sdd-05-nine-module-specs
view: dev
date: 2026-07-11
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "Спека как единица работы: раскладываем систему на 9 модульных спек"
    excerpt: "Одна сессия — девять спек и 241 новое требование. Зачем описывать весь проект модуль за модулем и что это даёт на практике."
  en:
    title: "A spec as a unit of work: splitting the system into 9 module specs"
    excerpt: "One session — nine specs and 241 new requirements. Why describe the whole project module by module, and what that buys in practice."
  he:
    title: "מפרט כיחידת עבודה: מפרקים את המערכת ל-9 מפרטי מודול"
    excerpt: "סשן אחד — תשעה מפרטים ו-241 דרישות חדשות. למה לתאר את כל הפרויקט מודול אחרי מודול ומה זה נותן בפועל."
---

<!-- lang:ru -->

## Триггер: SRS есть, а толку нет

В проекте давно лежал корпус `docs/SRS/` — документы `SRS-00`…`SRS-09`, по одному на модуль. Хороший корпус, но у него есть свойство: он описывает систему так, как она **задумывалась**, и никто не обновлял его синхронно с кодом. Через год статьи в нём расходятся с реальностью в мелочах, а в мелочах и живут дефекты.

После удачного опыта со спекой на одну строчку появилась гипотеза: если каждая спека модуля ссылается на свой SRS-раздел и на контракты, то SRS перестаёт быть мёртвым документом — он становится источником требований, а спека — его проверяемым уточнением для конкретного модуля.

## Что получилось за одну сессию

Девять новых каталогов в `specs/`:

| Модуль | SRS | FR | Артефакты |
| --- | --- | --- | --- |
| `003-pod-infrastructure` | SRS-01 | 26 | spec + чек-лист |
| `004-instance-config` | SRS-02 | 24 | spec + чек-лист |
| `005-job-broker` | SRS-03 | 21 | spec + чек-лист |
| `006-worker-runtime` | SRS-04 | 25 | spec + чек-лист |
| `007-agent-functions` | SRS-05 | 32 | spec + чек-лист |
| `008-provider-adapters` | SRS-06 | 32 | spec + чек-лист |
| `009-cron-scheduler` | SRS-07 | 23 | spec + чек-лист |
| `010-observability-testbed` | SRS-08 | 27 | spec + чек-лист |
| `011-docs-standard` | SRS-09 | 31 | spec + чек-лист |

Сумма по девяти модулям — **241 требование**. Вместе с уже существующими `001` (46 FR) и `002` (18 FR) получается **305 функциональных требований в 11 спеках**.

## Принципы нарезки

Здесь легко ошибиться, и ошибка дорогая: неправильная граница модуля превращает его в помойку требований.

**По модулям SRS, а не по слоям.** Слои (база, API, DAO) меняются от задачи к задаче. Модуль — это часть системы с собственными обязанностями: брокер заданий не знает про провайдеров, провайдеры не знают про cron. Граница модуля стабильна годами, значит и спека живёт долго.

**Один SRS на модуль.** Каждая спека в разделе «Контекст и источники» ссылается на конкретный SRS-раздел, а не на весь корпус. Ссылка на документ целиком бесполезна: агент не найдёт там нужную строчку и начнёт выдумывать.

**Контракты — арбитр.** Всё, что касается форматов сообщений и событий, не описывается в спеке заново — только ссылкой на `docs/CONTRACTS.md`.

**Смежные фичи ссылаются друг на друга.** `011-docs-standard` описывает каскад обновления документации и поэтому явно связан с остальными десятью. Это не формальность: при изменении любого модуля агент видит, какие документы нужно обновить по цепочке.

## Честный статус

Важная деталь, которую я не собираюсь прятать: у всех девяти модулей сейчас есть только `spec.md` и `checklists/requirements.md`, у всех стоит `Status: Draft`. Плана (`/speckit.plan`), research и задач (`/speckit.tasks`) нет ни у одного из них.

Это осознанная остановка, а не «всё готово». Смысл волны была в том, чтобы получить карту требований целиком и увидеть противоречия между модулями. Писать планы и задачи для девяти модулей сразу — гарантированно потратить половину впустую: пока не начал работать над модулем, его план устареет раньше, чем понадобится.

## Что даёт корпус

Помимо очевидного «теперь всё описано», есть три практических эффекта:

1. **Любой порядок работы.** Можно взять модуль `006-worker-runtime` и начать с него — требования и границы уже есть.
2. **Видимые дубли.** Два модуля часто описывают одну и ту же валидацию входящего сообщения. Варианты два: вынести в общий модуль или явно решить, что это два разных контракта. Корпус заставляет сделать выбор.
3. **Видимые противоречия.** `004-instance-config` и `006-worker-runtime` по-разному отвечали на вопрос «кто знает про инстанс». На практике это вылилось бы в баг, а не в спор о документах.

Дальше — честный разбор задним числом: что в этой волне сработало, а что нет.

---

[← Пост 4: спека на одну строчку](/ru/dev/blog/sdd-04-spec-for-one-log-line/) · [Пост 6: пост-мортем по волне →](/ru/dev/blog/sdd-06-spec-wave-postmortem/)

<!-- lang:en -->

## The trigger: SRS exists, but it does not help

The project had long had a `docs/SRS/` corpus — `SRS-00`…`SRS-09`, one per module. A decent corpus, but it has a property: it describes the system the way it was **designed to be**, and nobody kept it in sync with the code. A year later its articles diverge from reality in details, and details are where defects live.

After the good experience with a spec for one line, a hypothesis appeared: if every module spec references its SRS section and the contracts, then SRS stops being a dead document — it becomes the source of requirements, while the spec is its verifiable refinement for a specific module.

## What came out of one session

Nine new directories in `specs/`:

| Module | SRS | FR | Artefacts |
| --- | --- | --- | --- |
| `003-pod-infrastructure` | SRS-01 | 26 | spec + checklist |
| `004-instance-config` | SRS-02 | 24 | spec + checklist |
| `005-job-broker` | SRS-03 | 21 | spec + checklist |
| `006-worker-runtime` | SRS-04 | 25 | spec + checklist |
| `007-agent-functions` | SRS-05 | 32 | spec + checklist |
| `008-provider-adapters` | SRS-06 | 32 | spec + checklist |
| `009-cron-scheduler` | SRS-07 | 23 | spec + checklist |
| `010-observability-testbed` | SRS-08 | 27 | spec + checklist |
| `011-docs-standard` | SRS-09 | 31 | spec + checklist |

Nine modules add up to **241 requirements**. Together with the existing `001` (46 FR) and `002` (18 FR) that is **305 functional requirements across 11 specs**.

## Slicing principles

This is easy to get wrong, and the mistake is expensive: a wrong module boundary turns it into a dump of requirements.

**By SRS module, not by layer.** Layers (database, API, DAO) change from task to task. A module is a part of the system with its own responsibilities: the job broker knows nothing about providers, providers know nothing about cron. A module boundary is stable for years, so its spec lives long too.

**One SRS per module.** Each spec references a concrete SRS section in its "Context and sources" section, not the whole corpus. A link to a whole document is useless: the agent will not find the right line in it and will start inventing.

**Contracts are the arbiter.** Everything about message and event formats is not re-described in the spec — only referenced via `docs/CONTRACTS.md`.

**Adjacent features reference each other.** `011-docs-standard` describes the documentation update cascade and therefore explicitly links to the other ten. That is not a formality: when any module changes, the agent sees which documents must be updated along the chain.

## The honest status

An important detail I am not going to hide: all nine modules currently have only `spec.md` and `checklists/requirements.md`, all marked `Status: Draft`. None of them has a plan (`/speckit.plan`), research or tasks (`/speckit.tasks`).

That is a deliberate stop, not "everything is done". The point of the wave was to get the full requirements map and see contradictions between modules. Writing plans and tasks for nine modules at once guarantees wasting half of it: until you start working on a module, its plan goes stale before you need it.

## What the corpus buys

Beyond the obvious "now everything is described", there are three practical effects:

1. **Any order of work.** You can take module `006-worker-runtime` and start with it — the requirements and boundaries are already there.
2. **Visible duplicates.** Two modules often describe the same incoming message validation. Either extract it into a shared module or explicitly decide these are two different contracts. The corpus forces the choice.
3. **Visible contradictions.** `004-instance-config` and `006-worker-runtime` answered the question "who knows about the instance" differently. In practice that would have become a bug rather than a document dispute.

Next: an honest hindsight review of the wave — what worked and what did not.

---

[← Post 4: a spec for one line](/en/dev/blog/sdd-04-spec-for-one-log-line/) · [Post 6: post-mortem on the wave →](/en/dev/blog/sdd-06-spec-wave-postmortem/)

<!-- lang:he -->

## הטריגר: SRS קיים, אבל לא עוזר

בפרויקט כבר ישב מזמן קורפוס `docs/SRS/` — מסמכים `SRS-00`…`SRS-09`, אחד לכל מודול. קורפוס טוב, אבל יש לו תכונה: הוא מתאר את המערכת כמו שהיא **תוכננה להיות**, ואף אחד לא עדכן אותו בסנכרון עם הקוד. אחרי שנה הסעיפים בו סותרים את המציאות בפרטים קטנים, ובפרטים קטנים חיים הבאגים.

אחרי הניסיון המוצלח עם מפרט לשורה אחת עלתה השערה: אם כל מפרט מודול מפנה לסעיף ה-SRS שלו ולחוזים, אז SRS מפסיק להיות מסמך מת — הוא הופך למקור הדרישות, והמפרט הוא הדיוק הניתן לאימות שלו עבור מודול מסוים.

## מה יצא מסשן אחד

תשע תיקיות חדשות ב-`specs/`:

| מודול | SRS | FR | ארטיפקטים |
| --- | --- | --- | --- |
| `003-pod-infrastructure` | SRS-01 | 26 | spec + צ'ק-ליסט |
| `004-instance-config` | SRS-02 | 24 | spec + צ'ק-ליסט |
| `005-job-broker` | SRS-03 | 21 | spec + צ'ק-ליסט |
| `006-worker-runtime` | SRS-04 | 25 | spec + צ'ק-ליסט |
| `007-agent-functions` | SRS-05 | 32 | spec + צ'ק-ליסט |
| `008-provider-adapters` | SRS-06 | 32 | spec + צ'ק-ליסט |
| `009-cron-scheduler` | SRS-07 | 23 | spec + צ'ק-ליסט |
| `010-observability-testbed` | SRS-08 | 27 | spec + צ'ק-ליסט |
| `011-docs-standard` | SRS-09 | 31 | spec + צ'ק-ליסט |

תשעת המודולים מסתכמים ל-**241 דרישות**. יחד עם `001` הקיים (46 FR) ו-`002` (18 FR) מדובר ב-**305 דרישות פונקציונליות ב-11 מפרטים**.

## עקרונות החיתוך

כאן קל לטעות, והטעות יקרה: גבול מודול שגוי הופך אותו למזבלה של דרישות.

**לפי מודול SRS, לא לפי שכבה.** שכבות (מסד נתונים, API, DAO) משתנות ממשימה למשימה. מודול הוא חלק מהמערכת עם אחריות משלו: ה-job broker לא יודע כלום על ספקים, וספקים לא יודעים כלום על cron. גבול מודול יציב לשנים, ולכן גם המפרט שלו חי שנים.

**SRS אחד לכל מודול.** כל מפרט מפנה בסעיף "הקשר ומקורות" לסעיף SRS קונקרטי, לא לכל הקורפוס. הפניה למסמך שלם חסרת תועלת: הסוכן לא ימצא בו את השורה הנדרשת ויתחיל להמציא.

**חוזים הם הבורר.** כל מה שקשור לפורמטים של הודעות ואירועים לא מתואר מחדש במפרט — רק בהפניה ל-`docs/CONTRACTS.md`.

**פיצ'רים סמוכים מפנים זה לזה.** `011-docs-standard` מתאר את מפל עדכון התיעוד ולכן מקושר במפורש לעשרת האחרים. זה לא פורמליות: כשמודול כלשהו משתנה, הסוכן רואה אילו מסמכים צריך לעדכן לאורך השרשרת.

## הסטטוס הכנה

פרט חשוב שאני לא מתכוון להסתיר: לכל תשעת המודולים יש כרגע רק `spec.md` ו-`checklists/requirements.md`, ובכולם מסומן `Status: Draft`. אין לאף אחד מהם plan (`/speckit.plan`), research או tasks (`/speckit.tasks`).

זו עצירה מכוונת, לא "הכל מוכן". המשמעות של הגל היתה לקבל מפת דרישות מלאה ולראות סתירות בין מודולים. לכתוב תוכניות ומשימות לתשעה מודולים בבת אחת מבטיח לבזבז חצי מזה: עד שמתחילים לעבוד על מודול, התוכנית שלו מתיישנת לפני שצריך אותו.

## מה הקורפוס נותן

מעבר ל"עכשיו הכל מתואר", יש שלוש תוצאות מעשיות:

1. **כל סדר עבודה.** אפשר לקחת את מודול `006-worker-runtime` ולהתחיל ממנו — הדרישות והגבולות כבר שם.
2. **כפילויות גלויות.** שני מודולים מתארים לעתים קרובות את אותה ולידציה של הודעה נכנסת. או שמוציאים אותה למודול משותף, או שמחליטים במפורש שאלה שני חוזים שונים. הקורפוס מכריח לבחור.
3. **סתירות גלויות.** `004-instance-config` ו-`006-worker-runtime` ענו אחרת על השאלה "מי יודע על ה-instance". בפועל זה היה הופך לבאג, לא לוויכוח על מסמכים.

בהמשך — סקירה כנה בדיעבד של הגל: מה עבד ומה לא.

---

[← פוסט 4: מפרט לשורה אחת](/he/dev/blog/sdd-04-spec-for-one-log-line/) · [פוסט 6: פוסט-מורטם על הגל →](/he/dev/blog/sdd-06-spec-wave-postmortem/)
