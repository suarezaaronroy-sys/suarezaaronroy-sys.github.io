/**
 * ui.js — Aaron Suarez Portfolio
 * Shared UI behaviors: theme persistence, prefers-color-scheme,
 * nav active state, collapsible sections, back-to-top anchor,
 * favicon fallback, GDPR consent banner, skip-to-content.
 *
 * Usage: <script src="/assets/js/ui.js" defer></script>
 */

(function () {
  'use strict';

  // ── DARK MODE CSS APPLICATION ─────────────────────────────
  // Applies full dark mode via CSS custom property overrides on :root
  // Works for both manual toggle (theme.html) and prefers-color-scheme
  function applyDarkModeCSS() {
    document.documentElement.style.setProperty('--bg',    '#1C1917');
    document.documentElement.style.setProperty('--bg2',   '#292524');
    document.documentElement.style.setProperty('--bg3',   '#3C3835');
    document.documentElement.style.setProperty('--ink',   '#F5F2EC');
    document.documentElement.style.setProperty('--ink2',  '#D6D3D1');
    document.documentElement.style.setProperty('--ink3',  '#A8A29E');
    document.documentElement.style.setProperty('--ink4',  '#78716C');
    document.documentElement.style.setProperty('--border',  'rgba(245,242,236,0.1)');
    document.documentElement.style.setProperty('--border2', 'rgba(245,242,236,0.05)');
    document.body.style.background = '#1C1917';
    document.body.style.color      = '#F5F2EC';
    const topbar = document.querySelector('.topbar-wrap');
    if (topbar) topbar.style.background = 'rgba(28,25,23,.95)';
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  function applyLightModeCSS() {
    document.documentElement.style.removeProperty('--bg');
    document.documentElement.style.removeProperty('--bg2');
    document.documentElement.style.removeProperty('--bg3');
    document.documentElement.style.removeProperty('--ink');
    document.documentElement.style.removeProperty('--ink2');
    document.documentElement.style.removeProperty('--ink3');
    document.documentElement.style.removeProperty('--ink4');
    document.documentElement.style.removeProperty('--border');
    document.documentElement.style.removeProperty('--border2');
    document.body.style.background = '';
    document.body.style.color      = '';
    const topbar = document.querySelector('.topbar-wrap');
    if (topbar) topbar.style.background = '';
    document.documentElement.removeAttribute('data-theme');
  }

  // ── THEME PERSISTENCE ─────────────────────────────────────
  function applyTheme() {
    const savedAccent = localStorage.getItem('accent');
    if (savedAccent) {
      document.documentElement.style.setProperty('--accent', savedAccent);
    }

    const savedMode = localStorage.getItem('theme');

    if (savedMode === 'dark') {
      applyDarkModeCSS();
    } else if (savedMode === 'light') {
      applyLightModeCSS();
    } else {
      // No saved preference — respect OS setting
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyDarkModeCSS();
      }
    }

    // Listen for OS theme changes in real time (when no manual override saved)
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
          e.matches ? applyDarkModeCSS() : applyLightModeCSS();
        }
      });
    }
  }

  // ── SKIP TO CONTENT ───────────────────────────────────────
  // Injects a visually hidden skip link as the first element in body.
  // Becomes visible on focus — keyboard users can skip nav.
  function injectSkipLink() {
    if (document.getElementById('skip-to-content')) return;
    const skip = document.createElement('a');
    skip.id   = 'skip-to-content';
    skip.href = '#main-content';
    skip.textContent = 'Skip to main content';
    skip.style.cssText = [
      'position:fixed',
      'top:-100px',
      'left:1rem',
      'z-index:9999',
      'padding:.5rem 1rem',
      'background:var(--accent,#C2410C)',
      'color:#fff',
      'font-family:var(--mono,"DM Mono",monospace)',
      'font-size:.72rem',
      'border-radius:999px',
      'text-decoration:none',
      'transition:top .15s ease',
      'font-weight:500',
    ].join(';');
    skip.addEventListener('focus',  function() { skip.style.top = '1rem'; });
    skip.addEventListener('blur',   function() { skip.style.top = '-100px'; });
    document.body.insertBefore(skip, document.body.firstChild);

    // Tag the first <main> with the target id if it doesn't already have one
    const main = document.querySelector('main');
    if (main && !main.id) main.id = 'main-content';
  }

  // ── GDPR CONSENT BANNER ───────────────────────────────────
  // Minimal cookie consent for GA4. Fires GA4 only after consent.
  // Stored in localStorage — no cookie set by this script itself.
  function initConsent() {
    // If already decided, honour it
    const decision = localStorage.getItem('cookie-consent');
    if (decision === 'accepted') { enableGA4(); return; }
    if (decision === 'declined') { disableGA4(); return; }

    // Build banner
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.style.cssText = [
      'position:fixed',
      'bottom:0',
      'left:0',
      'right:0',
      'z-index:8000',
      'background:var(--ink,#1C1917)',
      'color:var(--dark-fg,#F5F2EC)',
      'padding:.9rem 1.4rem',
      'display:flex',
      'align-items:center',
      'justify-content:space-between',
      'gap:1rem',
      'flex-wrap:wrap',
      'font-family:var(--mono,"DM Mono",monospace)',
      'font-size:.66rem',
      'border-top:1px solid rgba(245,242,236,.12)',
    ].join(';');

    banner.innerHTML = [
      '<span style="color:#A8A29E;max-width:520px;line-height:1.65">',
        'This site uses Google Analytics to understand how it\'s being read. ',
        'No ads, no selling data. ',
        '<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" ',
          'style="color:#F5F2EC;text-decoration:underline">Google\'s privacy policy ↗</a>',
      '</span>',
      '<div style="display:flex;gap:.5rem;flex-shrink:0">',
        '<button id="consent-decline" style="',
          'font-family:inherit;font-size:.66rem;padding:.36rem .8rem;',
          'border-radius:999px;border:1px solid rgba(245,242,236,.2);',
          'background:transparent;color:#A8A29E;cursor:pointer;transition:.14s',
          '">No thanks</button>',
        '<button id="consent-accept" style="',
          'font-family:inherit;font-size:.66rem;padding:.36rem .8rem;',
          'border-radius:999px;border:none;',
          'background:#C2410C;color:#fff;cursor:pointer;',
          'font-weight:500;transition:.14s',
          '">Accept</button>',
      '</div>',
    ].join('');

    document.body.appendChild(banner);

    document.getElementById('consent-accept').addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'accepted');
      enableGA4();
      banner.remove();
    });

    document.getElementById('consent-decline').addEventListener('click', function() {
      localStorage.setItem('cookie-consent', 'declined');
      disableGA4();
      banner.remove();
    });
  }

  function enableGA4() {
    // GA4 gtag snippet is already on the page (async) — just set consent
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  }

  function disableGA4() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    // Delete existing GA cookies
    ['_ga', '_gid', '_gat'].forEach(function(name) {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + location.hostname;
    });
  }

  // ── NAV ACTIVE STATE ──────────────────────────────────────
  function setNavActive() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav a');
    links.forEach(function(link) {
      const href = (link.getAttribute('href') || '').split('?')[0];
      if (!href || href.startsWith('http')) return;
      if (path === href || (path === '/' && (href === '/' || href === '/index.html'))) {
        link.classList.add('nav-active');
      }
    });
  }

  // ── COLLAPSIBLE SECTIONS ──────────────────────────────────
  function initCollapsibles() {
    const triggers = document.querySelectorAll('[data-collapsible="trigger"]');
    triggers.forEach(function(trigger) {
      const content = trigger.nextElementSibling?.matches('[data-collapsible="content"]')
        ? trigger.nextElementSibling
        : trigger.parentElement.querySelector('[data-collapsible="content"]');
      if (!content) return;

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

      trigger.addEventListener('click', function() {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!expanded));
        content.style.display = expanded ? 'none' : '';
        const chevron = trigger.querySelector('[data-chevron]');
        if (chevron) chevron.style.transform = expanded ? '' : 'rotate(180deg)';
      });

      let resizeTimeout;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setInitialState, 150);
      });
    });
  }

  // ── BACK TO TOP ───────────────────────────────────────────
  function initBackToTop() {
    const anchor = document.querySelector('.quick-anchor');
    if (!anchor) return;
    anchor.style.transition = 'opacity .2s';
    anchor.style.opacity = '0';
    anchor.style.pointerEvents = 'none';
    window.addEventListener('scroll', function() {
      const show = window.scrollY > 400;
      anchor.style.opacity = show ? '1' : '0';
      anchor.style.pointerEvents = show ? '' : 'none';
    }, { passive: true });
  }

  // ── FAVICON FALLBACK ──────────────────────────────────────
  function initFaviconFallback() {
    document.querySelectorAll('.brand-icon img').forEach(function(img) {
      img.addEventListener('error', function() {
        img.style.display = 'none';
        const fallback = img.nextElementSibling;
        if (fallback && fallback.classList.contains('brand-icon-fallback')) {
          fallback.style.display = 'grid';
        }
      });
    });
  }

  // ── YEAR ─────────────────────────────────────────────────
  function setYear() {
    const el = document.getElementById('yr');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ── SIDEBAR OBSERVER (grimoires / notes) ─────────────────
  function initSidebarObserver() {
    const sidebar = document.querySelector('.sidebar, .notes-sidebar');
    if (!sidebar) return;
    const navLinks = sidebar.querySelectorAll('.nav-link, .sb-link');
    if (!navLinks.length) return;
    const sections = document.querySelectorAll('[id]');
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function(l) { l.classList.remove('active'); });
        const active = sidebar.querySelector('[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    sections.forEach(function(s) { observer.observe(s); });
  }

  // ── PORTFOLIO MODE TOGGLE ────────────────────────────────
  function initPortfolioMode() {
    window.toggleMode = function() {
      document.body.classList.toggle('portfolio-mode');
      const isPortfolio = document.body.classList.contains('portfolio-mode');
      const modeLabel   = document.getElementById('mode-label');
      const toggleLabel = document.getElementById('toggle-label');
      if (modeLabel) modeLabel.textContent = isPortfolio
        ? 'Portfolio mode — plain-English explanations on'
        : 'Technical mode — full system documentation';
      if (toggleLabel) toggleLabel.textContent = isPortfolio ? 'Technical mode' : 'Portfolio mode';
      document.querySelectorAll('.portfolio-explain, .show-in-portfolio').forEach(function(el) {
        el.style.display = isPortfolio ? 'block' : 'none';
      });
      localStorage.setItem('grimoire-mode', isPortfolio ? 'portfolio' : 'technical');
    };
    if (localStorage.getItem('grimoire-mode') === 'portfolio' &&
        !document.body.classList.contains('portfolio-mode')) {
      window.toggleMode();
    }
  }

  // ── READER PATH SELECTION ────────────────────────────────
  window.showPath = function(type) {
    document.querySelectorAll('.reader-path').forEach(function(el) { el.classList.remove('selected'); });
    document.querySelectorAll('.reader-guidance').forEach(function(el) { el.classList.remove('visible'); });
    const selected = document.querySelector('[onclick*="' + type + '"]');
    if (selected) selected.classList.add('selected');
    const guidance = document.getElementById('path-' + type);
    if (guidance) guidance.classList.add('visible');
  };

  // ── TOAST ─────────────────────────────────────────────────
  window._toast = function(msg, duration) {
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
    el._t = setTimeout(function() { el.style.opacity = '0'; }, duration);
  };

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    applyTheme();
    injectSkipLink();
    initConsent();
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
