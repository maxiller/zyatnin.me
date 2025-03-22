export const content = {
  about: {
    en: {
      text: "Hi, I'm a developer with experience in web technologies.",
      photo: "photo.png" // Укажи реальный путь, если есть фото
    },
    ru: {
      text: "Привет, я разработчик с опытом в веб-технологиях.",
      photo: "photo.png"
    }
  },
  cases: {
    en: [
      { title: "Project 1", text: "Description of project one goes here", tags: ["react", "web"] },
      { title: "Project 2", text: "Description of project two is here", tags: ["node", "api"] }
    ],
    ru: [
      { title: "Проект 1", text: "Описание первого проекта здесь", tags: ["react", "web"] },
      { title: "Проект 2", text: "Описание второго проекта здесь", tags: ["node", "api"] }
    ]
  },
  expertise: {
    tags: ["React", "Node.js", "CSS", "JavaScript"]
  },
  menu: {
    en: [
      { path: "/", label: "about me" },
      { path: "/cases", label: "cases" },
      { path: "/expertise", label: "expertise" }
    ],
    ru: [
      { path: "/", label: "обо мне" },
      { path: "/cases", label: "кейсы" },
      { path: "/expertise", label: "экспертиза" }
    ]
  },
  sectionTitles: {
    en: {
      "/": "About",
      "/cases": "Cases",
      "/expertise": "Expertise"
    },
    ru: {
      "/": "Обо мне",
      "/cases": "Кейсы",
      "/expertise": "Экспертиза"
    }
  },
  footer: {
    en: {
      text: "Prompting with Grok"
    },
    ru: {
      text: "Работаю с Grok"
    }
  }
};