---
slug: sdd-12-converge-and-series-postmortem
view: dev
date: 2026-11-07
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "/speckit.converge, пост-мортем серии и следующий горизонт"
    excerpt: "Финал серии: сверка кода со спекой, честная ретроспектива на три части и шесть action items на следующий горизонт."
  en:
    title: "/speckit.converge, the series post-mortem and the next horizon"
    excerpt: "The series finale: code-to-spec convergence, an honest three-part retrospective and six action items for the next horizon."
  he:
    title: "/speckit.converge, פוסט-מורטם של הסדרה והאופק הבא"
    excerpt: "סיום הסדרה: הצלבת קוד מול מפרט, רטרוספקטיבה כנה בשלושה חלקים ושישה סעיפי פעולה לאופק הבא."
---

<!-- lang:ru -->

## Converge: последняя проверка

`/speckit.converge` — финальный шаг цикла: сверка кода со спекой, планом и задачами. Не тесты, а соответствие.

Результат: **0 findings**, все **20 задач** отмечены как выполненные, незакрытых шагов по фиче `002` нет. Код и документы говорят об одном и том же.

Фича закоммичена одним набором: `1433449`, контракт v4.12, `SRS-04/05/08`, `TROUBLESHOOTING`, спека целиком, шестнадцать тестов и код.

## Пост-мортем серии, часть 1: что задумано и что вышло

Серия начиналась с формулировки «добавить строчку в лог». Кончилась так:

| Метрика | Значение |
| --- | --- |
| Функциональных требований в фиче | 18 |
| Принципов в конституции | 5 (из них 2 незыблемых) |
| Новых тестов | 16 |
| Проходов `/speckit.analyze` | 2 |
| Смен архитектуры | 1 |
| Спек в волне | 9 (241 требование) |

Вывод, который стоит запомнить: «маленькая фича» — это всегда немного система. Вопрос только в том, увидите ли вы эту систему заранее или по частям в логах прода.

## Пост-мортем серии, часть 2: что осталось вне SDD

Честный список недоделанного:

- **Контейнер `worker:dev` крутится со старой сборкой.** Нужен `make build` и перезапуск пода: сейчас код в репозитории новее, чем в контейнере.
- **`markdownlint` гоняет только CI (`docs-ci`)**, локально его нет. Линтер, который нельзя запустить перед коммитом, ловит ошибки после него.
- **Загадка пустого фильтра `59251`** — уже не про логи: надо разобраться, почему JQL-фильтр стабильно пуст. Может быть, неверный конфиг, а может — реально нет задач.
- **`.specify/feature.json` всё ещё указывает на `002`.** Пока не выбрана новая фича, указатель врёт.

## Пост-мортем серии, часть 3: action items

Шесть пунктов на ближайшее будущее:

1. Выбрать следующую фичу — например, `003-pod-infrastructure` — и обновить `feature.json`.
2. Прогнать `/speckit.plan` для неё.
3. Прогнать `/speckit.analyze` по новым спекам `003…011`.
4. Добавить раздел `## Out of Scope` в спеку `002`.
5. Поставить markdownlint локально в devDependencies.
6. Закоммитить `specs/003…011` по `docs/GIT-RULES.md`.

Пункт 6 — самый срочный. Девять каталогов спек лежат в рабочем дереве неотслеживаемыми, и это ровно та ошибка, которую я сам же описал в пост-мортеме волны.

## Что бы я сделал иначе

Три вещи, за которые серия заплатила временем:

**Сразу заложить эмиссию в функциях.** Один круг по плану и один пост в блоге ушли на то, чтобы переоткрыть очевидное: payload живёт в функции — функция пусть и логирует.

**Проверять прод-данные раньше, чем обвинять код.** Полчаса на проверку, вернул ли Jira хоть одну задачу, сэкономили бы всю детективную ветку поста 10 — хотя признаюсь честно, без неё серия была бы менее полезной.

**Коммитить `specs/` сразу, а не держать девять каталогов неотслеживаемыми.** Спека вне git — не артефакт, а черновик.

## Цифры серии

305 FR в 11 спеках. 18 FR и 20 задач в реализованной фиче. 16 новых тестов, 747 в полном прогоне. Контракт v4.12. 83 проверенные ссылки в волне спек. Два прохода analyze, один converge.

## Что дальше

У `001` (`control-plane-config`, 46 FR) готовы план и 40 открытых задач. У `003…011` — спеки на 241 требование, но без планов и задач. Это нормальный конвейер: специфицировать пачкой, реализовывать по одной.

Следующая серия будет про реализацию `001` и про то, как волна `003…011` превращается в работающие модули.

## Вердикт

Spec-driven development окупается не на «написать новую фичу». Он окупается на «передумать»: поменять решение владельца продукта и получить не день рефакторинга со страхом, а пересобранный план, обновлённый контракт и шестнадцать тестов, которые продолжают охранять то, что должны.

Именно там, где обычный проект молча гниёт, SDD даёт второй шанс дёшево.

---

[← Пост 11: эмиссия в функциях](/ru/dev/blog/sdd-11-emission-moves-to-functions/)

<!-- lang:en -->

## Converge: the last check

`/speckit.converge` is the final step of the cycle: reconciling the code with the spec, plan and tasks. Not tests — correspondence.

Result: **0 findings**, all **20 tasks** marked as done, no open SDD steps left for feature `002`. The code and the documents say the same thing.

The feature is committed as one set: `1433449`, contract v4.12, `SRS-04/05/08`, `TROUBLESHOOTING`, the whole spec, sixteen tests and the code.

## Series post-mortem, part 1: what was planned and what came out

The series started with "add a line to the log". It ended like this:

| Metric | Value |
| --- | --- |
| Functional requirements in the feature | 18 |
| Principles in the constitution | 5 (2 inviolable) |
| New tests | 16 |
| `/speckit.analyze` passes | 2 |
| Architecture changes | 1 |
| Specs in the wave | 9 (241 requirements) |

The takeaway worth remembering: a "small feature" is always a bit of a system. The only question is whether you see that system in advance or in pieces in production logs.

## Series post-mortem, part 2: what stayed outside SDD

An honest list of unfinished things:

- **The `worker:dev` container runs an old build.** It needs `make build` and a pod restart: right now the code in the repository is newer than in the container.
- **`markdownlint` runs only in CI (`docs-ci`)** and is not there locally. A linter you cannot run before committing catches errors after it.
- **The empty `59251` filter mystery** is no longer about logs: it needs investigating why the JQL filter is consistently empty. Maybe a wrong config, maybe there really are no tasks.
- **`.specify/feature.json` still points at `002`.** Until a new feature is chosen, the pointer lies.

## Series post-mortem, part 3: action items

Six items for the near future:

1. Pick the next feature — for example `003-pod-infrastructure` — and update `feature.json`.
2. Run `/speckit.plan` for it.
3. Run `/speckit.analyze` over the new specs `003…011`.
4. Add a `## Out of Scope` section to spec `002`.
5. Install markdownlint locally as a devDependency.
6. Commit `specs/003…011` per `docs/GIT-RULES.md`.

Item 6 is the most urgent. Nine spec directories sit untracked in the working tree — exactly the mistake I described myself in the wave post-mortem.

## What I would do differently

Three things the series paid for with time:

**Put emission in the functions from the start.** One plan round and one blog post went into rediscovering the obvious: the payload lives in the function, so let the function log it.

**Check production data before blaming the code.** Half an hour of checking whether Jira returned any tasks at all would have saved the whole detective branch of post 10 — although, honestly, the series would have been less useful without it.

**Commit `specs/` right away instead of keeping nine directories untracked.** A spec outside git is not an artefact but a draft.

## Series numbers

305 FR in 11 specs. 18 FR and 20 tasks in the shipped feature. 16 new tests, 747 in the full run. Contract v4.12. 83 verified links in the spec wave. Two analyze passes, one converge.

## What is next

`001` (`control-plane-config`, 46 FR) has a plan and 40 open tasks. `003…011` have specs for 241 requirements but no plans or tasks. That is a normal pipeline: specify in batches, implement one at a time.

The next series will be about implementing `001` and how the `003…011` wave turns into working modules.

## Verdict

Spec-driven development pays off not on "write a new feature". It pays off on "change your mind": change a product owner decision and get not a day of refactoring with fear, but a rebuilt plan, an updated contract and sixteen tests that keep guarding what they should.

That is exactly where an ordinary project rots silently, and SDD gives a second chance cheaply.

---

[← Post 11: emission in the functions](/en/dev/blog/sdd-11-emission-moves-to-functions/)

<!-- lang:he -->

## Converge: הבדיקה האחרונה

`/speckit.converge` הוא הצעד האחרון במחזור: הצלבת הקוד עם המפרט, התוכנית והמשימות. לא טסטים — התאמה.

תוצאה: **0 ממצאים**, כל **20 המשימות** מסומנות כבוצעו, אין שלבי SDD פתוחים לפיצ'ר `002`. הקוד והמסמכים אומרים אותו דבר.

הפיצ'ר ב-commit אחד: `1433449`, חוזה v4.12, `SRS-04/05/08`, `TROUBLESHOOTING`, המפרט כולו, שישה-עשר טסטים והקוד.

## פוסט-מורטם של הסדרה, חלק 1: מה תוכנן ומה יצא

הסדרה התחילה מ"להוסיף שורה ללוג". היא נגמרה כך:

| מדד | ערך |
| --- | --- |
| דרישות פונקציונליות בפיצ'ר | 18 |
| עקרונות בחוקה | 5 (2 בלתי ניתנים להפרה) |
| טסטים חדשים | 16 |
| מעברי `/speckit.analyze` | 2 |
| שינויי ארכיטקטורה | 1 |
| מפרטים בגל | 9 (241 דרישות) |

המסקנה שכדאי לזכור: "פיצ'ר קטן" הוא תמיד קצת מערכת. השאלה היחידה היא אם רואים את המערכת הזאת מראש או בחלקים בלוגי הפרודקשן.

## פוסט-מורטם של הסדרה, חלק 2: מה נשאר מחוץ ל-SDD

רשימה כנה של דברים לא גמורים:

- **הקונטיינר `worker:dev` רץ על בנייה ישנה.** דרוש `make build` והפעלה מחדש של הפוד: כרגע הקוד במאגר חדש מזה שבקונטיינר.
- **`markdownlint` רץ רק ב-CI (`docs-ci`)** ואינו זמין מקומית. לינטר שאי אפשר להריץ לפני commit תופס שגיאות אחריו.
- **תעלומת הפילטר הריק `59251`** — כבר לא על לוגים: צריך לבדוק למה פילטר ה-JQL ריק בעקביות. אולי קונפיג שגוי, ואולי באמת אין משימות.
- **`.specify/feature.json` עדיין מצביע על `002`.** עד שלא נבחר פיצ'ר חדש, המצביע משקר.

## פוסט-מורטם של הסדרה, חלק 3: סעיפי פעולה

שישה סעיפים לעתיד הקרוב:

1. לבחור את הפיצ'ר הבא — למשל `003-pod-infrastructure` — ולעדכן את `feature.json`.
2. להריץ `/speckit.plan` עבורו.
3. להריץ `/speckit.analyze` על המפרטים החדשים `003…011`.
4. להוסיף סעיף `## Out of Scope` למפרט `002`.
5. להתקין markdownlint מקומית כ-devDependency.
6. לעשות commit ל-`specs/003…011` לפי `docs/GIT-RULES.md`.

סעיף 6 הוא הדחוף ביותר. תשע תיקיות מפרטים יושבות בעץ העבודה בלי מעקב — בדיוק הטעות שתיארתי בעצמי בפוסט-מורטם של הגל.

## מה הייתי עושה אחרת

שלושה דברים שהסדרה שילמה עליהם בזמן:

**להכניס את הפליטה לפונקציות מההתחלה.** סיבוב תוכנית אחד ופוסט בלוג אחד הלכו לגילוי מחדש של המובן מאלוי: ה-payload חי בפונקציה — אז שהפונקציה תתעד אותו.

**לבדוק נתוני פרודקשן לפני שמאשימים את הקוד.** חצי שעה של בדיקה אם Jira החזירה בכלל משימות היתה חוסכת את כל ענף החקירה של פוסט 10 — למרות שבכנות, בלעדיו הסדרה היתה פחות שימושית.

**לעשות commit ל-`specs/` מיד, ולא להחזיק תשע תיקיות בלי מעקב.** מפרט מחוץ ל-git הוא לא ארטיפקט אלא טיוטה.

## מספרי הסדרה

305 FR ב-11 מפרטים. 18 FR ו-20 משימות בפיצ'ר שיצא. 16 טסטים חדשים, 747 בהרצה מלאה. חוזה v4.12. 83 קישורים שנבדקו בגל המפרטים. שני מעברי analyze, converge אחד.

## מה הלאה

ל-`001` (`control-plane-config`, 46 FR) יש תוכנית ו-40 משימות פתוחות. ל-`003…011` יש מפרטים ל-241 דרישות אבל בלי תוכניות ומשימות. זה צינור נורמלי: לתאר בכמות, לממש אחד-אחד.

הסדרה הבאה תהיה על מימוש `001` ועל איך הגל `003…011` הופך למודולים עובדים.

## פסיקה

Spec-driven development משתלם לא על "לכתוב פיצ'ר חדש". הוא משתלם על "לשנות את הדעה": לשנות החלטה של בעל מוצר ולקבל לא יום של ריפקטורינג עם פחד, אלא תוכנית שנבנתה מחדש, חוזה מעודכן ושישה-עשר טסטים שממשיכים להגן על מה שהם צריכים.

בדיוק במקום שבו פרויקט רגיל נרקב בשקט, SDD נותן הזדמנות שנייה בזול.

---

[← פוסט 11: הפליטה בפונקציות](/he/dev/blog/sdd-11-emission-moves-to-functions/)
