/* zyatnin.me — theme, mobile menu, reveal.
   Progressive enhancement: content is readable without this file. */

(function () {
  'use strict';

  var docEl = document.documentElement;
  var THEME_KEY = 'zyatnin-theme';
  var LANG_KEY = 'zyatnin-lang';
  var darkMq = window.matchMedia('(prefers-color-scheme: dark)');

  /* --- Theme: system default, manual override, live system changes --- */

  function systemTheme() {
    return darkMq.matches ? 'dark' : 'light';
  }

  function storedTheme() {
    try {
      var t = localStorage.getItem(THEME_KEY);
      return (t === 'light' || t === 'dark') ? t : null;
    } catch (e) {
      return null;
    }
  }

  function applyTheme(t) {
    docEl.setAttribute('data-theme', t);
    var btn = document.querySelector('.theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', String(t === 'dark'));
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      metas[i].setAttribute('content', t === 'dark' ? '#11131c' : '#f2f5f8');
    }
  }

  applyTheme(storedTheme() || systemTheme());

  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = docEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next);
    });
  }

  function onSystemThemeChange(e) {
    if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light');
  }

  if (darkMq.addEventListener) darkMq.addEventListener('change', onSystemThemeChange);
  else if (darkMq.addListener) darkMq.addListener(onSystemThemeChange);

  /* --- Mobile menu --- */

  var menuBtn = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.mobile-menu');

  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    var label = open ? menuBtn.getAttribute('data-label-close') : menuBtn.getAttribute('data-label-open');
    if (label) menuBtn.setAttribute('aria-label', label);
    menu.classList.toggle('mobile-menu--open', open);
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target instanceof Element && e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* --- Reveal on scroll (visible by default without JS) --- */

  var revealEls = document.querySelectorAll('.fade-in');
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!('IntersectionObserver' in window) || reduceMq.matches) {
    for (var j = 0; j < revealEls.length; j++) {
      revealEls[j].classList.add('fade-in--visible');
    }
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    for (var k = 0; k < revealEls.length; k++) observer.observe(revealEls[k]);
  }

  /* --- Remember a manual language choice (used by the / redirect) --- */

  var langLinks = document.querySelectorAll('.lang-switch a[hreflang]');
  for (var m = 0; m < langLinks.length; m++) {
    langLinks[m].addEventListener('click', function () {
      try { localStorage.setItem(LANG_KEY, this.getAttribute('hreflang')); } catch (e) {}
    });
  }
})();
