---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - _bmad-output/planning-artifacts/ux-design-specification.md
documentCounts:
  briefs: 0
  research: 0
  projectDocs: 2
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general_personal_event
  complexity: low_domain_medium_technical
  projectContext: greenfield_rewrite
---

# Product Requirements Document - sitemariage

**Author:** Eric
**Date:** 2026-02-19

## Executive Summary

A professional-grade, mobile-first wedding website for Anael & Eric's celebration (October 18-20, 2026, Tel Aviv, Israel). Complete rewrite of an amateur v1 prototype using Astro + React Islands + shadcn/ui + Tailwind CSS + D3.js, deployed on GitHub Pages.

The primary audience is wedding guests (ages 20s-70s+) accessing via WhatsApp-shared links on mobile phones. Two language communities: French-speaking (default, primary) and Hebrew-speaking (full RTL support). The site must be instantly impressive, effortlessly usable by older guests, and flawlessly bilingual.

The core experience is a scroll-driven geographic journey: guests scroll through a D3.js orthographic globe that zooms from Paris into each venue across Israel, with an Indiana Jones-style route line drawn in real-time. Four event stops (Mairie, Welcome Dinner, Beach Party, Wedding Ceremony) are revealed through an 8-beat zoom/dezoom/travel cycle. Tapping any stop opens a detail modal. Below the journey, practical travel info cards and a persistent RSVP button complete the page.

The visual direction is "Warm Invitation" -- the site feels like opening a beautifully crafted physical wedding invitation. Gold-dominant palette (#E8B84B), decorative double borders, Playfair Display typography, cream backgrounds, and invitation-card-styled modals. No backend -- RSVP submissions POST to Google Apps Script.

### What Makes This Special

No wedding website uses a scroll-driven interactive globe with geographic zoom cycles. The combination of D3.js orthographic projection, Indiana Jones route animation, three-level progressive disclosure (globe overview -> zoomed stop -> modal detail), and physical invitation aesthetic is entirely novel. Geography IS the narrative device -- transforming a functional wedding site into an emotional storytelling experience that guests screenshot and share.

Astro islands architecture ensures static content ships zero JavaScript while interactive elements (globe, modals, RSVP, language switcher) load progressively -- critical for mobile performance on mid-range devices via WhatsApp links.

## Project Classification

| Dimension | Value |
|---|---|
| **Type** | Static web app (single-page, scroll-driven, SPA-like) |
| **Stack** | Astro + React Islands + shadcn/ui + Tailwind CSS + D3.js + GSAP |
| **Domain** | Personal event (wedding) |
| **Domain Complexity** | Low (no compliance, no auth, no persistent data) |
| **Technical Complexity** | Medium (D3.js globe, GSAP scroll animation, bilingual RTL, islands architecture) |
| **Project Context** | Greenfield rewrite (v1 exists as prototype reference, not as codebase to extend) |
| **Deploy** | GitHub Pages via GitHub Actions |
| **Backend** | None (Google Apps Script for RSVP only) |

## Success Criteria

### User Success

- **"Wow" moment on first scroll:** Guest scrolls past hero, globe responds immediately, and the zoom-into-Paris animation creates genuine surprise. This is the moment guests screenshot and share.
- **Effortless event discovery:** Each zoom-in clearly identifies the event (emoji + label), and tapping opens a modal with complete details. Zero ambiguity at any disclosure level.
- **RSVP completion end-to-end:** Guest opens RSVP modal, fills required fields, submits, and sees warm confirmation. Target: >80% completion rate among guests who open the form.
- **Cross-generational usability:** A 70-year-old French guest on an older iPhone can scroll through the entire journey, tap event stops, read all details, and submit RSVP without confusion.
- **Flawless bilingual experience:** Language switch is instant (no reload, no flash), RTL layout mirrors correctly, and Hebrew typography feels native, not bolted-on.

### Business Success

- **100% RSVP functionality:** Every guest who wants to RSVP can do so successfully. GAS endpoint configured and tested.
- **Guest confidence:** Zero placeholder content -- all event times, locations, and details complete before sharing the link.
- **Shareability:** The globe experience is impressive enough that guests share it organically in WhatsApp groups.
- **Zero maintenance:** Once deployed, the site requires no ongoing attention. Static hosting, no backend to monitor.

### Measurable Outcomes

All performance and accessibility targets are defined as testable thresholds in the [Non-Functional Requirements](#non-functional-requirements) section (NFR1-NFR18). Key business metrics:

| Metric | Target | Measurement |
|---|---|---|
| RSVP form completion rate | >80% of openers | GAS spreadsheet submissions vs. site visits |
| Content flash occurrences | 0 | Visual testing, all languages |
| Lighthouse Performance (mobile) | >90 | Lighthouse CI on every PR |
| Lighthouse Accessibility (mobile) | >90 | Lighthouse CI on every PR |

## Product Scope

### MVP -- Minimum Viable Product

Everything needed to share the link with guests. The MVP IS the complete product -- all three user journeys must be supported.

| # | Feature | Description |
|---|---|---|
| 1 | **Globe Journey** | D3.js orthographic globe, 8-beat zoom/dezoom/travel cycle, Indiana Jones route line, 4 event stop markers, scroll-driven via GSAP (scrub: true) |
| 2 | **Event Modals** | shadcn/ui Dialog per event with complete details (date, time, location, transport, dress code), invitation card styling |
| 3 | **RSVP Modal** | shadcn/ui form (name, email, events, guest count, dietary, message), Zod validation, GAS POST, success/error feedback |
| 4 | **Hero Section** | Couple names (Playfair Display), date, location, countdown (months + days), invitation border frame |
| 5 | **Practical Info** | 6 static Astro cards: flights, hotels, transport, currency, emergency, weather/tips |
| 6 | **Language Switcher** | FR/HE toggle, instant client-side switch, RTL layout mirror, React context state |
| 7 | **Fixed Header** | Logo, language switcher, RSVP button -- always visible |
| 8 | **Warm Invitation Design** | Gold-dominant palette, decorative borders, Playfair Display + DM Sans typography |
| 9 | **Reduced Motion Fallback** | Static map with all stops visible and tappable, no animation |
| 10 | **Responsive** | Mobile-first, tested iPhone SE through desktop |

### Post-MVP (Phase 2 -- Enhancement)

| Feature | Value | Dependency |
|---|---|---|
| Toast notifications (shadcn/ui) | Better RSVP feedback UX | RSVP working |
| InvitationBorder decorative elements | Full invitation aesthetic | Core layout complete |
| Animation tuning & visual polish | Smoothness, easing, micro-interactions | Globe + modals working |
| Self-hosted fonts (.woff2) | Eliminate Google Fonts CDN dependency | Fonts chosen and tested |
| Skip navigation link | Keyboard accessibility enhancement | Header working |

### Vision (Phase 3 -- Post-Launch)

| Feature | Trigger |
|---|---|
| English (3rd language) | If anglophone-only guests identified |
| Photo gallery | When couple provides photos |
| Swipe-down modal dismiss | User feedback indicates desire |
| Post-wedding mode | After October 20, 2026 |

## User Journeys

### Journey 1: Discovery -- Marie, 68, Anael's aunt from Lyon

**Opening Scene:** Marie receives a WhatsApp message from Anael with a link. She taps it on her iPhone SE. She's excited but slightly anxious -- she's never been to Israel, her English is poor, and she worries about logistics.

**Rising Action:** The hero loads instantly: "Anael & Eric" in elegant gold lettering, "18-20 octobre 2026, Tel Aviv," and a countdown. Everything is in French. She scrolls down. A globe appears and starts zooming into Paris -- she sees the Mairie stop with a building emoji. She taps it. A beautiful card opens: the civil ceremony details, the address, "tenue de ville." She closes it and keeps scrolling. The route traces across the Mediterranean. The globe zooms into Tel Aviv, then Herzliya Beach, then the wedding venue. At each stop she taps and reads.

**Climax:** After the globe, she reaches the practical info cards: flights to Tel Aviv, recommended hotels, local transport, currency, emergency numbers. Every question she was worrying about is answered.

**Resolution:** She taps the RSVP button in the header. She fills in her name, email, checks events, enters 1 additional guest (her husband), notes "pas de fruits de mer" in dietary, and taps "Envoyer." A warm message confirms her RSVP. She screenshots the globe and sends it to her sister.

**Requirements revealed:** FR1-5, FR7-9, FR10-13, FR16, FR20-27 | NFR1-4, NFR10-13

---

### Journey 2: RSVP Error Recovery -- Yonatan, 31, Eric's colleague from Tel Aviv

**Opening Scene:** Yonatan gets the link in a Hebrew WhatsApp group. He taps it on his Samsung Galaxy A53. Tech-savvy, Hebrew-speaking, wants to RSVP fast.

**Rising Action:** The site loads in French. He taps the Hebrew button. Instantly, everything flips to RTL -- header mirrors, text in Hebrew with Frank Ruhl Libre, globe labels switch. He scrolls through quickly -- the globe is smooth on his mid-range Android.

**Climax:** He taps RSVP, enters a typo in his email. Submit shows an inline error in Hebrew (warm tone). He fixes it, taps Submit again. His phone loses connectivity in the elevator. Timeout after 10 seconds -- warm error message, form data preserved. He taps Submit in the lobby. Success.

**Resolution:** Thank-you card appears. He goes back to scrolling the globe.

**Requirements revealed:** FR14-19, FR5 | NFR5-7, NFR18, NFR22-24

---

### Journey 3: Reduced Motion -- David, 45, accessibility-conscious friend

**Opening Scene:** David has `prefers-reduced-motion: reduce` on his MacBook. Opens the link in Safari.

**Rising Action:** Hero renders normally. Where the globe would be, he sees a static map with all four stops labeled and the complete route line drawn. No scroll pinning, no animation.

**Climax:** He tabs through the page with keyboard. Enter on "Welcome Dinner" -- modal appears instantly. Focus lands on close button. Escape closes it; focus returns to the stop marker.

**Resolution:** Navigates to RSVP via header button, fills form with keyboard, submits. Everything works identically minus motion.

**Requirements revealed:** FR6, FR28-29 | NFR14-17

---

### Journey Requirements Summary

| Capability | Revealed By | Priority |
|---|---|---|
| Globe 8-beat scroll animation (60fps) | Journey 1, 2 | Critical |
| Event modals with complete details | Journey 1, 2, 3 | Critical |
| RSVP form with validation + GAS submission | Journey 1, 2 | Critical |
| French default with zero content flash | Journey 1 | Critical |
| Hebrew RTL instant switch | Journey 2 | Critical |
| Network error handling + data preservation | Journey 2 | Critical |
| prefers-reduced-motion static map fallback | Journey 3 | High |
| Full keyboard navigation + focus management | Journey 3 | High |
| Practical info cards (6 categories) | Journey 1 | High |
| Cross-generational touch targets (44px+) | Journey 1 | High |
| Warm, non-technical error messages (i18n) | Journey 2 | High |
| ARIA labels + screen reader support | Journey 3 | High |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Scroll-driven geographic narrative (novel interaction pattern)**
No wedding website -- and very few websites of any kind -- uses a scroll-driven D3.js orthographic globe with zoom/dezoom/travel cycles as the primary content delivery mechanism. Combines established patterns (Apple scroll-driven storytelling, Google Language Explorer globe, Airbnb progressive disclosure) into a novel combination.

**2. Indiana Jones route line as narrative device**
Real-time SVG stroke-dashoffset animation drawing a dashed route across the Mediterranean, driven 1:1 by scroll position. The route line IS the progress indicator.

**3. Three-level progressive disclosure for event information**
Globe overview (geographic context) -> zoomed stop with emoji/label (event identification) -> modal with full details (complete information). Sequences wedding information through discovery rather than listing.

### Market Context

Wedding platforms (Zola, The Knot, Joy, Minted) offer template-based sites with static event lists. None offer scroll-driven animation, geographic event presentation, or custom globe visualizations. Closest analogs: Google Language Explorer (globe) and Apple product pages (scroll storytelling) -- neither is a wedding site.

### Validation Approach

- **Performance validation (week 1):** Test 8-beat globe on Samsung Galaxy A53. If <30fps, trigger fallback: reduced geographic detail or pre-rendered zoom states.
- **Usability validation (pre-launch):** Test with 2-3 real guests from different age groups. Watch for: scroll confusion, missed tap targets, failure to discover event modals.
- **Cross-browser validation:** Safari iOS, Chrome Android, Safari macOS -- the three critical browsers.

## Web App Specific Requirements

### Architecture Overview

Single-page static site: Astro (static HTML generation) + React Islands (interactive components). Ships as static HTML with progressive JS hydration. No client-side routing, no SPA framework -- Astro renders one `index.html` with React islands that hydrate on demand.

**Island hydration strategy:**
- `client:load` -- Countdown, Language Switcher (needed immediately)
- `client:visible` -- GlobeJourney (heavy, load only when scrolled into view)
- `client:idle` -- EventModal, RsvpModal (load after main thread is idle)

**Architectural constraints:**
- No SPA routing -- scroll position is the navigation state
- No real-time -- RSVP is fire-and-forget POST to GAS
- No auth -- public site, no protected routes
- No database -- GAS spreadsheet managed externally
- GitHub Pages: static only, no SSR, no API routes. Astro `output: 'static'`, base: `/sitemariage/`

### Browser Support Matrix

| Browser | Platform | Priority |
|---|---|---|
| Safari | iOS (iPhone/iPad) | Critical |
| Chrome | Android | Critical |
| Chrome | macOS/Windows | High |
| Safari | macOS | High |
| Firefox | Desktop | Medium |
| Samsung Internet | Samsung devices | Medium |

Minimum: last 2 major versions. No IE11, no legacy Edge.

### Responsive Design

| Breakpoint | Width | Key Changes |
|---|---|---|
| Base | 0-639px | Single column, full-screen modals, globe fills viewport, 56px header |
| sm (640px) | 640-767px | 2-col practical info, centered modals, invitation borders appear |
| md (768px) | 768-1023px | Header expands, globe framing space, modal max-widths enforced |
| lg (1024px) | 1024-1279px | 3-col practical info, max content width, generous section spacing |
| xl (1280px) | 1280px+ | Maximum whitespace, decorative elements fully expressed |

**Critical device targets:** iPhone SE (375px), iPhone 14/15 (390px), Samsung Galaxy A53 (412px).

### SEO & Social Sharing

Minimal SEO -- private site shared via WhatsApp links, not discovered via search.
- **Open Graph meta tags:** Title, description, preview image for WhatsApp link previews (critical for shareability)
- **`robots: noindex`** -- optional, site is personal
- **Semantic HTML:** `<header>`, `<main>`, `<section>`, `<footer>` for accessibility

### Accessibility Implementation

**Target: WCAG 2.1 Level AA** (see NFR10-NFR18 for testable requirements)

| Category | Implementation |
|---|---|
| Color contrast | Dark on Light ~12:1 (AAA), Light on Primary ~4.8:1 (AA large text), Dark on Gold ~5.2:1 (AA) |
| Focus indicators | 2px terracotta ring, 2px cream offset on all interactive elements |
| Touch targets | 44px x 44px minimum, enforced via `min-h-11 min-w-11` |
| Keyboard navigation | Skip link -> header -> globe stops -> footer; Enter/Space activates; Escape closes modals |
| Screen readers | `role="img"` on globe, `aria-label` on stops, `aria-live` on countdown/toasts, `aria-modal` on dialogs |
| Motion | `prefers-reduced-motion` -> StaticMapFallback, instant transitions, no scroll pinning |
| Font sizing | 16px minimum body, `clamp()` for fluid display sizes |
| RTL | Tailwind `rtl:` variants + logical properties (`ms-`, `me-`, `ps-`, `pe-`) |

**Automated testing:** axe-core on every build, Lighthouse Accessibility >90 on every PR, eslint-plugin-jsx-a11y in development.

## Project Scoping & Risk

### MVP Strategy

**Experience MVP** -- the globe journey IS the product. Shipping without it would be a generic wedding template. All 10 MVP features and all 3 user journeys ship together in Phase 1.

**Resource Requirements:** One senior frontend developer (Astro, React, D3.js, GSAP, Tailwind). Eric provides content, translations, event data, and GAS endpoint. No designer -- UX spec provides complete visual specifications.

### Risk Mitigation

**Technical Risks:**

| Risk | Probability | Mitigation | Fallback |
|---|---|---|---|
| D3.js globe <30fps on Galaxy A53 | Medium | Pre-computed keyframes, minimal SVG nodes, early device testing week 1 | Reduce detail; worst case: pre-rendered images with crossfade |
| GSAP ScrollTrigger + Astro hydration conflict | Low | Initialize in `useEffect` with cleanup; test hydration timing | Defer to `client:visible` |
| shadcn/ui + Astro integration issues | Low | shadcn/ui = React components; Astro React integration is mature | Use Radix primitives directly |
| GAS endpoint rate limiting or failure | Low | 10s timeout, retry with preserved data, warm error messages | Email link fallback in error state |
| SVG route line janky during zoom transitions | Medium | GPU-accelerated `will-change`; path geometry recalculated via D3 geo path generator | Simplify path, reduce waypoints |

**Scope Risks:**

| Risk | Mitigation |
|---|---|
| Scope creep | MVP is locked: 10 features, 3 journeys. Nothing else ships in Phase 1. |
| Event details not finalized | All data confirmed before link shared. Zero placeholders. |
| Font choice regret | UX spec lists 5 fallback options. Swappable without architectural impact. |

## Functional Requirements

### Globe Journey

- **FR1:** Guest can scroll through an 8-beat geographic journey from Paris to Israel on an interactive globe
- **FR2:** Guest can see the globe zoom into each venue location during the corresponding scroll beat
- **FR3:** Guest can see an animated route line progressively drawn between venues as they scroll
- **FR4:** Guest can see emoji-labeled stop markers appear at each venue when the globe zooms in
- **FR5:** Guest can tap/click a stop marker to open the corresponding event detail modal
- **FR6:** Guest with `prefers-reduced-motion` enabled can see a static map displaying all venues, the complete route, and tappable stop markers without any animation

### Event Information

- **FR7:** Guest can view event details (name, date, time, location, transport, dress code) for each of the 4 events via modal
- **FR8:** Guest can close an event modal via close button, backdrop tap, or Escape key
- **FR9:** Guest can view event details in their selected language (French or Hebrew)

### RSVP

- **FR10:** Guest can open the RSVP form from any point on the page via the persistent header button
- **FR11:** Guest can submit their name, email, selected events (1-4), additional guest count (0-9), dietary requirements, and a message
- **FR12:** Guest can see inline validation errors on submit if required fields are missing or invalid
- **FR13:** Guest can see a warm confirmation message after successful RSVP submission
- **FR14:** Guest can see a warm error message and retry if submission fails, with all form data preserved
- **FR15:** Guest can submit RSVP in their selected language (French or Hebrew) with all labels, errors, and confirmation translated

### Language & Localization

- **FR16:** Guest can switch the site language between French (default) and Hebrew
- **FR17:** Guest can see all site content update instantly in the selected language without page reload
- **FR18:** Guest can see the full page layout mirror to RTL when Hebrew is selected (header, cards, modals, text alignment)
- **FR19:** Guest can see Hebrew text rendered in a Hebrew-appropriate serif font (Frank Ruhl Libre)
- **FR20:** Guest arriving at the site sees all content pre-populated in French with no flash of empty or untranslated content

### Hero & Countdown

- **FR21:** Guest can see the couple's names, wedding date, and location on the hero section
- **FR22:** Guest can see a countdown displaying months and days remaining until October 18, 2026
- **FR23:** Guest can see a celebration message on or after the wedding date instead of the countdown

### Practical Information

- **FR24:** Guest can view 6 practical information categories: flights, hotels, transport, currency, emergency contacts, and weather/tips
- **FR25:** Guest can view practical information in their selected language

### Navigation & Layout

- **FR26:** Guest can see a fixed header with logo, language switcher, and RSVP button visible at all times during scroll
- **FR27:** Guest can access the RSVP modal from the header with a single tap at any scroll position
- **FR28:** Guest can navigate all interactive elements via keyboard (Tab, Enter/Space, Escape)
- **FR29:** Guest using a screen reader can understand the page structure and all interactive elements via ARIA labels and semantic HTML

## Non-Functional Requirements

### Performance

| NFR | Requirement | Rationale |
|---|---|---|
| **NFR1** | First Contentful Paint <1.5s on mid-range mobile over 3G | Guests tapping WhatsApp links expect instant load |
| **NFR2** | Largest Contentful Paint <2.5s on mid-range mobile over 3G | Hero must be visible before guest loses patience |
| **NFR3** | Cumulative Layout Shift <0.1 | No content jump on load; French defaults pre-populated |
| **NFR4** | Total Blocking Time <200ms | Main thread available for scroll input; islands hydrate progressively |
| **NFR5** | Globe scroll animation sustains 60fps on Samsung Galaxy A53 | Janky animation destroys the "wow" moment |
| **NFR6** | Globe scroll input-to-visual response <100ms | Scroll must feel 1:1 connected to globe movement |
| **NFR7** | Modal opens within 200ms of tap/click | Modals must feel instant |
| **NFR8** | Total JavaScript bundle <40 KB gzipped | Mobile performance budget |
| **NFR9** | Globe SVG DOM footprint <5 MB in memory | Prevent memory pressure on mid-range devices |

### Accessibility

| NFR | Requirement | Rationale |
|---|---|---|
| **NFR10** | WCAG 2.1 Level AA compliance across all states | Cross-generational audience (20s-70s+) |
| **NFR11** | Color combinations meet 4.5:1 (normal text) or 3:1 (large text) contrast | Readability for older guests |
| **NFR12** | All interactive elements have minimum 44px x 44px touch target | Reduced fine motor control on mobile |
| **NFR13** | Minimum body font size 16px | Prevents iOS Safari auto-zoom on input focus |
| **NFR14** | Complete keyboard navigation: Tab, Enter/Space, Escape | Users who can't or don't use touch/mouse |
| **NFR15** | Focus trapped in open modals; returned to trigger on close | Keyboard users don't get lost |
| **NFR16** | Animations respect `prefers-reduced-motion` with functional static fallback | Vestibular disorders, motion sensitivity |
| **NFR17** | Screen reader announces dynamic changes via `aria-live` regions | Blind or low-vision guests |
| **NFR18** | `lang` and `dir` attributes update on language switch | Correct screen reader pronunciation |

### Security & Privacy

| NFR | Requirement | Rationale |
|---|---|---|
| **NFR19** | RSVP data transmitted via HTTPS | Names and emails not sent in cleartext |
| **NFR20** | No client-side storage of personal data | Minimize data footprint for EU guests |
| **NFR21** | GAS endpoint rejects malformed requests | Basic spam protection |

### Integration

| NFR | Requirement | Rationale |
|---|---|---|
| **NFR22** | RSVP uses `URLSearchParams` POST to GAS | GAS compatibility requirement |
| **NFR23** | 10-second timeout with warm error and retry | GAS can be slow; guest must not wait indefinitely |
| **NFR24** | Form data preserved across submission failures | Guest never re-enters information |
