---
title: 'Anaël & Eric — Wedding Website'
slug: 'anael-eric-wedding-website'
created: '2026-02-18'
status: 'Completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Vite', 'Vanilla JS ES Modules', 'GSAP + ScrollTrigger', 'CSS Custom Properties', 'Google Apps Script', 'Google Fonts']
files_to_modify: ['index.html', 'src/main.js', 'src/i18n/index.js', 'src/i18n/fr.js', 'src/i18n/he.js', 'src/i18n/en.js', 'src/modules/travel-path.js', 'src/modules/event-modal.js', 'src/modules/rsvp-form.js', 'src/styles/main.css', 'src/styles/variables.css', 'src/styles/layout.css', 'src/styles/hero.css', 'src/styles/travel-path.css', 'src/styles/practical-info.css', 'src/styles/modal.css', 'src/styles/rsvp.css', 'src/styles/rtl.css', 'src/assets/logo-olive-tree.svg', 'src/assets/icon-plane.svg', 'src/assets/icon-taxi.svg', 'src/assets/icon-walk.svg', 'src/assets/icon-bus.svg', 'package.json', 'vite.config.js', 'public/favicon.svg']
code_patterns: ['Mobile-first CSS', 'CSS logical properties for RTL', 'data-i18n attribute pattern', 'GSAP ScrollTrigger scrub animation', 'ES Module pattern', 'Google Apps Script web app for RSVP']
test_patterns: ['Manual browser testing on Vite dev server', 'Real device testing via Vite --host flag']
---

# Tech-Spec: Anaël & Eric — Wedding Website

**Created:** 2026-02-18

## Overview

### Problem Statement

No website exists to inform guests about the 3-event destination wedding (Paris → Israel, October 2026) and collect RSVPs. Guests need a beautiful, mobile-first experience that communicates the travel journey, event details, and allows them to RSVP — in French, Hebrew, or English.

### Solution

A mobile-first static website built with Vite + vanilla HTML/CSS/JS. Features an Indiana-Jones-style animated dotted travel path (Paris → Israel) with transport icons that follow the scroll. Each event stop on the path is clickable, opening a modal with event details. Trilingual (FR/HE/EN) with RTL support for Hebrew. Autumnal color palette (orange, red, yellow, brown, terracotta) with a flat minimalist olive tree SVG logo. Custom RSVP modal form that submits directly to Google Sheets via Google Apps Script. Developed and tested locally via Vite dev server.

### Scope

**In Scope:**
- Mobile-first static site (Vite + vanilla HTML/CSS/JS)
- Indiana Jones-style vertical scroll animation with dotted travel path
- Transport icons that follow the dotted line as the user scrolls: ✈️ → 🚶/🚕 → 🚌 → 🚌 → ✈️
- Clickable event stops on the path → modal popup with event details
- 3 events: Welcome Dinner (Neve Tsedek, Oct 18), Beach Party (Herzliya, Oct 19), Wedding/Houpa (Achuza - Beit Hanan, Oct 20)
- Trilingual support: French, Hebrew, English — with RTL layout for Hebrew
- Language switcher (FR | HE | EN flags) in the header
- Autumnal color palette: orange, red, yellow, brown, terracotta
- Flat minimalist olive tree SVG logo
- Custom RSVP modal → Google Sheets API via Google Apps Script
- SVG placeholders for couple photos (photo-swap-ready slots)
- Practical Info section: 6 cards covering transport, hotels, getting around, currency, language, emergency numbers (trilingual)
- Local development only (Vite dev server)

**Out of Scope:**
- Backend / server-side code
- Real photos (SVG placeholders only, but structured for easy photo replacement)
- GitHub Pages / hosting setup
- Admin dashboard or RSVP management UI
- Payment or ticketing

---

## Context for Development

### Codebase Patterns

**Confirmed Clean Slate** — greenfield project, no legacy constraints.

**Color Palette (CSS Custom Properties):**
```css
--color-primary: #C1513A;      /* Terracotta */
--color-accent-1: #E07B39;     /* Burnt Orange */
--color-accent-2: #E8B84B;     /* Warm Yellow */
--color-dark: #3D2314;         /* Deep Brown */
--color-light: #F5ECD7;        /* Warm Cream */
--color-olive: #6B7C45;        /* Olive Green */
--color-surface: #FAF3E8;      /* Off-white warm surface */
```

**Typography:**
```css
--font-heading: 'Cormorant Garamond', serif;   /* Elegant, romantic */
--font-body: 'Inter', sans-serif;              /* Clean, legible */
```

**i18n Pattern — every visible text node uses data-i18n:**
```html
<h1 data-i18n="hero.title"></h1>
<p data-i18n="hero.subtitle"></p>
<button data-i18n="nav.rsvp"></button>
```
JS sets `element.textContent` from active translation object. Language switch sets `document.documentElement.lang` and `document.documentElement.dir` (RTL for Hebrew).

**GSAP ScrollTrigger Travel Path:**
- `.travel-section` is a tall section (`min-height: 300vh`) that pins the viewport
- SVG dashed vertical line is positioned absolutely behind stop markers
- `.traveler` div holds the active transport SVG; animated with `gsap.to('.traveler', { y: targetY, scrollTrigger: { trigger, scrub: true } })`
- **scrub value**: Use `scrub: true` (boolean = 1:1 scroll fidelity) NOT `scrub: 1.5` (smoothing lag). A lag value causes the icon to visually trail the user's actual scroll position, which is disorienting on fast mobile swipes. If the dev wants easing, use `scrub: 0.5` maximum.
- At each stop threshold, the transport icon inside `.traveler` swaps to the next mode
- Stop markers are `<button class="event-stop" data-event="eventId">` at absolute Y positions

**Event Data Object (in event-modal.js):**
```js
const EVENTS = {
  'paris-departure': { icon: 'plane', transport: null },
  'welcome-dinner': { icon: 'walk-taxi', transport: 'foot-taxi', date: 'Oct 18', location: 'Neve Tsedek' },
  'beach-party':    { icon: 'bus',      transport: 'bus',       date: 'Oct 19', location: 'Herzliya' },
  'wedding':        { icon: 'bus',      transport: 'bus',       date: 'Oct 20', location: 'Achuza, Beit Hanan' },
  'return':         { icon: 'plane',    transport: null }
}
```

**RSVP Form Fields:**
- Full name (text, required)
- Email (email, required)
- Events attending (checkboxes: Welcome Dinner / Beach Party / Wedding)
- Number of additional guests (number, min 0 "coming alone", max 9) — label: "How many people are you coming with? (enter 0 if coming alone)" — this avoids the ambiguity of "including yourself" and produces cleaner data in Google Sheets
- Dietary requirements (textarea)
- Message (textarea, optional)

**Google Apps Script POST:**
```js
const GOOGLE_APPS_SCRIPT_URL = 'PASTE_YOUR_GAS_URL_HERE'; // Eric to replace
// IMPORTANT: Use URLSearchParams, NOT FormData — GAS e.parameter only parses
// application/x-www-form-urlencoded; FormData sends multipart/form-data which GAS cannot parse.
const params = new URLSearchParams(new FormData(form));
fetch(GOOGLE_APPS_SCRIPT_URL, {
  method: 'POST',
  body: params,
  redirect: 'follow'  // GAS web apps redirect on POST — must follow
})
```

**RTL Pattern:**
- `rtl.css` uses `:root[dir="rtl"]` selector
- Use CSS logical properties everywhere (`margin-inline-start`, `padding-inline-end`, `text-align: start`)
- Only override non-logical properties in `rtl.css` (e.g. absolute positions, SVG transforms)

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `index.html` | Single-page HTML shell, all sections, data-i18n attributes |
| `package.json` | Vite + GSAP dependencies |
| `vite.config.js` | Minimal Vite config |
| `src/main.js` | App entry — imports and initializes all modules |
| `src/i18n/index.js` | Language switcher logic, active language state, DOM updater |
| `src/i18n/fr.js` | All French translation strings |
| `src/i18n/he.js` | All Hebrew translation strings |
| `src/i18n/en.js` | All English translation strings |
| `src/modules/travel-path.js` | GSAP ScrollTrigger animation, icon swap logic |
| `src/modules/event-modal.js` | Event stop click handler, modal open/close/populate |
| `src/modules/rsvp-form.js` | RSVP modal open/close, form submit, Google Sheets POST |
| `src/styles/variables.css` | All CSS custom properties (colors, fonts, spacing) |
| `src/styles/main.css` | CSS entry file, imports all partials |
| `src/styles/layout.css` | Base layout, mobile-first, header, footer |
| `src/styles/hero.css` | Hero section (couple names, date, logo) |
| `src/styles/travel-path.css` | Dotted line, stop markers, traveler icon, section layout |
| `src/styles/practical-info.css` | Practical info card grid (getting there, hotels, currency, etc.) |
| `src/styles/modal.css` | Event modal + RSVP modal shared styles |
| `src/styles/rsvp.css` | RSVP form field styles |
| `src/styles/rtl.css` | RTL layout overrides for Hebrew |
| `src/assets/logo-olive-tree.svg` | Flat minimalist olive tree SVG logo |
| `src/assets/icon-plane.svg` | Plane transport icon |
| `src/assets/icon-taxi.svg` | Taxi transport icon |
| `src/assets/icon-walk.svg` | Walk transport icon |
| `src/assets/icon-bus.svg` | Bus transport icon |
| `public/favicon.svg` | Olive tree favicon |

### Technical Decisions

1. **Vite over plain HTML**: HMR during dev, ES module imports, CSS imports from JS — zero config, better DX.
2. **GSAP ScrollTrigger**: Free for personal use. `scrub: true` ties animation progress directly to scroll — butter-smooth on mobile. No CSS-only alternative supports icon swapping between scroll segments.
3. **Google Apps Script as RSVP backend**: No CORS issues, free, serverless, writes directly to Google Sheets. GAS web app URL stored as a JS constant (acceptable for personal site — not a secret).
4. **Inline SVGs**: Transport icons and logo are inline so they are fully styleable with CSS and require zero network requests.
5. **No CSS framework**: Custom design with full control over autumnal palette. No framework fighting.
6. **Cormorant Garamond + Inter**: Romantic serif for headings, legible sans for body/UI.
7. **CSS logical properties for RTL**: `margin-inline-start`, `padding-inline-end`, `text-align: start` — RTL support mostly free. `rtl.css` only patches absolute-positioned elements.

---

## Implementation Plan

### Tasks

Tasks are ordered by dependency (lowest level first — no task depends on a later task).

---

**PHASE 1 — Project Foundation**

- [x] Task 1: Initialize Vite project
  - File: `package.json`
  - Action: Create with `{ "name": "sitemariage", "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" }, "devDependencies": { "vite": "^5.0.0" }, "dependencies": { "gsap": "^3.12.0" } }`
  - Notes: Run `npm install` after creating. GSAP is a runtime dependency (not dev-only).

- [x] Task 2: Create minimal Vite config
  - File: `vite.config.js`
  - Action: Create with `export default { root: '.', publicDir: 'public' }` — no special config needed for vanilla JS.

- [x] Task 3: Create CSS design tokens
  - File: `src/styles/variables.css`
  - Action: Define all CSS custom properties: color palette (7 colors), typography (2 font families), spacing scale (--space-xs through --space-2xl), border-radius tokens, transition durations, z-index scale.
  - Notes: These are the single source of truth — no magic values anywhere else in the codebase.

- [x] Task 4: Create CSS entry file
  - File: `src/styles/main.css`
  - Action: `@import` all partial CSS files in this order: variables, layout, hero, travel-path, practical-info, modal, rsvp, rtl. Also include CSS reset (box-sizing border-box, margin 0, font-size 100%) and Google Fonts `@import` for Cormorant Garamond and Inter.

---

**PHASE 2 — SVG Assets**

- [x] Task 5: Create olive tree SVG logo
  - File: `src/assets/logo-olive-tree.svg`
  - Action: Create a flat minimalist SVG of an olive tree. Style: single-stroke trunk, simple branching structure, small oval leaves. Viewbox: `0 0 80 100`. Use `currentColor` for fill so CSS can color it. Should read as recognizable at 40px height.

- [x] Task 6: Create transport icon SVGs
  - Files: `src/assets/icon-plane.svg`, `src/assets/icon-walk.svg`, `src/assets/icon-taxi.svg`, `src/assets/icon-bus.svg`
  - Action: Create 4 flat minimalist SVG icons. All 48×48 viewBox. All use `currentColor`. Style: clean outlines, minimal detail, consistent stroke weight.
    - Plane: side-view silhouette angled upward
    - Walk: stick figure mid-stride
    - Taxi: simple car side view with small "TAXI" text or checkered strip
    - Bus: simple rectangular bus side view with wheels

- [x] Task 7: Create olive tree favicon
  - File: `public/favicon.svg`
  - Action: Copy/simplify `logo-olive-tree.svg` for favicon use. Circular background in terracotta (`#C1513A`), white olive tree centered. Viewbox `0 0 32 32`.

---

**PHASE 3 — i18n System**

- [x] Task 8: Create English translations
  - File: `src/i18n/en.js`
  - Action: Export a JS object with ALL translation keys used across the site:
    ```js
    export default {
      nav: { rsvp: 'RSVP', lang_fr: 'FR', lang_he: 'HE', lang_en: 'EN' },
      hero: {
        title: 'Anaël & Eric',
        subtitle: 'are getting married',
        date: 'October 18–20, 2026',
        location: 'Tel Aviv, Israel',
        scroll_hint: 'Scroll to discover the journey'
      },
      journey: {
        paris: 'Paris, France',
        stop_1_name: 'Welcome Dinner',
        stop_1_location: 'Neve Tsedek, Tel Aviv',
        stop_1_date: 'Sunday, October 18',
        stop_1_time: 'TBD',
        stop_1_transport: 'On foot or taxi',
        stop_1_dresscode: 'Smart casual',
        stop_2_name: 'Beach Party',
        stop_2_location: 'Herzliya Beach',
        stop_2_date: 'Monday, October 19',
        stop_2_time: 'TBD',
        stop_2_transport: 'Bus provided',
        stop_2_dresscode: 'Casual / beach chic',
        stop_3_name: 'Wedding Ceremony',
        stop_3_location: 'Achuza, Beit Hanan',
        stop_3_date: 'Tuesday, October 20',
        stop_3_time: 'TBD',
        stop_3_transport: 'Bus provided',
        stop_3_dresscode: 'Formal / elegant',
        return: 'À bientôt!'
      },
      modal: {
        date_label: 'Date',
        location_label: 'Location',
        transport_label: 'Transport',
        dresscode_label: 'Dress code',
        close: 'Close'
      },
      practical: {
        title: 'Practical Information',
        subtitle: 'Everything you need to know for your trip',
        getting_there_title: 'Getting There',
        getting_there_body: 'Fly to Ben Gurion International Airport (TLV), located 20 minutes from Tel Aviv. Direct flights from Paris CDG with Air France and El Al.',
        where_to_stay_title: 'Where to Stay',
        where_to_stay_body: 'We recommend staying in the Neve Tsedek or Jaffa area — close to Event 1 and the heart of Tel Aviv. Hotels: The Jaffa, Cinematheque Tel Aviv, or short-term rentals on Airbnb.',
        getting_around_title: 'Getting Around',
        getting_around_body: 'Download the Gett app for taxis. Bus transport is provided for the Beach Party and Wedding. For Event 1, Neve Tsedek is walkable from most central hotels.',
        currency_title: 'Currency',
        currency_body: 'Israeli Shekel (ILS / ₪). Credit cards are widely accepted everywhere. ATMs available throughout Tel Aviv.',
        language_title: 'Language',
        language_body: 'Hebrew is the official language, but English is widely spoken in Tel Aviv. French speakers may also find some locals who speak French.',
        emergency_title: 'Useful Numbers',
        emergency_body: 'Emergency: 101 (police), 102 (ambulance). French embassy in Tel Aviv: +972-3-520-2400.'
      },
      rsvp: {
        title: 'RSVP',
        subtitle: 'We can\'t wait to celebrate with you!',
        name_label: 'Full name',
        name_placeholder: 'Your name',
        email_label: 'Email',
        email_placeholder: 'your@email.com',
        events_label: 'Which events will you attend?',
        event_1: 'Welcome Dinner (Oct 18)',
        event_2: 'Beach Party (Oct 19)',
        event_3: 'Wedding (Oct 20)',
        guests_label: 'How many people are you coming with? (enter 0 if coming alone)',
        dietary_label: 'Dietary requirements',
        dietary_placeholder: 'Vegetarian, vegan, allergies...',
        message_label: 'Message for the couple (optional)',
        message_placeholder: 'Share your excitement!',
        submit: 'Send RSVP',
        submitting: 'Sending...',
        success: 'Thank you! We\'ll be in touch.',
        error: 'Something went wrong. Please try again.'
      }
    }
    ```

- [x] Task 9: Create French translations
  - File: `src/i18n/fr.js`
  - Action: Export same key structure as `en.js` with all strings in French. Key differences: hero subtitle "se marient", journey location names stay in original (Neve Tsedek etc.), transport descriptions in French ("À pied ou en taxi", "Bus mis à disposition"), dresscode in French. Include the full `practical` key group translated in French (getting there, where to stay, getting around, currency, language, useful numbers).

- [x] Task 10: Create Hebrew translations
  - File: `src/i18n/he.js`
  - Action: Export same key structure with all strings in Hebrew (RTL). Include proper Hebrew text for all keys. Note: location names (Neve Tsedek, Herzliya, Achuza) stay in their common Hebrew spellings (נווה צדק, הרצליה, אחוזה). Include the full `practical` key group in Hebrew — practical info is especially important for Hebrew-speaking guests who may need context on logistics for a 3-day event.

- [x] Task 11: Create i18n controller
  - File: `src/i18n/index.js`
  - Action: Create and export:
    - `LANGUAGES` object: `{ fr: frTranslations, he: heTranslations, en: enTranslations }`
    - `currentLang` state variable (default `'fr'`)
    - `setLanguage(lang)` function:
      1. Sets `currentLang = lang`
      2. Sets `document.documentElement.lang = lang`
      3. Sets `document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'`
      4. Queries all `[data-i18n]` elements
      5. For each, resolves the key path (e.g. `"hero.title"`) against `LANGUAGES[lang]` and sets `element.textContent`
    - `t(key)` helper: returns `LANGUAGES[currentLang][...key.split('.')]` — used by JS modules to get translated strings programmatically
    - Default export: `{ setLanguage, t, currentLang: () => currentLang }`

---

**PHASE 4 — HTML Structure**

- [x] Task 12: Create index.html
  - File: `index.html`
  - Action: Create the full single-page HTML. Structure:
    ```html
    <!DOCTYPE html>
    <html lang="fr" dir="ltr">
    <head>
      <!-- meta charset, viewport, title, favicon, Google Fonts link -->
      <!-- <link rel="stylesheet" href="/src/styles/main.css"> -->
    </head>
    <body>
      <!-- HEADER: logo + language switcher + RSVP button -->
      <header class="site-header">
        <div class="logo"><!-- inline olive tree SVG --></div>
        <nav class="lang-switcher">
          <button class="lang-btn" data-lang="fr" data-i18n="nav.lang_fr">FR</button>
          <button class="lang-btn" data-lang="he" data-i18n="nav.lang_he">HE</button>
          <button class="lang-btn" data-lang="en" data-i18n="nav.lang_en">EN</button>
        </nav>
        <button class="rsvp-btn" data-i18n="nav.rsvp">RSVP</button>
      </header>

      <!-- HERO: couple names, date, scroll hint -->
      <section class="hero">
        <div class="hero__logo"><!-- larger olive tree SVG --></div>
        <h1 class="hero__names" data-i18n="hero.title">Anaël & Eric</h1>
        <p class="hero__subtitle" data-i18n="hero.subtitle"></p>
        <p class="hero__date" data-i18n="hero.date"></p>
        <p class="hero__location" data-i18n="hero.location"></p>
        <div class="hero__photo-placeholder"><!-- SVG rect placeholder, swap for <img> later --></div>
        <p class="hero__scroll-hint" data-i18n="hero.scroll_hint"></p>
      </section>

      <!-- TRAVEL PATH SECTION: the animated journey -->
      <section class="travel-section">
        <!-- SVG dashed vertical line (absolute, behind everything) -->
        <svg class="travel-line" ...>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke-dasharray="8 12" .../>
        </svg>

        <!-- TRAVELER: the moving transport icon -->
        <div class="traveler" aria-hidden="true">
          <!-- transport SVGs injected by travel-path.js -->
        </div>

        <!-- STOP: Paris (departure) -->
        <div class="journey-stop journey-stop--city" data-stop="paris-departure" style="top: 0%">
          <span class="stop-dot stop-dot--city"></span>
          <span class="stop-label" data-i18n="journey.paris"></span>
          <!-- inline plane SVG icon -->
        </div>

        <!-- STOP: Welcome Dinner -->
        <button class="journey-stop event-stop" data-event="welcome-dinner" style="top: 25%">
          <span class="stop-dot"></span>
          <span class="stop-label" data-i18n="journey.stop_1_name"></span>
          <span class="stop-sublabel" data-i18n="journey.stop_1_location"></span>
        </button>

        <!-- STOP: Beach Party -->
        <button class="journey-stop event-stop" data-event="beach-party" style="top: 50%">
          <span class="stop-dot"></span>
          <span class="stop-label" data-i18n="journey.stop_2_name"></span>
          <span class="stop-sublabel" data-i18n="journey.stop_2_location"></span>
        </button>

        <!-- STOP: Wedding -->
        <button class="journey-stop event-stop" data-event="wedding" style="top: 75%">
          <span class="stop-dot"></span>
          <span class="stop-label" data-i18n="journey.stop_3_name"></span>
          <span class="stop-sublabel" data-i18n="journey.stop_3_location"></span>
        </button>

        <!-- STOP: Return -->
        <div class="journey-stop journey-stop--city" data-stop="return" style="top: 100%">
          <span class="stop-dot stop-dot--city"></span>
          <span class="stop-label" data-i18n="journey.return"></span>
        </div>
      </section>

      <!-- PRACTICAL INFO SECTION -->
      <section class="practical-info">
        <h2 class="section-title" data-i18n="practical.title"></h2>
        <p class="section-subtitle" data-i18n="practical.subtitle"></p>
        <div class="practical-grid">
          <div class="practical-card">
            <h3 data-i18n="practical.getting_there_title"></h3>
            <p data-i18n="practical.getting_there_body"></p>
          </div>
          <div class="practical-card">
            <h3 data-i18n="practical.where_to_stay_title"></h3>
            <p data-i18n="practical.where_to_stay_body"></p>
          </div>
          <div class="practical-card">
            <h3 data-i18n="practical.getting_around_title"></h3>
            <p data-i18n="practical.getting_around_body"></p>
          </div>
          <div class="practical-card">
            <h3 data-i18n="practical.currency_title"></h3>
            <p data-i18n="practical.currency_body"></p>
          </div>
          <div class="practical-card">
            <h3 data-i18n="practical.language_title"></h3>
            <p data-i18n="practical.language_body"></p>
          </div>
          <div class="practical-card">
            <h3 data-i18n="practical.emergency_title"></h3>
            <p data-i18n="practical.emergency_body"></p>
          </div>
        </div>
      </section>

      <!-- EVENT MODAL (hidden by default) -->
      <div class="modal-overlay" id="event-modal" role="dialog" aria-modal="true" hidden>
        <div class="modal-card">
          <button class="modal-close" aria-label="Close" data-i18n="modal.close">×</button>
          <h2 class="modal-title" id="modal-event-name"></h2>
          <dl class="modal-details">
            <dt data-i18n="modal.date_label"></dt><dd id="modal-event-date"></dd>
            <dt data-i18n="modal.location_label"></dt><dd id="modal-event-location"></dd>
            <dt data-i18n="modal.transport_label"></dt><dd id="modal-event-transport"></dd>
            <dt data-i18n="modal.dresscode_label"></dt><dd id="modal-event-dresscode"></dd>
          </dl>
        </div>
      </div>

      <!-- RSVP MODAL (hidden by default) -->
      <div class="modal-overlay" id="rsvp-modal" role="dialog" aria-modal="true" hidden>
        <div class="modal-card modal-card--rsvp">
          <button class="modal-close" aria-label="Close">×</button>
          <h2 data-i18n="rsvp.title"></h2>
          <p data-i18n="rsvp.subtitle"></p>
          <form id="rsvp-form" novalidate>
            <!-- name, email, event checkboxes, guests number, dietary, message, submit -->
          </form>
          <div class="rsvp-success" hidden></div>
          <div class="rsvp-error" hidden></div>
        </div>
      </div>

      <script type="module" src="/src/main.js"></script>
    </body>
    </html>
    ```
  - Notes: All visible text uses `data-i18n`. `hidden` attribute on modals. `<script type="module">` loads main.js.

---

**PHASE 5 — CSS Styles**

- [x] Task 13: Create base layout CSS
  - File: `src/styles/layout.css`
  - Action: Write mobile-first base styles:
    - CSS reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
    - `body`: `font-family: var(--font-body); background: var(--color-light); color: var(--color-dark); line-height: 1.6;`
    - `.site-header`: fixed top, full width, flex row (logo | lang-switcher | rsvp-btn), backdrop-blur, `z-index: 100`
    - `.lang-btn`: small pill buttons, active state highlighted with terracotta underline
    - `.rsvp-btn`: terracotta background, cream text, rounded, hover lift effect
    - Responsive: at 768px, header gets more horizontal padding

- [x] Task 14: Create hero CSS
  - File: `src/styles/hero.css`
  - Action: Style the hero section:
    - Full viewport height (`min-height: 100svh`)
    - Flex column center
    - Warm cream background with subtle autumnal texture (CSS radial gradient overlay)
    - `.hero__names`: large Cormorant Garamond, `font-size: clamp(2.5rem, 8vw, 5rem)`, deep brown
    - `.hero__subtitle`: italic, smaller, terracotta color
    - `.hero__date` / `.hero__location`: Inter, medium weight, muted brown
    - `.hero__photo-placeholder`: centered rounded rect, warm olive border, 280px × 200px on mobile, scales up on tablet
    - `.hero__scroll-hint`: small, animated bounce arrow, fades in after 1s

- [x] Task 15: Create travel path CSS
  - File: `src/styles/travel-path.css`
  - Action: Style the travel section:
    - `.travel-section`: `position: relative; min-height: 300vh;` — tall section for scroll space. 300vh (~2700px on mobile) gives enough room for 4 distinct stop moments without feeling like a marathon. If stops feel rushed during testing, increase to 400vh max.
    - `.travel-line`: absolute positioned SVG, centered horizontally, full height, `stroke: var(--color-olive); stroke-dasharray: 8 12; opacity: 0.5`
    - `.traveler`: `position: sticky; top: 50%; width: 56px; height: 56px;` — stays in center of viewport as user scrolls, left-offset to align with the line
    - `.traveler svg`: `width: 100%; height: 100%; color: var(--color-primary);`
    - `.journey-stop`: `position: absolute; left: 50%; transform: translateX(-50%);` displayed as flex row with dot + labels
    - `.stop-dot`: 16px circle, terracotta fill, white border, box-shadow glow on hover
    - `.stop-dot--city`: 24px circle, olive green fill — for Paris and Return stops (not clickable)
    - `.event-stop`: cursor pointer, `transition: transform 0.2s;` — scale on hover to signal interactivity
    - `.stop-label`: Cormorant Garamond, 1.1rem, bold
    - `.stop-sublabel`: Inter, 0.8rem, muted

- [x] Task 16: Create modal CSS
  - File: `src/styles/modal.css`
  - Action: Style both modals with shared styles:
    - `.modal-overlay`: `position: fixed; inset: 0; background: rgba(61,35,20,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center;`
    - `[hidden]` on overlay: `display: none`
    - `.modal-card`: `background: var(--color-surface); border-radius: 16px; padding: var(--space-xl); max-width: 480px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative;`
    - `.modal-close`: absolute top-right, 32px circle button, hover terracotta
    - `.modal-title`: Cormorant Garamond, large, deep brown
    - `.modal-details`: `dl` grid layout — `dt` in olive/muted, `dd` in dark bold
    - Entry animation: `transform: translateY(20px); opacity: 0` → `translateY(0); opacity: 1` via CSS transition on `.modal-overlay.is-open .modal-card`

- [x] Task 17: Create RSVP form CSS
  - File: `src/styles/rsvp.css`
  - Action: Style the RSVP form fields:
    - `.modal-card--rsvp`: wider max-width (560px)
    - Form fields: `display: flex; flex-direction: column; gap: var(--space-md);`
    - `input`, `textarea`: full width, padding, `border: 1.5px solid var(--color-olive); border-radius: 8px; background: white; font-family: var(--font-body);` — focus ring in terracotta
    - Checkboxes: custom styled with autumnal accent color
    - Submit button: full width, terracotta, large, Cormorant Garamond, hover darken
    - `.rsvp-success`: green-tinted cream box, checkmark icon, success message
    - `.rsvp-error`: red-tinted, error message with retry hint

- [x] Task 18: Create practical info CSS
  - File: `src/styles/practical-info.css`
  - Action: Style the practical info section:
    - `.practical-info`: `padding: var(--space-2xl) var(--space-md); background: var(--color-surface);`
    - `.section-title`: Cormorant Garamond, centered, large, deep brown
    - `.section-subtitle`: Inter, centered, muted, smaller
    - `.practical-grid`: CSS grid, `grid-template-columns: 1fr` on mobile, `repeat(2, 1fr)` at 600px, `repeat(3, 1fr)` at 900px, `gap: var(--space-lg)`
    - `.practical-card`: `background: white; border-radius: 12px; padding: var(--space-lg); border-inline-start: 4px solid var(--color-primary);` (logical property — flips in RTL)
    - `.practical-card h3`: Cormorant Garamond, terracotta color, margin-bottom
    - `.practical-card p`: Inter, body size, line-height 1.7

- [x] Task 19: Create RTL CSS
  - File: `src/styles/rtl.css`
  - Action: Override layout-specific (non-logical) properties for Hebrew:
    ```css
    :root[dir="rtl"] .site-header { flex-direction: row-reverse; }
    :root[dir="rtl"] .journey-stop { flex-direction: row-reverse; }
    :root[dir="rtl"] .traveler { /* mirror icon if needed */ transform: scaleX(-1); }
    :root[dir="rtl"] .modal-close { left: var(--space-md); right: auto; }
    :root[dir="rtl"] .stop-label { text-align: right; }
    ```
  - Notes: Most layout already handled by logical CSS properties. This file only patches absolute positioning and flex row direction where needed.

---

**PHASE 6 — JavaScript Modules**

- [x] Task 19: Create travel path animation module
  - File: `src/modules/travel-path.js`
  - Action: Create and export `initTravelPath()` function:
    1. Import `gsap` and `ScrollTrigger` from `'gsap/ScrollTrigger'`
    2. Register `gsap.registerPlugin(ScrollTrigger)`
    3. Define `STOPS` array:
       ```js
       const STOPS = [
         { id: 'paris-departure', yPercent: 0,   icon: 'plane',     label: null },
         { id: 'welcome-dinner',  yPercent: 0.25, icon: 'walk-taxi', label: 'welcome-dinner' },
         { id: 'beach-party',     yPercent: 0.50, icon: 'bus',       label: 'beach-party' },
         { id: 'wedding',         yPercent: 0.75, icon: 'bus',       label: 'wedding' },
         { id: 'return',          yPercent: 1.0,  icon: 'plane',     label: null },
       ]
       ```
    4. Inject initial transport icon (plane SVG) into `.traveler`
    5. Get `.travel-section` total height, calculate absolute Y pixel positions for each stop
     6. Create GSAP ScrollTrigger for the `.traveler`:
           - Pin `.traveler` in the viewport center
           - Use `scrub: true` for 1:1 scroll fidelity (NOT `scrub: 1.5` — smoothing lag causes icon to trail scroll position on mobile fast-swipes, which is disorienting)
       - At each stop threshold (via `onUpdate`), swap the `.traveler` inner SVG to the next transport icon
    7. Each stop transition swaps to the correct icon:
       - Paris → Neve Tsedek: plane → walk/taxi
       - Neve Tsedek → Herzliya: walk/taxi → bus
       - Herzliya → Achuza: bus → bus (same, no swap needed)
       - Achuza → Return: bus → plane
    8. Export `initTravelPath`

- [x] Task 20: Create event modal module
  - File: `src/modules/event-modal.js`
  - Action: Create and export two functions: `initEventModal(tFn)` (called ONCE on startup) and `updateEventModalLang(tFn)` (called on language switch — NO listener re-attachment):
    1. Define module-level `let currentT = null` — stores the active `t()` function reference
    2. Define `EVENT_KEYS` map:
       ```js
       const EVENT_KEYS = {
         'welcome-dinner': { name: 'journey.stop_1_name', date: 'journey.stop_1_date', location: 'journey.stop_1_location', transport: 'journey.stop_1_transport', dresscode: 'journey.stop_1_dresscode' },
         'beach-party':    { name: 'journey.stop_2_name', date: 'journey.stop_2_date', location: 'journey.stop_2_location', transport: 'journey.stop_2_transport', dresscode: 'journey.stop_2_dresscode' },
         'wedding':        { name: 'journey.stop_3_name', date: 'journey.stop_3_date', location: 'journey.stop_3_location', transport: 'journey.stop_3_transport', dresscode: 'journey.stop_3_dresscode' },
       }
       ```
    3. `openModal(eventId)`: uses `currentT()` to resolve keys, populates `#modal-event-name`, `#modal-event-date`, `#modal-event-location`, `#modal-event-transport`, `#modal-event-dresscode`, removes `hidden` from `#event-modal`, adds `is-open` class for CSS animation, traps focus inside modal.
    4. `closeModal()`: adds `hidden` to `#event-modal`, removes `is-open`, returns focus to trigger element.
    5. `initEventModal(tFn)`:
       - Sets `currentT = tFn`
       - Attaches click listeners (ONCE) to all `.event-stop` buttons → `openModal(button.dataset.event)`
       - Attaches click listener to `.modal-close` inside `#event-modal` → `closeModal()`
       - Attaches click listener to `#event-modal` backdrop → `closeModal()`
       - Attaches keydown listener: `Escape` → `closeModal()`
    6. `updateEventModalLang(tFn)`: simply sets `currentT = tFn` — NO listener re-attachment. Called on language switch instead of re-running `initEventModal`.
    7. Export `{ initEventModal, updateEventModalLang }`
  - Notes: This pattern prevents duplicate listeners accumulating on language switches. The `t()` reference is updated in-place; the next modal open call picks up the new language automatically.

- [x] Task 21: Create RSVP form module
  - File: `src/modules/rsvp-form.js`
  - Action: Create and export `initRsvpForm()` function:
    1. Define `GOOGLE_APPS_SCRIPT_URL = 'PASTE_YOUR_GAS_URL_HERE'` — constant at top of file with clear comment
    2. `openRsvpModal()`: removes `hidden` from `#rsvp-modal`, adds `is-open`, traps focus
    3. `closeRsvpModal()`: adds `hidden`, removes `is-open`
    4. Attach `.rsvp-btn` click → `openRsvpModal()`
    5. Attach `#rsvp-modal` backdrop click → `closeRsvpModal()`
    6. Attach `#rsvp-modal .modal-close` click → `closeRsvpModal()`
    7. Attach `Escape` keydown → `closeRsvpModal()`
     8. Form submit handler on `#rsvp-form`:
           - `event.preventDefault()`
           - Client-side validation: name and email required, at least one event checkbox checked
           - Show submitting state on submit button (disable, change text to i18n `rsvp.submitting`)
           - Send via URLSearchParams (NOT FormData — GAS e.parameter requires `application/x-www-form-urlencoded`):
             ```js
             const params = new URLSearchParams(new FormData(form));
             fetch(GOOGLE_APPS_SCRIPT_URL, { method: 'POST', body: params, redirect: 'follow' })
             ```
           - On success: hide form, show `.rsvp-success` div with success message
           - On error: show `.rsvp-error` div, re-enable submit button
    9. Export `initRsvpForm`
  - Notes: Eric must create a Google Apps Script web app that accepts POST and appends to Google Sheet. Instructions to be included in Notes section below.

- [x] Task 22: Create app entry point
  - File: `src/main.js`
  - Action:
    ```js
    import './styles/main.css'   // ← relative to src/main.js, NOT '../src/styles/main.css'
    import { setLanguage, t } from './i18n/index.js'
    import { initTravelPath } from './modules/travel-path.js'
    import { initEventModal, updateEventModalLang } from './modules/event-modal.js'
    import { initRsvpForm } from './modules/rsvp-form.js'

    // Initialize default language (French)
    setLanguage('fr')

    // Initialize modules ONCE — listeners attached here, never re-attached
    initTravelPath()
    initEventModal(t)   // passes t() reference for modal content population
    initRsvpForm()

    // Language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang)
        // Update active state styling
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('is-active'))
        btn.classList.add('is-active')
        // Update modal lang reference ONLY — do NOT call initEventModal() again (prevents duplicate listeners)
        updateEventModalLang(t)
      })
    })
    ```
  - Notes: CSS import path is `'./styles/main.css'` (relative to `src/main.js`). Never `'../src/styles/main.css'` — that path would fail in Vite since `main.js` is already inside `src/`.

---

### Acceptance Criteria

- [x] AC 1: Given the site loads in a browser, when no interaction occurs, then the hero section displays "Anaël & Eric", the wedding date (Oct 18–20, 2026), and the olive tree logo in the autumnal color palette.

- [x] AC 2: Given the user scrolls down through the travel section, when scroll progresses from 0% to 100%, then the transport icon moves smoothly along the dotted vertical line, transitioning from ✈️ (plane) → 🚶/🚕 (walk/taxi) → 🚌 (bus) → 🚌 (bus) → ✈️ (plane) at the correct scroll positions.

- [x] AC 3: Given the travel path is visible, when the user clicks on the "Welcome Dinner" stop, then a modal opens displaying: event name, date (Oct 18), location (Neve Tsedek), transport (foot/taxi), and dress code.

- [x] AC 4: Given the travel path is visible, when the user clicks on the "Beach Party" stop, then a modal opens displaying: event name, date (Oct 19), location (Herzliya Beach), transport (bus provided), and dress code.

- [x] AC 5: Given the travel path is visible, when the user clicks on the "Wedding" stop, then a modal opens displaying: event name, date (Oct 20), location (Achuza, Beit Hanan), transport (bus provided), and dress code.

- [x] AC 6: Given an event modal is open, when the user clicks the close button, clicks the backdrop, or presses Escape, then the modal closes and focus returns to the triggering stop button.

- [x] AC 7: Given the header is visible, when the user clicks the RSVP button, then the RSVP modal opens with the full form (name, email, event checkboxes, guest count, dietary, message).

- [x] AC 8: Given the RSVP modal is open and form is filled with valid data, when the user submits the form, then a POST request is sent to the Google Apps Script URL, and on success the form is replaced with a thank-you message.

- [x] AC 9: Given the RSVP form is submitted with missing required fields (name or email empty, or no events selected), when submit is clicked, then validation errors are shown inline and the form is not submitted.

- [x] AC 10: Given the RSVP form submission fails (network error or GAS error), when the fetch rejects, then an error message is shown in the modal with a prompt to retry, and the submit button is re-enabled.

- [x] AC 11: Given the site is loaded, when the user clicks "HE" in the language switcher, then all visible text switches to Hebrew, the page layout direction changes to RTL (right-to-left), and the `<html>` element has `dir="rtl"` and `lang="he"`.

- [x] AC 12: Given the site is loaded in Hebrew (RTL mode), when the user views the header and travel path, then the layout is correctly mirrored (logo on right, RSVP button on left, stop labels align right).

- [x] AC 13: Given the site is loaded in French, when the user clicks "EN" then "FR", then all text correctly switches language each time, with no stale translations remaining.

- [x] AC 14: Given a mobile device at 375px width, when the page loads, then all content is readable without horizontal scroll, touch targets are at least 44px, and the scroll animation functions correctly.

- [x] AC 15: Given the hero section contains a `.hero__photo-placeholder` element, when a developer replaces it with an `<img>` tag of the same dimensions, then the layout does not break.

- [x] AC 16: Given the site is loaded, when the user scrolls to the Practical Info section, then 6 cards are visible (Getting There, Where to Stay, Getting Around, Currency, Language, Useful Numbers) in the active language, laid out in a responsive grid (1 col mobile → 2 col tablet → 3 col desktop).

---

## Review Notes
- Adversarial review completed
- Findings: 13 total, 13 fixed, 0 skipped
- Resolution approach: auto-fix
- Key fixes: localized RSVP validation errors, modal exit animation, `prefers-reduced-motion` support, English locale French leak, Israel emergency numbers corrected (100 police / 101 ambulance), photo placeholder defrancification, footer added, HTML pre-populated with French defaults to eliminate content flash, olive tree SVG deduplicated via symbol/use, inert GSAP no-op removed, z-index token cleaned up, duplicate CSS declaration removed

---

## Additional Context

### Dependencies

**npm (install via `npm install`):**
- `gsap@^3.12` — scroll animation (includes ScrollTrigger plugin)
- `vite@^5.0` (devDependency) — local dev server + bundler

**Google Fonts (loaded in `<head>` via link tag):**
- `Cormorant+Garamond:wght@400;500;600`
- `Inter:wght@400;500`

**External Services:**
- **Google Apps Script Web App** — Eric must set up:
  1. Open Google Sheets, create a sheet with columns: Timestamp, Name, Email, Events, Guests, Dietary, Message
  2. Extensions → Apps Script → paste the following doPost(e) script:
     ```js
     // IMPORTANT: fetch sends URLSearchParams (application/x-www-form-urlencoded)
     // so e.parameter correctly parses the fields.
     function doPost(e) {
       const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       const data = e.parameter;
       sheet.appendRow([new Date(), data.name, data.email, data.events, data.guests, data.dietary, data.message]);
       return ContentService
         .createTextOutput(JSON.stringify({ status: 'ok' }))
         .setMimeType(ContentService.MimeType.JSON);
     }
     ```
  3. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone → Deploy
  4. Copy the web app URL and paste into `src/modules/rsvp-form.js` as `GOOGLE_APPS_SCRIPT_URL`

### Testing Strategy

1. **Local dev**: `npm run dev` — Vite serves at `localhost:5173`, HMR enabled
2. **Real mobile device**: `npm run dev -- --host` — exposes on local network IP for phone testing
3. **Language switching**: Manually click FR / HE / EN, verify all text updates, verify RTL layout flip for Hebrew
4. **Scroll animation**: Test on desktop and mobile; verify icon transitions happen at correct scroll positions
5. **Event modals**: Click each stop, verify correct data displayed, verify close (button, backdrop, Escape)
6. **RSVP submission**: Fill form and submit, verify row appears in Google Sheet
7. **RSVP validation**: Submit empty form, verify required field errors appear
8. **RSVP error state**: Temporarily break the GAS URL, verify error message appears and submit re-enables
9. **Keyboard accessibility**: Tab through interactive elements, verify focus order, verify modal focus trap
10. **RTL visual QA**: Switch to Hebrew, manually verify the travel path section — stop labels align right, `.traveler` icon is correctly positioned on the line, `.site-header` is mirrored, modal close button is on the correct side

### Notes

**High-risk items:**
- **GSAP mobile scroll performance**: `.travel-section` is set to `300vh` (~2700px on a typical mobile). Test on a real device early via `npm run dev -- --host`. If stops feel rushed, increase to `400vh` max and recalculate `yPercent` stop positions in `travel-path.js`.
- **RTL with GSAP**: The `.traveler` element's X position may need a RTL offset adjustment — the line is centered so this should be minimal, but verify visually.
- **Google Apps Script CORS**: By default, GAS web apps return a redirect on POST from fetch(). Must ensure the GAS script uses `ContentService` return (not HtmlService) and the fetch uses `redirect: 'follow'` or the GAS is configured to avoid redirect. Test thoroughly.
- **Hebrew font rendering**: Cormorant Garamond does not include Hebrew glyphs. The `he.js` translations will fall back to the browser's default Hebrew serif. Consider adding a Hebrew-compatible font (e.g. `Frank Ruhl Libre` from Google Fonts) loaded conditionally for Hebrew mode.

**Future considerations (out of scope):**
- Hosting on GitHub Pages + custom domain (Namecheap/Cloudflare ~$10–12/yr)
- Photo replacement: swap `.hero__photo-placeholder` SVG for real couple photo `<img>`
- Event times: currently TBD, update in translation files when confirmed
- Countdown timer in hero section
- Guest list / seating chart
- Music/playlist integration
