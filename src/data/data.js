export const content = {
  about: {
    photo: "photo.png", // Укажи реальный путь, если есть фото
    text: {
      en: "Hi, I'm an experienced technical support and team management professional with over 15 years in IT, specializing in business process development, client interactions, and AI-driven solutions.",
      ru: "Привет, я профессионал с более чем 15-летним опытом в области технической поддержки и управления командами в IT, специализируюсь на разработке бизнес-процессов, взаимодействии с клиентами и внедрении ИИ-решений."
    }
  },
  cases: [
    {
      title: { en: "VK (2023-2024)", ru: "VK (2023-2024)" },
      text: {
        en: "Developed and described business processes for technical support. Managed a team of five, ensuring SLA compliance and resolving escalations. Interacted with clients like Surgutneftegaz and Gazprom, prepared presentations, defended solutions, and drafted contracts. Built a knowledge base, contributed to AI tool development, and managed a DevOps team supporting VK Cloud OpenStack using Scrum, ITSM, and ITIL.",
        ru: "Разработка и описание бизнес-процессов для технической поддержки. Управление командой из пяти человек, обеспечение соблюдения SLA и решение эскалаций. Взаимодействие с клиентами (Сургутнефтегаз, Газпром), подготовка презентаций, защита решений и разработка контрактов. Создание базы знаний, участие в разработке ИИ-инструментов, управление DevOps-командой для VK Cloud OpenStack с использованием Scrum, ITSM и ITIL."
      },
      tagIds: [0, 1, 2, 3]
    },
    {
      title: { en: "General Electric (2020-2022)", ru: "General Electric (2020-2022)" },
      text: {
        en: "Led the customer technical support service, resolving escalations and negotiating with clients like Rosneft. Built a team from scratch, developed business processes, and implemented analytics tools using Microsoft Power BI. Managed contractors, ensured SLA compliance, and optimized processes with ITIL and ITSM. Earned an AWS certification to enhance team qualifications.",
        ru: "Руководство службой технической поддержки клиентов, решение эскалаций и переговоры с клиентами (Роснефть). Создание команды с нуля, разработка бизнес-процессов и аналитических инструментов с использованием Microsoft Power BI. Управление подрядчиками, соблюдение SLA, оптимизация процессов с ITIL и ITSM. Получение AWS-сертификата для повышения квалификации команды."
      },
      tagIds: [4, 5, 6, 7]
    },
    {
      title: { en: "Netcracker (2015-2020)", ru: "Netcracker (2015-2020)" },
      text: {
        en: "Directed technical support for clients like DHL and GCI, managing a team of up to 40 people. Conducted negotiations and presentations for top management (e.g., CTOs and the Prime Minister of Andorra). Transformed client business processes from on-premise to SaaS, implemented Scrum, ITSM, and tools like Jira, Confluence, and ServiceNow. Handled pre-sales and cost evaluations.",
        ru: "Руководство технической поддержкой для клиентов (DHL, GCI), управление командой до 40 человек. Проведение переговоров и презентаций для топ-менеджмента (CTO, премьер-министр Андорры). Трансформация бизнес-процессов клиента с он-прем на SaaS, внедрение Scrum, ITSM и инструментов (Jira, Confluence, ServiceNow). Pre-sale и оценка стоимости внедрения."
      },
      tagIds: [8, 9, 10, 11]
    },
    {
      title: { en: "NPTV (2013-2015)", ru: "NPTV (2013-2015)" },
      text: {
        en: "Created a technical support department from scratch, hiring and onboarding a team of five. Developed business processes, implemented knowledge-sharing practices, and reduced staff turnover. Supported public events to enhance client service, applying ITSM methodologies for process optimization.",
        ru: "Создание отдела технической поддержки с нуля, найм и онбординг команды из пяти человек. Разработка бизнес-процессов, внедрение передачи знаний, снижение текучести кадров. Поддержка публичных мероприятий для улучшения клиентского сервиса с использованием ITSM."
      },
      tagIds: [12, 1, 13]
    },
    {
      title: { en: "Comverse (2006-2013)", ru: "Comverse (2006-2013)" },
      text: {
        en: "Managed technical support for major telecom operators, handling escalations and critical incidents. Planned and executed updates for high-load platforms, improving stability. Leveraged Unix and cellular network expertise, collaborating with international teams in English.",
        ru: "Руководство технической поддержкой для операторов большой тройки, решение эскалаций и критических инцидентов. Планирование и обновление высоконагруженных платформ для повышения стабильности. Использование знаний Unix и сотовых сетей, взаимодействие с международными командами на английском."
      },
      tagIds: [14, 15, 16]
    }
  ],
  tags: [
    { id: 0, name: "management" },
    { id: 1, name: "ITSM" },
    { id: 2, name: "AI" },
    { id: 3, name: "DevOps" },
    { id: 4, name: "leadership" },
    { id: 5, name: "ITIL" },
    { id: 6, name: "Power BI" },
    { id: 7, name: "AWS" },
    { id: 8, name: "Scrum" },
    { id: 9, name: "SaaS" },
    { id: 10, name: "Product Management" },
    { id: 11, name: "ServiceNow" },
    { id: 12, name: "team building" },
    { id: 13, name: "client service" },
    { id: 14, name: "Unix" },
    { id: 15, name: "telecom" },
    { id: 16, name: "incident management" }
  ],
  expertise: {
    tags: ["ITSM", "ITIL", "Scrum", "DevOps", "AWS", "Microsoft Power BI", "Jira", "ServiceNow", "Unix", "Team Management", "AI Tools", "SaaS"]
  },
  menu: [
    {
      title: { en: "about me", ru: "обо мне" },
      path: "/"
    },
    {
      title: { en: "cases", ru: "кейсы" },
      path: "/cases"
    },
    {
      title: { en: "expertise", ru: "экспертиза" },
      path: "/expertise"
    }
  ],
  sectionTitles: [
    {
      title: { en: "About", ru: "Обо мне" },
      path: "/"
    },
    {
      title: { en: "Cases", ru: "Кейсы" },
      path: "/cases"
    },
    {
      title: { en: "Expertise", ru: "Экспертиза" },
      path: "/expertise"
    }
  ],
  footer: {
    text: {
      en: "Prompting with Grok",
      ru: "Работаю с Grok"
    }
  }
};