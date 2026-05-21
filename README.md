# Aaron Suarez — Portfolio Site
**Dev reference for the repo. Read this before touching anything.**

Live at: `https://suarezaaronroy-sys.github.io/`

---

## Repo Structure

```
/
├── index.html                    # Hero only. Nav cards to all sections.
├── about.html                    # Bio, timeline, work with me
├── articles.html                 # Placeholder — planned pieces listed
├── projects.html                 # Grimoire list → direct links (no middle page)
├── notes.html                    # Full notes page, sidebar nav, no floating window
├── fix-my-systems.html           # Instant redirect → asmultitaskcollective
│
├── grimoires/
│   ├── 001-asmc-crm-engine.html  # LIVE — Grimoire v8.1 (purple accent)
│   ├── 002-dual-wing-rental.html # LIVE — Dual Wing v4 (teal accent)
│   ├── 003-ghl-101.html          # LIVE — GHL 101 2026 Edition (blue accent)
│   ├── 004-n8n-101.html          # PLACEHOLDER — noindex
│   ├── 005-zapier-101.html       # PLACEHOLDER — noindex
│   ├── 006-automations-101.html  # PLACEHOLDER — noindex
│   ├── 007-agentic-ai-101.html   # PLACEHOLDER — noindex
│   ├── 008-seo-101.html          # PLACEHOLDER — noindex
│   ├── 009-payment-support.html  # PLACEHOLDER — noindex
│   └── 010-claude-openclaw.html  # PLACEHOLDER — noindex
│
├── assets/
│   ├── css/
│   │   ├── global.css            # Shared tokens, nav, footer, buttons, callouts
│   │   └── grimoire.css          # Grimoire layout, sidebar, dark blocks, SEO sublayers
│   ├── js/
│   │   ├── analytics.js          # GA4 init + per-page tracking + event tracking
│   │   └── ui.js                 # Theme, nav active, collapsibles, back-to-top, toast
│   └── img/
│       └── favicon.png           # Used as brand-icon on all pages
│
├── robots.txt                    # Crawl rules — placeholders disallowed
├── sitemap.xml                   # 8 indexable pages — placeholders excluded
└── README.md                     # This file
```

---

## Visual Language Rules

### Font Stack
- **Headings:** `Fraunces` (serif) — weight 600 for h1/h2, 300 italic for `em` accents
- **Mono/UI:** `DM Mono` — nav pills, badges, labels, code
- **Body:** `DM Sans` — weight 300 base, 400/500 for emphasis

### Color Tokens (always use CSS vars, never hardcode hex)
```css
--bg:    #F5F2EC  /* warm parchment base */
--bg2:   #EDE9E0  /* card surfaces */
--bg3:   #E5E0D5  /* hover states, tags */
--ink:   #1C1917  /* primary text */
--ink2:  #44403C  /* body text */
--ink3:  #78716C  /* muted text */
--ink4:  #A8A29E  /* labels, timestamps */
--accent:#C2410C  /* terracotta — primary accent */
--dark:  #1C1917  /* dark block surfaces */
```

### THE CRITICAL RULE — Dark Blocks
**Never use `background: #000` or `background: black`.**

Dark showcase blocks use `var(--dark)` which is `#1C1917` — warm ink, not black.
Text inside must always have explicit color set:
- Headings: `color: var(--dark-fg)` → `#F5F2EC`
- Body text: `color: var(--dark-muted)` → `#A8A29E`
- Strong text: `color: #D6D3D1`
- Green values: `#86EFAC` ✓ readable on `#1C1917`
- Blue values: `#93C5FD` ✓ readable on `#1C1917`
- Amber values: `#FCD34D` ✓ readable on `#1C1917`

This was the bug in M1.1 SEO sublayer of the original Dual Wing — the black block made text invisible because no explicit text color was set inside dark containers.

---

## Navigation Pattern

### Active State
Each page sets its own nav active link inline via `class="nav-active"`. The `ui.js` also does a path-match fallback. Active color varies by page section:
- Projects: teal
- Notes: purple
- About: teal
- Articles: blue
- Theme: amber
- Sound: teal

### Route Pattern
```
Index → Projects page → Grimoire (direct link, no summary page)
```
No middle pages. No summary routes. Click → Grimoire.

---

## Analytics

GA4 Measurement ID: `G-GYPEWZXH03`

Every page includes GA4 with a `page_title` and `page_path` config so individual pages appear in GA reports (not just `/`).

Tracked events:
- `grimoire_open` — clicking to open any grimoire
- `nav_click` — main nav interactions
- `scroll_depth` — 25/50/75/90% milestones
- `external_link` — all outbound clicks
- `asmc_cta_click` — "Fix My Systems" CTA specifically

To add GA to a new page, include the inline snippet:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GYPEWZXH03"></script>
<script>
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  gtag('js',new Date());
  gtag('config','G-GYPEWZXH03',{page_title:'Your Page Title',page_path:'/your-path.html'});
</script>
```

---

## Adding a New Grimoire

1. Create `grimoires/0XX-your-slug.html`
2. Copy the placeholder template from any `004`–`010` file
3. Remove `<meta name="robots" content="noindex"/>` when ready to publish
4. Add to `sitemap.xml`
5. Remove from `robots.txt` disallow list
6. Update `projects.html` — add live card above placeholders
7. Update `index.html` — add to grimoire preview grid
8. Update all placeholder series-pills to show new one as `.live`

### Grimoire Visual Pattern Per Number
| # | Accent color | Dark block variant |
|---|---|---|
| 001 | Purple `#7C3AED` | `.gc.purple` |
| 002 | Teal `#0D9488` | `.gc.teal` |
| 003 | Blue `#1D4ED8` | `.lg-badge.blue` |
| 004 | Blue `#1D4ED8` | — |
| 005 | Orange `#EA580C` | — |
| 006 | Green `#15803D` | — |
| 007 | Purple `#7C3AED` | — |
| 008 | Blue `#1D4ED8` | — |
| 009 | Amber `#B45309` | — |
| 010 | Terracotta `#C2410C` | — |

---

## Updating Notes

Notes live in `notes.html` as static HTML cards. There's no CMS.

To add a note:
1. Add a new `.note-card` inside the appropriate `.notes-cat-section`
2. Update the count in `.cat-header` span
3. Update the sidebar `.sb-section` with the new title
4. If featuring: update `.featured-note` section
5. Update `notes.html` meta description if it references note count

---

## Shared Assets — When to Use What

### `global.css`
Import on every page. Contains:
- CSS custom properties (all design tokens)
- Base body + reset
- Topbar / nav / brand
- Footer
- Buttons, callouts, badges, section dividers
- Notebook button pattern
- `pre` code block defaults

### `grimoire.css`
Import only on grimoire pages. Contains:
- Mode banner (portfolio/technical toggle)
- Grimoire header (sticky at top:40px)
- Sidebar layout + nav links
- Module section pattern
- Dark block components (data-struct, loop-diagram, power-tip)
- SEO sublayer components
- Portfolio mode CSS overrides
- Sequence timeline, feature grid

### `analytics.js`
Import on every page. Self-initializing. Sets up GA4 and all event tracking.

### `ui.js`
Import on every page with `defer`. Handles:
- Theme persistence from localStorage
- Nav active state (fallback)

---

## Development Status
- `README.md` updated to reflect that implementation work has started.
- This repo is currently ready for edits and authoring improvements in the site files.
- Collapsible sections (data-collapsible attributes)
- Back-to-top anchor visibility
- Favicon fallback
- Year auto-fill
- Sidebar intersection observer (grimoires)
- Portfolio mode toggle (grimoires)
- `_toast()` utility

---

## GitHub Pages Notes

- No build step. Pure HTML/CSS/JS.
- Deploy: push to `main` → auto-deploys via GitHub Pages
- Custom domain: not set (using default `suarezaaronroy-sys.github.io`)
- Assets: served from root. All paths use `/assets/...` absolute paths.
- If adding a 404 page: create `404.html` at root with same nav/footer.

---

## SEO Checklist per New Page

- [ ] `<title>` — descriptive, includes "Aaron Suarez"
- [ ] `<meta name="description">` — 150–160 chars
- [ ] `<link rel="canonical">` — absolute URL
- [ ] GA4 snippet with `page_title` and `page_path`
- [ ] `<meta name="robots" content="noindex"/>` ONLY for utility pages
- [ ] OG tags for shareable pages (index, about, projects, grimoires)
- [ ] Add to `sitemap.xml` if indexable

---

## The Grimoire Series — Full Plan

| # | Title | Status |
|---|---|---|
| 001 | ASMC Full Stack CRM Engine | ✅ Live |
| 002 | Dual Wing Rental Marketing Engine | ✅ Live |
| 003 | GHL 101 — 2026 Edition | ✅ Live |
| 004 | N8N 101 | 🔜 Planned |
| 005 | Zapier 101 | 🔜 Planned |
| 006 | Automations 101 | 🔜 Planned |
| 007 | Agentic AI 101 | 🔜 Planned |
| 008 | SEO 101 | 🔜 Planned |
| 009 | Basic Payment Processing — Support Specialist POV | 🔜 Planned |
| 010 | Claude + OpenClaw 101 — The Viral Combo | 🔜 Planned |

---

*Last updated: April 2026*
