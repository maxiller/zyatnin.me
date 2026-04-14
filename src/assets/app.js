/* zyatnin.me — Theme toggle + mobile menu + RTL */

(function() {
  // Theme: auto-detect + manual toggle
  let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  function applyTheme(t) {
    theme = t;
    document.documentElement.setAttribute('data-theme', t);
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  document.addEventListener('DOMContentLoaded', function() {
    applyTheme(theme);

    // Theme toggle button
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        applyTheme(theme === 'dark' ? 'light' : 'dark');
      });
    }

    // Mobile hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function() {
        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', String(!expanded));
        mobileMenu.classList.toggle('mobile-menu--open');
      });
      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() {
          hamburger.setAttribute('aria-expanded', 'false');
          mobileMenu.classList.remove('mobile-menu--open');
        });
      });
    }

    // Scroll fade-in
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('fade-in--visible'); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(function(el) { observer.observe(el); });

    // Terminal cursor blink (already CSS, but animate typing)
    const termLines = document.querySelectorAll('.terminal__line');
    if (termLines.length) {
      termLines.forEach(function(line, i) {
        line.style.opacity = '0';
        setTimeout(function() {
          line.style.transition = 'opacity 0.3s';
          line.style.opacity = '1';
        }, 300 + i * 400);
      });
    }
  });
})();
