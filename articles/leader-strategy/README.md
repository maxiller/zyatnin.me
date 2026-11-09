# Шаблоны статей: серия «Стратегия управления поддержкой» (SP-01–SP-25)

25 шаблонов статей для блога лида технической поддержки: вид «Лидер» (`view: leader`), метки `team-leadership` и `support-management`, язык — русский (сначала ru-версии; en/he — переводами по готовности).

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
6. Даты в таблице и в front matter — даты публикации. Серия SP-03–SP-25 выходит единым блоком: одна статья каждые 2–3 дня с 2026-11-10 по 2027-01-09. У опубликованных статей (SP-01, SP-02) стоит фактическая дата публикации; у остальных — назначенная при выпуске блока. При переносе выхода меняйте дату сразу в таблице и в трёх файлах статьи (`src/{ru,en,he}/posts/<slug>.md`).
7. Доводка до публикации (переводы en/he, схемы mermaid, проверки) — единым промптом [prompt-finalize-article.md](../prompt-finalize-article.md): черновик пишется на русском, затем применяется промпт целиком.

## Серия и план выхода

| ID | Файл | Статья | Тип | Плановый выход | Источник |
| --- | --- | --- | --- | --- | --- |
| SP-01 | опубликована → `src/ru/posts/support-lead-five-results.md` | Пять результатов работы лида поддержки | Стратегия | 2026-03-31 (факт) | §1.1 |
| SP-02 | опубликована → `src/ru/posts/support-lead-boundaries.md` | Границы ответственности: что лид делает сам, делегирует и от чего отказывается | Стратегия | 2026-06-07 (факт) | §1.2 |
| SP-03 | опубликована → `src/ru/posts/support-lead-baseline-first.md` | Baseline раньше целей: почему годовые планы проваливаются на старте | Стратегия | 2026-11-10 | §1.3 |
| SP-04 | опубликована → `src/ru/posts/support-lead-year-roadmap.md` | Год лида по кварталам: дорожная карта на 12 месяцев | Стратегия | 2026-11-13 | §2 |
| SP-05 | [support-lead-service-map-baseline.md](support-lead-service-map-baseline.md) | Карта сервиса и Точка А: диагностика первого месяца | Стратегия | 2026-11-15 | §2 (месяц 1) |
| SP-06 | [support-lead-triage-first-touch.md](support-lead-triage-first-touch.md) | Триаж при первом касании: категория, критичность, маршрут | Оператив | 2026-11-18 | §4.1 |
| SP-07 | [support-lead-no-silent-sla.md](support-lead-no-silent-sla.md) | Ни одного тихого нарушения SLA: еженедельный контроль очереди | Оператив | 2026-11-21 | §4.2 |
| SP-08 | [support-lead-l3-escalation.md](support-lead-l3-escalation.md) | Эскалация в L3: пакет, OLA и владелец клиента | Оператив | 2026-11-24 | §4.3 |
| SP-09 | [support-lead-kcs-workflow.md](support-lead-kcs-workflow.md) | KCS в рабочем потоке: статья пишется в момент решения | Стратегия | 2026-11-26 | §4.7 |
| SP-10 | [support-lead-kb-template.md](support-lead-kb-template.md) | Шаблон статьи базы знаний и владелец КБ | Оператив | 2026-11-29 | §4.7 |
| SP-11 | [support-lead-recurring-problems.md](support-lead-recurring-problems.md) | Повторяющиеся проблемы: от потока тикетов к записям с владельцем | Оператив | 2026-12-02 | §4.8 |
| SP-12 | [support-lead-shift-left-pilot.md](support-lead-shift-left-pilot.md) | Самообслуживание как Shift Left: пилот с честным измерением | Оператив | 2026-12-05 | месяц 7 |
| SP-13 | [support-lead-rhythm-40-percent.md](support-lead-rhythm-40-percent.md) | Ритм руководителя: правило 40 % | Стратегия | 2026-12-07 | §3 |
| SP-14 | [support-lead-one-on-one.md](support-lead-one-on-one.md) | 1:1, которые не превращаются в отчёт и аттестацию | Оператив | 2026-12-10 | §5 |
| SP-15 | [support-lead-facts-based-assessment.md](support-lead-facts-based-assessment.md) | Оценка по наблюдаемым фактам: QA-выборка и шесть критериев | Оператив | 2026-12-13 | §6.1–6.3 |
| SP-16 | [support-lead-competency-matrix.md](support-lead-competency-matrix.md) | Матрица компетенций: закрываем одноточечные риски | Оператив | 2026-12-15 | §6.4 |
| SP-17 | [support-lead-capacity-planning.md](support-lead-capacity-planning.md) | Мощность вместо героизма: расчёт потребности в инженерах | Стратегия | 2026-12-18 | месяц 9 |
| SP-18 | [support-lead-interaction-matrix.md](support-lead-interaction-matrix.md) | Матрица взаимодействий: кто решает и по каким вопросам | Стратегия | 2026-12-21 | §7.1 |
| SP-19 | [support-lead-management-status.md](support-lead-management-status.md) | Статус руководству: письмо на страницу и часовой обзор | Оператив | 2026-12-24 | §7.2 |
| SP-20 | [support-lead-ask-for-decisions.md](support-lead-ask-for-decisions.md) | Просить решения, а не сочувствия: эскалация и запрос ресурсов | Оператив | 2026-12-26 | §7.5 |
| SP-21 | [support-lead-blameless-postmortem.md](support-lead-blameless-postmortem.md) | Blameless-разбор инцидента: хронология без имён | Оператив | 2026-12-29 | §7.6 |
| SP-22 | [support-lead-problem-card.md](support-lead-problem-card.md) | Карточка проблемы для продукта, которую не закрыть без статуса | Стратегия | 2026-12-31 | §7.7 |
| SP-23 | [support-lead-metric-passport.md](support-lead-metric-passport.md) | Метрика без действия — это картинка: паспорт метрики | Стратегия | 2027-01-04 | §8 |
| SP-24 | [support-lead-resilience-audit.md](support-lead-resilience-audit.md) | Аудит живучести: что сломается, когда вас не будет | Оператив | 2027-01-06 | §4.9 |
| SP-25 | [support-lead-nine-mistakes.md](support-lead-nine-mistakes.md) | Девять ошибок лида поддержки — и годовой отчёт | Стратегия | 2027-01-09 | §9 |

## Блоки серии

- Блок 1 — Стратегическая рамка года: SP-01–SP-04.
- Блок 2 — Стабилизация сервиса: SP-05–SP-08.
- Блок 3 — Знания как система: SP-09–SP-12.
- Блок 4 — Команда: люди и развитие: SP-13–SP-17.
- Блок 5 — Внешний контур: SP-18–SP-22.
- Блок 6 — Метрики и замыкание года: SP-23–SP-25.
