---
title: 'sitemariage v2 — Astro + React Islands Rewrite'
slug: 'sitemariage-v2-astro-rewrite'
created: '2026-02-19'
status: 'in-progress'
stepsCompleted: [1]
tech_stack:
  - Astro 5.x
  - React 19
  - Tailwind CSS 4.x
  - shadcn/ui 3.8.5
  - D3.js (d3-geo)
  - GSAP 3 + ScrollTrigger
  - nanostores
  - React Hook Form + Zod
files_to_modify: []
code_patterns:
  - 'Astro islands architecture (client:load, client:visible)'
  - 'nanostores for cross-island state ($language, $activeEvent, $rsvpOpen)'
  - 'Hybrid i18n: React useStore + Astro data-i18n DOM swap'
  - 'GSAP scrub: true (boolean only, never numeric)'
  - 'URLSearchParams POST for GAS (never FormData)'
  - 'Logical CSS only (ps-, pe-, ms-, me-, text-start, text-end)'
test_patterns:
  - 'npm run build (zero errors)'
  - 'npx tsc --noEmit (zero errors)'
  - 'RTL lint: rg for physical CSS properties must return 0'
---

# Tech-Spec: sitemariage v2 — Astro + React Islands Rewrite

**Created:** 2026-02-19

## Overview

### Problem Statement

The current sitemariage v1 is a vanilla JS prototype (Vite + GSAP + CSS Custom Properties) that works but is amateur in quality — non-functional RSVP, no D3.js globe, inconsistent i18n, double font loading, no reduced-motion fallback. It needs a complete rewrite to deliver a professional-grade wedding website with a scroll-driven D3.js globe journey as the signature feature.

### Solution

Full rewrite on a `v2-astro` branch using Astro + React Islands + shadcn/ui + Tailwind CSS + D3.js + GSAP. Static Astro sections ship zero JS; interactive components (globe, modals, RSVP, language switcher) load as React islands with progressive hydration. Bilingual FR/HE with instant client-side switching via nanostores.

### Scope

**In Scope:**
- Complete v2 build from project scaffolding to deployment
- 10 MVP features: Hero, Globe Journey, Event Modals, RSVP, Practical Info, Language Switcher, Fixed Header, Warm Invitation Design, Reduced Motion Fallback, Responsive
- Astro + React + Tailwind + shadcn/ui + D3.js + GSAP stack
- Bilingual FR/HE with RTL support
- GitHub Pages deployment (base: '/sitemariage/')
- GitHub Actions CI/CD

**Out of Scope:**
- English language (Phase 3)
- Photo gallery (post-launch)
- Backend/database
- Testing beyond build verification
- v1 modifications (stays on main untouched)

## Context for Development

### Codebase Patterns

All patterns are exhaustively documented in `_bmad-output/planning-artifacts/architecture.md` Section "Implementation Patterns & Consistency Rules". Key rules:

1. **Naming:** Astro = kebab-case.astro, React = PascalCase.tsx, stores = $camelCase
2. **i18n:** React islands use `useStore($language)` + translations. Astro sections use `data-i18n` + global script. Never mix.
3. **RTL:** NEVER physical CSS (pl-, pr-, ml-, mr-, text-left, text-right). ALWAYS logical (ps-, pe-, ms-, me-, text-start, text-end).
4. **GSAP:** `scrub: true` (boolean only). Import from npm, never CDN. `registerPlugin` once per entry point.
5. **RSVP:** `URLSearchParams` POST, never FormData. 10s AbortController timeout. Preserve form data on error.
6. **State:** 3 nanostores atoms only ($language, $activeEvent, $rsvpOpen). One writer per atom.
7. **shadcn/ui:** Never modify files in `ui/`. Customize via className or wrapper.
8. **Design tokens:** Never hardcode hex colors or font names. Always Tailwind tokens.
9. **Fonts:** Preload all three (Playfair Display, DM Sans, Frank Ruhl Libre).
10. **Build:** `npm run build && npx tsc --noEmit` before every commit.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `_bmad-output/planning-artifacts/prd.md` | 29 FRs, 24 NFRs, 3 user journeys |
| `_bmad-output/planning-artifacts/ux-design-specification.md` | Design direction, components, patterns, accessibility |
| `_bmad-output/planning-artifacts/architecture.md` | Full architecture: decisions, patterns, structure, boundaries |

### Technical Decisions

All decisions documented in architecture.md. Key ones:
- **Starter:** Official Astro CLI with `with-tailwindcss` template + React integration
- **i18n:** Hybrid approach — React useStore + Astro data-i18n DOM swap via nanostores
- **State:** nanostores (3 atoms: $language, $activeEvent, $rsvpOpen)
- **Globe:** React container + D3-managed SVG internals, pre-computed keyframes, ScrollTrigger-driven
- **Performance:** <35KB initial JS, <110KB total (progressive island loading)
- **Hydration:** HeaderControls + Countdown + RsvpForm = client:load; Globe + EventModal = client:visible
- **Fonts:** Self-hosted .woff2, all three preloaded

## Implementation Plan

### Tasks

Implementation follows the dependency-ordered sequence from the architecture document. Each task group becomes a subagent execution unit.

---

#### Task Group 1: Project Scaffolding (INFRA-1)

**Files:** `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`, `components.json`, `.gitignore`, `.env.example`

1. Create `v2-astro` branch from current main
2. Remove v1 source files (keep `_bmad-output/`, `AGENTS.md`, `.github/`)
3. Scaffold Astro project: `npm create astro@latest . -- --template with-tailwindcss --add react --install`
4. Configure `tsconfig.json` path aliases (`@/*` → `./src/*`)
5. Initialize shadcn/ui: `npx shadcn@latest init`
6. Install shadcn/ui components: dialog, button, input, label, textarea, checkbox
7. Install additional deps: gsap, d3-geo, @types/d3-geo, react-hook-form, @hookform/resolvers, nanostores, @nanostores/react, zod
8. Configure `astro.config.mjs`: site, base: '/sitemariage/', output: 'static'
9. Configure `tailwind.config.mjs` with design tokens (colors, fonts)
10. Create `.env.example` with PUBLIC_GAS_URL placeholder
11. Download and place self-hosted font files (.woff2) in `public/fonts/`
12. Download world-110m.json TopoJSON for globe
13. Verify: `npm run build && npx tsc --noEmit`

**AC:**
- Given a fresh checkout of v2-astro, when `npm install && npm run build` is run, then it completes with zero errors
- Given the built site, when served locally, then the Astro welcome page renders

---

#### Task Group 2: Base Layout + i18n System (INFRA-2, INFRA-4, INFRA-5)

**Files:** `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/stores/language.ts`, `src/stores/active-event.ts`, `src/stores/rsvp-open.ts`, `src/i18n/fr.ts`, `src/i18n/he.ts`, `src/i18n/translations.ts`, `src/i18n/i18n-global.ts`, `src/lib/utils.ts`, `src/data/events.ts`, `src/data/globe-keyframes.ts`, `src/schemas/rsvp.ts`

1. Create `BaseLayout.astro` with HTML shell (lang="fr", dir="ltr"), head (CSP meta, font preloads, OG meta), body wrapper
2. Create `src/styles/global.css` with Tailwind directives, @font-face declarations, CSS custom properties for shadcn/ui, base resets
3. Create 3 nanostores atoms: $language, $activeEvent, $rsvpOpen
4. Create i18n translation files (fr.ts, he.ts) with all translation keys from PRD/UX spec
5. Create TranslationKey union type and t() helper in translations.ts
6. Create i18n-global.ts script (subscribes to $language, swaps data-i18n DOM content, sets lang/dir/class on html)
7. Create `src/lib/utils.ts` with cn() utility
8. Create `src/data/events.ts` with 4 typed events (coordinates, translation keys)
9. Create `src/data/globe-keyframes.ts` with 8 keyframes
10. Create `src/schemas/rsvp.ts` with Zod schema
11. Verify: `npm run build && npx tsc --noEmit`

**AC:**
- Given the i18n system, when $language is set to 'he', then document.documentElement has lang="he", dir="rtl"
- Given fr.ts and he.ts, when TypeScript compiles, then all TranslationKey entries exist in both files

---

#### Task Group 3: Static Sections + Header (FR20-FR27)

**Files:** `src/pages/index.astro`, `src/sections/header.astro`, `src/sections/hero-section.astro`, `src/sections/globe-section.astro`, `src/sections/practical-info.astro`, `src/sections/footer.astro`, `src/components/HeaderControls.tsx`, `src/components/Countdown.tsx`

1. Create `index.astro` composing BaseLayout + all sections
2. Create `header.astro` (fixed, logo, slot for HeaderControls island)
3. Create `HeaderControls.tsx` (language switcher FR/HE + RSVP button, client:load)
4. Create `hero-section.astro` (names in Playfair Display, date, location, data-i18n, French defaults)
5. Create `Countdown.tsx` (months + days until Oct 18 2026, celebration mode, client:load)
6. Create `globe-section.astro` (scroll container, slot for GlobeJourney island)
7. Create `practical-info.astro` (6 cards with data-i18n, French defaults, responsive grid)
8. Create `footer.astro` (data-i18n, French defaults)
9. Verify all data-i18n elements pre-populated with French
10. Verify: `npm run build && npx tsc --noEmit`

**AC:**
- Given the built site, when loaded in browser, then all sections render with French content, no flash
- Given HeaderControls, when HE is tapped, then all data-i18n elements switch to Hebrew and layout mirrors to RTL
- Given Countdown, when before Oct 18 2026, then months + days display correctly

---

#### Task Group 4: RSVP Form + Event Modal (FR7-FR15)

**Files:** `src/components/RsvpForm.tsx`, `src/components/EventModal.tsx`

1. Create `RsvpForm.tsx`: shadcn/ui Dialog + Form, React Hook Form + Zod validation, all fields (name, email, events checkboxes, guest count, dietary, message), URLSearchParams POST to GAS, 10s timeout, data preservation on error, success/error states, bilingual via $language
2. Create `EventModal.tsx`: shadcn/ui Dialog, reads $activeEvent, displays event details from events.ts with i18n, invitation card styling (cream bg, gold top border), close via button/backdrop/Escape, focus management
3. Wire RSVP button in HeaderControls to $rsvpOpen
4. Verify: `npm run build && npx tsc --noEmit`

**AC:**
- Given RSVP form, when submitted with valid data, then URLSearchParams POST is sent (not FormData)
- Given RSVP form, when submission fails, then all form data is preserved and error message shown
- Given $activeEvent set to 'welcome-dinner', when EventModal renders, then correct event details display
- Given EventModal open, when Escape pressed, then modal closes and focus returns to trigger

---

#### Task Group 5: Globe Journey (FR1-FR6)

**Files:** `src/components/GlobeJourney.tsx`, `src/components/StaticMapFallback.tsx`

1. Create `GlobeJourney.tsx`: React container, D3 orthographic projection inside useEffect, 8-beat scroll-driven zoom/dezoom/travel cycle via GSAP ScrollTrigger (scrub: true), pre-computed keyframe interpolation, Indiana Jones route line (SVG stroke-dashoffset), stop markers (D3-rendered circles with click handlers), bilingual labels via $language, writes $activeEvent on marker click
2. Create `StaticMapFallback.tsx`: static equirectangular map showing complete route + all 4 stops, tappable markers (HTML buttons), no animation, no scroll pinning, respects prefers-reduced-motion
3. GlobeJourney checks prefers-reduced-motion on mount and renders fallback if true
4. Load world-110m.json TopoJSON for land masses
5. Verify: `npm run build && npx tsc --noEmit`

**AC:**
- Given the globe, when user scrolls, then globe rotates/zooms through 8 beats with scrub: true
- Given a stop marker, when clicked, then $activeEvent is set and EventModal opens
- Given prefers-reduced-motion: reduce, then StaticMapFallback renders instead of animated globe
- Given the route line, when scrolling, then stroke-dashoffset animates progressively

---

#### Task Group 6: Styling, Polish + Deploy (NFR1-NFR18)

**Files:** `src/styles/global.css`, `.github/workflows/deploy.yml`, all components

1. Apply Warm Invitation design direction: decorative borders, gold accents, invitation card styling
2. Ensure all color contrast meets WCAG 2.1 AA (4.5:1 normal, 3:1 large text)
3. Ensure all touch targets 44px minimum
4. Verify keyboard navigation: Tab through all interactive elements, Enter/Space activates, Escape closes modals
5. Verify RTL: run `rg '\b(pl-|pr-|ml-|mr-|text-left|text-right)\b' src/` returns 0 results
6. Create `.github/workflows/deploy.yml` for GitHub Pages deployment
7. Update `AGENTS.md` for v2 stack
8. Final: `npm run build && npx tsc --noEmit`

**AC:**
- Given the site in Hebrew, when inspected, then no physical CSS directional properties exist
- Given the deployment workflow, when pushed to main, then site deploys to GitHub Pages
- Given all interactive elements, when navigated by keyboard, then all are reachable and operable

### Acceptance Criteria

See per-task-group ACs above. Global acceptance criteria:

- `npm run build` completes with zero errors
- `npx tsc --noEmit` completes with zero errors
- Site renders bilingually (FR default, HE with RTL)
- Globe 8-beat scroll animation works with scrub: true
- RSVP form submits via URLSearchParams (GAS URL is placeholder)
- prefers-reduced-motion shows static map fallback
- All data-i18n elements pre-populated with French (no flash)
- v1 code on main branch untouched

## Additional Context

### Dependencies

| Package | Purpose |
| ------- | ------- |
| astro | Static site framework |
| @astrojs/react | React integration for islands |
| @astrojs/tailwind | Tailwind integration |
| react + react-dom | Island runtime |
| tailwindcss | Utility-first CSS |
| gsap | Scroll-driven animations |
| d3-geo + @types/d3-geo | Globe projection |
| nanostores + @nanostores/react | Cross-island state |
| react-hook-form | Form state management |
| @hookform/resolvers | RHF + Zod bridge |
| zod | Schema validation |
| shadcn/ui components | Dialog, Button, Input, Label, Textarea, Checkbox |

### Testing Strategy

Primary guardrails (no unit tests for MVP):
- `npm run build` — Astro static build must succeed
- `npx tsc --noEmit` — TypeScript type checking must pass
- RTL lint — `rg '\b(pl-|pr-|ml-|mr-|text-left|text-right)\b' src/` must return 0
- Manual browser testing: Safari iOS, Chrome Android, Chrome Desktop

### Notes

- GAS URL is placeholder (`PASTE_YOUR_GAS_URL_HERE`) — Eric configures post-deploy
- Event times are TBD in translation files — Eric updates when confirmed
- Font pair: Playfair Display + DM Sans (confirmed by PRD/UX spec chosen direction)
- v1 stays on main, v2 builds on v2-astro branch
- Architecture doc recommends `topojson-client` for TopoJSON parsing — add during globe task
