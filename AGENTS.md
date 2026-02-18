# Agent Instructions — sitemariage

The task should be done with the relevant bmad subagents. Keeping context free.

## Project Overview
Wedding website for Anaël & Eric (October 18–20, 2026, Tel Aviv, Israel).
Single-page, trilingual (French default, Hebrew RTL, English), hosted on GitHub Pages.

**Live URL:** `https://elmagow.github.io/sitemariage/`
**GitHub repo:** `https://github.com/elmagow/sitemariage` (private)

## Tech Stack
- **Bundler:** Vite 5
- **JS:** Vanilla ES Modules (no framework)
- **Animation:** GSAP 3 + ScrollTrigger
- **Styles:** CSS Custom Properties (no preprocessor)
- **i18n:** Custom hand-rolled system (`src/i18n/`)
- **Deploy:** GitHub Actions → GitHub Pages (`base: '/sitemariage/'`)

## Key Rules (must follow exactly)

### RSVP Form
- POST to Google Apps Script using `URLSearchParams` — **NOT** `FormData`
- GAS endpoint URL lives in `src/modules/rsvp-form.js` as `GOOGLE_APPS_SCRIPT_URL`
- Current value is `PASTE_YOUR_GAS_URL_HERE` (placeholder — not yet configured)

### GSAP
- `scrub: true` — **never** `scrub: 1.5` or any numeric value (mobile fidelity)
- Import path: `import { ScrollTrigger } from 'gsap/ScrollTrigger'`

### Event Listeners
- `initEventModal()` and `initRsvpForm()` called **once** on load — never re-called
- Language switches use `updateEventModalLang()` / `updateRsvpFormLang()` only

### i18n / Language
- French is the default language (`lang="fr"` on `<html>`)
- Hebrew is RTL — all RTL overrides live in `src/styles/rtl.css`
- Hebrew uses `Frank Ruhl Libre` via `--font-hebrew` CSS variable
- All `data-i18n` elements must be pre-populated with French defaults (prevents flash)

### CSS
- `variables.css` must be imported **first** in `main.css` before all other partials
- Use `--font-heading` for Cormorant Garamond (display font)
- Use `--font-body` for Inter (body font)
- Use `--font-hebrew` for Frank Ruhl Libre (Hebrew only)
- `--color-accent-2` is the warm gold used for highlights
- `--color-light` is the warm cream background tone

### Git / Deploy
- **Always commit and push after completing any task**
- Remote: `https://github.com/elmagow/sitemariage` (HTTPS, authenticated via `gh` CLI as `elmagow`)
- Every push to `main` triggers auto-deploy via `.github/workflows/deploy.yml`
- Run `npm run build` and confirm zero errors before committing

## Project Structure
```
sitemariage/
├── .github/workflows/deploy.yml   # GitHub Actions → GitHub Pages
├── index.html                     # Single-page HTML (all sections)
├── package.json                   # Vite 5 + GSAP 3
├── vite.config.js                 # base: '/sitemariage/'
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js                    # Entry: imports CSS, inits modules, lang switcher
│   ├── assets/                    # SVG icons (logo, plane, walk, taxi, bus)
│   ├── i18n/
│   │   ├── index.js               # setLanguage(), t(), getCurrentLang()
│   │   ├── fr.js                  # French (default)
│   │   ├── he.js                  # Hebrew (RTL)
│   │   └── en.js                  # English
│   ├── modules/
│   │   ├── countdown.js           # Hero countdown timer (Oct 18 2026)
│   │   ├── travel-path.js         # GSAP ScrollTrigger travel animation
│   │   ├── event-modal.js         # Event modal open/close + lang update
│   │   └── rsvp-form.js           # RSVP modal, validation, GAS POST
│   └── styles/
│       ├── main.css               # Entry: @import all partials + Google Fonts
│       ├── variables.css          # All CSS custom properties
│       ├── layout.css             # Header, lang switcher, RSVP button
│       ├── hero.css               # Hero + countdown + prefers-reduced-motion
│       ├── travel-path.css        # Dotted line, sticky traveler, stops
│       ├── modal.css              # Shared modal overlay + prefers-reduced-motion
│       ├── rsvp.css               # RSVP form fields, validation, success/error
│       ├── practical-info.css     # 6-card responsive grid
│       └── rtl.css                # RTL + Hebrew font overrides
└── _bmad-output/
    └── implementation-artifacts/
        └── tech-spec-anael-eric-wedding-website.md
```

## Pending Human Actions
- **GitHub Pages:** Enable in repo settings → Pages → Source → GitHub Actions
- **GAS URL:** Replace `PASTE_YOUR_GAS_URL_HERE` in `src/modules/rsvp-form.js`
- **Event times:** Currently `TBD` in all locale files — update when confirmed
- **Photos:** Replace `.hero__photo-placeholder` SVG with real `<img>` when ready
