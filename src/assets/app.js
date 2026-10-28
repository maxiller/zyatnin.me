/* zyatnin.me — mobile menu, reveal, view preference.
   Progressive enhancement: content is readable without this file.
   Each view loads its own stylesheet (style.css / dev.css); the site
   has no client-side theme toggle. */

(function () {
  'use strict';

  var VIEW_KEY = 'zyatnin-view';
  var LANG_KEY = 'zyatnin-lang';

  /* --- Mobile menu (header drawer and IDE sidebar) ---
     Button: [data-menu-toggle], panel: [data-menu-panel].
     The open-state class comes from the panel's
     data-menu-open-class attribute (default "mobile-menu--open"). */

  var menuBtn = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu-panel]');

  function openClass() {
    var cls = menu ? menu.getAttribute('data-menu-open-class') : null;
    return cls || 'mobile-menu--open';
  }

  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    var label = open ? menuBtn.getAttribute('data-label-close') : menuBtn.getAttribute('data-label-open');
    if (label) menuBtn.setAttribute('aria-label', label);
    menu.classList.toggle(openClass(), open);
  }

  function menuIsOpen() {
    return menuBtn && menuBtn.getAttribute('aria-expanded') === 'true';
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      setMenu(!menuIsOpen());
    });

    menu.addEventListener('click', function (e) {
      if (e.target instanceof Element && e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuIsOpen()) {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* --- Remember the chosen view (used by the / redirect) --- */

  var viewLinks = document.querySelectorAll('.view-switch a[data-view]');
  for (var i = 0; i < viewLinks.length; i++) {
    viewLinks[i].addEventListener('click', function () {
      try { localStorage.setItem(VIEW_KEY, this.getAttribute('data-view')); } catch (e) {}
    });
  }

  /* --- Remember a manual language choice (used by the / redirect) --- */

  var langLinks = document.querySelectorAll('.lang-switch a[hreflang]');
  for (var m = 0; m < langLinks.length; m++) {
    langLinks[m].addEventListener('click', function () {
      try { localStorage.setItem(LANG_KEY, this.getAttribute('hreflang')); } catch (e) {}
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
})();
