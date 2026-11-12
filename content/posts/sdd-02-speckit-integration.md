---
slug: sdd-02-speckit-integration
view: dev
date: 2026-05-04
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "Вживляем speckit в существующий проект"
    excerpt: "Spec-driven development — не только для новых проектов. Как поставить speckit в живой репозиторий с историей, контрактами и работающим продом."
  en:
    title: "Plugging speckit into an existing project"
    excerpt: "Spec-driven development is not only for greenfield projects. How to put speckit into a live repository with history, contracts and a running production."
  he:
    title: "משתילים את speckit בפרויקט קיים"
    excerpt: "Spec-driven development הוא לא רק לפרויקטים חדשים. איך מכניסים speckit למאגר חי שיש בו history, חוזים ופרודקשן שעובד."
---

<!-- lang:ru -->

## Почему не переписать с нуля

Первая мысль, когда проект начинает разваливаться, — переписать. Она почти всегда неверная, и вот почему в моём случае:

- Проект **работает в проде**. Он приносит пользу каждый день, и время, потраченное на rewrite, — это время без пользы.
- У него есть **история решений**. Каждый странный костыль — это ответ на реальный инцидент, и переписывание потеряет эту память.
- Rewrite редко решает проблему процесса. Через полгода новый проект развалится так же, если правила игры прежние.

Spec-driven development как раз про правила, а не про чистый лист. Поэтому я не переписывал проект, а вживил в него инструмент.

## `specify init` в живой репозиторий

Установка speckit занимает минуту и ничего не ломает: она добавляет в корень каталог `.specify/`.

```text
.specify/
├── memory/            # конституция проекта
├── templates/         # шаблоны spec, plan, tasks
├── scripts/           # скрипты создания и валидации артефактов
├── workflows/         # описания команд /speckit.*
└── feature.json       # указатель на «текущую» фичу
```

Идея простая: каждая фича живёт в своём каталоге `specs/<NNN>-<slug>/`, и в нём лежат артефакты одного и того же набора — спека, чек-лист требований, план, research, задачи, контракты. Ничего специфического для зелёного поля: это работает и в проекте, которому четыре года.

## Нюанс: у проекта уже был источник истины

Вот тут началось интересное. У `uveonbot` уже существовал `docs/CONTRACTS.md` — документ, описывающий форматы событий и сообщений между компонентами. Когда появляется второй источник истины, кто-то должен стать главным, иначе через месяц они противоречат друг другу.

Решение было таким: конституция проекта (о ней — следующий пост) объявила контракты арбитром в вопросах внешнего поведения. Спека описывает *что* и *зачем*, контракт — *как это выглядит на проводе*. Спека не может противоречить контракту; чтобы изменить внешнее поведение, сначала меняется контракт.

## Нумерация фич

Порядковые номера в `specs/` не косметика — по ним строятся ссылки и сортировка артефактов:

```text
specs/
├── 001-control-plane-config/
├── 002-next-payload-trace/
└── ... 003…011
```

`001` — модуль управления (конфиг отдельных инстансов бота), он же первый модуль, распланированный до задач. `002` — та самая «фича со строчкой в лог», на ней будет построена вся серия.

Номер выдаётся при создании фичи и больше не меняется. Если фича отменяется, её каталог не переиспользуется — номера идут только вперёд. Это скучно и именно поэтому работает: ссылка `002` никогда не начнёт значить что-то другое.

## Спеки — тоже артефакты

Самая обидная ошибка в этом месте: воспринимать `specs/` как «документацию рядом». Нет. Спека меняется вместе с кодом и живёт в git по тем же правилам: отдельный коммит, понятное сообщение, ревью диффа.

К моменту, когда я пишу этот пост, у меня в рабочем дереве лежат девять новых каталогов `specs/003…011` — неотслеживаемые. Содержимое готово, коммита нет. Это не мелочь: пока спека не в git, её нельзя ревьюить, на неё нельзя ссылаться из кода, и при следующем чтении агент её не найдёт в истории.

Поэтому в пост-мортеме серии коммит этих каталогов стоит отдельным пунктом action items. Spec-driven development ломается не когда плохо пишут спеки, а когда их забывают коммитить.

## Что получилось

Дерево репозитория теперь явно делится на четыре слоя, у каждого из которых своя роль:

| Слой | Отвечает на вопрос |
| --- | --- |
| `.specify/memory/` (конституция) | Как мы вообще работаем? |
| `specs/<NNN>/spec.md` | Что и зачем делаем в этой фиче? |
| `docs/CONTRACTS.md` | Как выглядит внешнее поведение? |
| код и тесты | Как это работает? |

И самое главное: у агента при каждом запросе есть контекст, который не надо пересказывать заново. Конституция и спека лежат в репозитории, а не в моей голове.

Но спеки без правил — просто документация. Пять правил, которые агент обязан читать перед любым действием, — тема следующего поста.

---

[← Пост 1: зачем проекту конституция](/ru/dev/blog/sdd-01-constitution-and-specs/) · [Пост 3: `/speckit.constitution` →](/ru/dev/blog/sdd-03-constitution-five-principles/)

<!-- lang:en -->

## Why not rewrite from scratch

The first thought when a project starts falling apart is to rewrite it. It is almost always wrong, and here is why in my case:

- The project **runs in production**. It delivers value every day, and time spent on a rewrite is time without value.
- It has **decision history**. Every strange workaround is an answer to a real incident, and a rewrite loses that memory.
- A rewrite rarely fixes the process. Six months later the new project falls apart the same way if the rules of the game are unchanged.

Spec-driven development is about rules, not about a clean slate. So I did not rewrite the project — I grafted a tool into it.

## `specify init` into a live repository

Installing speckit takes a minute and breaks nothing: it adds a `.specify/` directory to the repository root.

```text
.specify/
├── memory/            # project constitution
├── templates/         # spec, plan, tasks templates
├── scripts/           # artefact creation and validation
├── workflows/         # /speckit.* command descriptions
└── feature.json       # pointer to the "current" feature
```

The idea is simple: every feature lives in its own `specs/<NNN>-<slug>/` directory with the same set of artefacts — spec, requirements checklist, plan, research, tasks, contracts. Nothing greenfield-specific: this works in a project that is four years old.

## The nuance: the project already had a source of truth

This is where it got interesting. `uveonbot` already had `docs/CONTRACTS.md` — a document describing the formats of events and messages between components. When a second source of truth appears, one of them must be the authority, otherwise they contradict each other within a month.

The solution: the project constitution (next post) declared contracts the arbiter of external behaviour. The spec describes *what* and *why*, the contract describes *how it looks on the wire*. A spec cannot contradict a contract; to change external behaviour, the contract changes first.

## Feature numbering

The sequence numbers in `specs/` are not cosmetic — links and sorting of artefacts depend on them:

```text
specs/
├── 001-control-plane-config/
├── 002-next-payload-trace/
└── ... 003…011
```

`001` is the control module (per-instance bot config), the first module planned down to tasks. `002` is the "one line in the log" feature, and the whole series is built on it.

The number is assigned when the feature is created and never changes. If a feature is cancelled, its directory is not reused — numbers only go forward. That is boring, and that is exactly why it works: `002` will never start meaning something else.

## Specs are artefacts too

The most annoying mistake here is treating `specs/` as "documentation on the side". It is not. A spec changes together with the code and lives in git by the same rules: its own commit, a clear message, a reviewed diff.

As I write this post, nine new `specs/003…011` directories sit in my working tree untracked. The content is ready, the commit is not. That is not a detail: until a spec is in git it cannot be reviewed, cannot be referenced from code, and the agent will not find it in history next time.

That is why committing those directories is a separate action item in the series post-mortem. Spec-driven development breaks not when specs are written badly, but when they are forgotten in the working tree.

## What came out of it

The repository tree now clearly splits into four layers, each with its own role:

| Layer | Answers the question |
| --- | --- |
| `.specify/memory/` (constitution) | How do we work at all? |
| `specs/<NNN>/spec.md` | What and why are we doing in this feature? |
| `docs/CONTRACTS.md` | What does external behaviour look like? |
| code and tests | How does it actually work? |

And the most important part: the agent has context on every request that does not need re-explaining. The constitution and the spec live in the repository, not in my head.

But specs without rules are just documentation. The five rules the agent must read before acting are the next topic.

---

[← Post 1: why a project needs a constitution](/en/dev/blog/sdd-01-constitution-and-specs/) · [Post 3: `/speckit.constitution` →](/en/dev/blog/sdd-03-constitution-five-principles/)

<!-- lang:he -->

## למה לא לכתוב מאפס

המחשבה הראשונה כשפרויקט מתחיל להתפרק היא לשכתב אותו. היא כמעט תמיד שגויה, ובמקרה שלי זה כך:

- הפרויקט **עובד בפרודקשן**. הוא מביא תועלת כל יום, וזמן שנשקע בשכתוב הוא זמן בלי תועלת.
- יש לו **היסטוריית החלטות**. כל workaround מוזר הוא תשובה לאירוע אמיתי, ושכתוב מוחק את הזיכרון הזה.
- שכתוב כמעט לא פותר את בעיית התהליך. אחרי חצי שנה הפרויקט החדש יתפרק אותו דבר אם כללי המשחק לא השתנו.

Spec-driven development הוא על כללים, לא על דף חלק. לכן לא שכתבתי את הפרויקט — השתלתי בו כלי.

## `specify init` במאגר חי

התקנת speckit לוקחת דקה ולא שוברת כלום: היא מוסיפה תיקיית `.specify/` לשורש המאגר.

```text
.specify/
├── memory/            # חוקת הפרויקט
├── templates/         # תבניות spec, plan, tasks
├── scripts/           # יצירה ואימות של ארטיפקטים
├── workflows/         # תיאורי פקודות /speckit.*
└── feature.json       # מצביע על הפיצ'ר ה"נוכחי"
```

הרעיון פשוט: כל פיצ'ר חי בתיקייה משלו `specs/<NNN>-<slug>/` עם אותה קבוצת ארטיפקטים — מפרט, צ'ק-ליסט דרישות, תוכנית, research, משימות, חוזים. אין כאן שום דבר ייחודי לפרויקט חדש: זה עובד גם בפרויקט בן ארבע שנים.

## הניואנס: כבר היה מקור אמת אחד

וכאן ניהיה מעניין. ל-`uveonbot` כבר היה `docs/CONTRACTS.md` — מסמך שמתאר את הפורמטים של אירועים והודעות בין רכיבים. כשיש מקור אמת שני, אחד מהם חייב להיות הסמכות, אחרת תוך חודש הם סותרים זה את זה.

הפתרון: חוקת הפרויקט (בפוסט הבא) הכריזה שהחוזים הם הבורר בכל הקשור להתנהגות חיצונית. המפרט מתאר *מה* ו*למה*, החוזה מתאר *איך זה נראה על החוט*. מפרט לא יכול לסתור חוזה; כדי לשנות התנהגות חיצונית — קודם משתנה החוזה.

## מספור פיצ'רים

המספרים ב-`specs/` הם לא קוסמטיקה — עליהם בנויים קישורים ומיון של ארטיפקטים:

```text
specs/
├── 001-control-plane-config/
├── 002-next-payload-trace/
└── ... 003…011
```

`001` הוא מודול הבקרה (קונפיג בוט לכל instance), והוא המודול הראשון שתוכנן עד משימות. `002` הוא פיצ'ר "שורה אחת בלוג", ועליו בנויה כל הסדרה.

המספר מוקצה ביצירת הפיצ'ר ולא משתנה יותר. אם פיצ'ר מבוטל, התיקייה שלו לא ממוחזרת — המספרים רק הולכים קדימה. זה משעמם, ובדיוק בגלל זה זה עובד: `002` לעולם לא יתחיל להיות משהו אחר.

## מפרטים הם גם ארטיפקטים

הטעות המעצבנת ביותר כאן היא להתייחס ל-`specs/` כ"דוקומנטציה בצד". ממש לא. מפרט משתנה יחד עם הקוד וחי ב-git לפי אותם כללים: commit משלו, הודעה ברורה, diff שעובר review.

בזמן שאני כותב את הפוסט הזה, תשע תיקיות חדשות `specs/003…011` נמצאות בעץ העבודה שלי בלי להיות במעקב git. התוכן מוכן, ה-commit לא. זה לא פרט קטן: מפרט שלא ב-git לא ניתן ל-review, אי אפשר לקשר אליו מהקוד, והסוכן לא ימצא אותו בהיסטוריה בפעם הבאה.

לכן commit של התיקיות האלה הוא סעיף פעולה נפרד בפוסט-מורטם של הסדרה. Spec-driven development נשבר לא כשכותבים מפרטים גרועים, אלא כששוכחים אותם בעץ העבודה.

## מה יצא מזה

עץ המאגר מתחלק עכשיו בבירור לארבעה שכבות, לכל אחת תפקיד:

| שכבה | עונה על השאלה |
| --- | --- |
| `.specify/memory/` (חוקה) | איך אנחנו בכלל עובדים? |
| `specs/<NNN>/spec.md` | מה ולמה אנחנו עושים בפיצ'ר הזה? |
| `docs/CONTRACTS.md` | איך נראית ההתנהגות החיצונית? |
| קוד וטסטים | איך זה באמת עובד? |

והחשוב ביותר: לסוכן יש בכל בקשה הקשר שלא צריך להסביר מחדש. החוקה והמפרט נמצאים במאגר, לא בראש שלי.

אבל מפרטים בלי כללים הם רק דוקומנטציה. חמשת הכללים שהסוכן חייב לקרוא לפני כל פעולה — הנושא הבא.

---

[← פוסט 1: למה פרויקט צריך חוקה](/he/dev/blog/sdd-01-constitution-and-specs/) · [פוסט 3: `/speckit.constitution` →](/he/dev/blog/sdd-03-constitution-five-principles/)
