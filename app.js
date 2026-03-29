/* ============================================
   zyatnin.me — Application JavaScript
   Theme toggle, language switcher, translations
   ============================================ */

// ---- State ----
let currentLang = 'ru';
let currentTheme = 
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// ---- Translations (shared across all pages) ----
const T = {
  // Navigation
  nav: {
    ru: { about: 'Обо мне', projects: 'Проекты', blog: 'Блог' },
    en: { about: 'About', projects: 'Projects', blog: 'Blog' },
    he: { about: 'אודות', projects: 'פרויקטים', blog: 'בלוג' }
  },

  // Hero
  hero: {
    ru: {
      greeting: 'Привет, я',
      name: 'Max Zia',
      title: 'IT-инженер / DevOps-специалист',
      desc: 'Руковожу отделом L3-поддержки. Специализируюсь на контейнеризации с Podman, автоматизации на Python и CI/CD. Строю надёжные инфраструктурные решения для продакшена.',
      cta_projects: 'Проекты',
      cta_blog: 'Читать блог',
      terminal_1: 'podman pod create --name jira-stack',
      terminal_2: 'rq worker --with-scheduler jira asterisk',
      terminal_3: 'systemctl --user enable container-runner.service',
      terminal_4: '# всё работает ✓'
    },
    en: {
      greeting: "Hi, I'm",
      name: 'Max Zia',
      title: 'IT Engineer / DevOps Specialist',
      desc: 'Department head for L3 support. I specialize in containerization with Podman, Python automation, and CI/CD pipelines. Building reliable infrastructure solutions for production.',
      cta_projects: 'Projects',
      cta_blog: 'Read Blog',
      terminal_1: 'podman pod create --name jira-stack',
      terminal_2: 'rq worker --with-scheduler jira asterisk',
      terminal_3: 'systemctl --user enable container-runner.service',
      terminal_4: '# all systems go ✓'
    },
    he: {
      greeting: 'שלום, אני',
      name: 'Max Zia',
      title: 'מהנדס IT / מומחה DevOps',
      desc: 'מנהל מחלקת תמיכה L3. מתמחה בקונטיינריזציה עם Podman, אוטומציה ב-Python וצינורות CI/CD. בונה פתרונות תשתית אמינים לסביבות ייצור.',
      cta_projects: 'פרויקטים',
      cta_blog: 'קראו את הבלוג',
      terminal_1: 'podman pod create --name jira-stack',
      terminal_2: 'rq worker --with-scheduler jira asterisk',
      terminal_3: 'systemctl --user enable container-runner.service',
      terminal_4: '# הכל עובד ✓'
    }
  },

  // About
  about: {
    ru: {
      label: 'Обо мне',
      title: 'Инженер и руководитель',
      p1: 'Руковожу отделом L3-поддержки в компании «Айса Ай-Ти Сервис», обеспечивая экспертную поддержку VDI-платформы TermiDesk. Моя команда занимается сложными инцидентами, требующими глубокого понимания инфраструктуры виртуализации.',
      p2: 'В повседневной работе использую контейнеризацию (Podman), автоматизацию на Python и CI/CD-пайплайны для оптимизации процессов поддержки. Разрабатываю внутренние инструменты — от Telegram-ботов до систем мониторинга Jira.',
      tech_title: 'Технологии',
      interests_title: 'Интересы',
      interest_1: 'Linux-десктопы и оконные менеджеры',
      interest_2: 'Оркестрация контейнеров',
      interest_3: 'VoIP и телефония',
      interest_4: 'Сетевая инфраструктура',
      stat_1_value: 'L3',
      stat_1_label: 'Уровень поддержки',
      stat_2_value: '7+',
      stat_2_label: 'Проектов',
      stat_3_value: 'Podman',
      stat_3_label: 'Контейнеризация',
      stat_4_value: 'Python',
      stat_4_label: 'Автоматизация'
    },
    en: {
      label: 'About',
      title: 'Engineer & Team Lead',
      p1: 'I lead the L3 support department at Aisa IT Service, providing expert-level support for the TermiDesk VDI platform. My team handles complex incidents requiring deep understanding of virtualization infrastructure.',
      p2: 'In my daily work I leverage containerization (Podman), Python automation, and CI/CD pipelines to optimize support processes. I build internal tools — from Telegram bots to Jira monitoring systems.',
      tech_title: 'Technologies',
      interests_title: 'Interests',
      interest_1: 'Linux desktop environments',
      interest_2: 'Container orchestration',
      interest_3: 'VoIP and telephony',
      interest_4: 'Network infrastructure',
      stat_1_value: 'L3',
      stat_1_label: 'Support Level',
      stat_2_value: '7+',
      stat_2_label: 'Projects',
      stat_3_value: 'Podman',
      stat_3_label: 'Containerization',
      stat_4_value: 'Python',
      stat_4_label: 'Automation'
    },
    he: {
      label: 'אודות',
      title: 'מהנדס ומנהל צוות',
      p1: 'אני מנהל את מחלקת התמיכה L3 ב-Aisa IT Service, ומספק תמיכה ברמת מומחה לפלטפורמת VDI של TermiDesk. הצוות שלי מטפל באירועים מורכבים הדורשים הבנה עמוקה של תשתיות וירטואליזציה.',
      p2: 'בעבודה היומיומית אני משתמש בקונטיינריזציה (Podman), אוטומציה ב-Python וצינורות CI/CD לייעול תהליכי תמיכה. אני בונה כלים פנימיים — מבוטים בטלגרם ועד מערכות ניטור ל-Jira.',
      tech_title: 'טכנולוגיות',
      interests_title: 'תחומי עניין',
      interest_1: 'סביבות שולחן עבודה של Linux',
      interest_2: 'אורקסטרציית קונטיינרים',
      interest_3: 'VoIP וטלפוניה',
      interest_4: 'תשתיות רשת',
      stat_1_value: 'L3',
      stat_1_label: 'רמת תמיכה',
      stat_2_value: '7+',
      stat_2_label: 'פרויקטים',
      stat_3_value: 'Podman',
      stat_3_label: 'קונטיינריזציה',
      stat_4_value: 'Python',
      stat_4_label: 'אוטומציה'
    }
  },

  // Projects
  projects: {
    ru: {
      label: 'Проекты',
      title: 'Избранные проекты',
      items: [
        { name: 'jira-alert-daemon', desc: 'Контейнеризированный Python-демон для уведомлений из Jira. Использует RQ-воркеры, очередь Valkey и SSH-туннели внутри Podman-пода.', tags: ['Python', 'Podman', 'RQ', 'Valkey', 'Jira API'], icon: '🔔' },
        { name: 'Telegram-Jira Bot', desc: 'Telegram-бот на aiogram, который принимает задачи и ставит их в очередь RQ/Valkey для фоновой обработки воркерами.', tags: ['aiogram', 'RQ', 'Valkey', 'Podman'], icon: '🤖' },
        { name: 'Container Orchestration Pipeline', desc: 'Кастомный паттерн диспетчер/воркер с Podman-подами и эфемерными sidecar-контейнерами для SSH-туннелей.', tags: ['Podman', 'Python', 'SSH', 'Pods'], icon: '⚙️' },
        { name: 'AmneziaWG Deploy', desc: 'Контейнеризированный шаблон развёртывания WireGuard с CI/CD-пайплайном для автоматической конфигурации.', tags: ['WireGuard', 'CI/CD', 'Podman', 'GitLab'], icon: '🔐' },
        { name: 'CI/CD Infrastructure', desc: 'Контейнеризация GitLab Runner с Podman quadlets и интеграцией systemd для управления пайплайнами.', tags: ['GitLab CI', 'Podman', 'Quadlets', 'systemd'], icon: '🚀' },
        { name: 'ITIL KPI System', desc: 'Комплексная система KPI для инженеров L3-поддержки с взвешенными SLA-метриками и коэффициентами сложности.', tags: ['ITIL', 'KPI', 'SLA', 'Management'], icon: '📊' },
        { name: 'Competency Matrix', desc: 'Фреймворк оценки компетенций для инженеров поддержки TermiDesk по множеству доменов.', tags: ['Skills', 'Assessment', 'TermiDesk'], icon: '📋' }
      ]
    },
    en: {
      label: 'Projects',
      title: 'Featured Projects',
      items: [
        { name: 'jira-alert-daemon', desc: 'Podman-containerized Python daemon for Jira notifications with RQ workers, Valkey queue, and SSH tunnels inside a pod.', tags: ['Python', 'Podman', 'RQ', 'Valkey', 'Jira API'], icon: '🔔' },
        { name: 'Telegram-Jira Bot', desc: 'Telegram bot built with aiogram that accepts tasks and queues them via RQ/Valkey for background processing by workers.', tags: ['aiogram', 'RQ', 'Valkey', 'Podman'], icon: '🤖' },
        { name: 'Container Orchestration Pipeline', desc: 'Custom dispatcher/worker pattern using Podman pods with ephemeral sidecar containers for SSH tunnels.', tags: ['Podman', 'Python', 'SSH', 'Pods'], icon: '⚙️' },
        { name: 'AmneziaWG Deploy', desc: 'Containerized WireGuard deployment template with CI/CD pipeline for automated configuration.', tags: ['WireGuard', 'CI/CD', 'Podman', 'GitLab'], icon: '🔐' },
        { name: 'CI/CD Infrastructure', desc: 'GitLab Runner containerization with Podman quadlets and systemd integration for pipeline management.', tags: ['GitLab CI', 'Podman', 'Quadlets', 'systemd'], icon: '🚀' },
        { name: 'ITIL KPI System', desc: 'Comprehensive KPI framework for L3 support engineers with weighted SLA metrics and complexity coefficients.', tags: ['ITIL', 'KPI', 'SLA', 'Management'], icon: '📊' },
        { name: 'Competency Matrix', desc: 'Skills assessment framework for TermiDesk support engineers across multiple domains.', tags: ['Skills', 'Assessment', 'TermiDesk'], icon: '📋' }
      ]
    },
    he: {
      label: 'פרויקטים',
      title: 'פרויקטים נבחרים',
      items: [
        { name: 'jira-alert-daemon', desc: 'דימון Python בקונטיינר Podman להתראות Jira עם עובדי RQ, תור Valkey ומנהרות SSH בתוך פוד.', tags: ['Python', 'Podman', 'RQ', 'Valkey', 'Jira API'], icon: '🔔' },
        { name: 'Telegram-Jira Bot', desc: 'בוט טלגרם שנבנה עם aiogram שמקבל משימות ומעביר אותן לתור RQ/Valkey לעיבוד ברקע.', tags: ['aiogram', 'RQ', 'Valkey', 'Podman'], icon: '🤖' },
        { name: 'Container Orchestration Pipeline', desc: 'תבנית dispatcher/worker מותאמת אישית עם Podman pods וקונטיינרים זמניים למנהרות SSH.', tags: ['Podman', 'Python', 'SSH', 'Pods'], icon: '⚙️' },
        { name: 'AmneziaWG Deploy', desc: 'תבנית פריסת WireGuard בקונטיינר עם צינור CI/CD לתצורה אוטומטית.', tags: ['WireGuard', 'CI/CD', 'Podman', 'GitLab'], icon: '🔐' },
        { name: 'CI/CD Infrastructure', desc: 'קונטיינריזציה של GitLab Runner עם Podman quadlets ואינטגרציית systemd.', tags: ['GitLab CI', 'Podman', 'Quadlets', 'systemd'], icon: '🚀' },
        { name: 'ITIL KPI System', desc: 'מערכת KPI מקיפה למהנדסי תמיכה L3 עם מדדי SLA משוקללים ומקדמי מורכבות.', tags: ['ITIL', 'KPI', 'SLA', 'Management'], icon: '📊' },
        { name: 'Competency Matrix', desc: 'מסגרת הערכת מיומנויות למהנדסי תמיכת TermiDesk במגוון תחומים.', tags: ['Skills', 'Assessment', 'TermiDesk'], icon: '📋' }
      ]
    }
  },

  // Blog highlights section
  blogSection: {
    ru: { label: 'Блог', title: 'Последние статьи', viewAll: 'Все статьи' },
    en: { label: 'Blog', title: 'Latest Articles', viewAll: 'View All' },
    he: { label: 'בלוג', title: 'מאמרים אחרונים', viewAll: 'כל המאמרים' }
  },

  // Blog page
  blogPage: {
    ru: { title: 'Блог', desc: 'Статьи о контейнеризации, автоматизации, Linux и DevOps' },
    en: { title: 'Blog', desc: 'Articles on containerization, automation, Linux, and DevOps' },
    he: { title: 'בלוג', desc: 'מאמרים על קונטיינריזציה, אוטומציה, לינוקס ו-DevOps' }
  },

  // Blog topics
  blogTopics: {
    ru: {
      t1: 'Контейнеризация и Podman',
      t2: 'Автоматизация на Python',
      t3: 'Linux и системное администрирование',
      t4: 'DevOps и CI/CD',
      t5: 'Сети и инфраструктура'
    },
    en: {
      t1: 'Containerization & Podman',
      t2: 'Python Automation & Integration',
      t3: 'Linux Desktop & System Administration',
      t4: 'DevOps & CI/CD',
      t5: 'Networking & Infrastructure'
    },
    he: {
      t1: 'קונטיינריזציה ו-Podman',
      t2: 'אוטומציה ואינטגרציה ב-Python',
      t3: 'שולחן עבודה של Linux וניהול מערכות',
      t4: 'DevOps ו-CI/CD',
      t5: 'רשתות ותשתיות'
    }
  },

  // Blog articles metadata
  blogArticles: [
    {
      id: 1, topic: 't1', file: 'blog-1.html', date: '2026-03-15',
      ru: { title: 'Паттерн эфемерных sidecar-контейнеров: управление SSH-туннелями в Podman-подах', excerpt: 'Как динамически запускать и останавливать контейнеры внутри Podman-пода с помощью Python.' },
      en: { title: 'Ephemeral Sidecar Pattern: Managing SSH Tunnels in Podman Pods', excerpt: 'How to dynamically start and stop containers within a Podman pod using Python context managers.' },
      he: { title: 'תבנית Sidecar זמנית: ניהול מנהרות SSH בפודים של Podman', excerpt: 'איך להפעיל ולעצור קונטיינרים דינמית בתוך פוד Podman באמצעות Python.' }
    },
    {
      id: 2, topic: 't1', file: 'blog-2.html', date: '2026-03-10',
      ru: { title: 'Мульти-очередной воркер с RQ и Podman', excerpt: 'Архитектура единого RQ-воркера, слушающего несколько очередей и диспетчеризующего задачи в контейнеры.' },
      en: { title: 'Building a Multi-Queue Worker with RQ and Podman', excerpt: 'Architecture for a single RQ worker listening to multiple queues and dispatching tasks to different containers.' },
      he: { title: 'בניית Worker מרובה תורים עם RQ ו-Podman', excerpt: 'ארכיטקטורה של עובד RQ יחיד שמקשיב למספר תורים ומפיץ משימות לקונטיינרים שונים.' }
    },
    {
      id: 3, topic: 't1', file: 'blog-3.html', date: '2026-03-05',
      ru: { title: 'От разработки до продакшена: консистентность образов контейнеров', excerpt: 'CI/CD-практики для обеспечения идентичности OCI-образов в dev и prod средах.' },
      en: { title: 'From Development to Production: Container Image Consistency', excerpt: 'CI/CD practices ensuring the same OCI image runs in dev and prod environments.' },
      he: { title: 'מפיתוח לייצור: עקביות תמונות קונטיינר', excerpt: 'שיטות CI/CD שמבטיחות שאותה תמונת OCI רצה בסביבות פיתוח וייצור.' }
    },
    {
      id: 4, topic: 't2', file: 'blog-4.html', date: '2026-02-28',
      ru: { title: 'Интеграция Telegram-ботов с очередями задач: aiogram + RQ + Valkey', excerpt: 'Полная архитектура асинхронного Telegram-бота с фоновой обработкой задач.' },
      en: { title: 'Integrating Telegram Bots with Task Queues: aiogram + RQ + Valkey', excerpt: 'Complete architecture for async Telegram bot with background job processing.' },
      he: { title: 'שילוב בוטים של Telegram עם תורי משימות: aiogram + RQ + Valkey', excerpt: 'ארכיטקטורה מלאה לבוט Telegram אסינכרוני עם עיבוד משימות ברקע.' }
    },
    {
      id: 5, topic: 't2', file: 'blog-5.html', date: '2026-02-20',
      ru: { title: 'Универсальный контейнерный диспетчер на Python', excerpt: 'Паттерн Python-воркера, запускающего произвольные Podman-контейнеры по конфигурации.' },
      en: { title: 'Building a Universal Container Dispatcher in Python', excerpt: 'Pattern where a Python worker launches arbitrary Podman containers based on config.' },
      he: { title: 'בניית Dispatcher קונטיינרים אוניברסלי ב-Python', excerpt: 'תבנית שבה עובד Python מפעיל קונטיינרים שרירותיים של Podman לפי קונפיגורציה.' }
    },
    {
      id: 6, topic: 't2', file: 'blog-6.html', date: '2026-02-15',
      ru: { title: 'Автоматизация Jira API: от оповещений к действиям', excerpt: 'Использование Python для автоматизации рабочих процессов Jira с контейнеризированными демонами.' },
      en: { title: 'Jira API Automation: From Alerts to Action', excerpt: 'Using Python to automate Jira workflows with containerized daemons.' },
      he: { title: 'אוטומציית Jira API: מהתראות לפעולה', excerpt: 'שימוש ב-Python לאוטומציה של תהליכי עבודה ב-Jira עם דימונים בקונטיינרים.' }
    },
    {
      id: 7, topic: 't3', file: 'blog-7.html', date: '2026-02-10',
      ru: { title: 'KDE Plasma 6 на корпоративном железе', excerpt: 'Практический гайд по запуску KDE Plasma 6 на бизнес-ноутбуках HP и Dell.' },
      en: { title: 'KDE Plasma 6 on Enterprise Hardware', excerpt: 'Practical guide for running KDE Plasma 6 on business laptops like HP EliteBook and Dell.' },
      he: { title: 'KDE Plasma 6 על חומרה ארגונית', excerpt: 'מדריך מעשי להפעלת KDE Plasma 6 על מחשבים ניידים עסקיים של HP ו-Dell.' }
    },
    {
      id: 8, topic: 't3', file: 'blog-8.html', date: '2026-02-05',
      ru: { title: 'FreeBSD как десктопная ОС: может ли она заменить Fedora KDE?', excerpt: 'Реальное сравнение FreeBSD и Fedora для повседневной разработки.' },
      en: { title: 'FreeBSD as a Desktop OS: Can It Replace Fedora KDE?', excerpt: 'Real-world comparison of FreeBSD vs Fedora for daily development work.' },
      he: { title: 'FreeBSD כמערכת הפעלה שולחנית: האם היא יכולה להחליף את Fedora KDE?', excerpt: 'השוואה מעשית בין FreeBSD ל-Fedora לעבודת פיתוח יומיומית.' }
    },
    {
      id: 9, topic: 't4', file: 'blog-9.html', date: '2026-01-28',
      ru: { title: 'GitLab Runner в контейнерах: Podman Quadlets и Systemd', excerpt: 'Настройка GitLab CI с контейнеризированными раннерами через Podman quadlets.' },
      en: { title: 'GitLab Runner in Containers: Podman Quadlets and Systemd', excerpt: 'Setting up GitLab CI with containerized runners using Podman quadlets.' },
      he: { title: 'GitLab Runner בקונטיינרים: Podman Quadlets ו-Systemd', excerpt: 'הגדרת GitLab CI עם runners בקונטיינרים באמצעות Podman quadlets.' }
    },
    {
      id: 10, topic: 't4', file: 'blog-10.html', date: '2026-01-20',
      ru: { title: 'Проектирование KPI-систем для команд технической поддержки', excerpt: 'ITIL-подход к измерению эффективности L3-инженеров поддержки.' },
      en: { title: 'Designing KPI Systems for Technical Support Teams', excerpt: 'ITIL-based approach to measuring L3 support engineer performance.' },
      he: { title: 'תכנון מערכות KPI לצוותי תמיכה טכנית', excerpt: 'גישה מבוססת ITIL למדידת ביצועי מהנדסי תמיכה L3.' }
    },
    {
      id: 11, topic: 't5', file: 'blog-11.html', date: '2026-01-15',
      ru: { title: 'SSH-туннели в контейнерах: безопасный доступ к удалённым сервисам', excerpt: 'Контейнеризированные SSH-туннели для доступа к Asterisk ARI и базам данных.' },
      en: { title: 'SSH Tunnels in Containers: Secure Access to Remote Services', excerpt: 'Containerized SSH tunnels for accessing Asterisk ARI, databases, and APIs.' },
      he: { title: 'מנהרות SSH בקונטיינרים: גישה מאובטחת לשירותים מרוחקים', excerpt: 'מנהרות SSH בקונטיינרים לגישה ל-Asterisk ARI, מסדי נתונים ו-API.' }
    },
    {
      id: 12, topic: 't5', file: 'blog-12.html', date: '2026-01-10',
      ru: { title: 'KVM Bridge Networking: подключение виртуальных машин к физической сети', excerpt: 'Пошаговая настройка сетевого моста KVM на Fedora.' },
      en: { title: 'KVM Bridge Networking: Connecting VMs to Physical Networks', excerpt: 'Step-by-step KVM bridge setup on Fedora for connecting VMs to physical networks.' },
      he: { title: 'KVM Bridge Networking: חיבור מכונות וירטואליות לרשתות פיזיות', excerpt: 'מדריך שלב אחר שלב להגדרת גשר KVM ב-Fedora.' }
    }
  ],

  // Article page
  articlePage: {
    ru: { back: 'Назад к блогу', readTime: 'мин. чтения', related: 'Похожие статьи' },
    en: { back: 'Back to Blog', readTime: 'min read', related: 'Related Articles' },
    he: { back: 'חזרה לבלוג', readTime: 'דקות קריאה', related: 'מאמרים קשורים' }
  },

  // Footer
  footer: {
    ru: { copy: '© 2026 Max Zia. Все права защищены.' },
    en: { copy: '© 2026 Max Zia. All rights reserved.' },
    he: { copy: '© 2026 Max Zia. כל הזכויות שמורות.' }
  },

  // Read more
  readMore: {
    ru: 'Читать далее',
    en: 'Read more',
    he: 'קרא עוד'
  }
};

// ---- Theme Management ----
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  // theme stored in memory
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// ---- Language Management ----
function applyLang(lang) {
  currentLang = lang;
  document.documentElement.setAttribute('lang', lang);
  // lang stored in memory

  // RTL for Hebrew
  if (lang === 'he') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }

  // Update active state on switcher buttons
  document.querySelectorAll('.lang-switcher button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Translate current page
  translatePage();
}

// ---- Translate Page Content ----
function translatePage() {
  const lang = currentLang;

  // Translate all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = getNestedValue(T, key + '.' + lang) || getNestedValue(T, key.replace(/\.[^.]+$/, '') + '.' + lang + '.' + key.split('.').pop());
    if (value) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    }
  });

  // Translate navigation
  document.querySelectorAll('[data-nav]').forEach(el => {
    const key = el.getAttribute('data-nav');
    if (T.nav[lang] && T.nav[lang][key]) {
      el.textContent = T.nav[lang][key];
    }
  });

  // Translate hero
  translateSection('hero');
  translateSection('about');
  translateSection('projects');

  // Translate projects
  const projectCards = document.querySelectorAll('.project-card');
  if (projectCards.length && T.projects[lang]) {
    const items = T.projects[lang].items;
    projectCards.forEach((card, i) => {
      if (items[i]) {
        const nameEl = card.querySelector('.project-card__name');
        const descEl = card.querySelector('.project-card__desc');
        if (nameEl) nameEl.textContent = items[i].name;
        if (descEl) descEl.textContent = items[i].desc;
      }
    });
  }

  // Translate section labels and titles
  document.querySelectorAll('[data-t]').forEach(el => {
    const path = el.getAttribute('data-t');
    const parts = path.split('.');
    let val = T;
    for (const p of parts) {
      if (val) val = val[p];
    }
    if (val && val[lang]) {
      const subkey = el.getAttribute('data-tk');
      if (subkey && val[lang][subkey] !== undefined) {
        el.textContent = val[lang][subkey];
      } else if (typeof val[lang] === 'string') {
        el.textContent = val[lang];
      }
    }
  });

  // Translate blog cards
  translateBlogCards();

  // Translate blog article content if present
  translateArticleContent();

  // Translate blog topic groups
  document.querySelectorAll('[data-topic]').forEach(el => {
    const topicKey = el.getAttribute('data-topic');
    if (T.blogTopics[lang] && T.blogTopics[lang][topicKey]) {
      el.textContent = T.blogTopics[lang][topicKey];
    }
  });
}

function translateSection(section) {
  const lang = currentLang;
  const data = T[section] && T[section][lang];
  if (!data) return;

  document.querySelectorAll(`[data-s="${section}"]`).forEach(el => {
    const key = el.getAttribute('data-k');
    if (key && data[key] !== undefined) {
      el.textContent = data[key];
    }
  });
}

function translateBlogCards() {
  const lang = currentLang;
  document.querySelectorAll('.blog-card').forEach(card => {
    const id = parseInt(card.getAttribute('data-blog-id'));
    const article = T.blogArticles.find(a => a.id === id);
    if (article && article[lang]) {
      const titleEl = card.querySelector('.blog-card__title');
      const excerptEl = card.querySelector('.blog-card__excerpt');
      const readMoreEl = card.querySelector('.blog-card__read-more');
      const topicEl = card.querySelector('.blog-card__topic');
      if (titleEl) titleEl.textContent = article[lang].title;
      if (excerptEl) excerptEl.textContent = article[lang].excerpt;
      if (readMoreEl) readMoreEl.childNodes[0].textContent = T.readMore[lang] + ' ';
      if (topicEl && T.blogTopics[lang]) {
        topicEl.textContent = T.blogTopics[lang][article.topic];
      }
    }
  });
}

function translateArticleContent() {
  const lang = currentLang;
  const articleEl = document.querySelector('[data-article-id]');
  if (!articleEl) return;

  const id = parseInt(articleEl.getAttribute('data-article-id'));
  const article = T.blogArticles.find(a => a.id === id);
  if (!article) return;

  // Title
  const titleEl = document.querySelector('.article__title');
  if (titleEl && article[lang]) titleEl.textContent = article[lang].title;

  // Topic
  const topicEl = document.querySelector('.article__topic');
  if (topicEl && T.blogTopics[lang]) topicEl.textContent = T.blogTopics[lang][article.topic];

  // Back link
  const backEl = document.querySelector('.article__back');
  if (backEl && T.articlePage[lang]) backEl.childNodes[backEl.childNodes.length - 1].textContent = T.articlePage[lang].back;

  // Meta
  const metaEl = document.querySelector('.article__meta');
  if (metaEl && T.articlePage[lang]) {
    metaEl.textContent = article.date + ' · 8 ' + T.articlePage[lang].readTime;
  }

  // Article body — switch language blocks
  document.querySelectorAll('.article__body .lang-block').forEach(block => {
    block.style.display = block.getAttribute('data-lang') === lang ? 'block' : 'none';
  });

  // Related title
  const relatedTitle = document.querySelector('.related-articles__title');
  if (relatedTitle && T.articlePage[lang]) relatedTitle.textContent = T.articlePage[lang].related;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

// ---- Mobile Menu ----
function toggleMobileMenu() {
  const menu = document.querySelector('.mobile-menu');
  const hamburger = document.querySelector('.hamburger');
  if (menu) {
    menu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', menu.classList.contains('open'));
  }
}

// ---- Scroll Effects ----
function initScrollEffects() {
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (scroll > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
    lastScroll = scroll;
  }, { passive: true });

  // Fade-in observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ---- Initialize ----
function init() {
  // Apply theme
  applyTheme(currentTheme);

  // Apply language
  applyLang(currentLang);

  // Theme toggle
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Language switcher
  document.querySelectorAll('.lang-switcher button').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  // Mobile menu
  document.querySelectorAll('.hamburger').forEach(btn => {
    btn.addEventListener('click', toggleMobileMenu);
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('.mobile-menu').classList.remove('open');
    });
  });

  // Scroll effects
  initScrollEffects();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
