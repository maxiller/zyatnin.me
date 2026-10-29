# Шаблоны статей: серия «Стратегия управления поддержкой» (SP-01–SP-25)

25 шаблонов статей для блога лида технической поддержки: вид «Лидер» (`view: leader`), топик `t6` «Клиентский успех», язык — русский (сначала ru-версии; en/he — переводами по готовности).

Источник планов: тред [Article backlog](delta://thread/ksQQH3_z1IdBSlK6RkFX_uWFG5LOAAOCfpIBxBBvlrjKtvRE-50aB7eqdzP1) — `content-plan.md` (серия, блоки, ритм) и `article-plans.md` (тезис и каркас каждой статьи).

## Как работать с шаблоном

1. Каталог `articles/` не участвует в сборке сайта (Eleventy обрабатывает только `src/`), поэтому шаблоны не видны на публике.
2. Front matter готов по схеме [SRS 7.1](../../docs/SRS.md#71-схема-front-matter) с обязательным полем `view: leader`; при публикации правится только `date`.
3. Каркас разделов — заголовки H2; руководства для автора и «вилки» (места для данных из трекера и практики) — в HTML-комментариях `<!-- … -->`: они видны при редактировании и не попадают в HTML сайта.
4. Публикация заполненной статьи — перемещение файла без правок:

   ```sh
   git mv articles/leader-strategy/<slug>.md src/ru/posts/<slug>.md
   ```

5. Соседние статьи серии связываются ссылками в тексте (подсказка — в шапке каждого шаблона); SP-04 играет роль оглавления серии.
6. Даты в таблице и в front matter — плановые: ритм «одна статья в две недели», старт — понедельник 2026-11-02. При публикации поправьте дату на фактическую.
7. Доводка до публикации (переводы en/he, схемы mermaid, проверки) — единым промптом [prompt-finalize-article.md](../prompt-finalize-article.md): черновик пишется на русском, затем применяется промпт целиком.

## Серия и план выхода

| ID | Файл | Статья | Тип | Плановый выход | Источник |
| --- | --- | --- | --- | --- | --- |
| SP-01 | опубликована → `src/ru/posts/support-lead-five-results.md` | Пять результатов работы лида поддержки | Стратегия | 2026-11-02 | §1.1 |
| SP-02 | [support-lead-boundaries.md](support-lead-boundaries.md) | Границы ответственности: что лид делает сам, делегирует и от чего отказывается | Стратегия | 2026-11-16 | §1.2 |
| SP-03 | [support-lead-baseline-first.md](support-lead-baseline-first.md) | Baseline раньше целей: почему годовые планы проваливаются на старте | Стратегия | 2026-11-30 | §1.3 |
| SP-04 | [support-lead-year-roadmap.md](support-lead-year-roadmap.md) | Год лида по кварталам: дорожная карта на 12 месяцев | Стратегия | 2026-12-14 | §2 |
| SP-05 | [support-lead-service-map-baseline.md](support-lead-service-map-baseline.md) | Карта сервиса и Точка А: диагностика первого месяца | Стратегия | 2026-12-28 | §2 (месяц 1) |
| SP-06 | [support-lead-triage-first-touch.md](support-lead-triage-first-touch.md) | Триаж при первом касании: категория, критичность, маршрут | Оператив | 2027-01-11 | §4.1 |
| SP-07 | [support-lead-no-silent-sla.md](support-lead-no-silent-sla.md) | Ни одного тихого нарушения SLA: еженедельный контроль очереди | Оператив | 2027-01-25 | §4.2 |
| SP-08 | [support-lead-l3-escalation.md](support-lead-l3-escalation.md) | Эскалация в L3: пакет, OLA и владелец клиента | Оператив | 2027-02-08 | §4.3 |
| SP-09 | [support-lead-kcs-workflow.md](support-lead-kcs-workflow.md) | KCS в рабочем потоке: статья пишется в момент решения | Стратегия | 2027-02-22 | §4.7 |
| SP-10 | [support-lead-kb-template.md](support-lead-kb-template.md) | Шаблон статьи базы знаний и владелец КБ | Оператив | 2027-03-08 | §4.7 |
| SP-11 | [support-lead-recurring-problems.md](support-lead-recurring-problems.md) | Повторяющиеся проблемы: от потока тикетов к записям с владельцем | Оператив | 2027-03-22 | §4.8 |
| SP-12 | [support-lead-shift-left-pilot.md](support-lead-shift-left-pilot.md) | Самообслуживание как Shift Left: пилот с честным измерением | Оператив | 2027-04-05 | месяц 7 |
| SP-13 | [support-lead-rhythm-40-percent.md](support-lead-rhythm-40-percent.md) | Ритм руководителя: правило 40 % | Стратегия | 2027-04-19 | §3 |
| SP-14 | [support-lead-one-on-one.md](support-lead-one-on-one.md) | 1:1, которые не превращаются в отчёт и аттестацию | Оператив | 2027-05-03 | §5 |
| SP-15 | [support-lead-facts-based-assessment.md](support-lead-facts-based-assessment.md) | Оценка по наблюдаемым фактам: QA-выборка и шесть критериев | Оператив | 2027-05-17 | §6.1–6.3 |
| SP-16 | [support-lead-competency-matrix.md](support-lead-competency-matrix.md) | Матрица компетенций: закрываем одноточечные риски | Оператив | 2027-05-31 | §6.4 |
| SP-17 | [support-lead-capacity-planning.md](support-lead-capacity-planning.md) | Мощность вместо героизма: расчёт потребности в инженерах | Стратегия | 2027-06-14 | месяц 9 |
| SP-18 | [support-lead-interaction-matrix.md](support-lead-interaction-matrix.md) | Матрица взаимодействий: кто решает и по каким вопросам | Стратегия | 2027-06-28 | §7.1 |
| SP-19 | [support-lead-management-status.md](support-lead-management-status.md) | Статус руководству: письмо на страницу и часовой обзор | Оператив | 2027-07-12 | §7.2 |
| SP-20 | [support-lead-ask-for-decisions.md](support-lead-ask-for-decisions.md) | Просить решения, а не сочувствия: эскалация и запрос ресурсов | Оператив | 2027-07-26 | §7.5 |
| SP-21 | [support-lead-blameless-postmortem.md](support-lead-blameless-postmortem.md) | Blameless-разбор инцидента: хронология без имён | Оператив | 2027-08-09 | §7.6 |
| SP-22 | [support-lead-problem-card.md](support-lead-problem-card.md) | Карточка проблемы для продукта, которую не закрыть без статуса | Стратегия | 2027-08-23 | §7.7 |
| SP-23 | [support-lead-metric-passport.md](support-lead-metric-passport.md) | Метрика без действия — это картинка: паспорт метрики | Стратегия | 2027-09-06 | §8 |
| SP-24 | [support-lead-resilience-audit.md](support-lead-resilience-audit.md) | Аудит живучести: что сломается, когда вас не будет | Оператив | 2027-09-20 | §4.9 |
| SP-25 | [support-lead-nine-mistakes.md](support-lead-nine-mistakes.md) | Девять ошибок лида поддержки — и годовой отчёт | Стратегия | 2027-10-04 | §9 |

## Блоки серии

- Блок 1 — Стратегическая рамка года: SP-01–SP-04.
- Блок 2 — Стабилизация сервиса: SP-05–SP-08.
- Блок 3 — Знания как система: SP-09–SP-12.
- Блок 4 — Команда: люди и развитие: SP-13–SP-17.
- Блок 5 — Внешний контур: SP-18–SP-22.
- Блок 6 — Метрики и замыкание года: SP-23–SP-25.
