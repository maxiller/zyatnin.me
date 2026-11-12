---
slug: sdd-03-constitution-five-principles
view: dev
date: 2026-05-21
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "/speckit.constitution: пять принципов, которые читает и человек, и агент"
    excerpt: "Что такое конституция проекта, чем она отличается от README и почему агент перестаёт «улучшать» API без спроса."
  en:
    title: "/speckit.constitution: five principles read by humans and agents alike"
    excerpt: "What a project constitution is, how it differs from a README, and why the agent stopped \"improving\" the API without asking."
  he:
    title: "/speckit.constitution: חמישה עקרונות שגם אדם וגם סוכן קוראים"
    excerpt: "מהי חוקת פרויקט, במה היא שונה מ-README, ולמה הסוכן הפסיק \"לשפר\" את ה-API בלי לשאול."
---

<!-- lang:ru -->

## Зачем ещё один документ

К этому моменту у проекта уже были README, `ARCHITECTURE.md` и файл инструкций для агента. Зачем конституция?

Потому что это документы **разного жанра**. README описывает проект для человека, который зашёл впервые. Инструкции агенту говорят, как оформлять коммиты и не трогать чужие файлы. Конституция — нормативный документ: она задаёт правила, которые нельзя нарушить, даже если задача очень просит.

Разница видна по языку. README может сказать «обычно мы предпочитаем X». Конституция говорит «X — обязательно» и объясняет, что будет, если сделать Y. Спека же описывает одну фичу и не имеет права менять правила игры.

## Что в ней сейчас

Конституция лежит в `.specify/memory/` и состоит из пяти принципов. Заголовки — дословно:

1. **I. Contracts First** — NON-NEGOTIABLE
2. **II. Configuration Is Data, Never Code**
3. **III. Offline-Testable By Default**
4. **IV. One Pod, Instance-Scoped Names**
5. **V. Durable Jobs, Observable Failures** — NON-NEGOTIABLE

Два из пяти помечены как незыблемые: если задача требует нарушить I или V, правильный ответ — не «сделать исключение», а пересмотреть задачу.

Вот фрагмент первого принципа:

```text
### I. Contracts First (NON-NEGOTIABLE)

Любое изменение внешнего поведения сначала фиксируется
в docs/CONTRACTS.md, и только потом реализуется в коде.

- Аддитивное изменение (новое поле, новое событие) — MINOR-версия.
- Несовместимое изменение — MAJOR-версия и миграция потребителей.
- Код, расходящийся с контрактом, считается дефектом, а не
  недоработкой документации.
```

Последняя строчка — самая важная. До конституции было наоборот: если код расходился с `CONTRACTS.md`, я правил документ «по факту». Теперь расхождение — это баг в коде или баг в контракте, третьего не дано.

## Принцип I в жизни

Самый наглядный пример — та самая фича из серии. Добавляем событие `function_next_payload`, которое в TRACE-режиме показывает, что за задания функция выбрала следующими.

Порядок действий строго такой:

1. В `docs/CONTRACTS.md` описывается новое событие и его поля.
2. Версия контракта поднимается с **v4.11** до **v4.12** — изменение аддитивное, значит MINOR.
3. Только после этого появляется первая строчка кода.

Пункт 2 звучит как бюрократия, но он бесплатно решает вопрос совместимости: любой потребитель видит в changelog контракта, что ему ничего не сломали, а просто добавили новое событие, которое можно игнорировать.

## Что изменилось в работе с агентом

Главный эффект — не в коде, а в разговоре. Раньше любая просьба «добавь поле в событие» имела шанс закончиться переписанным соседним событием, потому что агенту показалось логичнее. Сейчас можно остановить работу одной фразой: «это против принципа I».

Агент читает конституцию в начале сессии и в конкретном случае сам говорит: «Для этого изменения нужно сначала обновить `docs/CONTRACTS.md` и поднять MINOR-версию — сделать?».

Отдельно полезны принципы III и V. Третий запрещает решение, которое нельзя проверить локально без живого Jira и телефонии — именно из него выросла любовь к семнадцати тестам на событие, о котором никто не просил. Пятый говорит, что фоновое задание не может потеряться молча: любое падение обязано оставить наблюдаемый след.

Что стоит за остальными тремя — коротко:

- **II. Configuration Is Data, Never Code.** Конфиг инстанса — это данные, а не ветка в коде. Один код — много инстансов, каждый со своим конфигом.
- **III. Offline-Testable By Default.** Тест не должен требовать сети и живых сервисов: провайдеры подменяются фейками, а не моками «на всякий случай».
- **IV. One Pod, Instance-Scoped Names.** Всё живёт в одном поде, имена ресурсов привязаны к инстансу. Второй инстанс не может случайно перетереть данные первого.

Эти три не помечены как незыблемые, но проверяются так же строго: расхождение с ними — дефект спеки, а не вопрос вкуса.

## Правило, которое легко недооценить

Конституция работает лишь пока она короткая. Пять принципов читаются за две минуты и запоминаются. Двадцать принципов не читает никто — ни человек, ни агент, — и тогда нормативный документ превращается в декорацию.

Если хочется добавить шестой — сначала попробуйте найти принцип, который он уточняет. Почти всегда это уточнение, а не новый принцип.

Основа есть. Дальше — как на ней выглядит спека одной маленькой фичи, и почему она занимает восемнадцать требований.

---

[← Пост 2: вживляем speckit](/ru/dev/blog/sdd-02-speckit-integration/) · [Пост 4: `/speckit.specify` →](/ru/dev/blog/sdd-04-spec-for-one-log-line/)

<!-- lang:en -->

## Why yet another document

By that point the project already had a README, `ARCHITECTURE.md` and an agent instruction file. Why a constitution?

Because these are documents of **different genres**. A README describes the project for someone who just walked in. Agent instructions say how to format commits and which files not to touch. A constitution is a normative document: it sets rules that must not be broken even when a task really asks for it.

The difference shows in the language. A README may say "we usually prefer X". A constitution says "X is mandatory" and explains what happens if you do Y. A spec describes one feature and has no right to change the rules of the game.

## What is in it now

The constitution lives in `.specify/memory/` and consists of five principles. The headings verbatim:

1. **I. Contracts First** — NON-NEGOTIABLE
2. **II. Configuration Is Data, Never Code**
3. **III. Offline-Testable By Default**
4. **IV. One Pod, Instance-Scoped Names**
5. **V. Durable Jobs, Observable Failures** — NON-NEGOTIABLE

Two of the five are marked inviolable: if a task requires breaking I or V, the right answer is to revisit the task, not to make an exception.

Here is a fragment of the first principle:

```text
### I. Contracts First (NON-NEGOTIABLE)

Any change to external behaviour is first recorded in docs/CONTRACTS.md
and only then implemented in code.

- Additive change (new field, new event) — MINOR version.
- Incompatible change — MAJOR version and a consumer migration.
- Code diverging from the contract is a defect, not
  an underdocumented feature.
```

The last line matters most. Before the constitution it was the opposite: if code diverged from `CONTRACTS.md`, I edited the document "to match reality". Now a divergence is either a code bug or a contract bug — there is no third option.

## Principle I in practice

Take the feature of the series. We add a `function_next_payload` event that, in TRACE mode, shows which jobs a function picked next.

The order of operations is strict:

1. `docs/CONTRACTS.md` describes the new event and its fields.
2. The contract version goes from **v4.11** to **v4.12** — the change is additive, so MINOR.
3. Only then does the first line of code appear.

Step 2 sounds bureaucratic, but it answers the compatibility question for free: any consumer sees in the contract changelog that nothing broke, and that a new event was added which can be ignored.

## What changed in working with an agent

The main effect is not in the code but in the conversation. Previously any request to "add a field to an event" could end with a rewritten neighbouring event because it looked more logical to the agent. Now the work can be stopped with one phrase: "that is against principle I".

The agent reads the constitution at session start and says on its own: "For this change we need to update `docs/CONTRACTS.md` and bump the MINOR version first — shall I?"

Principles III and V are valuable too. The third forbids a solution that cannot be verified locally without live Jira and telephony — that is where the love for seventeen tests on an event nobody asked for came from. The fifth says a background job cannot be lost silently: any crash must leave an observable trace.

What the other three are about, briefly:

- **II. Configuration Is Data, Never Code.** Instance config is data, not a branch in the code. One codebase — many instances, each with its own config.
- **III. Offline-Testable By Default.** A test must not require the network or live services: providers are replaced with fakes, not with mocks "just in case".
- **IV. One Pod, Instance-Scoped Names.** Everything lives in one pod, resource names are bound to the instance. A second instance cannot overwrite the first one's data by accident.

Those three are not marked inviolable, but they are enforced just as strictly: diverging from them is a spec defect, not a matter of taste.

## The rule that is easy to underestimate

The constitution works only while it is short. Five principles take two minutes to read and you remember them. Twenty principles are read by nobody — neither human nor agent — and then a normative document turns into decoration.

If you want a sixth, first try to find the principle it refines. Most of the time it is a refinement, not a new principle.

The foundation is there. Next: what a spec for one small feature looks like on top of it, and why it takes eighteen requirements.

---

[← Post 2: plugging speckit in](/en/dev/blog/sdd-02-speckit-integration/) · [Post 4: `/speckit.specify` →](/en/dev/blog/sdd-04-spec-for-one-log-line/)

<!-- lang:he -->

## למה עוד מסמך אחד

עד לנקודה הזו לפרויקט כבר היה README, `ARCHITECTURE.md` וקובץ הוראות לסוכן. אז למה חוקה?

כי אלה מסמכים מ**ז'אנרים שונים**. README מתאר את הפרויקט למי שנכנס בפעם הראשונה. הוראות לסוכן אומרות איך לכתוב commit ואילו קבצים לא לגעת. החוקה היא מסמך נורמטיבי: היא קובעת כללים שאסור להפר, גם כשמשימה ממש מבקשת.

ההבדל ניכר בשפה. README יכול לומר "בדרך כלל אנחנו מעדיפים X". חוקה אומרת "X הוא חובה" ומסבירה מה יקרה אם יעשו Y. מפרט מתאר פיצ'ר אחד ואין לו רשות לשנות את כללי המשחק.

## מה יש בה עכשיו

החוקה יושבת ב-`.specify/memory/` ומורכבת מחמישה עקרונות. הכותרות כלשונן:

1. **I. Contracts First** — NON-NEGOTIABLE
2. **II. Configuration Is Data, Never Code**
3. **III. Offline-Testable By Default**
4. **IV. One Pod, Instance-Scoped Names**
5. **V. Durable Jobs, Observable Failures** — NON-NEGOTIABLE

שניים מתוך החמישה מסומנים כבלתי ניתנים להפרה: אם משימה דורשת להפר את I או V, התשובה הנכונה היא לחזור למשימה, לא לעשות חריג.

הנה קטע מהעקרון הראשון:

```text
### I. Contracts First (NON-NEGOTIABLE)

Any change to external behaviour is first recorded in docs/CONTRACTS.md
and only then implemented in code.

- Additive change (new field, new event) — MINOR version.
- Incompatible change — MAJOR version and a consumer migration.
- Code diverging from the contract is a defect, not
  an underdocumented feature.
```

השורה האחרונה היא החשובה ביותר. לפני החוקה זה היה הפוך: אם הקוד סתר את `CONTRACTS.md`, תיקנתי את המסמך "לפי המציאות". עכשיו סתירה היא או באג בקוד או באג בחוזה — אין אפשרות שלישית.

## עקרון I בפועל

קחו את הפיצ'ר של הסדרה. מוסיפים אירוע `function_next_payload` שבמצב TRACE מראה אילו משימות הפונקציה בחרה בהמשך.

סדר הפעולות קפדני:

1. `docs/CONTRACTS.md` מתאר את האירוע החדש ואת השדות שלו.
2. גרסת החוזה עולה מ-**v4.11** ל-**v4.12** — השינוי הוא אדיטיבי, כלומר MINOR.
3. רק אז מופיעה שורת הקוד הראשונה.

שלב 2 נשמע ביורוקרטי, אבל הוא פותר בחינם את שאלת התאימות: כל צרכן רואה ב-changelog של החוזה שכלום לא נשבר, ושאירוע חדש נוסף שאפשר להתעלם ממנו.

## מה השתנה בעבודה עם סוכן

ההשפעה העיקרית היא לא בקוד אלא בשיחה. קודם כל בקשה "תוסיף שדה לאירוע" היתה יכולה להיגמר באירוע שכן משוכתב, כי "ככה יותר הגיוני". היום אפשר לעצור את העבודה במשפט אחד: "זה נגד עקרון I".

הסוכן קורא את החוקה בתחילת הסשן ואומר בעצמו: "בשביל השינוי הזה צריך קודם לעדכן את `docs/CONTRACTS.md` ולהעלות גרסת MINOR — לעשות?"

גם עקרונות III ו-V שימושיים. השלישי אוסר פתרון שאי אפשר לאמת מקומית בלי Jira וטלפוניה חיה — משם צמחה האהבה לשבעה-עשר טסטים לאירוע שאף אחד לא ביקש. החמישי אומר שמשימת רקע לא יכולה ללכת לאיבוד בשקט: כל קריסה חייבת להשאיר סימן גלוי.

מה שלושת האחרים, בקצרה:

- **II. Configuration Is Data, Never Code.** קונפיג של instance הוא נתונים, לא ענף בקוד. קוד אחד — הרבה instances, לכל אחד קונפיג משלו.
- **III. Offline-Testable By Default.** טסט לא דורש רשת ושירותים חיים: ספקים מוחלפים ב-fakes, לא ב-mocks "ליתר ביטחון".
- **IV. One Pod, Instance-Scoped Names.** הכל חי בפוד אחד, שמות המשאבים קשורים ל-instance. instance שני לא יכול לדרוס בטעות את הנתונים של הראשון.

שלושת אלה לא מסומנים כבלתי ניתנים להפרה, אבל נאכפים באותה חומרה: סתירה איתם היא פגם במפרט, לא עניין של טעם.

## הכלל שקל להמעיט בערכו

החוקה עובדת רק כשהיא קצרה. חמישה עקרונות נקראים בשתי דקות וזוכרים אותם. עשרים עקרונות לא קורא אף אחד — לא אדם ולא סוכן — ואז מסמך נורמטיבי הופך לקישוט.

אם רוצים עיקרון שישי — קודם כדאי לחפש את העיקרון שהוא מדייק. ברוב המקרים זה דיוק, לא עיקרון חדש.

הבסיס קיים. בהמשך — איך נראה מפרט של פיצ'ר קטן אחד מעליו, ולמה הוא תופס שמונה-עשרה דרישות.

---

[← פוסט 2: הכנסת speckit](/he/dev/blog/sdd-02-speckit-integration/) · [פוסט 4: `/speckit.specify` →](/he/dev/blog/sdd-04-spec-for-one-log-line/)
