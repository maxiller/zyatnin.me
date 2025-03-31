import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import About from './components/About';
import Cases from './components/Cases';
import Expertise from './components/Expertise';
import Footer from './components/Footer';
import { content } from './data/data';

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animateTheme, setAnimateTheme] = useState(false);

  // Инициализация темы и языка при загрузке
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
    const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
    setLanguage(browserLang);
  }, []);

  // Обновление классов темы на body
  useEffect(() => {
    document.body.className = `theme-${theme} ${animateTheme ? 'animate' : ''}`;
  }, [theme, animateTheme]);

  const toggleTheme = () => {
    setAnimateTheme(true);
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setTimeout(() => setAnimateTheme(false), 500);
  };

  const toggleLanguage = () => setLanguage(language === 'en' ? 'ru' : 'en');
  const handleMenuClick = () => setIsMenuOpen(false);

  // Получение заголовка секции
  const getSectionTitle = () => {
    const path = window.location.pathname;
    const section = content.sectionTitles.find((s) => s.path === path);
    return section ? section.title[language] : '';
  };

  return (
    <Router>
      <div className="app">
        {/* Шапка */}
        <header className="header">
          <button
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
          <h1 className="section-title">{getSectionTitle()}</h1>
          <div className="switches">
            <button
              className={`theme-toggle ${animateTheme ? 'animate' : ''}`}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={toggleLanguage}
              title="Toggle Language"
            >
              {language === 'en' ? '🇬🇧' : '🇷🇺'}
            </button>
          </div>
        </header>

        {/* Боковая панель навигации */}
        <nav className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            {content.menu.map((item, index) => (
              <li key={item.path}>
                <Link to={item.path} onClick={handleMenuClick}>
                  <span className="prefix">
                    {index === 0 ? '├─' : index === content.menu.length - 1 ? '└─' : '├─'}
                  </span>
                  {item.title[language]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Основной контент */}
        <main className="content">
          <Routes>
            <Route path="/" element={<About language={language} />} />
            <Route path="/cases" element={<Cases language={language} />} />
            <Route path="/expertise" element={<Expertise language={language} />} />
          </Routes>
        </main>

        {/* Кнопка Telegram */}
        <a
          href="https://t.me/ziatnine"
          className="telegram-sticky"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.865 7.392l-1.73 8.16c-.127.6-.497.745-.845.465l-2.49-1.835-1.205 1.165c-.133.13-.24.23-.49.23-.165 0-.315-.06-.465-.225l-.865-2.82-1.815-.575c-.585-.185-.59-.765.135-1.005l7.13-2.755c.48-.18.91.105.635.595z" />
          </svg>
        </a>

        {/* Футер */}
        <Footer language={language} />
      </div>
    </Router>
  );
};

export default App;