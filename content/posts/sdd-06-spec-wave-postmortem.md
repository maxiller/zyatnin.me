---
slug: sdd-06-spec-wave-postmortem
view: dev
date: 2026-07-28
tags: ["spec-driven-dev", "ai-agents"]
translations:
  ru:
    title: "Пост-мортем по волне спек: что я узнал задним числом"
    excerpt: "Девять спек за сессию: что задумано, что вышло и какие дефекты процесса проявились только когда всё легло в одну папку."
  en:
    title: "Post-mortem on the spec wave: what I learned in hindsight"
    excerpt: "Nine specs in one session: what was planned, what came out, and which process defects only showed up once everything sat in one folder."
  he:
    title: "פוסט-מורטם על גל המפרטים: מה למדתי בדיעבד"
    excerpt: "תשעה מפרטים בסשן אחד: מה תוכנן, מה יצא, ואילו פגמי תהליך התגלו רק כשהכל שכב בתיקייה אחת."
---

<!-- lang:ru -->

## Что было задумано

Разложить всю систему на спеки так, чтобы: не противоречить `docs/SRS/`, не дублировать схемы из `docs/CONTRACTS.md` и получить артефакт, по которому можно брать в работу любой модуль.

## Как делал

Порядок действий, если кому-то захочется повторить:

1. Перечитал `001` и `002` как эталон стиля — важно, чтобы все спеки выглядели одинаково.
2. Прочитал весь корпус `docs/SRS/SRS-00…SRS-09`, `ARCHITECTURE.md` и конституцию.
3. Каждая спека получила раздел «Контекст и источники» со ссылками на **конкретные** разделы SRS и на `CONTRACTS`, а не на документы целиком.
4. Прогнал программную проверку относительных ссылок.

## Что получилось

Девять спек и девять чек-листов, все обязательные секции на месте. Ссылки проверены программно: **83 относительные ссылки — 0 битых файлов, 0 битых анкоров**.

## Что не сработало

Теперь то, ради чего этот пост и написан.

**Линтер, который нельзя запустить локально, — иллюзия качества.** `markdownlint` в проекте не установлен, есть только конфиг `.markdownlint.json`, а проверка живёт в CI. Пока пишешь девять документов подряд, в них регулярно попадают то мелкие нарушения вокруг заголовков, то лишние пустые строки. Ошибка всплывёт в CI, после того как всё уже закоммичено и считаешь работу готовой.

**Указатель на «текущую» фичу потерял фокус.** `.specify/feature.json` до сих пор указывает на `002`. При пакетном создании спек нет «текущей» фичи, и агент молча продолжает считать текущей старую. Мелочь, но из-за неё команды смотрели не туда.

**Унаследованный дефект `002` остался.** В `specs/002-next-payload-trace/spec.md` нет раздела `## Out of Scope`. Я его нашёл и записал в долг, но не тронул: правка одного старого документа в волне из девяти новых — это расширение скоупа и риск потерять содержательное.

**Два модуля решил “не выделять”.** SIP-телефония и конвертация Markdown→Telegram в отдельные спеки не попали: они полностью покрыты `007` (функции-агенты) и `008` (провайдеры). Решение верное, но «почему не выделили» надо писать явно — иначе читается как пропуск.

**Переходные фазы SRS уехали в Edge Cases.** Например, «мягкое» предупреждение о неизвестном провайдере — это поведение, которое когда-то будет, а сейчас его нет. Спека описывает настоящее, поэтому такие вещи поехали в Edge Cases, чтобы не описывать будущее как факт.

**Версия контракта дрейфует.** Спеки волны цитируют **v4.11**, а фича `002` позже подняла контракт до **v4.12**. Само по себе это не дефект: каждая спека была верна на момент написания. Дефект — в отсутствии привычки сверять ссылки на версию перед публикацией и перед каждым планированием.

## Сводная таблица

| Что задумано | Что вышло | Что делаем иначе |
| --- | --- | --- |
| Не противоречить SRS | Ссылки на конкретные разделы, 83 проверки | Запускать проверку ссылок в каждом PR |
| Не дублировать контракты | Ссылки на арбитра вместо копий схем | Держать правило в конституции явно |
| Можно брать модуль в работу | Только `spec.md` + чек-лист, планов нет | Планировать поштучно, а не пачкой |
| Линт по проекту | CI-only, локально не запускается | Поставить lint в devDependencies |
| Один источник фокуса | `feature.json` застрял на `002` | Обновлять указатель при каждой фиче |

## Вывод

Пост-мортем по документам нужен так же, как по инциденту. Самый дорогой дефект в этой волне — не битая ссылка (её нашёл скрипт), а незамеченное противоречие между спеками: его не находит ни один линтер, только чтение.

А теперь возвращаемся к фиче `002` — как спека превращается в план.

---

[← Пост 5: девять модульных спек](/ru/dev/blog/sdd-05-nine-module-specs/) · [Пост 7: `/speckit.plan` →](/ru/dev/blog/sdd-07-plan-research-contract/)

<!-- lang:en -->

## What was planned

Split the whole system into specs such that: we do not contradict `docs/SRS/`, do not duplicate the schemas from `docs/CONTRACTS.md`, and get an artefact you can start any module from.

## How it was done

A sequence worth repeating if you attempt the same:

1. Re-read `001` and `002` as the style reference — all specs must look the same.
2. Read the whole `docs/SRS/SRS-00…SRS-09` corpus, `ARCHITECTURE.md` and the constitution.
3. Every spec got a "Context and sources" section linking to **specific** SRS sections and to `CONTRACTS`, not to whole documents.
4. Ran a programmatic check of relative links.

## What came out

Nine specs and nine checklists, all mandatory sections present. Links verified programmatically: **83 relative links — 0 broken files, 0 broken anchors**.

## What did not work

Now the reason this post exists at all.

**A linter you cannot run locally is an illusion of quality.** `markdownlint` is not installed in the project; only the `.markdownlint.json` config exists, while the check lives in CI. Writing nine documents in a row, you regularly introduce small issues around headings and stray blank lines. The error surfaces in CI, after everything is committed and you consider the work done.

**The "current feature" pointer lost focus.** `.specify/feature.json` still points at `002`. With batch spec creation there is no "current" feature, and the agent silently keeps treating the old one as current. A small thing, but commands looked the wrong way because of it.

**An inherited defect in `002` stayed.** `specs/002-next-payload-trace/spec.md` has no `## Out of Scope` section. I found it and recorded it as debt, but did not touch it: editing one old document in a wave of nine new ones is scope creep and a risk of losing something substantial.

**I decided "not to extract" two modules.** SIP telephony and Markdown→Telegram conversion did not become separate specs: they are fully covered by `007` (agent functions) and `008` (providers). The decision is right, but the "why not extracted" needs to be written explicitly — otherwise it reads as an omission.

**Transitional SRS phases went to Edge Cases.** For example, a "soft" warning about an unknown provider — behaviour that will exist some day and does not exist now. A spec describes the present, so such things went to Edge Cases instead of describing the future as a fact.

**The contract version drifts.** Specs in the wave quote **v4.11**, while feature `002` later bumped the contract to **v4.12**. That is not a defect in itself: each spec was correct when written. The defect is the missing habit of re-checking version references before publication and before every planning session.

## Summary table

| What was planned | What came out | What we do differently |
| --- | --- | --- |
| Not contradict SRS | Links to concrete sections, 83 checks | Run the link check in every PR |
| Not duplicate contracts | References to the arbiter instead of copied schemas | Keep the rule in the constitution explicitly |
| Any module can be started | Only `spec.md` + checklist, no plans | Plan one at a time, not in batches |
| Lint across the project | CI-only, not runnable locally | Add lint to devDependencies |
| A single focus source | `feature.json` stuck at `002` | Update the pointer with every feature |

## Conclusion

A post-mortem on documents is as necessary as one on an incident. The most expensive defect in this wave was not a broken link (a script found those) but an unnoticed contradiction between specs: no linter finds that, only reading.

And now back to feature `002` — how a spec turns into a plan.

---

[← Post 5: nine module specs](/en/dev/blog/sdd-05-nine-module-specs/) · [Post 7: `/speckit.plan` →](/en/dev/blog/sdd-07-plan-research-contract/)

<!-- lang:he -->

## מה תוכנן

לפרק את כל המערכת למפרטים כך שלא נסתור את `docs/SRS/`, לא נכפיל סכמות מתוך `docs/CONTRACTS.md`, ונקבל ארטיפקט שאפשר להתחיל ממנו כל מודול.

## איך זה נעשה

רצף שכדאי לחזור עליו אם מנסים את אותו דבר:

1. קראתי מחדש את `001` ו-`002` כסטנדרט סגנון — כל המפרטים צריכים להיראות אותו דבר.
2. קראתי את כל קורפוס `docs/SRS/SRS-00…SRS-09`, את `ARCHITECTURE.md` ואת החוקה.
3. כל מפרט קיבל סעיף "הקשר ומקורות" עם הפניות ל**סעיפים ספציפיים** ב-SRS ול-`CONTRACTS`, ולא למסמכים שלמים.
4. הרצתי בדיקה אוטומטית של קישורים יחסיים.

## מה יצא

תשעה מפרטים ותשעה צ'ק-ליסטים, כל הסעיפים החובה במקום. הקישורים נבדקו אוטומטית: **83 קישורים יחסיים — 0 קבצים שבורים, 0 עמודים חסרים**.

## מה לא עבד

ועכשיו הסיבה שהפוסט הזה קיים בכלל.

**לינטר שאי אפשר להריץ מקומית הוא אשליית איכות.** `markdownlint` לא מותקן בפרויקט, יש רק את הקונפיג `.markdownlint.json`, והבדיקה חיה ב-CI. כשכותבים תשעה מסמכים ברצף, בהם מופיעים מדי פעם ליקויים קטנים סביב כותרות ושורות ריקות מיותרות. השגיאה צפה ב-CI, אחרי שהכל כבר ב-commit ואתה מחשיב את העבודה לגמורה.

**מצביע "הפיצ'ר הנוכחי" איבד פוקוס.** `.specify/feature.json` עדיין מצביע על `002`. ביצירת מפרטים בכמות אין "פיצ'ר נוכחי", והסוכן בשקט ממשיך להתייחס לישן כאל נוכחי. דבר קטן, אבל בגללו פקודות הסתכלו לכיוון הלא נכון.

**פגם בירושה ב-`002` נשאר.** ב-`specs/002-next-payload-trace/spec.md` אין סעיף `## Out of Scope`. מצאתי ורשמתי כחוב, אבל לא נגעתי: עריכת מסמך ישן אחד בתוך גל של תשעה חדשים היא הרחבת סקופ וסיכון לאבד משהו מהותי.

**החלטתי "לא להוציא" שני מודולים.** טלפוניית SIP והמרת Markdown→Telegram לא הפכו למפרטים נפרדים: הם מכוסים לגמרי ב-`007` (פונקציות סוכן) ו-`008` (ספקים). ההחלטה נכונה, אבל את ה"למה לא הוצא" צריך לכתוב במפורש — אחרת זה נקרא כמו פספוס.

**שלבי מעבר של SRS עברו ל-Edge Cases.** למשל אזהרה "רכה" על ספק לא מוכר — התנהגות שתהיה מתישהו והיום אין. מפרט מתאר את ההווה, ולכן דברים כאלה עברו ל-Edge Cases, במקום לתאר את העתיד כעובדה.

**גרסת החוזה נסחפת.** המפרטים בגל מצטטים **v4.11**, ואילו הפיצ'ר `002` העלה אחר כך את החוזה ל-**v4.12**. זה לא פגם בפני עצמו: כל מפרט היה נכון בזמן הכתיבה. הפגם הוא בהיעדר הרגל לבדוק הפניות לגרסה לפני פרסום ולפני כל תכנון.

## טבלת סיכום

| מה תוכנן | מה יצא | מה עושים אחרת |
| --- | --- | --- |
| לא לסתור את SRS | הפניות לסעיפים קונקרטיים, 83 בדיקות | להריץ בדיקת קישורים בכל PR |
| לא להכפיל חוזים | הפניות לבורר במקום סכמות מועתקות | לקבוע את הכלל בחוקה במפורש |
| אפשר להתחיל מכל מודול | רק `spec.md` + צ'ק-ליסט, אין תוכניות | לתכנן אחד-אחד, לא בכמות |
| לינט בכל הפרויקט | רק ב-CI, לא ניתן להרצה מקומית | להוסיף lint ל-devDependencies |
| מקור פוקוס אחד | `feature.json` תקוע על `002` | לעדכן את המצביע בכל פיצ'ר |

## מסקנה

פוסט-מורטם על מסמכים נדרש בדיוק כמו פוסט-מורטם על אירוע. הפגם היקר ביותר בגל הזה הוא לא קישור שבור (אותו מצא סקריפט) אלא סתירה שלא שמו לב אליה בין מפרטים: אותה לא מוצא שום לינטר, רק קריאה.

ועכשיו חוזרים לפיצ'ר `002` — איך מפרט הופך לתוכנית.

---

[← פוסט 5: תשעה מפרטי מודול](/he/dev/blog/sdd-05-nine-module-specs/) · [פוסט 7: `/speckit.plan` →](/he/dev/blog/sdd-07-plan-research-contract/)
