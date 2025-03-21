export const aboutText: string = `
  Привет! Я Максим Зятнин, специалист по созданию цифровых решений, которые делают клиентов счастливыми. 
  Более 10 лет я помогаю бизнесам выстраивать эффективные процессы через UX/UI дизайн и разработку.

  Моя страсть - превращать сложные задачи в простые и интуитивные решения. Работал с проектами от стартапов до крупных корпораций,
  всегда фокусируясь на потребностях пользователя и целях бизнеса.
`;

export interface Case {
  title: string;
  description: string;
  fullText: string;
  tags: string[];
}

export const cases: Case[] = [
  {
    title: 'E-commerce платформа',
    description: 'Создание масштабируемой платформы для онлайн-продаж',
    fullText: 'Полный редизайн и разработка e-commerce платформы с интеграцией платежных систем...',
    tags: ['UX', 'React', 'E-commerce'],
  },
  {
    title: 'Мобильное приложение',
    description: 'Приложение для управления финансами',
    fullText: 'Разработка мобильного приложения для личных финансов с AI-аналитикой...',
    tags: ['Mobile', 'UI', 'FinTech'],
  },
];

export const expertise: string[] = ['UX Design', 'UI Design', 'React', 'TypeScript', 'Mobile', 'E-commerce', 'FinTech'];

export interface MenuItem {
  title: string;
  url: string;
}

export const menuItems: MenuItem[] = [
  { title: 'Обо мне', url: '#about' },
  { title: 'Кейсы', url: '#cases' },
  { title: 'Экспертиза', url: '#expertise' },
  { title: 'Контакты', url: '#contacts' },
];