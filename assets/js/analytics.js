/**
 * analytics.js — Aaron Suarez Portfolio
 * GA4 initialization + per-page event tracking
 *
 * Usage: <script src="/assets/js/analytics.js"></script>
 * Set window.PAGE_TITLE and window.PAGE_PATH before including,
 * OR let this script auto-detect from document.title and location.pathname.
 *
 * GA4 Measurement ID: G-GYPEWZXH03
 */

(function () {
  'use strict';

  const GA_ID = 'G-GYPEWZXH03';

  // ── INJECT GA4 SCRIPT ──────────────────────────────────────
  function loadGA() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
  }

  // ── PAGE CONFIG ────────────────────────────────────────────
  function getPageConfig() {
    // Allow per-page overrides via window variables
    const title = window.PAGE_TITLE || document.title || 'Page';
    const path  = window.PAGE_PATH  || window.location.pathname;
    return { title, path };
  }

  // ── SEND PAGE VIEW ─────────────────────────────────────────
  function sendPageView() {
    if (typeof window.gtag !== 'function') return;
    const { title, path } = getPageConfig();

    window.gtag('config', GA_ID, {
      page_title: title,
      page_path:  path,
    });
  }

  // ── TRACK GRIMOIRE OPENS ───────────────────────────────────
  // Fires when a user clicks any .gc-open, .btn-open, or .grimoire-open-btn
  function trackGrimoireClicks() {
    document.addEventListener('click', function (e) {
      const target = e.target.closest(
        '.gc-open, .btn-open, .grimoire-open-btn, [data-track-grimoire]'
      );
      if (!target) return;

      const grimoire = target.closest('[data-grimoire]')?.dataset.grimoire
        || target.dataset.trackGrimoire
        || target.textContent.trim().slice(0, 40);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'grimoire_open', {
          event_category: 'engagement',
          event_label: grimoire,
        });
      }
    });
  }

  // ── TRACK NAV CLICKS ──────────────────────────────────────
  function trackNavClicks() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('.nav a');
      if (!link) return;

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'nav_click', {
          event_category: 'navigation',
          event_label: link.textContent.trim(),
          event_value: link.href,
        });
      }
    });
  }

  // ── TRACK SCROLL DEPTH ────────────────────────────────────
  function trackScrollDepth() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 90];
    const fired = new Set();

    window.addEventListener('scroll', function () {
      const scrolled = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      if (scrolled > maxScroll) maxScroll = scrolled;

      milestones.forEach(function (m) {
        if (scrolled >= m && !fired.has(m)) {
          fired.add(m);
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'scroll_depth', {
              event_category: 'engagement',
              event_label: m + '%',
              event_value: m,
              non_interaction: true,
            });
          }
        }
      });
    }, { passive: true });
  }

  // ── TRACK EXTERNAL LINK CLICKS ────────────────────────────
  function trackExternalLinks() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const isExternal = link.hostname !== window.location.hostname
        && link.hostname !== '';

      if (isExternal && typeof window.gtag === 'function') {
        window.gtag('event', 'external_link', {
          event_category: 'outbound',
          event_label: link.href,
        });
      }
    });
  }

  // ── TRACK ASMC CTA CLICKS ────────────────────────────────
  // Specific tracking for "Fix My Systems" CTA — business-critical
  function trackASMCClicks() {
    document.addEventListener('click', function (e) {
      const cta = e.target.closest('.nav-cta, [href*="aaron-systems"]');
      if (!cta) return;

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'asmc_cta_click', {
          event_category: 'conversion',
          event_label: 'Fix My Systems',
        });
      }
    });
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    loadGA();

    // Wait for GA to initialize before sending page view
    setTimeout(function () {
      sendPageView();
    }, 100);

    trackGrimoireClicks();
    trackNavClicks();
    trackScrollDepth();
    trackExternalLinks();
    trackASMCClicks();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
