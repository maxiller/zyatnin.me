---
slug: sdd-09-analyze-findings
view: dev
date: 2026-09-17
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "/speckit.analyze: когда проверки находят то, чего вы не заметили"
    excerpt: "Кросс-сверка спеки, плана и задач нашла дыру в покрытии требования — до того, как её нашёл прод. Разбор находок и что с ними делать."
  en:
    title: "/speckit.analyze: when the checks find what you missed"
    excerpt: "A cross-check of spec, plan and tasks found a coverage gap before production did. A breakdown of findings and what to do with them."
  he:
    title: "/speckit.analyze: כשהבדיקות מוצאות את מה שפספסתם"
    excerpt: "הצלבת מפרט, תוכנית ומשימות מצאה חור בכיסוי דרישה לפני שהפרודקשן מצא אותו. פירוק הממצאים ומה עושים איתם."
---

<!-- lang:ru -->

## Что делает analyze

`/speckit.analyze` — это кросс-проверка трёх документов: спеки, плана и задач. Он ищет три вещи: несогласованность формулировок между документами, требования без покрытия тестами и задачи, которые ни к чему не относятся.

Звучит скучно. На практике это единственный артефакт SDD, который нашёл дефект, невидимый остальным трём.

## Что нашлось на нашем прогоне

Два класса находок.

**Несогласованные формулировки.** Спека говорила «событие пишется при каждом выборе следующего задания», а `data-model.md` — «событие эмитится в момент постановки задания». На бумаге разница микроскопическая, в коде — это два разных места вызова. Если бы писали по плану, а проверяли по спеке, тест на «каждое решение» провалился бы без объяснения причины.

**Дыра в покрытии FR-014.** Требование звучит так: «событие пишется во всех ветвях выполнения функции: успех, пустой результат, ошибка». В `tasks.md` нашлись тесты на успех и на пустой результат. На ветку ошибки — теста не было.

Вот это уже настоящая находка. Дефект не в коде, а в плане проверок — и до прода он бы дошёл незамеченным.

## Как выглядят находки

Findings размечены по важности:

| Уровень | Находка | Действие |
| --- | --- | --- |
| HIGH | FR-014 без теста на ошибку | Добавлен тест |
| MEDIUM | Формулировка «эмитится в момент постановки» | Правка `data-model.md` |
| LOW | Разные названия поля в спеке и плане | Правка спеки |

Закрываются они двумя принципиально разными способами: HIGH — кодом (дописать тест), MEDIUM и LOW — формулировками. Важно не путать: если исправлять HIGH правкой текста, требование просто исчезнет из списка, а дефект останется.

## Почему это работает

Главная ценность analyze не в умении читать код, а в равнодушии к автору. Он не помнит, как я вчера обсуждал «эту ветку и так понятно». Он сверяет список требований со списком задач и находит требование без задачи.

Человеческое ревью такое тоже находит — если его делать через месяц и с чистым листом. Проблема в том, что ревью собственных документов почти никогда не бывает с чистым листом: ты читаешь то, что собирался написать, а не то, что написал.

## Чем analyze не является

Он не заменяет ни тесты, ни ревью кода, ни расследование в проде. Все три первых находки — про документы. Работу кода он не проверяет вообще.

## Две тонкости, без которых толку мало

**Запускать до реализации, а не после.** Analyze по готовому коду бессмысленно мягкий: код уже написан, тесты зелёные, и любая находка читается как «да ладно, и так работает». Здоровое место для него — между `tasks.md` и первой задачей реализации.

**Не закрывать находки правкой текста, если правка нужна коду.** Самый быстрый способ сделать отчёт зелёным — переформулировать требование. Так рождаются спеки, которые описывают то, что уже написано, а не то, что нужно. Правило простое: HIGH закрывается тестом, и только MEDIUM/LOW — формулировкой. И если HIGH нельзя закрыть тестом — значит требование сформулировано непроверяемо, и это уже другая правка.

## Что analyze не поймал

Он нашёл дыру в покрытии FR-014 и разницу в формулировках. Он не мог найти того, что проявилось в проде: пустой фильтр Jira и работу кода с пустым списком. Это не его работа — но именно поэтому после зелёного analyze рано радоваться.

И именно поэтому следующий пост начинается со фразы, которая до сих пор меня раздражает: «спека чиста, задачи закрыты, тесты зелёные, а в проде события нет».

---

[← Пост 8: задачи и TDD](/ru/dev/blog/sdd-08-tasks-and-tdd/) · [Пост 10: где мои логи? →](/ru/dev/blog/sdd-10-empty-event-investigation/)

<!-- lang:en -->

## What analyze does

`/speckit.analyze` is a cross-check of three documents: the spec, the plan and the tasks. It looks for three things: inconsistent wording between documents, requirements without test coverage, and tasks unrelated to anything.

That sounds boring. In practice this is the only SDD artefact that found a defect invisible to the other three.

## What the run found

Two classes of findings.

**Inconsistent wording.** The spec said "the event is written on every selection of the next job", while `data-model.md` said "the event is emitted at the moment the job is enqueued". On paper the difference is microscopic; in code these are two different call sites. Had we written by the plan and checked by the spec, the "every decision" test would have failed with no explanation.

**A coverage gap for FR-014.** The requirement reads: "the event is written in all branches of function execution: success, empty result, error". `tasks.md` had tests for success and for the empty result. There was no test for the error branch.

That one is a real finding. The defect is not in the code but in the test plan — and it would have reached production unnoticed.

## What the findings look like

Findings are ranked by severity:

| Level | Finding | Action |
| --- | --- | --- |
| HIGH | FR-014 without an error test | Test added |
| MEDIUM | The "emitted at enqueue time" wording | `data-model.md` edited |
| LOW | Different field names in spec and plan | Spec edited |

They are closed in two fundamentally different ways: HIGH by code (write the test), MEDIUM and LOW by wording. It matters not to confuse them: fixing a HIGH by rewording simply removes the requirement from the list while the defect stays.

## Why this works

Analyze's main value is not in reading code but in indifference to the author. It does not remember that I discussed "that branch is obvious anyway" yesterday. It compares the list of requirements with the list of tasks and finds a requirement without a task.

Human review finds that too — if done a month later with a blank sheet. The problem is that reviewing your own documents is almost never done with a blank sheet: you read what you meant to write, not what you wrote.

## What analyze is not

It replaces neither tests, nor code review, nor production investigation. All three findings above are about documents. It does not check how the code works at all.

## Two subtleties without which it hardly helps

**Run it before implementation, not after.** Analyze over finished code is hopelessly soft: the code is written, the tests are green, and any finding reads as "come on, it works as it is". The healthy place for it is between `tasks.md` and the first implementation task.

**Do not close findings by rewording if the code needs the fix.** The fastest way to a green report is to reword the requirement. That is exactly how specs are born that describe what is already written rather than what is needed. The rule is simple: HIGH is closed by a test, and only MEDIUM/LOW by wording. And if a HIGH cannot be closed by a test, the requirement is not verifiable and that is a different fix.

## What analyze did not catch

It found the FR-014 coverage gap and the wording difference. It could not find what appeared in production: an empty Jira filter and code working correctly with an empty list. That is not its job — and that is exactly why it is too early to celebrate after a green analyze.

Which is why the next post starts with a line that still annoys me: "the spec is clean, the tasks are closed, the tests are green, and production has no event".

---

[← Post 8: tasks and TDD](/en/dev/blog/sdd-08-tasks-and-tdd/) · [Post 10: where are my logs? →](/en/dev/blog/sdd-10-empty-event-investigation/)

<!-- lang:he -->

## מה עושה analyze

`/speckit.analyze` הוא הצלבה של שלושה מסמכים: המפרט, התוכנית והמשימות. הוא מחפש שלושה דברים: חוסר עקביות בניסוחים בין המסמכים, דרישות בלי כיסוי טסטים, ומשימות שאין להן קשר לכלום.

נשמע משעמם. בפועל זה הארטיפקט היחיד ב-SDD שמצא פגם שלא היה נראה לשלושת האחרים.

## מה נמצא בהרצה

שני סוגי ממצאים.

**ניסוחים לא עקביים.** המפרט אמר "האירוע נכתב בכל בחירה של המשימה הבאה", ואילו `data-model.md` אמר "האירוע נפלט ברגע ההצבה לתור". על הנייר ההבדל זעיר; בקוד אלה שתי נקודות קריאה שונות. אילו כתבנו לפי התוכנית ובדקנו לפי המפרט, הטסט "כל החלטה" היה נופל בלי הסבר.

**חור בכיסוי של FR-014.** הדרישה אומרת: "האירוע נכתב בכל ענפי ההרצה של הפונקציה: הצלחה, תוצאה ריקה, שגיאה". ב-`tasks.md` היו טסטים להצלחה ולתוצאה ריקה. לענף השגיאה — לא היה טסט.

זו כבר ממצא אמיתי. הפגם הוא לא בקוד אלא בתוכנית הבדיקות — והוא היה מגיע לפרודקשן בלי ששמו לב.

## איך נראים הממצאים

הממצאים מדורגים לפי חשיבות:

| רמה | ממצא | פעולה |
| --- | --- | --- |
| HIGH | FR-014 בלי טסט לשגיאה | נוסף טסט |
| MEDIUM | הניסוח "נפלט ברגע ההצבה" | עריכת `data-model.md` |
| LOW | שמות שדות שונים במפרט ובתוכנית | עריכת המפרט |

סוגרים אותם בשתי דרכים שונות מהיסוד: HIGH בקוד (לכתוב את הטסט), MEDIUM ו-LOW בניסוח. חשוב לא לבלבל: אם מתקנים HIGH בעריכת טקסט, הדרישה פשוט נעלמת מהרשימה והפגם נשאר.

## כמה זה עולה

הרצת analyze לוקחת דקות ורוב הפעמים מוצאת אפס או ממצאים קוסמטיים. השאלה הנכונה היא לא "כמה זה עולה" אלא "כמה עולה לפספס": דרישה אחת בלי כיסוי טסטים הופכת לבאג בפרודקשן, ושם המחיר כבר נמדד בשעות.

לכן אני מריץ אותו בכל פעם שיש שינוי במפרט או במשימות, ולא רק לפני מימוש. זה זול כמו commit.

## למה זה עובד

הערך המרכזי של analyze הוא לא ביכולת לקרוא קוד אלא באדישות לכותב. הוא לא זוכר שדיברתי אתמול על "הענף הזה גם ככה מובן". הוא משווה את רשימת הדרישות לרשימת המשימות ומוצא דרישה בלי משימה.

גם review אנושי מוצא את זה — אם עושים אותו חודש אחר כך ועם דף חלק. הבעיה היא ש-review של המסמכים של עצמך כמעט אף פעם לא נעשה עם דף חלק: קוראים את מה שהתכוונת לכתוב, לא את מה שכתבת.

## מה analyze לא

הוא לא מחליף טסטים, לא review של קוד ולא חקירה בפרודקשן. כל שלושת הממצאים למעלה הם על מסמכים. את עבודת הקוד הוא בכלל לא בודק.

## שתי דקויות שבלעדיהן זה כמעט לא עוזר

**להריץ לפני המימוש, לא אחריו.** analyze על קוד מוגמר הוא רך מדי: הקוד כתוב, הטסטים ירוקים, וכל ממצא נקרא כמו "נו, זה עובד ככה". המקום הבריא שלו הוא בין `tasks.md` למשימת המימוש הראשונה.

**לא לסגור ממצאים בעריכת טקסט אם התיקון צריך להיות בקוד.** הדרך המהירה ביותר לדוח ירוק היא לנסח מחדש את הדרישה. כך בדיוק נולדים מפרטים שמתארים את מה שכבר כתוב ולא את מה שצריך. הכלל פשוט: HIGH נסגר בטסט, ורק MEDIUM/LOW בניסוח. ואם HIGH לא ניתן לסגור בטסט — הדרישה לא ניתנת לאימות, וזה כבר תיקון אחר.

## מה analyze לא תפס

הוא מצא את החור בכיסוי FR-014 ואת הבדל הניסוחים. הוא לא היה יכול למצוא את מה שהופיעה בפרודקשן: פילטר Jira ריק וקוד שעובד נכון עם רשימה ריקה. זה לא התפקיד שלו — ובדיוק בגלל זה מוקדם לשמוח אחרי analyze ירוק.

ולכן הפוסט הבא מתחיל במשפט שעד היום מעצבן אותי: "המפרט נקי, המשימות סגורות, הטסטים ירוקים, ובפרודקשן אין אירוע".

---

[← פוסט 8: משימות ו-TDD](/he/dev/blog/sdd-08-tasks-and-tdd/) · [פוסט 10: איפה הלוגים שלי? →](/he/dev/blog/sdd-10-empty-event-investigation/)
