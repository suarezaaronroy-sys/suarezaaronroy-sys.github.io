/**
 * ui.js — Aaron Suarez Portfolio
 * Shared UI behaviors: theme persistence, nav active state,
 * collapsible sections (mobile overview), back-to-top anchor,
 * favicon fallback handler.
 *
 * Usage: <script src="/assets/js/ui.js" defer></script>
 */

(function () {
  'use strict';

  // ── THEME PERSISTENCE ─────────────────────────────────────
  // Reads accent color from localStorage and applies it on load.
  // Works alongside theme.html settings page.
  function applyTheme() {
    const savedAccent = localStorage.getItem('accent');
    if (savedAccent) {
      document.documentElement.style.setProperty('--accent', savedAccent);
    }

    const savedMode = localStorage.getItem('theme');
    if (savedMode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.style.background = '#1C1917';
      document.body.style.color = '#F5F2EC';
      // topbar
      const topbar = document.querySelector('.topbar-wrap');
      if (topbar) topbar.style.background = 'rgba(28,25,23,.92)';
    }
  }

  // ── NAV ACTIVE STATE ──────────────────────────────────────
  // Highlights the nav link matching the current page path.
  // Each page can also set class="nav-active" directly — this is a fallback.
  function setNavActive() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav a');

    links.forEach(function (link) {
      const href = link.getAttribute('href') || '';
      // Exact match or starts-with for section pages
      const linkPath = href.split('?')[0];

      if (linkPath && path === linkPath) {
        link.classList.add('nav-active');
      }
      // Home special case
      if (path === '/' && (href === '/' || href === '/index.html')) {
        link.classList.add('nav-active');
      }
    });
  }

  // ── COLLAPSIBLE SECTIONS (mobile overview) ────────────────
  // Any element with data-collapsible="trigger" toggles the next sibling
  // matching [data-collapsible="content"]. Used for Overview panels on mobile.
  function initCollapsibles() {
    const triggers = document.querySelectorAll('[data-collapsible="trigger"]');

    triggers.forEach(function (trigger) {
      // Find adjacent content panel
      const content = trigger.nextElementSibling?.matches('[data-collapsible="content"]')
        ? trigger.nextElementSibling
        : trigger.parentElement.querySelector('[data-collapsible="content"]');

      if (!content) return;

      // Default: collapsed on mobile, expanded on desktop
      function setInitialState() {
        if (window.innerWidth < 760) {
          content.style.display = 'none';
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          content.style.display = '';
          trigger.setAttribute('aria-expanded', 'true');
        }
      }

      setInitialState();

      trigger.addEventListener('click', function () {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isExpanded));
        content.style.display = isExpanded ? 'none' : '';

        // Animate chevron if present
        const chevron = trigger.querySelector('[data-chevron]');
        if (chevron) chevron.style.transform = isExpanded ? '' : 'rotate(180deg)';
      });

      // Reset on resize
      let resizeTimeout;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setInitialState, 150);
      });
    });
  }

  // ── BACK TO TOP ANCHOR ────────────────────────────────────
  // Shows .quick-anchor when scrolled past 400px, hides at top.
  function initBackToTop() {
    const anchor = document.querySelector('.quick-anchor');
    if (!anchor) return;

    function updateAnchor() {
      anchor.style.opacity = window.scrollY > 400 ? '1' : '0';
      anchor.style.pointerEvents = window.scrollY > 400 ? '' : 'none';
    }

    anchor.style.transition = 'opacity .2s';
    anchor.style.opacity = '0';
    anchor.style.pointerEvents = 'none';

    window.addEventListener('scroll', updateAnchor, { passive: true });
  }

  // ── FAVICON FALLBACK ──────────────────────────────────────
  // If favicon.png fails to load in brand-icon, shows text fallback.
  function initFaviconFallback() {
    const icons = document.querySelectorAll('.brand-icon img');
    icons.forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.display = 'none';
        const fallback = img.nextElementSibling;
        if (fallback && fallback.classList.contains('brand-icon-fallback')) {
          fallback.style.display = 'grid';
        }
      });
    });
  }

  // ── YEAR AUTO-UPDATE ─────────────────────────────────────
  // Fills any element with id="yr" with the current year.
  function setYear() {
    const el = document.getElementById('yr');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ── SIDEBAR ACTIVE NAV (grimoires) ───────────────────────
  // IntersectionObserver to highlight sidebar nav link as sections scroll into view.
  // Only runs if a .sidebar with .nav-link elements is present.
  function initSidebarObserver() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const navLinks = sidebar.querySelectorAll('.nav-link');
    if (!navLinks.length) return;

    const sections = document.querySelectorAll('[id]');

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        const active = sidebar.querySelector('.nav-link[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      });
    }, { rootMargin: '-15% 0px -70% 0px' });

    sections.forEach(function (s) { observer.observe(s); });
  }

  // ── PORTFOLIO MODE TOGGLE (grimoires) ────────────────────
  // Binds toggleMode() to window so grimoire pages can call it inline.
  function initPortfolioMode() {
    window.toggleMode = function () {
      document.body.classList.toggle('portfolio-mode');
      const isPortfolio = document.body.classList.contains('portfolio-mode');

      const modeLabel = document.getElementById('mode-label');
      const toggleLabel = document.getElementById('toggle-label');
      const modeToggle = document.querySelector('.mode-toggle');

      if (modeLabel) {
        modeLabel.textContent = isPortfolio
          ? 'Portfolio mode — plain-English explanations on'
          : 'Technical mode — full system documentation';
      }

      if (toggleLabel) {
        toggleLabel.textContent = isPortfolio ? 'Technical mode' : 'Portfolio mode';
      }

      // Show/hide portfolio explain blocks
      document.querySelectorAll('.portfolio-explain').forEach(function (el) {
        el.style.display = isPortfolio ? 'block' : 'none';
      });

      document.querySelectorAll('.show-in-portfolio').forEach(function (el) {
        el.style.display = isPortfolio ? 'block' : 'none';
      });

      // Persist preference
      localStorage.setItem('grimoire-mode', isPortfolio ? 'portfolio' : 'technical');
    };

    // Restore saved mode
    const savedMode = localStorage.getItem('grimoire-mode');
    if (savedMode === 'portfolio' && !document.body.classList.contains('portfolio-mode')) {
      window.toggleMode();
    }
  }

  // ── READER PATH SELECTION (guided walkthrough) ───────────
  window.showPath = function (type) {
    document.querySelectorAll('.reader-path').forEach(function (el) {
      el.classList.remove('selected');
    });
    document.querySelectorAll('.reader-guidance').forEach(function (el) {
      el.classList.remove('visible');
    });

    const selectedPath = document.querySelector('[onclick*="' + type + '"]');
    if (selectedPath) selectedPath.classList.add('selected');

    const guidance = document.getElementById('path-' + type);
    if (guidance) guidance.classList.add('visible');
  };

  // ── TOAST UTILITY ─────────────────────────────────────────
  window._toast = function (msg, duration) {
    duration = duration || 2000;
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1C1917;color:#F5F2EC;font-family:var(--mono,"DM Mono",monospace);font-size:.7rem;padding:.4rem 1rem;border-radius:40px;z-index:4000;opacity:0;pointer-events:none;transition:opacity .2s;white-space:nowrap';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.style.opacity = '0'; }, duration);
  };

  // ── INIT ALL ──────────────────────────────────────────────
  function init() {
    applyTheme();
    setNavActive();
    initCollapsibles();
    initBackToTop();
    initFaviconFallback();
    setYear();
    initSidebarObserver();
    initPortfolioMode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
