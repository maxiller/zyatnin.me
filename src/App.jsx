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

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
    const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
    setLanguage(browserLang);
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setAnimateTheme(true);
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setTimeout(() => setAnimateTheme(false), 500);
  };
  const toggleLanguage = () => setLanguage(language === 'en' ? 'ru' : 'en');
  const handleMenuClick = () => setIsMenuOpen(false);

  const getSectionTitle = () => {
    const path = window.location.pathname;
    return content.sectionTitles[language][path] || '';
  };

  return (
      <Router>
        <div className="app">
          <div className="header">
            <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              >_
            </button>
            <h1>{getSectionTitle()}</h1>
          </div>
          <nav className={isMenuOpen ? 'open' : ''}>
          <pre>
            {content.menu[language].map((item, index) => {
              const prefix = index === 0 ? '├─ ' : index === content.menu[language].length - 1 ? '└─ ' : '├─ ';
              return (
                  <div key={item.path}>
                    {prefix}
                    <Link to={item.path} onClick={handleMenuClick}>
                      {item.label}
                    </Link>
                  </div>
              );
            })}
          </pre>
          </nav>
          <div className="switches">
            <button className={`theme-toggle ${animateTheme ? 'animate' : ''}`} onClick={toggleTheme}>
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="24" height="24">
                <path fill="currentColor" d="M300.1,71.1c-62.1,0-106.2,50.4-106.1,106.2c0,26.7,9.9,51,26.3,69.6c15.5,17.6,30.3,46.4,31.6,55.6l0,45.3c0,1.9,0.6,3.7,1.6,5.3l14.8,22.2c1.8,2.7,4.8,4.3,8,4.3h47.5c3.2,0,6.2-1.6,8-4.3l14.8-22.2c1-1.6,1.6-3.4,1.6-5.3l0-45.3c1.4-9.5,16.3-38.1,31.6-55.6c16.3-18.6,26.3-43,26.3-69.8C406.2,118.6,358.7,71.1,300.1,71.1z M329,344.9l-10.3,15.5h-37.2l-10.3-15.5l0-3.8H329V344.9z M329,321.8h-57.8l0-19.3h57.9L329,321.8z M365.4,234.2c-8.4,9.6-21.9,29-30.5,49h-69.7c-8.6-20-22.1-39.4-30.5-49c-13.9-15.9-21.4-36.1-21.4-57.1c-0.1-46.4,36.4-86.8,86.8-86.8c47.9,0,86.8,38.9,86.8,86.8C386.9,198.2,379.3,218.4,365.4,234.2z" />
                {theme === 'light' && (
                    <>
                      <path fill="currentColor" d="M132.4,272.5c-2.3,1.3-3.1,4.3-1.8,6.6l4.8,8.4c1.3,2.3,4.3,3.1,6.6,1.8l59.8-34.5c-4-5.1-7.7-10.4-10.9-16L132.4,272.5z" />
                      <path fill="currentColor" d="M132.4,101.1l51.3,29.6c2.4-6,5.3-11.8,8.5-17.3l-50.2-29c-2.3-1.3-5.3-0.5-6.6,1.8l-4.8,8.4C129.3,96.8,130.1,99.8,132.4,101.1z" />
                      <path fill="currentColor" d="M467.8,101.1c2.3-1.3,3.1-4.3,1.8-6.6l-4.8-8.4c-1.3-2.3-4.3-3.1-6.6-1.8l-50.3,29c3.3,5.5,6.2,11.3,8.6,17.3L467.8,101.1z" />
                      <path fill="currentColor" d="M467.8,272.5l-58.7-33.9c-3.2,5.6-6.9,10.9-10.9,16l60,34.6c2.3,1.3,5.3,0.5,6.6-1.8l4.8-8.4C470.9,276.7,470.1,273.8,467.8,272.5z" />
                      <path fill="currentColor" d="M175,177.2h-62.9c-2.7,0-4.8,2.2-4.8,4.8v9.6c0,2.7,2.2,4.8,4.8,4.8h64.2C175.3,190.1,175,183.6,175,177.2z" />
                      <path fill="currentColor" d="M488.2,177.2h-62.7c0,6.5-0.8,12.9-1.7,19.3h64.4c2.7,0,4.8-2.2,4.8-4.8v-9.6C493,179.3,490.8,177.2,488.2,177.2z" />
                    </>
                )}
              </svg>
            </button>
            <button onClick={toggleLanguage}>{language === 'en' ? '🇬🇧' : '🇷🇺'}</button>
          </div>

          <Routes>
            <Route path="/" element={<About language={language} />} />
            <Route path="/cases" element={<Cases language={language} />} />
            <Route path="/expertise" element={<Expertise language={language} />} />
          </Routes>

          <a href="https://t.me/yourusername" className="telegram-sticky">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.865 7.392l-1.73 8.16c-.127.6-.497.745-.845.465l-2.49-1.835-1.205 1.165c-.133.13-.24.23-.49.23-.165 0-.315-.06-.465-.225l-.865-2.82-1.815-.575c-.585-.185-.59-.765.135-1.005l7.13-2.755c.48-.18.91.105.635.595z" />
            </svg>
          </a>
          <Footer language={language} />
        </div>
      </Router>
  );
};

export default App;