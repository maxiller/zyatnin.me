---
slug: sdd-11-emission-moves-to-functions
view: dev
date: 2026-10-21
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "Поворот: «исключений не будет» — эмиссия переезжает в функции"
    excerpt: "Решение владельца продукта меняет архитектуру уже готовой фичи — и SDD позволяет это дёшево. Сигнатура хелпера, пять вызовов и переписанные тесты."
  en:
    title: "The turn: «no exceptions» — emission moves into the functions"
    excerpt: "A product owner decision changes the architecture of a finished feature — and SDD makes that cheap. Helper signature, five calls, rewritten tests."
  he:
    title: "המפנה: «בלי חריגים» — הפליטה עוברת לפונקציות"
    excerpt: "החלטה של בעל המוצר משנה את הארכיטקטורה של פיצ'ר גמור — ו-SDD עושה את זה בזול. חתימת ה-helper, חמש קריאות, טסטים שנכתבו מחדש."
---

<!-- lang:ru -->

## Вопрос после расследования

После поста 10 остался неприятный вопрос: событие не пишется, когда функция не породила заданий. Это правильно по FR-007. Но стоит ли делать исключения для терминальных и пустых случаев вообще?

Идея звучала соблазнительно: «терминальные ветки не логируем, зачем шуметь». Я сел её обдумать — и понял, что это ровно тот тип исключения, из которого потом растёт необъяснимое поведение.

Решение: **никаких исключений**. Если функция выбирает следующее задание — событие пишется всегда. Если не выбирает — значит вызов был, и это тоже имеет смысл видеть. А «пусто» и «не вызвали» — это разные ситуации, и лог должен их различать.

## Что поменялось в архитектуре

План (пост 7) выбрал эмиссию в диспетчере. Причина была в том, что диспетчер уже знает про каскад и в одном месте происходит всё, что связано с запуском заданий.

Проблема: диспетчер знает про следующий шаг только то, что ему сообщили. Полный payload задания живёт в функции — она его формирует. Диспетчеру приходится либо тащить payload через границу слоёв, либо довольствоваться тем, что осталось.

Поэтому решение переехало в функции. В `uveon/functions/base.py` появился хелпер:

```python
def log_next_payloads(ctx, function: str, next_jobs: list) -> None:
    """Эмитит function_next_payload для каждого следующего задания."""
```

И его вызов — в каждой из пяти функций, перед сообщением о завершении:

```python
next_jobs = [build_fetch_issue_job(ctx, issue) for issue in issues]
log_next_payloads(ctx, "search_jql", next_jobs)
await function_done(ctx, ...)
```

Эмиссия из `Dispatcher.dispatch` удалена полностью — не закомментирована, не оставлена «на всякий случай»: две точки эмиссии дали бы двойные записи.

## Неочевидное следствие: контракт не изменился

Самое элегантное в этом развороте: версия контракта осталась **v4.12**. Принцип I требует фиксировать изменения внешнего поведения — а внешнее поведение не изменилось. Событие называется так же, содержит те же поля, пишется в тех же условиях. Поменялось только место, откуда оно эмитится, — а это внутренняя деталь реализации.

Если бы я делал это в обычном режиме, первым желанием было бы «поднять версию, мы же поменяли архитектуру». Именно так в контрактах появляются MAJOR-версии без изменений для потребителей, и именно так потребители перестают их читать.

## Почему это дёшево

Вот тут и окупается весь SDD-цикл. Изменение архитектуры внутри готовой фичи — это не рефакторинг, а пересборка плана:

- меняется `data-model.md` (место эмиссии в описании);
- меняются тесты, которые проверяли «диспетчер пишет событие»;
- меняются задачи, и в них явно появляется пункт «удалить эмиссию из диспетчера»;
- переписывается `tasks.md`, а не код «как получилось».

Сравните с обычным режимом: вы объясняете себе, почему старый подход был правильный, потом правите код в трёх местах, потом обнаруживаете, что тест был про другое. Потом решаете, что переписывать тест долго и правите его «под факт». Через месяц тест охраняет уже не то требование, ради которого существовал.

В SDD-цикле шестнадцать тестов переписаны под новую архитектуру, включая тест на каскад из шести заданий. Ни один не удалён — каждый проверяет по-прежнему то, что должен.

И это главное отличие от «поправить как получилось»: тесты меняются потому, что изменилось решение, а не потому, что они мешают сдать фичу.

## Что это стоило

Один круг против плана. Один лишний прогон тестов. Один пост в блоге — этот.

Что бы я сделал иначе: сразу закладывать эмиссию в функции. Почему не заложил? Потому что на этапе плана короткий путь («одно место — один вызов») выглядит дешевле, а цена выясняется только когда начинаешь думать про payload. Это нормально: план — это не пророчество, а инструмент пересмотра.

Фича собрана заново. Осталось проверить, что код и документы не разъехались.

---

[← Пост 10: пустое событие в проде](/ru/dev/blog/sdd-10-empty-event-investigation/) · [Пост 12: `/speckit.converge` →](/ru/dev/blog/sdd-12-converge-and-series-postmortem/)

<!-- lang:en -->

## The question after the investigation

After post 10 an unpleasant question remained: no event is written when a function produces no jobs. That is correct per FR-007. But should there be exceptions for terminal and empty cases at all?

The idea sounded tempting: "we do not log terminal branches, why the noise". I sat down to think about it — and realised it is exactly the kind of exception that later grows into inexplicable behaviour.

The decision: **no exceptions**. If a function picks the next job — the event is always written. If it does not pick one — the call still happened, and that is also worth seeing. And "empty" and "not called" are different situations, and the log must tell them apart.

## What changed in the architecture

The plan (post 7) chose emission in the dispatcher. The reason was that the dispatcher already knows about the cascade and everything related to launching jobs happens in one place.

The problem: the dispatcher knows about the next step only what it was told. The full job payload lives in the function — the function builds it. The dispatcher either has to drag the payload across a layer boundary or make do with what is left.

So the decision moved into the functions. In `uveon/functions/base.py` a helper appeared:

```python
def log_next_payloads(ctx, function: str, next_jobs: list) -> None:
    """Emits function_next_payload for every next job."""
```

And its call — in each of the five functions, before reporting completion:

```python
next_jobs = [build_fetch_issue_job(ctx, issue) for issue in issues]
log_next_payloads(ctx, "search_jql", next_jobs)
await function_done(ctx, ...)
```

Emission from `Dispatcher.dispatch` is removed entirely — not commented out, not left "just in case": two emission points would produce double records.

## A non-obvious consequence: the contract did not change

The elegant part of this reversal: the contract version stayed **v4.12**. Principle I requires recording changes to external behaviour — and external behaviour did not change. The event is called the same, carries the same fields, and is written under the same conditions. Only the place it is emitted from changed — and that is an internal implementation detail.

Had I done this in the usual mode, the first instinct would be "bump the version, we changed the architecture". That is exactly how contracts get MAJOR versions with no changes for consumers, and exactly how consumers stop reading them.

## Why this is cheap

This is where the whole SDD cycle pays off. An architecture change inside a finished feature is not refactoring but a plan rebuild:

- `data-model.md` changes (where the emission point sits);
- the tests that checked "the dispatcher writes the event" change;
- the tasks change, and an explicit item appears in them: "remove emission from the dispatcher";
- `tasks.md` is rewritten, not the code "as it turned out".

Compare with the usual mode: you explain to yourself why the old approach was right, then edit code in three places, then discover the test was about something else. Then you decide rewriting the test is long and adjust it "to match the fact". A month later the test guards something other than the requirement it existed for.

In the SDD cycle sixteen tests are rewritten for the new architecture, including the cascade-of-six-jobs test. Not one is deleted — every one still checks what it should.

And that is the main difference from "fix it as it came out": tests change because the decision changed, not because they get in the way of shipping.

## What it cost

One round against the plan. One extra test run. One blog post — this one.

What I would do differently: put emission in the functions from the start. Why did I not? Because at the plan stage the short path ("one place — one call") looks cheaper, and the price only shows up when you start thinking about the payload. That is normal: a plan is not a prophecy but a revision tool.

The feature is rebuilt. What is left is to check the code and the documents have not drifted apart.

---

[← Post 10: an empty event in production](/en/dev/blog/sdd-10-empty-event-investigation/) · [Post 12: `/speckit.converge` →](/en/dev/blog/sdd-12-converge-and-series-postmortem/)

<!-- lang:he -->

## השאלה שאחרי החקירה

אחרי פוסט 10 נשארה שאלה לא נעימה: האירוע לא נכתב כשהפונקציה לא הולידה משימות. זה נכון לפי FR-007. אבל האם בכלל כדאי לעשות חריגים למקרים טרמינליים וריקים?

הרעיון נשמע מפתה: "ענפים טרמינליים לא מתעדים, למה הרעש". התיישבתי לחשוב על זה — והבנתי שזה בדיוק סוג החריג שממנו אחר כך גדלה התנהגות בלתי מוסברת.

ההחלטה: **בלי חריגים**. אם פונקציה בוחרת את המשימה הבאה — האירוע נכתב תמיד. אם היא לא בוחרת — הקריאה בכל זאת היתה, וגם זה שווה לראות. ו"ריק" ו"לא נקראה" הם שני מצבים שונים, והלוג חייב להבדיל ביניהם.

## מה השתנה בארכיטקטורה

התוכנית (פוסט 7) בחרה בפליטה ב-dispatcher. הנימוק היה שה-dispatcher כבר יודע על המפל וכל מה שקשור להרצת משימות קורה במקום אחד.

הבעיה: ה-dispatcher יודע על הצעד הבא רק את מה שאמרו לו. ה-payload המלא של המשימה חי בפונקציה — היא בונה אותו. ה-dispatcher צריך לגרור את ה-payload דרך גבול שכבות או להסתפק במה שנשאר.

לכן ההחלטה עברה לפונקציות. ב-`uveon/functions/base.py` הופיע helper:

```python
def log_next_payloads(ctx, function: str, next_jobs: list) -> None:
    """Emits function_next_payload for every next job."""
```

והקריאה שלו — בכל אחת מחמש הפונקציות, לפני הדיווח על סיום:

```python
next_jobs = [build_fetch_issue_job(ctx, issue) for issue in issues]
log_next_payloads(ctx, "search_jql", next_jobs)
await function_done(ctx, ...)
```

הפליטה מ-`Dispatcher.dispatch` הוסרה לגמרי — לא הושמה בהערה ולא נשארה "ליתר ביטחון": שתי נקודות פליטה היו יוצרות רשומות כפולות.

## מסקנה לא מובנת מאליה: החוזה לא השתנה

החלק האלגנטי במפנה הזה: גרסת החוזה נשארה **v4.12**. עקרון I דורש לתעד שינויים בהתנהגות חיצונית — וההתנהגות החיצונית לא השתנתה. האירוע נקרא אותו דבר, נושא את אותם שדות, ונכתב באותם תנאים. השתנה רק המקום שממנו הוא נפלט — וזה פרט פנימי של המימוש.

אילו עשיתי זאת במצב הרגיל, הדחף הראשון היה "להעלות גרסה, הרי שינינו ארכיטקטורה". כך בדיוק מקבלים חוזים עם גרסת MAJOR בלי שום שינוי לצרכנים, וכך בדיוק צרכנים מפסיקים לקרוא אותם.

## למה זה זול

כאן משתלם כל מחזור ה-SDD. שינוי ארכיטקטורה בתוך פיצ'ר גמור הוא לא ריפקטורינג אלא בנייה מחדש של התוכנית:

- משתנה `data-model.md` (איפה נקודת הפליטה);
- משתנים הטסטים שבדקו "ה-dispatcher כותב אירוע";
- משתנות המשימות, ובהן מופיע סעיף מפורש "להסיר את הפליטה מה-dispatcher";
- נכתב מחדש `tasks.md`, ולא הקוד "איך שיצא".

השוו למצב הרגיל: אתם מסבירים לעצמכם למה הגישה הישנה היתה נכונה, אחר כך מתקנים קוד בשלושה מקומות, ואז מגלים שהטסט היה על משהו אחר. אחר כך מחליטים שלשכתב את הטסט ארוך ומתאימים אותו "לעובדות". בעוד חודש הטסט מגן על משהו שאינו הדרישה שבשבילה נועד.

במחזור SDD שישה-עשר טסטים נכתבים מחדש לארכיטקטורה החדשה, כולל הטסט למפל של שש משימות. אף אחד לא נמחק — כל אחד עדיין בודק את מה שהוא צריך.

וזה ההבדל העיקרי מ"לתקן איך שיצא": הטסטים משתנים כי ההחלטה השתנתה, לא כי הם מפריעים לשחרר.

## כמה זה עלה

סיבוב אחד מול התוכנית. הרצת טסטים נוספת. פוסט אחד בבלוג — זה.

מה הייתי עושה אחרת: להשתמש בפליטה בפונקציות מההתחלה. למה לא? כי בשלב התוכנית הדרך הקצרה ("מקום אחד — קריאה אחת") נראית זולה יותר, והמחיר מתגלה רק כשיושבים לחשוב על ה-payload. זה נורמלי: תוכנית היא לא נבואה אלא כלי לתיקון.

הפיצ'ר נבנה מחדש. נשאר לבדוק שהקוד והמסמכים לא התרחקו זה מזה.

---

[← פוסט 10: אירוע ריק בפרודקשן](/he/dev/blog/sdd-10-empty-event-investigation/) · [פוסט 12: `/speckit.converge` →](/he/dev/blog/sdd-12-converge-and-series-postmortem/)
