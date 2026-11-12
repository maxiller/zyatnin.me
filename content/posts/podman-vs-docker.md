---
slug: podman-vs-docker
view: dev
date: 2026-02-24
tags: ["podman", "containers"]
translations:
  ru:
    title: "Почему я предпочитаю Podman вместо Docker"
    excerpt: "Rootless-контейнеры без демона и поды с изолированной средой: почему Podman — мой выбор по умолчанию вместо Docker."
  en:
    title: "Why I prefer Podman over Docker"
    excerpt: "Rootless containers without a daemon and pods with an isolated environment: why Podman is my default choice over Docker."
  he:
    title: "למה אני מעדיף Podman על פני Docker"
    excerpt: "קונטיינרים rootless בלי daemon ופודים עם סביבה מבודדת: למה Podman הוא ברירת המחדל שלי על פני Docker."
---

<!-- lang:ru -->

## Введение

Выбор рантайма — не вопрос веры, а инженерный расчёт: важны модель безопасности, интеграция с окружением и стоимость сопровождения. Для моих задач — инфраструктура поддержки, автоматизация, локальные и серверные окружения — по умолчанию я выбираю Podman. Причины две: работа без привилегий и поды.

## Rootless: контейнеры без рута

В Docker демон работает с правами root, а клиенты обращаются к нему через docker.sock. У кого доступ к сокету — у того фактически root на хосте; это известный вектор компрометации. В Podman контейнеры запускаются от имени обычного пользователя: rootless — не опция, а поведение по умолчанию. Практические следствия:

- нет фонового демона с root-привилегиями, поверхность атаки заметно меньше;
- контейнер живёт в пределах прав пользователя и user namespace;
- сервисы корректно интегрируются с systemd через `systemctl --user` и quadlets — без root в цепочке запуска.

Rootless не решает всё: нужно настроить subuid/subgid, у некоторых образов встречаются нюансы с портами ниже 1024. Но настройка одноразовая, а выигрыш в безопасности постоянный.

## Поды: изолированная среда вместо sidecar на хосте

Вторая причина — поды. Podman-под — это группа контейнеров с общим network namespace вокруг инфраструктурного контейнера: локальный интерфейс, общие порты. Всё, что взаимодействует между собой, живёт внутри одного пода.

Это меняет подход к вспомогательным процессам. В docker-compose sidecar стоит рядом с основным сервисом на хосте: связь через пользовательскую сеть хоста, порты открываются наружу хоста. В Podman sidecar живёт внутри пода: SSH-туннель, локальный прокси, одноразовый воркер — компоненты, невидимые хосту, при этом под является замкнутой средой. В моих задачах это выглядит так: воркер с очередями и эфемерный sidecar-контейнер с SSH-туннелем запускаются и завершаются внутри пода, не трогая сетевую конфигурацию хоста.

Подробнее об этом паттерне — в статьях про [эфемерные sidecar-поды](/ru/blog/ephemeral-sidecar-podman-pods/) и [мультиочередевые воркеры](/ru/blog/multi-queue-worker-rq-podman/).

## Daemonless и systemd

Podman работает без центрального демона: каждый контейнер — обычный процесс, управляемый системным окружением. Отсюда естественная интеграция с systemd: quadlet-юниты описывают контейнеры и поды как обычные сервисы, зависимости, перезапуски и журналы — всё нативно. GitLab Runner у меня живёт именно так.

## Совместимость

Переход безболезненный: CLI совместим (`alias docker=podman` работает в большинстве случаев), образы OCI взаимозаменяемы, compose-файлы поддерживаются. Миграция обычно сводится к правкам CI-скриптов, а не к переписыванию инфраструктуры.

## Когда Docker остаётся уместным

Справедливости ради: если проект завязан на Docker Swarm, специфичные инструменты экосистемы или корпоративные политики, Docker — рабочий выбор. Я описываю свой дефолт для новых задач, а не запрет.

## Заключение

Podman выигрывает там, где важны минимальные привилегии и аккуратная изоляция вспомогательных процессов: rootless по умолчанию и поды с изолированной средой вместо sidecar на хосте. Поэтому для инфраструктуры поддержки и автоматизации это мой выбор по умолчанию.

<!-- lang:en -->

## Introduction

Choosing a runtime is an engineering question, not a matter of faith: what matters is the security model, integration with the environment and the cost of maintenance. For my tasks — support infrastructure, automation, local and server environments — Podman is my default. Two reasons: rootless operation and pods.

## Rootless: containers without root

In Docker the daemon runs as root and clients talk to it through docker.sock. Whoever has access to the socket effectively has root on the host — a well-known compromise vector. In Podman containers run as an unprivileged user: rootless mode is not an option but the default behavior. Practical consequences:

- no background root daemon, a much smaller attack surface;
- the container lives within the user's rights and the user namespace;
- services integrate cleanly with systemd through `systemctl --user` and quadlets — no root in the startup chain.

Rootless does not solve everything: subuid/subgid need configuring, and some images have quirks with ports below 1024. But the setup is one-time and the security gain is permanent.

## Pods: an isolated environment instead of sidecars on the host

The second reason is pods. A Podman pod is a group of containers sharing one network namespace around an infra container: a local interface, shared ports. Everything that interacts lives inside one pod.

This changes how auxiliary processes are handled. In docker-compose a sidecar sits next to the main service on the host: it communicates through the host's user-defined network, and ports open onto the host itself. In Podman the sidecar lives inside the pod: an SSH tunnel, a local proxy, an ephemeral worker — components invisible to the host, with the pod as a closed environment. In my work this looks like: a queue worker and an ephemeral sidecar container with an SSH tunnel start and die inside the pod without touching the host network configuration.

More on this pattern in the articles on [ephemeral sidecar pods](/en/blog/ephemeral-sidecar-podman-pods/) and [multi-queue workers](/en/blog/multi-queue-worker-rq-podman/).

## Daemonless and systemd

Podman works without a central daemon: every container is a plain process managed by the surrounding init system. Hence the natural systemd integration: quadlet units describe containers and pods as ordinary services — dependencies, restarts and journals are all native. My GitLab Runner lives exactly this way.

## Compatibility

The migration is painless: the CLI is compatible (`alias docker=podman` works in most cases), OCI images are interchangeable, compose files are supported. Migration usually amounts to touching CI scripts, not rewriting infrastructure.

## When Docker still makes sense

To be fair: if a project is tied to Docker Swarm, specific ecosystem tooling or corporate policies, Docker is a legitimate choice. I am describing my default for new work, not a ban.

## Conclusion

Podman wins where minimal privileges and careful isolation of auxiliary processes matter: rootless by default, and pods with an isolated environment instead of sidecars on the host. That makes it my default choice for support infrastructure and automation.

<!-- lang:he -->

## מבוא

בחירת רנטיים היא שאלה הנדסית ולא עניין של אמונה: חשובים מודל האבטחה, האינטגרציה עם הסביבה ועלות התחזוקה. למשימות שלי — תשתית תמיכה, אוטומציה, סביבות מקומיות ושרתים — Podman הוא ברירת המחדל שלי. שתי סיבות: עבודה בלי הרשאות ופודים.

## Rootless: קונטיינרים בלי root

ב-Docker ה-daemon רץ עם הרשאות root והלקוחות פונים אליו דרך docker.sock. מי שיש לו גישה ל-socket — למעשה יש לו root על המארח; וקטור פריצה מוכר. ב-Podman קונטיינרים רצים מטעם המשתמש: מצב rootless אינו אופציה אלא התנהגות ברירת מחדל. השלכות מעשיות:

- אין daemon רקע עם הרשאות root, משטח התקפה קטן משמעותית;
- הקונטיינר חי בגבולות הרשאות המשתמש וה-user namespace;
- שירותים משתלבים עם systemd דרך `systemctl --user` ו-quadlets — בלי root בשרשור ההפעלה.

Rootless לא פותר הכל: צריך להגדיר subuid/subgid, ולתמונות מסוימות יש ניואנסים עם פורטים מתחת ל-1024. אבל ההגדרה חד-פעמית והרווח באבטחה קבוע.

## פודים: סביבה מבודדת במקום sidecar על המארח

הסיבה השנייה — פודים. פוד של Podman הוא קבוצת קונטיינרים עם network namespace משותף סביב קונטיינר תשתית (infra): ממשק מקומי, פורטים משותפים. כל מה שמדבר בינו לבין עצמו חי בתוך פוד אחד.

זה משנה את הגישה לתהליכי עזר. ב-docker-compose ה-sidecar יושב לצד השירות הראשי על המארח: קישוריות דרך רשת המשתמש של המארח, פורטים נפתחים כלפי חוץ של המארח. ב-Podman ה-sidecar חי בתוך הפוד: מנהרת SSH, פרוקסי מקומי, וורקר חד-פעמי — רכיבים בלתי נראים למארח, כשהפוד הוא סביבה סגורה. אצלי זה נראה כך: וורקר עם תורים וקונטיינר sidecar אפמרלי למנהרת SSH נדלקים ונכבים בתוך הפוד, בלי לגעת בתצורת הרשת של המארח.

עוד על התבנית הזו — במאמרים על [פודי sidecar אפמרליים](/he/blog/ephemeral-sidecar-podman-pods/) ועל [וורקרים רב-תוריים](/he/blog/multi-queue-worker-rq-podman/).

## Daemonless ו-systemd

Podman עובד בלי daemon מרכזי: כל קונטיינר הוא תהליך רגיל שמנוהל על ידי סביבת האתחול. מכאן אינטגרציה טבעית עם systemd: יחידות quadlet מתארות קונטיינרים ופודים כשירותים רגילים — תלויות, אתחולים ויומנים, הכל נטיבי. GitLab Runner שלי חי בדיוק כך.

## תאימות

המעבר נטול כאבים: שורת הפקודה תואמת (`alias docker=podman` עובד ברוב המקרים), תמונות OCI ניתנות להחלפה, קבצי compose נתמכים. הגירה בדרך כלל מסתכמת בעדכון סקריפטים ב-CI ולא בכתיבה מחדש של תשתית.

## מתי Docker עדיין מתאים

לשם ההגינות: אם פרויקט קשור ל-Docker Swarm, לכלי אקוסיסטם ספציפיים או למדיניות ארגונית — Docker הוא בחירה לגיטימית. אני מתאר את ברירת המחדל שלי למשימות חדשות, ולא איסור.

## סיכום

Podman מנצח שם שחשובות הרשאות מינימליות ובידוד זהיר של תהליכי עזר: rootless כברירת מחדל ופודים עם סביבה מבודדת במקום sidecar על המארח. לכן לתשתית תמיכה ואוטומציה זו בחירת ברירת המחדל שלי.
