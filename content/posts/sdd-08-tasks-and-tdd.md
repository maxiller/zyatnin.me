---
slug: sdd-08-tasks-and-tdd
view: dev
date: 2026-08-31
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "/speckit.tasks + /speckit.implement: TDD по фазам"
    excerpt: "Двадцать задач в четырёх фазах: сначала контракт и документация, потом тесты, только потом код. И цифры прогона после реализации."
  en:
    title: "/speckit.tasks + /speckit.implement: TDD by phases"
    excerpt: "Twenty tasks in four phases: contract and docs first, then tests, only then code. And the numbers from the run after implementation."
  he:
    title: "/speckit.tasks + /speckit.implement: TDD לפי שלבים"
    excerpt: "עשרים משימות בארבעה שלבים: קודם חוזה ותיעוד, אחר כך טסטים, ורק אז קוד. והמספרים מהרצה אחרי המימוש."
---

<!-- lang:ru -->

## Из плана — в задачи

`/speckit.tasks` берёт спеку и план и выдаёт `tasks.md` — список задач с зависимостями. Ключевое отличие от чек-листа «сделать фичу»: у каждой задачи есть идентификатор, фаза и — если она параллелизуема — метка `[P]`.

## Четыре фазы

Структура, к которой мы пришли:

```text
Phase 1: Контракт и документация
Phase 2: Тесты (до кода)
Phase 3: Реализация
Phase 4: Валидация
```

Фрагмент `tasks.md` с зависимостями:

```text
- [ ] T001 [blocking] Обновить docs/CONTRACTS.md до v4.12
- [ ] T002 [P] Обновить SRS-04 (воркер) и SRS-05 (функции)
- [ ] T003 [P] Обновить SRS-08 (наблюдаемость), TROUBLESHOOTING
- [ ] T004 [P] Докстринги публичных функций
- [ ] T005 [after T001] Тесты: подавление на INFO/DEBUG
- [ ] T006 [after T001] Тесты: единый формат для всех пяти функций
- [ ] T007 [after T001] Тесты: каскад из 6 заданий, один root_job_id
- [ ] T008 [after T001] Тесты: независимость от дедупликации
- [ ] T009 [after T001] Тесты: длинный payload без усечения
- [ ] T010 [after T005-T009] Хелпер эмиссии события
- [ ] T011 [after T010] Вызовы в пяти функциях
- [ ] T012 [after T010] Удалить эмиссию из диспетчера
- [ ] T013 [after T012] Полный прогон тестов
```

Задача `T001` блокирует всё остальное — и это правильно. Пока контракт не поднят до v4.12, любая строчка кода нарушает принцип I.

## Фаза 1: документация вперёд кода

Меняется `docs/CONTRACTS.md`, `SRS-04/05/08`, `TROUBLESHOOTING` и докстринги. Выглядит как «писать документацию ради галочки», но есть конкретный эффект: к моменту, когда агент доходит до кода, он уже три раза прочитал формулировки требования. Код получается точнее.

## Фаза 2: семь групп тестов до кода

TDD здесь не догма, а способ проверить, что спека проверяема. Тесты пишутся на ещё не существующий хелпер и пять вызовов:

1. подавление на INFO/DEBUG — на этих уровнях событий нет;
2. единый формат для всех пяти функций — одинаковые поля, одинаковые типы;
3. каскад из шести заданий по одному `root_job_id` — связность каскада видна в логе;
4. независимость от дедупликации — событие есть, даже если задание не поставлено в очередь;
5. длинный payload — без усечения;
6. отсутствие логгера в контексте — не падать;
7. пустой список `next_jobs` — событие не пишется.

Седьмой тест важен: он прямо проверяет FR-007 и именно он потом спасёт меня при расследовании в проде.

## Фаза 3: реализация

Здесь всё скучно и это хорошо: хелпер эмиссии, пять вызовов, удаление эмиссии из диспетчера. Последний пункт — не рефакторинг ради чистоты, а требование избежать двойных записей: если писать и в диспетчере, и в функциях, в логе появятся дубли.

## Фаза 4: полный прогон

Итог: **747 passed, 22 skipped** по всему проекту. Новых тестов — шестнадцать, в файле `test_function_next_payload.py` на 334 строки.

Коммит `1433449`: 22 файла, `+1462/−13`. В нём вся фича целиком — контракт v4.12, документация, спека, тесты и код. Не тремя коммитами, не по мере готовности: один набор, у которого нет промежуточного состояния «тесты есть, а контракта нет».

## Что это дало по сравнению с обычным режимом

В обычном режиме я бы сделал так: добавил вызов в диспетчер, проверил руками, закоммитил, через месяц обнаружил, что не работает в трёх из пяти функций. В SDD-режиме я в первую очередь написал тест «единый формат для всех пяти функций» — и когда он был готов, код уже не мог оказаться в трёх из пяти.

Отдельно полезны метки `[P]`. Это не декорация: пометка означает, что задачу можно делать параллельно с соседними, потому что у неё нет общих файлов. `T002` и `T003` правят разные документы — значит идут одновременно. А `T010` ждёт все тесты (`T005–T009`), потому что писать реализацию, пока ни один тест не описан, — это ровно старый режим с бумажкой.

Смешное следствие такой дисциплины: сначала пишешь семь групп тестов на несуществующую функцию и чувствуешь себя странно. Через полчаса, когда первый же тест падает с понятным сообщением, странность исчезает.

## Чем это не является

Это не TDD ради TDD. Часть задач (обновление документации, докстринги) — не про тесты вообще. Настоящая дисциплина здесь одна: у каждой задачи есть проверяемый результат, и в `tasks.md` видно, зависит она от других или нет.

Зелёные тесты, впрочем, ничего не говорят о работе в проде. Об этом следующие два поста.

---

[← Пост 7: `/speckit.plan`](/ru/dev/blog/sdd-07-plan-research-contract/) · [Пост 9: `/speckit.analyze` →](/ru/dev/blog/sdd-09-analyze-findings/)

<!-- lang:en -->

## From plan to tasks

`/speckit.tasks` takes the spec and the plan and produces `tasks.md` — a list of tasks with dependencies. The key difference from a "build the feature" checklist: every task has an identifier, a phase and — if it can run in parallel — a `[P]` marker.

## Four phases

The structure we arrived at:

```text
Phase 1: Contract and documentation
Phase 2: Tests (before code)
Phase 3: Implementation
Phase 4: Validation
```

A fragment of `tasks.md` with dependencies:

```text
- [ ] T001 [blocking] Update docs/CONTRACTS.md to v4.12
- [ ] T002 [P] Update SRS-04 (worker) and SRS-05 (functions)
- [ ] T003 [P] Update SRS-08 (observability), TROUBLESHOOTING
- [ ] T004 [P] Docstrings of public functions
- [ ] T005 [after T001] Tests: suppression on INFO/DEBUG
- [ ] T006 [after T001] Tests: single format for all five functions
- [ ] T007 [after T001] Tests: cascade of 6 jobs, one root_job_id
- [ ] T008 [after T001] Tests: independence from deduplication
- [ ] T009 [after T001] Tests: long payload without truncation
- [ ] T010 [after T005-T009] Emission helper
- [ ] T011 [after T010] Calls in five functions
- [ ] T012 [after T010] Remove emission from the dispatcher
- [ ] T013 [after T012] Full test run
```

Task `T001` blocks everything else — and rightly so. Until the contract is at v4.12, any line of code breaks principle I.

## Phase 1: documentation ahead of code

`docs/CONTRACTS.md`, `SRS-04/05/08`, `TROUBLESHOOTING` and docstrings change. It looks like "writing docs for a tick", but there is a concrete effect: by the time the agent reaches the code, it has read the requirement wording three times. The code comes out more accurate.

## Phase 2: seven test groups before code

TDD here is not dogma but a way to check the spec is verifiable. Tests are written against a helper that does not exist yet and five call sites:

1. suppression at INFO/DEBUG — no events at those levels;
2. single format for all five functions — same fields, same types;
3. cascade of six jobs under one `root_job_id` — cascade connectivity is visible in the log;
4. independence from deduplication — the event exists even if the job was not enqueued;
5. long payload — no truncation;
6. no logger in the context — do not crash;
7. empty `next_jobs` list — no event written.

The seventh test matters: it checks FR-007 directly, and it is exactly what saves me later during the production investigation.

## Phase 3: implementation

Everything here is boring and that is good: the emission helper, five calls, removal of emission from the dispatcher. The last item is not refactoring for cleanliness but a requirement to avoid double records: writing both in the dispatcher and in the functions would produce duplicates in the log.

## Phase 4: full run

Result: **747 passed, 22 skipped** across the project. New tests: sixteen, in `test_function_next_payload.py`, 334 lines.

Commit `1433449`: 22 files, `+1462/−13`. The whole feature in it — contract v4.12, documentation, spec, tests and code. Not three commits, not as-it-becomes-ready: one set with no intermediate state of "tests exist but the contract does not".

## What it gave compared to the usual mode

In the usual mode I would have added the call in the dispatcher, checked by hand, committed, then found a month later that it does not work in three of five functions. In SDD mode I wrote the "single format for all five functions" test first — and once it was ready, the code could no longer end up in three of five.

`[P]` markers are useful separately. It is not decoration: the marker means the task can run in parallel with its neighbours because they do not share files. `T002` and `T003` edit different documents, so they run together. `T010` waits for all tests (`T005–T009`), because writing implementation while no test is described is exactly the old mode with a piece of paper.

A funny consequence of such discipline: first you write seven test groups for a non-existent function and feel strange. Half an hour later, when the first test fails with a clear message, the strangeness is gone.

## What this is not

This is not TDD for TDD's sake. Some tasks (documentation updates, docstrings) are not about tests at all. The real discipline here is one: every task has a verifiable outcome, and `tasks.md` shows whether it depends on others.

Green tests, however, say nothing about working in production. The next two posts are about that.

---

[← Post 7: `/speckit.plan`](/en/dev/blog/sdd-07-plan-research-contract/) · [Post 9: `/speckit.analyze` →](/en/dev/blog/sdd-09-analyze-findings/)

<!-- lang:he -->

## מתוכנית למשימות

`/speckit.tasks` לוקח את המפרט ואת התוכנית ומפיק `tasks.md` — רשימת משימות עם תלויות. ההבדל המרכזי מצ'ק-ליסט "לבנות את הפיצ'ר": לכל משימה יש מזהה, שלב, ואם אפשר להריץ אותה במקביל — סימון `[P]`.

## ארבעה שלבים

המבנה שאליו הגענו:

```text
Phase 1: Contract and documentation
Phase 2: Tests (before code)
Phase 3: Implementation
Phase 4: Validation
```

קטע מ-`tasks.md` עם תלויות:

```text
- [ ] T001 [blocking] Update docs/CONTRACTS.md to v4.12
- [ ] T002 [P] Update SRS-04 (worker) and SRS-05 (functions)
- [ ] T003 [P] Update SRS-08 (observability), TROUBLESHOOTING
- [ ] T004 [P] Docstrings of public functions
- [ ] T005 [after T001] Tests: suppression on INFO/DEBUG
- [ ] T006 [after T001] Tests: single format for all five functions
- [ ] T007 [after T001] Tests: cascade of 6 jobs, one root_job_id
- [ ] T008 [after T001] Tests: independence from deduplication
- [ ] T009 [after T001] Tests: long payload without truncation
- [ ] T010 [after T005-T009] Emission helper
- [ ] T011 [after T010] Calls in five functions
- [ ] T012 [after T010] Remove emission from the dispatcher
- [ ] T013 [after T012] Full test run
```

משימה `T001` חוסמת את כל השאר — ובצדק. עד שהחוזה ב-v4.12, כל שורת קוד שוברת את עקרון I.

## שלב 1: תיעוד לפני קוד

משתנים `docs/CONTRACTS.md`, `SRS-04/05/08`, `TROUBLESHOOTING` ודוקומנטציה פנימית של פונקציות. זה נראה כמו "לכתוב מסמכים בשביל הוי", אבל יש אפקט קונקרטי: עד שהסוכן מגיע לקוד, הוא כבר קרא שלוש פעמים את ניסוח הדרישה. הקוד יוצא מדויק יותר.

## שלב 2: שבע קבוצות טסטים לפני הקוד

TDD כאן הוא לא דוגמה אלא דרך לבדוק שהמפרט ניתן לאימות. הטסטים נכתבים ל-helper שעדיין לא קיים ולחמש נקודות קריאה:

1. דיכוי ב-INFO/DEBUG — ברמות האלה אין אירועים;
2. פורמט אחיד לכל חמש הפונקציות — אותם שדות, אותם טיפוסים;
3. מפל של שש משימות תחת `root_job_id` אחד — הקישוריות של המפל נראית בלוג;
4. עצמאות מ-deduplication — האירוע קיים גם אם המשימה לא הוכנסה לתור;
5. payload ארוך — בלי קיצור;
6. אין logger בהקשר — לא לקרוס;
7. רשימת `next_jobs` ריקה — האירוע לא נכתב.

הטסט השביעי חשוב: הוא בודק ישירות את FR-007, והוא בדיוק מה שמציל אותי אחר כך בחקירה בפרודקשן.

## שלב 3: מימוש

כאן הכל משעמם וזה טוב: ה-helper לפליטה, חמש קריאות, הסרת הפליטה מה-dispatcher. הפריט האחרון הוא לא ריפקטורינג לשם ניקיון אלא דרישה להימנע מרשומות כפולות: כתיבה גם ב-dispatcher וגם בפונקציות היתה מייצרת כפילויות בלוג.

## למה ארבעה שלבים ולא אחד

החלוקה לשלבים עונה על בעיה אמיתית: כשכותבים את הכל בבת אחת, אין נקודה שבה אפשר לעצור ולשאול "האם אנחנו בונים את הדבר הנכון". ארבעה שלבים הם ארבע נקודות עצירה. אחרי שלב 1 אפשר לבדוק את החוזה מול צרכן אמיתי; אחרי שלב 2 — לראות שהטסטים מתארים התנהגות ולא מימוש; אחרי שלב 3 — להריץ הכל.

בפועל עצרתי רק פעם אחת, בין שלב 2 לשלב 3. זה הספיק: בדיוק שם התברר שהטסט למפל של שש משימות דורש מה-helper API שלא תכננתי.

## שלב 4: הרצה מלאה

תוצאה: **747 עברו, 22 דולגו** בכל הפרויקט. טסטים חדשים: שישה-עשר, בקובץ `test_function_next_payload.py`, 334 שורות.

commit `1433449`: 22 קבצים, `+1462/−13`. כל הפיצ'ר בו — חוזה v4.12, תיעוד, מפרט, טסטים וקוד. לא שלושה commits, לא לפי מידת המוכנות: סט אחד שאין בו מצב ביניים של "הטסטים קיימים אבל החוזה לא".

## מה זה נתן לעומת המצב הרגיל

במצב הרגיל הייתי מוסיף את הקריאה ב-dispatcher, בודק ביד, עושה commit, ואחרי חודש מגלה שזה לא עובד בשלוש מתוך חמש פונקציות. במצב SDD כתבתי קודם את הטסט "פורמט אחיד לכל חמש הפונקציות" — וברגע שהוא מוכן, הקוד כבר לא יכול היה להיגמר בשלוש מתוך חמש.

סימוני `[P]` שימושיים בפני עצמם. זה לא קישוט: הסימון אומר שאפשר להריץ את המשימה במקביל לשכנות כי אין להן קבצים משותפים. `T002` ו-`T003` עורכים מסמכים שונים, ולכן רצים יחד. `T010` ממתין לכל הטסטים (`T005–T009`), כי לכתוב מימוש לפני שאף טסט לא תואר זה בדיוק המצב הישן עם פיסת נייר.

תוצאה מצחיקה של משמעת כזאת: קודם כותבים שבע קבוצות טסטים לפונקציה שלא קיימת ומרגישים מוזר. חצי שעה אחר כך, כשהטסט הראשון נכשל עם הודעה ברורה, המוזרות נעלמת.

## מה זה לא

זה לא TDD לשם TDD. חלק מהמשימות (עדכוני תיעוד, דוקומנטציה פנימית) בכלל לא קשורות לטסטים. המשמעת האמיתית כאן היא אחת: לכל משימה יש תוצאה ניתנת לבדיקה, וב-`tasks.md` רואים אם היא תלויה באחרות.

טסטים ירוקים, לעומת זאת, לא אומרים כלום על עבודה בפרודקשן. על זה שני הפוסטים הבאים.

---

[← פוסט 7: `/speckit.plan`](/he/dev/blog/sdd-07-plan-research-contract/) · [פוסט 9: `/speckit.analyze` →](/he/dev/blog/sdd-09-analyze-findings/)
