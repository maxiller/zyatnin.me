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

  /* --- Mermaid diagrams (articles) ---
     Lazy CDN load, only on pages that contain mermaid blocks.
     Without JS the block stays a readable source of the diagram. */

  var mermaidBlocks = document.querySelectorAll('pre > code.language-mermaid');
  if (mermaidBlocks.length) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
    script.onload = function () {
      /* Diagram theme from the active view's design tokens:
         both stylesheets define the same token names in :root,
         so computed values are always the page's own palette.
         Node colors are semantic: green = positive, red = negative,
         light blue = neutral. Flowchart diagrams get classDefs
         injected from tokens; mindmap branches use the cScale
         palette (green, since series results are positive). */
      var cs = getComputedStyle(document.documentElement);
      function token(name, fallback) {
        var v = cs.getPropertyValue(name);
        return (v && v.trim()) || fallback;
      }
      var okFill = token('--diag-ok-fill', '#e3f2e9');
      var okLine = token('--diag-ok-line', '#15803d');
      var okText = token('--diag-ok-text', '#14532d');
      var badFill = token('--diag-bad-fill', '#fdecea');
      var badLine = token('--diag-bad-line', '#b91c1c');
      var badText = token('--diag-bad-text', '#7f1d1d');
      var nFill = token('--diag-neutral-fill', '#e7f0fa');
      var nLine = token('--diag-neutral-line', '#2b5fb0');
      var nText = token('--diag-neutral-text', '#1d3d63');

      var classDefs =
        'classDef neutral fill:' + nFill + ',stroke:' + nLine + ',color:' + nText + ';\n' +
        'classDef good fill:' + okFill + ',stroke:' + okLine + ',color:' + okText + ';\n' +
        'classDef bad fill:' + badFill + ',stroke:' + badLine + ',color:' + badText + ';';

      for (var i = 0; i < mermaidBlocks.length; i++) {
        var src = mermaidBlocks[i].textContent;
        if (/^\s*flowchart/.test(src)) {
          var nl = src.indexOf('\n');
          mermaidBlocks[i].textContent = src.slice(0, nl) + '\n' + classDefs + '\n' + src.slice(nl + 1);
        }
      }

      var isDev = window.location.pathname.indexOf('/dev/') !== -1;
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          background: 'transparent',
          fontFamily: isDev ? token('--font-mono', 'monospace') : token('--font-body', 'sans-serif'),
          fontSize: isDev ? '13px' : '15px',
          primaryColor: nFill,
          primaryTextColor: nText,
          primaryBorderColor: nLine,
          lineColor: token('--text-muted', '#5f6d80'),
          secondaryColor: token('--bg-secondary', '#eef1f5'),
          tertiaryColor: token('--accent-dim', 'rgba(43, 95, 176, 0.09)'),
          edgeLabelBackground: token('--diag-surface', '#f7f8fa'),
          clusterBkg: 'transparent',
          cScale0: okFill,
          cScale1: okFill,
          cScale2: okFill,
          cScale3: okFill,
          cScale4: okFill,
          cScaleLabel0: okText,
          cScaleLabel1: okText,
          cScaleLabel2: okText,
          cScaleLabel3: okText,
          cScaleLabel4: okText
        }
      });
      window.mermaid.run({ nodes: mermaidBlocks });
    };
    document.head.appendChild(script);
  }
})();
