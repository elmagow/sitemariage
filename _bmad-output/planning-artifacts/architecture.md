---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/implementation-artifacts/tech-spec-anael-eric-wedding-website.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-19'
project_name: 'sitemariage'
user_name: 'Eric'
date: '2026-02-19'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

29 functional requirements across 7 categories define the product surface:

- **Globe Journey (FR1-FR6):** The signature feature — a scroll-driven D3.js orthographic globe with an 8-beat zoom/dezoom/travel cycle, Indiana Jones route line (SVG stroke-dashoffset), 4 event stop markers (Mairie, Welcome Dinner, Beach Party, Wedding Ceremony), and a `prefers-reduced-motion` static map fallback. Architecturally, this is the highest-complexity component: D3.js rendering bridged into React, GSAP ScrollTrigger integration via `useEffect`, pre-computed projection keyframe interpolation, and a complete alternative component (StaticMapFallback) for reduced-motion.

- **Event Information (FR7-FR9):** 4 event detail modals (expanded from v1's 3 events to include Mairie). Each modal displays date, time, location, transport, and dress code. Requires shadcn/ui Dialog with bilingual content. Architecturally straightforward — the key constraint is that modal content must update when language switches without re-mounting.

- **RSVP (FR10-FR15):** Persistent header button opens a form modal. Fields: name, email, events (4 checkboxes), guest count (0-9), dietary, message. Client-side validation (React Hook Form + Zod), POST to Google Apps Script via `URLSearchParams` (hard constraint — GAS cannot parse `FormData`). 10-second timeout, form data preserved on failure, bilingual error messages. GAS endpoint URL is currently a placeholder.

- **Language & Localization (FR16-FR20):** FR/HE toggle with instant client-side switch (no page reload). Hebrew triggers full RTL layout mirror (`dir="rtl"`), Hebrew font (Frank Ruhl Libre), and content update across all components. French is the default with all content pre-populated to prevent flash. This is the most pervasive cross-cutting concern — it touches every component, both static Astro sections and React islands.

- **Hero & Countdown (FR21-FR23):** Static hero with couple names, date, location. Dynamic countdown (months + days until October 18, 2026) as an Astro island (`client:load`). Post-wedding celebration message mode.

- **Practical Information (FR24-FR25):** 6 static info cards (flights, hotels, transport, currency, emergency, weather/tips). Bilingual. Architecturally, these are candidates for static Astro rendering (0 KB JS) but must update on language switch — creating a tension with the islands architecture.

- **Navigation & Layout (FR26-FR29):** Fixed header with logo, language switcher, and RSVP button. Full keyboard navigation (Tab, Enter/Space, Escape). Screen reader support via ARIA labels and semantic HTML.

**Non-Functional Requirements:**

24 NFRs across 4 categories constrain architectural decisions:

- **Performance (NFR1-NFR9):** The most architecturally significant constraints. FCP <1.5s and LCP <2.5s on mid-range mobile over 3G demand aggressive code splitting and progressive hydration. Total JS bundle <40KB gzipped is in direct tension with the React + D3.js + GSAP + Radix stack (estimated ~120KB raw / ~40KB gzipped at minimum). Globe must sustain 60fps on Samsung Galaxy A53 (NFR5) with <100ms scroll response (NFR6). Globe SVG DOM <5MB memory (NFR9). These budgets will drive every dependency and rendering decision.

- **Accessibility (NFR10-NFR18):** WCAG 2.1 AA compliance. 4.5:1 contrast ratios, 44px touch targets, 16px minimum font, complete keyboard navigation, focus trapping in modals, `prefers-reduced-motion` static fallback, `aria-live` for dynamic content, `lang`/`dir` attribute updates. Radix primitives (via shadcn/ui) handle modal focus management natively, but the globe requires custom keyboard navigation for stop markers.

- **Security (NFR19-NFR21):** HTTPS (provided by GitHub Pages), no client-side storage of personal data, GAS endpoint rejects malformed requests. Minimal security surface — no auth, no tokens, no cookies.

- **Integration (NFR22-NFR24):** Single integration point: GAS via `URLSearchParams` POST. 10-second timeout with graceful error handling and form data preservation. The `redirect: 'follow'` requirement for GAS web apps is a known constraint.

**Scale & Complexity:**

- Primary domain: **Frontend visualization & animation** on a static hosting platform
- Complexity level: **Low domain / Medium technical** — No business logic, no data modeling, no compliance. Technical complexity concentrated in D3.js globe rendering, GSAP scroll integration, bilingual RTL, and Astro islands architecture.
- Estimated architectural components: **~17** (7 custom components: GlobeJourney, EventStopMarker, IndianaJonesRoute, Countdown, InvitationBorder, LanguageSwitcher, StaticMapFallback; 10 shadcn/ui components: Dialog, Form, Button, Input, Textarea, Checkbox, Label, Select, Toast, Separator; plus Astro layouts/pages and i18n system)

### Technical Constraints & Dependencies

**Hard Constraints (non-negotiable):**

1. **GitHub Pages hosting** — Static files only. No SSR, no API routes, no server-side rendering at request time. Astro must use `output: 'static'`. Base path: `/sitemariage/`.
2. **GAS RSVP integration** — POST must use `URLSearchParams`, not `FormData`. `redirect: 'follow'` required. Endpoint URL is a runtime constant (not a secret). No CORS issues with GAS web apps.
3. **GSAP `scrub: true`** — Boolean value only, never numeric. This is a fidelity requirement for mobile scroll-animation synchronization (carried forward from v1).
4. **French as default language** — All `data-i18n` elements (or equivalent) must be pre-populated with French content to prevent flash of empty/untranslated content on initial load.
5. **Bilingual FR/HE** — Not trilingual. v1 supported EN as a third language; v2 PRD scopes to FR/HE only, with EN as a post-launch possibility.
6. **4 events** — Mairie (Paris civil ceremony), Welcome Dinner (Neve Tsedek), Beach Party (Herzliya), Wedding Ceremony (Achuza, Beit Hanan). Expanded from v1's 3 events.

**Stack Dependencies (from PRD + UX spec):**

| Dependency | Purpose | Gzipped Size (approx) |
|---|---|---|
| Astro | Static site framework, islands architecture | 0 KB (build-time only) |
| React + ReactDOM | Island runtime for interactive components | ~40 KB |
| D3.js (d3-geo subset) | Globe orthographic projection, path generation | ~12-15 KB (tree-shaken) |
| GSAP + ScrollTrigger | Scroll-driven animation | ~25 KB |
| shadcn/ui (Radix primitives) | Dialog, Form, Button, Input, etc. | ~15-20 KB (tree-shaken) |
| React Hook Form | Form state management | ~8 KB |
| Zod | Schema validation | ~12 KB |
| Tailwind CSS | Utility-first styling | ~10 KB (purged) |
| Playfair Display + DM Sans + Frank Ruhl Libre | Typography | ~60-90 KB (font files, separate from JS budget) |

**Estimated total JS: ~112-120 KB gzipped** — This significantly exceeds the NFR8 target of <40KB gzipped. This tension is flagged as a critical architectural decision for a later step.

**External Dependencies:**

- Google Apps Script endpoint (runtime, configured by Eric)
- Google Fonts or self-hosted font files
- GitHub Actions for CI/CD deployment

### Cross-Cutting Concerns Identified

**1. Internationalization & RTL (highest architectural impact)**

Affects every component. The i18n system must:
- Update all visible text instantly on language switch (no page reload)
- Toggle `dir="rtl"` on `<html>` for Hebrew
- Apply Frank Ruhl Libre font for Hebrew text
- Mirror layout (header, cards, modals, globe labels)
- Work across both static Astro components and React islands

**Architectural tension:** Astro static components render at build time and cannot re-render on client-side events. React islands hydrate independently and don't share React context. Language state must propagate across these boundaries. This requires an architectural decision on the i18n mechanism (DOM-based like v1's `data-i18n`, or a shared event bus, or converting static sections to islands).

**2. Performance Budget**

The <40KB JS gzipped target (NFR8) affects every dependency choice. The proposed stack (React + D3 + GSAP + Radix + RHF + Zod) sums to ~112-120KB gzipped. Options to explore in architectural decisions:
- Accept the higher budget and revise NFR8 based on Astro's progressive loading (islands load separately, not all at once)
- Replace React with Preact (~3KB) for island runtime
- Evaluate whether shadcn/ui + RHF + Zod can be replaced with lighter alternatives
- Consider whether the globe could use vanilla D3 (no React wrapper) as a single island

**3. Accessibility (WCAG 2.1 AA)**

Affects all interactive components. Key areas:
- **Globe:** Custom keyboard navigation for stop markers (not handled by any library), `role="img"` with descriptive `aria-label`, `aria-live` for scroll progress announcements
- **Modals:** Focus trapping (Radix handles natively), focus return to trigger, `aria-modal`, keyboard dismiss
- **Forms:** `aria-describedby` for error messages, `aria-invalid` on invalid fields
- **Motion:** Complete alternative component (StaticMapFallback) for `prefers-reduced-motion`
- **Touch targets:** 44px minimum enforced globally

**4. Responsive Design**

5 breakpoints (base, sm:640px, md:768px, lg:1024px, xl:1280px) with per-component behavior changes:
- Globe: edge-to-edge on mobile, framed with decorative borders on desktop
- Modals: near-full-screen on mobile (<640px), centered cards on desktop
- Practical info: 1-col → 2-col → 3-col grid
- Header: compact (56px) on mobile, expanded (64px) on desktop

**5. Progressive Enhancement / Reduced Motion**

The globe (signature feature) has a complete alternative: StaticMapFallback renders a static map with all stops visible and tappable, no animation, no scroll pinning. This is not a degraded experience — it's a parallel implementation that must be maintained alongside the animated globe. Both paths must support the same event data, i18n, and modal integration.

## Starter Template Evaluation

### Primary Technology Domain
Astro (static site generator with islands architecture) — content-driven web framework optimized for performance, with React islands for interactive components.

### Starter Options Considered

#### Option A: Official Astro CLI with `with-tailwindcss` Template + React Integration (SELECTED)
The **shadcn/ui official Astro installation guide** recommends this exact path: scaffold with the `with-tailwindcss` template, add the React integration via `--add react`, then run `shadcn init` on top. This is a two-step official path documented by both Astro and shadcn/ui.

**Pros:**
- Officially documented by both Astro and shadcn/ui teams
- Minimal starter with no opinionated cruft to remove
- Tailwind CSS and React pre-configured correctly
- TypeScript included out of the box
- Standard Astro project structure conventions
- Guaranteed compatibility between Astro, React, and Tailwind versions

**Cons:**
- Requires a second step (`shadcn init`) after project creation
- No D3.js, GSAP, or i18n setup included — must be added manually

#### Option B: Bare `create astro` (Minimal) + Fully Manual Setup
Start from the bare Astro template and manually add every integration (React, Tailwind, shadcn).

**Pros:** Maximum control over every configuration choice.
**Cons:** More steps to reach the same outcome. No meaningful advantage over Option A for this project.

#### Option C: Community Astro + shadcn/ui Starters (Various GitHub Repos)
Several community-maintained repositories combine Astro + React + Tailwind + shadcn/ui into a single starter.

**Pros:** One-step setup with everything pre-wired.
**Cons:** Not officially maintained — version drift risk. May include opinionated routing, layout, or i18n choices that conflict with our architecture. Unclear maintenance commitment.

#### Astro 5 vs Astro 6 Decision
Astro 6 is currently in **beta** (announced January 13, 2026). Its headline features — Cloudflare Workers runtime support, live content collections, CSP — are irrelevant for a static GitHub Pages site. It also introduces breaking changes: requires Node 22+, drops Node 18/20, upgrades to Zod 4. **Decision: Use Astro 5.x stable** (currently 5.17.3) for production reliability with a hard wedding deadline.

### Selected Starter: Official `create astro` CLI with `with-tailwindcss` Template

**Rationale:**
This is the officially documented path recommended by both the Astro team and the shadcn/ui installation guide. It provides the minimal correct foundation (Astro + Tailwind + React + TypeScript) without opinionated extras, letting us layer our specific architecture (D3.js globe, GSAP scroll animations, bilingual i18n, shadcn/ui components) on top with full control. For a project with a fixed deadline and an intermediate-skill developer, the official path minimizes integration surprises.

**Initialization Command:**
```bash
# Step 1: Create Astro project with Tailwind CSS and React integration
npm create astro@latest sitemariage-v2 -- --template with-tailwindcss --add react --install --git

# Step 2: Add path aliases to tsconfig.json (required by shadcn/ui)
# Manually add: "baseUrl": ".", "paths": { "@/*": ["./src/*"] }

# Step 3: Initialize shadcn/ui component system
npx shadcn@latest init

# Step 4: Add required shadcn/ui components
npx shadcn@latest add dialog button
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript configured via `astro/tsconfigs/base` (tsconfig.json)
- Node.js runtime (18.20.8+, 20.3.0+, or 22.0.0+)
- ES Modules throughout (`"type": "module"` in package.json)

**Styling Solution:**
- Tailwind CSS integrated via Astro's built-in PostCSS pipeline
- Tailwind configuration file (`tailwind.config.mjs`) scaffolded
- shadcn/ui adds CSS custom properties for its design tokens (compatible with Tailwind)
- shadcn/ui uses `tailwind-merge` and `clsx` via a `cn()` utility for class composition

**Build Tooling:**
- Vite 6 (bundled inside Astro — not separately configured)
- Static output mode by default (`output: 'static'`)
- Optimized asset bundling with automatic code splitting per island
- Image optimization via `astro:assets`

**Testing Framework:**
- Not included by starter — to be added as needed
- Recommended: Vitest (ships with Vite compatibility) + Playwright for E2E if needed
- For a wedding site with a deadline, testing is deprioritized

**Code Organization:**
- `src/pages/` — File-based routing (single `index.astro` for this SPA)
- `src/components/` — Astro and React components (shadcn/ui components install here under `src/components/ui/`)
- `src/layouts/` — Page layout wrappers
- `public/` — Static assets served as-is (favicon, images, fonts)
- `astro.config.mjs` — Central configuration (integrations, output mode, base path)

**Development Experience:**
- `npm run dev` — Astro dev server with HMR (Vite-powered)
- `npm run build` — Static site generation to `dist/`
- `npm run preview` — Preview built site locally
- VS Code integration via `astro-build.astro-vscode` extension
- React component HMR within Astro islands

**Additional Libraries to Install on Top of Starter:**

| Library | Purpose | Install Command |
|---|---|---|
| `gsap` | Scroll-driven animations (GSAP + ScrollTrigger) | `npm install gsap` |
| `d3-geo` + `@types/d3-geo` | Orthographic globe projection | `npm install d3-geo @types/d3-geo` |
| `react-hook-form` | RSVP form state management | `npm install react-hook-form` |
| `zod` | Form + data validation schemas | Already included via Astro; verify version |
| `@hookform/resolvers` | Bridge between React Hook Form and Zod | `npm install @hookform/resolvers` |
| `nanostores` + `@nanostores/react` | Cross-island shared state (language toggle) | `npm install nanostores @nanostores/react` |
| `eslint` + `prettier` | Code quality and formatting | `npm install -D eslint prettier eslint-plugin-astro prettier-plugin-astro` |

**Verified Current Versions (February 2026):**

| Package | Stable Version | Status |
|---|---|---|
| Astro | 5.17.3 | Stable (v6 is beta — not recommended) |
| shadcn CLI | 3.8.5 | Stable, official Astro support |
| @astrojs/react | 4.4.2 | Stable, React 19 compatible |
| Tailwind CSS | 4.x | Integrated via Astro |

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

1. **i18n Architecture: Hybrid approach (Option B)** — Resolves the core Astro static/React island tension for instant language switching without page reload (FR17). Without this decision, no component can be implemented with confidence.
2. **Component split: Astro static vs React islands** — Determines which components ship JS and which are zero-JS static HTML. Affects every implementation story.
3. **Performance budget revision** — The original NFR8 (<40KB gzipped total) is physically impossible with the chosen stack. A revised budget based on Astro's progressive island loading model is required before implementation begins.
4. **Cross-island state: nanostores** — Language state must propagate across independent React islands and static Astro sections. This is the glue that makes the hybrid i18n architecture work.

**Important Decisions (Shape Architecture):**

5. **GSAP integration pattern** — Script tags for static sections, useEffect for React islands. Determines how scroll animations are authored across the two rendering models.
6. **Globe architecture** — React container with D3-managed SVG internals, pre-computed keyframes, ScrollTrigger-driven interpolation. Most complex component in the system.
7. **Hydration strategy** — `client:load` / `client:visible` / `client:idle` assignments per island. Directly impacts initial load performance.
8. **Font loading strategy** — Preload Latin fonts, lazy-load Hebrew. Impacts FCP and LCP metrics.

**Deferred Decisions (Post-MVP):**

- **English language support** — PRD scopes to FR/HE only. EN is a post-launch possibility. The i18n architecture supports adding a third locale without structural changes.
- **Testing framework** — Vitest + Playwright recommended but deprioritized for a wedding site with a fixed deadline. Can be added incrementally.
- **Analytics** — No analytics in MVP. Can be added via a simple script tag post-launch if desired.

### Data Architecture

**Decision: Typed TypeScript data modules — no database, no API, no caching layer.**

- **Event data**: Stored as typed constants in `src/data/events.ts`. Each event object contains: `id`, `date`, `time` (nullable — currently TBD), `location`, `coordinates: [lon, lat]`, `translationKey` (maps to i18n strings for name, description, transport, dress code).
- **Globe keyframes**: Stored in `src/data/globe-keyframes.ts` as a typed array. Each keyframe: `{ center: [lon, lat], scale: number, markerHighlight: string | null }`. 8 beats total (intro zoom-out → Paris → Mediterranean → Tel Aviv area → 4 event stops → final zoom-out).
- **i18n translations**: TypeScript objects per locale — `src/i18n/fr.ts`, `src/i18n/he.ts`. Flat key structure with dot-notation grouping (e.g., `hero.title`, `rsvp.submit`, `event.mairie.name`). Exported as typed `Record<string, string>` with a shared key type to catch missing translations at build time.
- **Validation**: Zod schemas for RSVP form data (`src/schemas/rsvp.ts`). No other runtime data validation needed — all data is compile-time constants.

**Rationale:** For a static site with no database, no user accounts, and no dynamic data beyond the RSVP form submission, the simplest possible data architecture is correct. TypeScript provides compile-time safety without runtime cost.

### Authentication & Security

**Decision: No authentication. Minimal security surface.**

- **No auth, no sessions, no tokens, no cookies** — This is a public wedding website. All content is visible to everyone.
- **GAS endpoint protection**: Client-side Zod validation before POST. The Google Apps Script itself performs server-side validation (field presence, type checks, email format). No API keys are exposed — the GAS web app URL is a public endpoint by design (Google's `doPost` deployment model).
- **Content Security Policy**: Basic CSP via `<meta>` tag in the Astro layout:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline'` (required for Astro's island hydration scripts)
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` (Tailwind + Google Fonts)
  - `font-src 'self' https://fonts.gstatic.com`
  - `connect-src 'self' https://script.google.com` (GAS endpoint)
  - `img-src 'self' data:` (inline SVGs and local images)
- **No secrets in client code** — The GAS URL is a public web app URL, not a secret. It is configured via `import.meta.env.PUBLIC_GAS_URL` (Astro public env variable) for build-time injection, with the placeholder as fallback during development.

**Rationale:** Minimal attack surface. The only external communication is the RSVP POST to GAS, which Google handles on the server side. CSP headers provide defense-in-depth against XSS.

### API & Communication Patterns

**Decision: Single integration point — RSVP POST to Google Apps Script.**

- **Protocol**: `fetch()` POST with `URLSearchParams` body (hard constraint — GAS `doPost(e)` parses `e.parameter` from URL-encoded form data, not JSON or FormData).
- **Headers**: `Content-Type: application/x-www-form-urlencoded`. No auth headers.
- **Redirect handling**: `redirect: 'follow'` (required for GAS web app deployment, which returns a redirect response).
- **Timeout**: 10-second `AbortController` timeout. GAS cold starts can take 3-5 seconds.
- **Error handling strategy**:
  - Network failure / timeout → Show localized error message ("Connection failed, please try again"), preserve all form data, show retry button.
  - GAS returns error response → Show localized error message ("Submission failed"), preserve form data, show retry button.
  - Success → Show localized success message, clear form after brief delay, close modal.
  - All error/success messages are bilingual (FR/HE) via the i18n system.
- **No other APIs** — No analytics, no maps API, no weather API. All data is static.

**Rationale:** The simplest possible API surface. One POST endpoint, one success path, one error path. The `URLSearchParams` constraint is non-negotiable (GAS limitation).

### Frontend Architecture

#### 4a. State Management

**Decision: nanostores for cross-island state. Local state for everything else.**

- **`$language` atom** (nanostores): The single shared state atom. Holds `'fr' | 'he'`. Source of truth for the current language across the entire application.
  - React islands consume via `useStore($language)` from `@nanostores/react`
  - Global Astro `<script>` subscribes via `$language.subscribe()` for static section DOM updates
- **RSVP form state**: Managed entirely within the RSVP React island by React Hook Form. No external state needed — form data doesn't leave the component until submission.
- **Globe state** (current beat index, rotation, zoom): Managed via `useRef` within the globe React component. No other component needs this state. GSAP ScrollTrigger drives updates via its `onUpdate` callback.
- **Modal open/close state**: Local React state (`useState`) within each modal component. The RSVP modal's trigger button is a React island (`client:load`) that controls modal visibility.

**Rationale:** nanostores is ~1KB gzipped and is specifically designed for Astro's islands architecture — it works across independent React islands without a shared React tree. Using it only for language state keeps the architecture simple. Everything else is component-local, which is the correct default.

#### 4b. i18n Architecture — Hybrid Approach (Option B)

**Decision: React islands use nanostores reactively. Static Astro sections use DOM manipulation triggered by nanostores subscription.**

This is the most architecturally significant decision in the project. It resolves the core tension identified in Step 2: Astro static components render at build time and cannot re-render on client-side language switches, but FR17 requires instant language switching without page reload.

**The hybrid pattern works as follows:**

1. **Translation files** (`src/i18n/fr.ts`, `src/i18n/he.ts`): Shared TypeScript modules importable by both React components and the global script. Flat key-value `Record<string, string>` objects.

2. **nanostores atom** (`src/stores/language.ts`):
   ```typescript
   import { atom } from 'nanostores';
   export const $language = atom<'fr' | 'he'>('fr');
   ```

3. **React islands**: Import `useStore` from `@nanostores/react`, read `$language`, and render translated text reactively. When `$language` changes, React re-renders the island with the correct translations.

4. **Static Astro sections**: All translatable elements have `data-i18n="key"` attributes and are pre-populated with French text (preventing flash). A global Astro `<script>` (~1-2KB) runs on page load and subscribes to `$language`:
   - On language change: walks all `[data-i18n]` elements and swaps `textContent` from the appropriate translation file
   - Sets `document.documentElement.lang` and `document.documentElement.dir` (`'rtl'` for Hebrew, `'ltr'` for French)
   - Adds/removes a `hebrew` class on `<html>` for font-family switching via CSS

5. **Language switcher** (React island, `client:load`): Writes to `$language` store on toggle. Both the React islands and the global script react to the change.

**Why not Option A (all-islands)?** Converting every translatable section to a React island would hydrate the entire page, adding ~40KB+ of React runtime cost to sections that are fundamentally static content. This defeats the purpose of choosing Astro.

**Why not Option C (route-based)?** Astro's built-in i18n generates `/fr/` and `/he/` route prefixes, requiring a page navigation (reload) to switch languages. This directly contradicts FR17 (instant language switching).

**Rationale:** Option B preserves Astro's zero-JS-for-static-content advantage while solving the i18n problem with a lightweight global script. The `data-i18n` DOM-swap pattern is proven (used in v1) and adds negligible JS. React islands handle their own i18n reactively via nanostores. Both systems share the same translation files, ensuring consistency.

#### 4c. Component Architecture — Astro vs React Split

**Decision: 4 React islands for interactive components. Everything else is static Astro.**

| Component | Type | Hydration Directive | Rationale |
|---|---|---|---|
| Header / Nav | Astro `.astro` | None (static HTML) | Simple text content. Language updates via global `data-i18n` script. |
| Language Switcher | React `.tsx` | `client:load` | Must be interactive immediately on page load. Writes to `$language` nanostores atom. |
| Hero + Countdown | Astro `.astro` | None (countdown via inline `<script>`) | Countdown timer is simple date arithmetic — no React needed. Language updates via `data-i18n`. |
| Travel Globe | React `.tsx` | `client:visible` | Complex D3.js interactivity, GSAP ScrollTrigger integration, React lifecycle for setup/teardown. Only loads when scrolled into view. |
| Story Timeline | Astro `.astro` | None (GSAP via `<script>`) | Static content with scroll-driven CSS animations. No interactivity. |
| Event Cards + Modal | React `.tsx` | `client:visible` | Modal requires state management, focus trapping (Radix Dialog), dynamic content. Loads when scrolled into view. |
| RSVP Form + Modal | React `.tsx` | `client:idle` | React Hook Form + Zod validation, form state management, GAS submission logic. Loads after browser is idle (form is lower on page / triggered by header button). |
| Practical Info Grid | Astro `.astro` | None (static HTML) | Static cards with text content only. Language updates via `data-i18n`. |
| Footer | Astro `.astro` | None (static HTML) | Static content. |

**Hydration strategy rationale:**
- `client:load` — Only the language switcher. It must work the instant the page loads because users may want to switch language before scrolling.
- `client:visible` — Globe and event modal. These are below the fold; loading their JS only when scrolled into view saves ~54KB on initial load.
- `client:idle` — RSVP form. It loads after the browser's main thread is idle. Even though the RSVP button is in the header, clicking it before the island hydrates can be handled by deferring modal open until hydration completes (the button itself is a separate small React island or triggers hydration on click).

**Cross-island communication:** Exclusively via nanostores. The `$language` atom is the only shared state. No other cross-island communication is needed — globe state, form state, and modal state are all component-local.

#### 4d. GSAP + Astro Integration

**Decision: GSAP in Astro `<script>` tags for static sections, GSAP in React `useEffect` for island components.**

**Static sections (Story Timeline, decorative scroll animations):**
- GSAP imported and initialized in an Astro `<script>` tag at the bottom of the page
- `gsap.registerPlugin(ScrollTrigger)` called once globally
- Animations target static DOM elements by CSS selector
- `scrub: true` (boolean only — hard constraint)
- No cleanup needed — static scripts persist for the page lifecycle

**React islands (Globe):**
- GSAP initialized in `useEffect` with ref-based targeting
- ScrollTrigger instance created in `useEffect`, stored in a ref
- Cleanup in `useEffect` return: `scrollTriggerInstance.kill()` + `ScrollTrigger.refresh()`
- `scrub: true` (boolean only)

**Globe ↔ ScrollTrigger connection pattern:**
```typescript
useEffect(() => {
  const trigger = ScrollTrigger.create({
    trigger: containerRef.current,
    start: 'top top',
    end: '+=400%',        // 4x viewport height of scroll pinning
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;           // 0 → 1
      const beatIndex = Math.floor(progress * 8); // 0 → 7
      updateGlobe(beatIndex, progress);          // D3 rotation + zoom
    }
  });
  return () => trigger.kill();
}, []);
```

**Rationale:** This split follows the natural boundary — static HTML animations belong in script tags (no React overhead), while the globe needs React lifecycle management for D3 setup/teardown and ScrollTrigger cleanup.

#### 4e. Performance Strategy — Revised Bundle Budget

**Decision: Accept revised budget. Mitigate via Astro's progressive island loading.**

The original NFR8 target (<40KB gzipped total JS) is not achievable with the chosen stack (React + D3 + GSAP + Radix + RHF + Zod). However, Astro's island architecture fundamentally changes how JS is delivered — it is NOT a single bundle loaded upfront.

**Revised budget:**

| Metric | Target | Rationale |
|---|---|---|
| Initial JS load | <35 KB gzipped | GSAP script (~25KB) + nanostores (~1KB) + lang switcher island (~2KB) + global i18n script (~1-2KB) + countdown script (~1KB) |
| Total JS (all islands) | <110 KB gzipped | Full cost when all islands have hydrated |
| FCP | <1.5s on 3G | Astro ships static HTML first; JS loads progressively |
| LCP | <2.5s on 3G | Hero is static HTML + CSS, no JS dependency |

**JS budget breakdown by island:**

| Island / Script | Gzipped Size | Load Timing |
|---|---|---|
| GSAP + ScrollTrigger (script) | ~25-28 KB | Page load (script tag) |
| nanostores + React adapter | ~1 KB | Page load (lang switcher dep) |
| Language Switcher island | ~2 KB (app code) | `client:load` |
| Global i18n script | ~1-2 KB | Page load (inline script) |
| Countdown script | ~1 KB | Page load (inline script) |
| **Initial total** | **~30-34 KB** | — |
| React + ReactDOM | ~42 KB | Deferred (first island hydration) |
| D3-geo (tree-shaken) | ~12 KB | `client:visible` (globe) |
| Globe app code | ~5 KB | `client:visible` |
| Event modal app code | ~3 KB | `client:visible` |
| React Hook Form + Zod | ~20 KB | `client:idle` (RSVP) |
| RSVP form app code | ~3 KB | `client:idle` |
| **Deferred total** | **~85 KB** | — |

**Key optimization decisions:**
- **D3.js tree-shaking**: Import ONLY `d3-geo` and `d3-interpolate`. Never import the full `d3` package. This reduces D3's contribution from ~80KB to ~12KB.
- **Font loading**: Preload Playfair Display (heading) and DM Sans (body) for Latin scripts via `<link rel="preload">`. Frank Ruhl Libre (Hebrew) is loaded on-demand only when Hebrew is selected, using a dynamic `<link>` injection triggered by the `$language` store.
- **Image optimization**: Use Astro's built-in `<Image>` component (`astro:assets`) for automatic format conversion (WebP/AVIF), responsive sizing, and lazy loading.
- **Preact alternative considered and rejected**: Preact (~4KB) would save ~38KB over React, but shadcn/ui requires React (Radix primitives use React internals). The compatibility shim (`preact/compat`) introduces subtle bugs with Radix components. Not worth the risk for a wedding site.

**Rationale:** The effective user experience is that of a <35KB site — the page renders fully as static HTML, interactivity loads progressively as the user scrolls. The 110KB total is spread across time, not loaded as a blocking bundle. This is the core value proposition of Astro's islands architecture.

#### 4f. Globe Architecture

**Decision: React component container with D3-managed SVG internals. Pre-computed keyframes. D3-rendered markers.**

**Rendering approach:**
- A React component (`GlobeJourney.tsx`) provides the container `<div>`, lifecycle management (`useEffect` for setup/teardown), and nanostores subscription for language.
- Inside `useEffect`, D3 creates and owns an `<svg>` element with an orthographic projection.
- D3 handles all SVG rendering: land masses, ocean, route line (stroke-dashoffset animation), stop markers (`<circle>` elements positioned via projection).
- React does NOT render any SVG elements — it delegates entirely to D3 for the globe internals. This avoids the React-vs-D3 DOM ownership conflict.

**Pre-computed keyframes:**
- Stored in `src/data/globe-keyframes.ts` as a typed array of 8 beats:
  ```typescript
  interface GlobeKeyframe {
    center: [number, number];  // [longitude, latitude]
    scale: number;             // projection scale (zoom level)
    markerHighlight: string | null; // event ID to highlight, or null
  }
  ```
- GSAP ScrollTrigger's `onUpdate` callback maps scroll progress (0–1) to a beat index (0–7).
- Between beats, `d3.interpolate` smoothly transitions center coordinates and scale.
- The Indiana Jones route line uses SVG `stroke-dashoffset` animated by the same scroll progress.

**Stop markers:**
- D3-rendered `<circle>` SVG elements positioned via the orthographic projection's `.projection()([lon, lat])` method.
- Click handlers attached via D3's `.on('click', ...)` (not React synthetic events) since the elements live inside D3's SVG.
- Active/highlighted state: CSS class toggle driven by the current beat's `markerHighlight` value.
- Clicking a marker opens the corresponding event detail modal (calls a callback passed from the React component).

**StaticMapFallback (prefers-reduced-motion):**
- Same React component file, conditional render path.
- On mount, checks `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- If reduced motion: renders a flat equirectangular (or Mercator) projection showing the full route with all 4 stops visible simultaneously. No ScrollTrigger, no scroll pinning, no animation.
- Stop markers are still clickable (open event modals).
- The container does not pin — it flows naturally in the page.

**Rationale:** The "React container + D3 internals" pattern is the established best practice for D3-in-React. It avoids the anti-pattern of React rendering SVG elements that D3 then tries to manipulate (DOM ownership conflict). D3 is optimized for SVG manipulation; React is optimized for component lifecycle. Each does what it's best at.

### Infrastructure & Deployment

**Decision: Astro official GitHub Pages action. Public env vars for configuration. Non-blocking Lighthouse CI.**

**GitHub Actions workflow:**
- Use Astro's official deployment action: `withastro/action@v3` for building + `actions/deploy-pages@v4` for deploying.
- Trigger: push to `main` branch (same as v1).
- Build step: `npm ci` → `npm run build` (Astro outputs to `dist/`).
- Deploy step: uploads `dist/` as GitHub Pages artifact.

**Configuration:**
- `astro.config.mjs`:
  - `site: 'https://elmagow.github.io'`
  - `base: '/sitemariage/'`
  - `output: 'static'`
  - `integrations: [react(), tailwind()]`
- **GAS URL**: Configured as `PUBLIC_GAS_URL` environment variable in GitHub Actions secrets. Accessed in code via `import.meta.env.PUBLIC_GAS_URL`. Falls back to placeholder during local development.

**Lighthouse CI (recommended, non-blocking):**
- Add a Lighthouse CI step in the GitHub Actions workflow after deployment.
- Configuration: report-only mode (does not fail the build).
- Tracks performance regressions across deployments.
- Key thresholds to monitor: FCP <1.5s, LCP <2.5s, Accessibility score ≥90.

**Rationale:** The official Astro GitHub Pages action is maintained by the Astro team and handles all the edge cases (base path, 404 handling, etc.). Environment variables via `import.meta.env` are Astro's built-in mechanism. Lighthouse CI as non-blocking provides visibility without blocking deployments for a wedding site where ship speed matters.

### Decision Impact Analysis

**Implementation Sequence:**

The following decisions must be implemented in order due to dependencies:

1. **Project scaffolding** (Astro + React + Tailwind + shadcn/ui) — Foundation for everything
2. **nanostores setup** (`$language` atom) — Required before any component can handle language
3. **i18n system** (translation files + global script + React hook) — Required before any content can be rendered bilingually
4. **Astro layout + static sections** (Header, Hero, Practical Info, Footer) — Establish page structure with `data-i18n` attributes
5. **Language Switcher island** (`client:load`) — Enables testing the i18n system end-to-end
6. **GSAP setup** (global script + ScrollTrigger registration) — Required before globe or timeline
7. **Globe island** (`client:visible`) — Most complex component; depends on i18n, GSAP, and data
8. **Event modal island** (`client:visible`) — Depends on i18n; triggered by globe markers
9. **RSVP form island** (`client:idle`) — Depends on i18n; independent of globe
10. **GitHub Actions deployment** — Can be set up early and refined throughout
11. **Lighthouse CI** — Added after initial deployment is working

**Cross-Component Dependencies:**

```
$language (nanostores atom)
├── Language Switcher (writes)
├── Global i18n script (reads → DOM updates)
├── Globe island (reads → label updates)
├── Event modal island (reads → content updates)
└── RSVP form island (reads → label + error message updates)

GSAP ScrollTrigger
├── Global script (timeline animations on static sections)
└── Globe island (scroll-driven rotation, zoom, route animation)

Event data (src/data/events.ts)
├── Globe island (stop marker positions + highlight)
├── Event modal island (modal content)
└── RSVP form (event checkboxes)

Globe keyframes (src/data/globe-keyframes.ts)
└── Globe island (exclusive consumer)
```

## Implementation Patterns & Consistency Rules

_Reviewed via Party Mode by Dev (Amelia), UX (Sally), and QA (Quinn). 10 enhancements integrated._

### Pattern Categories Defined

**Critical Conflict Points Identified:** 27 areas where AI agents could make different choices, organized into 6 categories. Each rule below exists because two reasonable agents WOULD implement it differently if not specified.

### 1. Naming Patterns

#### Component & File Naming

| File Type | Convention | Example |
|---|---|---|
| Astro components | `kebab-case.astro` | `hero-section.astro`, `practical-info.astro` |
| React components | `PascalCase.tsx` | `GlobeJourney.tsx`, `EventModal.tsx`, `HeaderControls.tsx` |
| Astro page sections | `kebab-case.astro` in `src/sections/` | `globe-section.astro`, `footer.astro` |
| nanostores files | `kebab-case.ts` | `language.ts`, `active-event.ts`, `rsvp-open.ts` |
| nanostores exports | `$camelCase` | `$language`, `$activeEvent`, `$rsvpOpen` |
| Data files | `kebab-case.ts` | `events.ts`, `globe-keyframes.ts` |
| i18n locale files | `locale-code.ts` | `fr.ts`, `he.ts` |
| Schema files | `kebab-case.ts` | `rsvp.ts` |
| shadcn/ui components | `kebab-case.tsx` (as CLI installs) | `button.tsx`, `dialog.tsx` |

#### i18n Key Naming

Keys use **dot-separated `snake_case` segments**. Never camelCase in keys.

```
hero.title                    → "Anaël & Eric"
event.mairie.name             → "Mairie"
event.welcome_dinner.name     → "Dîner de bienvenue"
rsvp.form.name_label          → "Nom complet"
rsvp.status.success           → "Merci !"
practical.flights.title       → "Comment venir"
```

Event IDs in key paths use `snake_case`; event IDs in data objects and nanostores use `kebab-case`.

### 2. Structure Patterns

#### Project Organization — By Type, Not By Feature

```
src/
├── components/
│   ├── ui/                         # shadcn/ui (CLI-installed, NEVER modify)
│   ├── GlobeJourney.tsx            # React island (client:visible)
│   ├── StaticMapFallback.tsx       # React (reduced-motion alternative)
│   ├── EventModal.tsx              # React island (client:visible)
│   ├── RsvpForm.tsx                # React island (client:idle)
│   ├── HeaderControls.tsx          # React island (client:load) — lang + RSVP
│   └── Countdown.tsx               # Small React or inline script
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   └── index.astro
├── sections/                       # Astro page sections (static, zero JS)
│   ├── hero-section.astro
│   ├── globe-section.astro
│   ├── practical-info.astro
│   └── footer.astro
├── data/
│   ├── events.ts
│   └── globe-keyframes.ts
├── i18n/
│   ├── fr.ts
│   ├── he.ts
│   ├── translations.ts            # TranslationKey type + helper
│   └── i18n-global.ts             # Global script for data-i18n DOM swap
├── stores/
│   ├── language.ts                 # $language atom
│   ├── active-event.ts            # $activeEvent atom
│   └── rsvp-open.ts               # $rsvpOpen atom
├── schemas/
│   └── rsvp.ts
├── styles/
│   └── global.css
├── lib/
│   └── utils.ts                   # cn() — NEVER duplicate elsewhere
└── assets/
```

### 3. Code Patterns

**React:** Named exports only, function declarations, Props interface co-located above component. One component per file.

**TypeScript:** `strict: true`, no `any`, prefer `interface` over `type`, explicit return types on exports.

**Type-Safe i18n Keys:**
```typescript
export type TranslationKey = 'hero.title' | 'hero.subtitle' | /* ... all keys */;
export type Translations = Record<TranslationKey, string>;
```
Each locale file must satisfy `Translations` — TypeScript catches missing keys at build time.

**Import ordering:** framework → external → internal `@/` → relative `./` → styles

**Canonical GSAP import:**
```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```
Never CDN. Never `gsap/dist/`. `registerPlugin` once per entry point.

### 4. Communication Patterns

**nanostores — Three Atoms, No Maps:**

| Store | Writer | Reader | Purpose |
|---|---|---|---|
| `$language` | `HeaderControls` | All islands + global script | Language state |
| `$activeEvent` | `GlobeJourney` | `EventModal` | Globe → modal |
| `$rsvpOpen` | `HeaderControls` | `RsvpForm` | Header → RSVP modal |

One writer per atom. Never custom DOM events between islands. Never nanostores for component-local state.

**i18n: Two patterns, never mixed.** React islands use `useStore($language)` + translations. Astro sections use `data-i18n` + global script. Never cross the patterns.

### 5. Process Patterns

**No loading states.** Pre-render all content as static HTML with French defaults. Islands enhance after hydration.

**RSVP error handling:** try/catch with 10s AbortController timeout. Always preserve form data on error. Always re-enable submit button. Error messages via i18n keys.

**Accessibility:** Radix Dialog handles focus trap. Globe markers get `role="button"`, `tabindex="0"`, `aria-label`. StaticMapFallback uses HTML `<button>` (not SVG). 44px touch targets via `min-h-11 min-w-11`.

**RTL:** NEVER use `pl-`, `pr-`, `ml-`, `mr-`, `text-left`, `text-right`. ALWAYS use `ps-`, `pe-`, `ms-`, `me-`, `text-start`, `text-end`.

### 6. Style Patterns

**Tailwind hierarchy:** Inline utilities (default) → `cn()` composition → Custom CSS (rare). Never `@apply`.

**shadcn/ui:** Never modify source files in `ui/`. Customize via `className` or wrapper components.

**Design tokens:** NEVER hardcode hex colors or font names. Always use Tailwind config tokens (`text-accent`, `font-heading`).

**Font loading:** Preload ALL three fonts (Playfair Display, DM Sans, Frank Ruhl Libre). No lazy loading.

### Build Verification

```bash
npm run build && npx tsc --noEmit
```
Both must pass. RTL lint check: `rg '\b(pl-|pr-|ml-|mr-|text-left|text-right)\b' src/` should return zero results.

### All AI Agents MUST:

1. Logical CSS only (`ps-`, `pe-`, `text-start`) — never physical
2. GSAP `scrub: true` (boolean) — never numeric
3. `URLSearchParams` for GAS POST — never FormData
4. Named exports for React components — never `export default`
5. Pre-populate all `data-i18n` with French text
6. Design tokens only — never hardcode hex colors
7. Three nanostores atoms only — no maps, no computed
8. React uses `useStore()`, Astro uses `data-i18n` — never mix
9. Import ordering: framework → external → internal → relative → styles
10. Preserve RSVP form data on error — never reset
11. Run `npm run build` AND `npx tsc --noEmit` before commit
12. Typed translation keys via `TranslationKey` union
13. GSAP via npm only — never CDN
14. Preload all three font families
15. Globe focus return — store ref, return on dialog close

## Project Structure & Boundaries

_Reviewed via Party Mode by Dev (Amelia), Scrum Master (Bob), and UX (Sally). 15 enhancements integrated._

### Migration from v1

**This is a v2 rewrite.** The existing repository contains a complete v1 prototype built with Vite + Vanilla JS + GSAP + CSS Custom Properties (`index.html`, `src/main.js`, `src/modules/`, `src/styles/`, `src/i18n/`). The v2 architecture (Astro + React Islands + TypeScript + Tailwind + shadcn/ui) is a fundamentally different stack.

**Disposition of v1 code:**
- Before scaffolding v2, create a `v1-archive` branch preserving the complete v1 codebase
- The v2 project is scaffolded fresh using `npm create astro@latest` (see Starter Template section)
- v1 files (`index.html`, `src/main.js`, `src/modules/`, `src/styles/*.css`, `src/i18n/*.js`, `vite.config.js`) are replaced entirely
- v1 translation content (`src/i18n/fr.js`, `src/i18n/he.js`) should be referenced when writing v2 TypeScript translation files — the keys and values carry over, the format changes
- `AGENTS.md` is updated to reflect the v2 stack
- `_bmad-output/` directory is preserved across both versions

**Note on English (v1 → v2):** v1 supported three languages (FR/HE/EN). v2 scopes to FR/HE only per the PRD. English is a post-launch possibility (Phase 3). The `en.ts` file is NOT included in v2's initial structure. If EN is added later, the i18n architecture (typed `TranslationKey` union + locale files) supports it without structural changes.

### Requirements-to-Architecture Mapping

#### Setup & Infrastructure → Root config, CI/CD, base layout

These are not functional requirements but are implementation prerequisites that must be completed before any FR can be implemented.

| Story | Description | Primary Files | Supporting Files |
|---|---|---|---|
| INFRA-1 | Project scaffolding (Astro + React + Tailwind + shadcn/ui) | `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`, `components.json` | `.gitignore`, `.env.example` |
| INFRA-2 | Base layout with HTML shell, head, CSP, font preloads | `src/layouts/BaseLayout.astro` | `src/styles/global.css`, `public/fonts/` |
| INFRA-3 | GitHub Actions deploy workflow | `.github/workflows/deploy.yml` | `astro.config.mjs` (site, base) |
| INFRA-4 | nanostores setup (3 atoms) | `src/stores/language.ts`, `src/stores/active-event.ts`, `src/stores/rsvp-open.ts` | `package.json` (nanostores dep) |
| INFRA-5 | i18n system (translation files + global script + types) | `src/i18n/fr.ts`, `src/i18n/he.ts`, `src/i18n/translations.ts`, `src/i18n/i18n-global.ts` | `src/stores/language.ts` |

#### FR Category: Globe Journey (FR1–FR6) → `src/components/`, `src/data/`, `src/stores/`

| FR | Description | Primary Files | Supporting Files |
|---|---|---|---|
| FR1 | 8-beat scroll-driven globe | `src/components/GlobeJourney.tsx` | `src/data/globe-keyframes.ts` |
| FR2 | Zoom into venue locations | `src/components/GlobeJourney.tsx` | `src/data/globe-keyframes.ts` (scale values) |
| FR3 | Animated route line (stroke-dashoffset) | `src/components/GlobeJourney.tsx` | — |
| FR4 | Stop markers at venues | `src/components/GlobeJourney.tsx` | `src/data/events.ts` (coordinates) |
| FR5 | Tap marker → open event modal | `src/components/GlobeJourney.tsx`, `src/stores/active-event.ts` | `src/components/EventModal.tsx` |
| FR6 | Static map fallback (reduced-motion) | `src/components/StaticMapFallback.tsx` | `src/data/events.ts` |

**Cross-dependencies:** Globe writes `$activeEvent` → EventModal reads it. Both consume `$language`. Globe section wrapper in `src/sections/globe-section.astro`. Globe SVG content always renders LTR regardless of page `dir` attribute — marker labels use explicit `direction: ltr` on SVG text elements.

#### FR Category: Event Information (FR7–FR9) → `src/components/`, `src/data/`, `src/i18n/`

| FR | Description | Primary Files | Supporting Files |
|---|---|---|---|
| FR7 | Event detail modals (4 events) | `src/components/EventModal.tsx` | `src/data/events.ts`, `src/components/ui/dialog.tsx` |
| FR8 | Modal close (button, backdrop, Escape) | `src/components/EventModal.tsx` | `src/components/ui/dialog.tsx` (Radix handles) |
| FR9 | Bilingual event details | `src/components/EventModal.tsx` | `src/i18n/fr.ts`, `src/i18n/he.ts`, `src/i18n/translations.ts`, `src/stores/language.ts` |

#### FR Category: RSVP (FR10–FR15) → `src/components/`, `src/schemas/`, `src/stores/`

| FR | Description | Primary Files | Supporting Files |
|---|---|---|---|
| FR10 | Persistent RSVP button | `src/components/HeaderControls.tsx`, `src/stores/rsvp-open.ts` | — |
| FR11 | Form fields (name, email, events, guests, dietary, message) | `src/components/RsvpForm.tsx` | `src/schemas/rsvp.ts`, `src/data/events.ts` |
| FR12 | Inline validation errors | `src/components/RsvpForm.tsx` | `src/schemas/rsvp.ts` (Zod schema) |
| FR13 | Success confirmation message | `src/components/RsvpForm.tsx` | `src/i18n/fr.ts`, `src/i18n/he.ts`, `src/i18n/translations.ts` |
| FR14 | Error message + retry + data preservation | `src/components/RsvpForm.tsx` | `src/i18n/fr.ts`, `src/i18n/he.ts`, `src/i18n/translations.ts` |
| FR15 | Bilingual RSVP form | `src/components/RsvpForm.tsx` | `src/i18n/fr.ts`, `src/i18n/he.ts`, `src/i18n/translations.ts`, `src/stores/language.ts` |

**Integration:** POST to GAS via `URLSearchParams`. Endpoint from `import.meta.env.PUBLIC_GAS_URL`. RSVP island uses `client:load` hydration (upgraded from `client:idle` to prevent dead-button scenario — the RSVP button in the fixed header is visible from first paint, so the form must be ready to respond immediately).

#### FR Category: Language & Localization (FR16–FR20) → `src/i18n/`, `src/stores/`, `src/components/`

| FR | Description | Primary Files | Supporting Files |
|---|---|---|---|
| FR16 | FR/HE toggle | `src/components/HeaderControls.tsx` | `src/stores/language.ts` |
| FR17 | Instant language switch (no reload) | `src/i18n/i18n-global.ts`, all React islands | `src/stores/language.ts`, `src/i18n/translations.ts` |
| FR18 | RTL layout mirror | `src/i18n/i18n-global.ts` (sets `dir`), `src/styles/global.css` | Tailwind logical properties |
| FR19 | Hebrew font (Frank Ruhl Libre) | `src/styles/global.css`, `src/layouts/BaseLayout.astro` | `tailwind.config.mjs` (`fontFamily`) |
| FR20 | French defaults (no flash) | All `.astro` sections (`data-i18n` + French text) | `src/i18n/fr.ts`, `src/i18n/translations.ts` |

**Note:** `HeaderControls.tsx` is a single React island (`client:load`) that combines the language switcher and the RSVP trigger button. Earlier architecture references to a separate "Language Switcher" island refer to the language-switching functionality within `HeaderControls.tsx` — it is not a separate component.

#### FR Category: Hero & Countdown (FR21–FR23) → `src/sections/`, `src/components/`

| FR | Description | Primary Files | Supporting Files |
|---|---|---|---|
| FR21 | Names, date, location | `src/sections/hero-section.astro` | `src/i18n/fr.ts`, `src/i18n/he.ts` |
| FR22 | Countdown (months + days) | `src/components/Countdown.tsx` | `src/stores/language.ts`, `src/i18n/translations.ts` |
| FR23 | Post-wedding celebration mode | `src/components/Countdown.tsx` | `src/i18n/fr.ts` (`countdown.celebration` key), `src/i18n/he.ts` (`countdown.celebration` key), `src/i18n/translations.ts` |

#### FR Category: Practical Information (FR24–FR25) → `src/sections/`, `src/i18n/`

| FR | Description | Primary Files | Supporting Files |
|---|---|---|---|
| FR24 | 6 info categories | `src/sections/practical-info.astro` | `src/i18n/fr.ts`, `src/i18n/he.ts` |
| FR25 | Bilingual practical info | `src/sections/practical-info.astro` | `src/i18n/i18n-global.ts` (DOM swap), `src/i18n/translations.ts` |

#### FR Category: Navigation & Layout (FR26–FR29) → `src/layouts/`, `src/sections/`, `src/components/`

| FR | Description | Primary Files | Supporting Files |
|---|---|---|---|
| FR26 | Fixed header + footer | `src/layouts/BaseLayout.astro`, `src/sections/header.astro`, `src/sections/footer.astro` | `src/styles/global.css` |
| FR27 | RSVP access from header | `src/components/HeaderControls.tsx` | `src/stores/rsvp-open.ts` |
| FR28 | Keyboard navigation | All React components, `src/components/GlobeJourney.tsx` (custom), `src/components/ui/dialog.tsx` (Radix) | — |
| FR29 | Screen reader support | `src/layouts/BaseLayout.astro` (landmarks), all `.astro` sections (semantic HTML), all React components (ARIA) | — |

**Note:** `src/sections/footer.astro` is static content with `data-i18n` attributes. It has no dedicated FR — it is covered by FR26 (Navigation & Layout) as part of the overall page structure.

#### NFR Category Mapping

| NFR Category | Enforcement Location |
|---|---|
| Performance (NFR1–9) | `astro.config.mjs` (static output), hydration directives in `src/sections/*.astro`, `src/layouts/BaseLayout.astro` (font preload), `.github/workflows/deploy.yml` (Lighthouse CI) |
| Accessibility (NFR10–18) | `src/styles/global.css` (min font, touch targets), `src/components/ui/dialog.tsx` (focus trap), `src/components/GlobeJourney.tsx` (keyboard nav, ARIA), `src/components/StaticMapFallback.tsx` (reduced-motion), `src/i18n/i18n-global.ts` (lang/dir) |
| Security (NFR19–21) | `src/layouts/BaseLayout.astro` (CSP meta tag, HTTPS), `src/components/RsvpForm.tsx` (no client storage), `src/schemas/rsvp.ts` (validation) |
| Integration (NFR22–24) | `src/components/RsvpForm.tsx` (URLSearchParams, 10s timeout, data preservation) |

### Complete Project Directory Structure

```
sitemariage/
│
│── Root Configuration ────────────────────────────────────
│
├── package.json                        # Dependencies, scripts (dev, build, preview)
├── package-lock.json                   # Lockfile (committed)
├── astro.config.mjs                    # site, base: '/sitemariage/', integrations: [react(), tailwind()]
├── tsconfig.json                       # strict: true, path aliases (@/*), Astro base config
├── tailwind.config.mjs                 # Design tokens (colors, fonts), content paths
├── components.json                     # shadcn/ui config (style, aliases, rsc: false)
├── .env.example                        # PUBLIC_GAS_URL=PASTE_YOUR_GAS_URL_HERE
├── .gitignore                          # node_modules, dist, .env, .astro
│
│── CI/CD ─────────────────────────────────────────────────
│
├── .github/
│   └── workflows/
│       └── deploy.yml                  # Push-to-main → build → GitHub Pages deploy → Lighthouse
│
│── Public Assets (served as-is) ──────────────────────────
│
├── public/
│   ├── favicon.svg                     # Wedding favicon
│   ├── og-image.jpg                    # Open Graph image (1200×630) for WhatsApp previews
│   └── fonts/
│       ├── playfair-display-latin.woff2    # Heading font (preloaded)
│       ├── dm-sans-latin.woff2             # Body font (preloaded)
│       └── frank-ruhl-libre-hebrew.woff2   # Hebrew font (preloaded)
│
│── Source Code ───────────────────────────────────────────
│
├── src/
│   │
│   │── Entry & Layout ────────────────────────────────────
│   │
│   ├── pages/
│   │   └── index.astro                 # Single page: imports BaseLayout + all sections
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro            # <html lang/dir>, <head> (fonts, CSP, OG meta), <body>
│   │
│   │── Page Sections (Astro, static, zero JS) ───────────
│   │
│   ├── sections/
│   │   ├── header.astro                # Fixed header: logo + HeaderControls island slot
│   │   ├── hero-section.astro          # Names, date, location + Countdown island slot
│   │   ├── globe-section.astro         # Scroll container + GlobeJourney island slot
│   │   ├── practical-info.astro        # 6 info cards (data-i18n, French defaults)
│   │   └── footer.astro               # Footer content (data-i18n, French defaults)
│   │
│   │── React Islands (interactive, hydrated) ────────────
│   │
│   ├── components/
│   │   ├── HeaderControls.tsx          # Language switcher + RSVP button (client:load)
│   │   ├── Countdown.tsx               # Countdown / celebration message (client:load)
│   │   ├── GlobeJourney.tsx            # D3 globe + GSAP ScrollTrigger (client:visible)
│   │   ├── StaticMapFallback.tsx       # Reduced-motion static map (rendered by GlobeJourney)
│   │   ├── EventModal.tsx              # Event detail modal — Radix Dialog (client:visible)
│   │   ├── RsvpForm.tsx               # RSVP form + modal — RHF/Zod (client:load)
│   │   │
│   │   └── ui/                         # shadcn/ui (CLI-installed, NEVER hand-modify)
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── textarea.tsx
│   │       ├── checkbox.tsx
│   │       ├── select.tsx
│   │       └── toast.tsx
│   │
│   │── State Management ─────────────────────────────────
│   │
│   ├── stores/
│   │   ├── language.ts                 # $language atom: 'fr' | 'he'
│   │   ├── active-event.ts            # $activeEvent atom: EventId | null
│   │   └── rsvp-open.ts              # $rsvpOpen atom: boolean
│   │
│   │── Internationalization ──────────────────────────────
│   │
│   ├── i18n/
│   │   ├── fr.ts                       # French translations (default, complete)
│   │   ├── he.ts                       # Hebrew translations (complete)
│   │   ├── translations.ts            # TranslationKey union type, Translations type, t() helper
│   │   └── i18n-global.ts            # Global script: $language subscriber → DOM swap + dir/lang
│   │
│   │── Data (typed constants) ────────────────────────────
│   │
│   ├── data/
│   │   ├── events.ts                   # 4 events with typed Event interface
│   │   └── globe-keyframes.ts         # 8 keyframes with typed GlobeKeyframe interface
│   │
│   │── Schemas (runtime validation) ─────────────────────
│   │
│   ├── schemas/
│   │   └── rsvp.ts                     # Zod schema: name, email, events[], guestCount, dietary, message
│   │
│   │── Utilities ─────────────────────────────────────────
│   │
│   ├── lib/
│   │   └── utils.ts                    # cn() utility (clsx + tailwind-merge) — NEVER duplicate
│   │
│   │── Styles ────────────────────────────────────────────
│   │
│   ├── styles/
│   │   └── global.css                  # @tailwind directives, CSS custom props, font-face, base resets
│   │
│   │── Static Assets (processed by Astro) ───────────────
│   │
│   └── assets/
│       ├── images/
│       │   ├── hero-photo.jpg          # Hero section photo (when provided by couple)
│       │   └── hero-placeholder.svg    # Placeholder until real photo
│       ├── geo/
│       │   └── world-110m.json         # TopoJSON world geometry (D3 globe land masses)
│       └── icons/
│           └── logo.svg                # Wedding logo/monogram
│
│── Build Output (gitignored) ────────────────────────────
│
├── dist/                               # Astro build output → deployed to GitHub Pages
│
│── BMAD Artifacts ────────────────────────────────────────
│
└── _bmad-output/
    ├── planning-artifacts/
    │   ├── prd.md
    │   ├── ux-design-specification.md
    │   └── architecture.md             # This document
    └── implementation-artifacts/
        └── tech-spec-anael-eric-wedding-website.md
```

### Data Type Definitions

**Event interface** (used by `src/data/events.ts`):

```typescript
interface Event {
  id: EventId;                          // 'mairie' | 'welcome-dinner' | 'beach-party' | 'wedding-ceremony'
  date: string;                         // ISO date string
  time: string | null;                  // null = TBD
  location: {
    name: string;                       // Venue name (not translated — proper noun)
    address: string;                    // Full address
    city: string;                       // City name
  };
  coordinates: [number, number];        // [longitude, latitude] for D3 projection
  translationKey: string;               // Prefix for i18n keys: 'event.mairie', 'event.welcome_dinner', etc.
}

type EventId = 'mairie' | 'welcome-dinner' | 'beach-party' | 'wedding-ceremony';
```

**GlobeKeyframe interface** (used by `src/data/globe-keyframes.ts`):

```typescript
interface GlobeKeyframe {
  center: [number, number];             // [longitude, latitude]
  scale: number;                        // Projection scale (zoom level)
  markerHighlight: EventId | null;      // Event to highlight, or null
}
```

### Architectural Boundaries

#### API Boundaries — Single External API: Google Apps Script (GAS)

| Boundary | Detail |
|---|---|
| Endpoint | `import.meta.env.PUBLIC_GAS_URL` (build-time injected) |
| Protocol | HTTPS POST |
| Content-Type | `application/x-www-form-urlencoded` |
| Body encoding | `URLSearchParams` (never `FormData`, never JSON) |
| Redirect | `redirect: 'follow'` (GAS returns 302 on success) |
| Timeout | 10s via `AbortController` |
| Auth | None (public GAS web app) |
| Caller | `src/components/RsvpForm.tsx` (exclusive) |
| Validation | Client: `src/schemas/rsvp.ts` (Zod). Server: GAS script (field presence, email format) |

No other external APIs. All data is compiled into the static build.

#### Component Boundaries

**Boundary 1: Astro Static ↔ React Islands**

Static Astro sections and React islands share NO React context, NO props at runtime, NO direct function calls. Communication is exclusively via nanostores atoms and the global i18n script.

| Communication | Direction | Mechanism |
|---|---|---|
| Language state | React → Astro | `$language` atom → global script subscribes |
| Initial data | Astro → React | Props passed in `.astro` files at render time |
| Events | React → React | `$activeEvent`, `$rsvpOpen` atoms |

**Boundary 2: React Islands ↔ React Islands**

Each island hydrates independently with its own React root. No shared React context or hooks.

| Communication | Mechanism |
|---|---|
| `HeaderControls` → `RsvpForm` | `$rsvpOpen` atom |
| `GlobeJourney` → `EventModal` | `$activeEvent` atom |
| `HeaderControls` → All | `$language` atom |

**Boundary 3: React ↔ D3.js (inside GlobeJourney)**

React owns the container `<div>`. D3 owns the `<svg>` inside it. React NEVER renders SVG elements for the globe. D3 NEVER manipulates elements outside its SVG. Globe SVG content always renders LTR — marker labels use explicit `direction: ltr` on SVG text elements regardless of page `dir` attribute.

| Concern | Owner |
|---|---|
| Container div, lifecycle, nanostores | React (`GlobeJourney.tsx`) |
| SVG creation, projection, paths, markers, route line | D3 (inside `useEffect`) |
| ScrollTrigger setup/teardown | GSAP (inside `useEffect`, stored in ref) |
| Marker click → event modal | D3 `.on('click')` → calls React callback (closure) |

**Boundary 4: shadcn/ui Components**

Files in `src/components/ui/` are installed by the shadcn CLI and MUST NOT be hand-modified. Customization via `className` prop or wrapper components only.

#### Data Boundaries

All data is compile-time static. No database, no cache, no session storage, no client-side persistence (NFR20).

| Data Type | Source of Truth | Consumers | Mutability |
|---|---|---|---|
| Event metadata | `src/data/events.ts` | GlobeJourney, EventModal, RsvpForm (checkboxes) | Build-time constant |
| Globe keyframes | `src/data/globe-keyframes.ts` | GlobeJourney (exclusive) | Build-time constant |
| Translations (FR) | `src/i18n/fr.ts` | All components + global script | Build-time constant |
| Translations (HE) | `src/i18n/he.ts` | All components + global script | Build-time constant |
| RSVP form data | React Hook Form (in-memory) | RsvpForm (exclusive) | Runtime, ephemeral |
| Current language | `$language` atom | All components + global script | Runtime, ephemeral |
| Active event | `$activeEvent` atom | GlobeJourney → EventModal | Runtime, ephemeral |
| RSVP open state | `$rsvpOpen` atom | HeaderControls → RsvpForm | Runtime, ephemeral |

### Integration Points

#### Internal Communication

**nanostores — the single cross-island bus:**

```
HeaderControls (client:load)
  ├── $language ──→ i18n-global.ts (DOM swap: data-i18n elements)
  │                 GlobeJourney (re-render labels)
  │                 EventModal (re-render content)
  │                 RsvpForm (re-render labels/errors)
  │                 Countdown (re-render text)
  │
  └── $rsvpOpen ──→ RsvpForm (open/close modal)

GlobeJourney (client:visible)
  └── $activeEvent ──→ EventModal (open with event data)
```

**GSAP ScrollTrigger — scroll-to-animation bridge:**

```
Browser scroll event
  → ScrollTrigger.create({ scrub: true, onUpdate })
    → progress (0→1) mapped to beat index (0→7)
      → D3 projection update (rotation + scale interpolation)
      → SVG stroke-dashoffset update (route line)
      → Marker highlight toggle
```

**Astro hydration directives — load-timing control:**

| Island | Directive | When JS Loads |
|---|---|---|
| `HeaderControls` | `client:load` | Immediately on page load |
| `Countdown` | `client:load` | Immediately on page load |
| `RsvpForm` | `client:load` | Immediately on page load |
| `GlobeJourney` | `client:visible` | When globe section scrolls into viewport |
| `EventModal` | `client:visible` | When globe section scrolls into viewport |

**Note:** RsvpForm was upgraded from `client:idle` to `client:load` because the RSVP button in the fixed header is visible from first paint. A `client:idle` island would create a dead button if tapped before hydration, with no loading state permitted (per Step 5 rules).

#### External Integrations

| Integration | Protocol | Configuration | Used By |
|---|---|---|---|
| Google Apps Script | HTTPS POST (`URLSearchParams`) | `PUBLIC_GAS_URL` env var | `RsvpForm.tsx` |
| Self-hosted fonts | `<link rel="preload">` in `BaseLayout.astro` | `public/fonts/` directory | Global |
| GitHub Pages | Static file hosting | `deploy.yml` workflow | CI/CD |
| TopoJSON world data | Bundled static file | `src/assets/geo/world-110m.json` | `GlobeJourney.tsx` |

**Font loading strategy (consolidated):** All three font families (Playfair Display, DM Sans, Frank Ruhl Libre) are self-hosted as `.woff2` files in `public/fonts/` and preloaded via `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `BaseLayout.astro`. No Google Fonts CDN dependency.

#### Data Flows

**Flow 1: Language Switch**
```
User clicks FR/HE toggle in HeaderControls
  → $language.set('he')
  → React islands: useStore($language) triggers re-render with Hebrew translations
  → i18n-global.ts: $language.subscribe() callback fires
    → document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = he[key])
    → document.documentElement.lang = 'he'
    → document.documentElement.dir = 'rtl'
    → document.documentElement.classList.add('hebrew')
```

**Flow 2: Globe → Event Modal**
```
User clicks stop marker on globe (D3 click handler)
  → Store ref to triggering marker element (for focus return)
  → $activeEvent.set('welcome-dinner')
  → EventModal: useStore($activeEvent) triggers re-render
    → Looks up event data from events.ts by ID
    → Opens Radix Dialog with bilingual content
    → Focus trapped inside modal

User closes modal (Escape / backdrop / close button)
  → $activeEvent.set(null)
  → Focus returns to triggering marker via stored ref
```

**Flow 3: RSVP Submission**
```
User clicks RSVP button in HeaderControls
  → $rsvpOpen.set(true)
  → RsvpForm: useStore($rsvpOpen) → opens Radix Dialog

User fills form and clicks Submit
  → React Hook Form validates against Zod schema (src/schemas/rsvp.ts)
  → If invalid: inline errors shown, form data preserved
  → If valid:
    → new URLSearchParams(formData)
    → fetch(PUBLIC_GAS_URL, { method: 'POST', body: params, redirect: 'follow' })
    → AbortController with 10s timeout
    → Success: show confirmation message (countdown.celebration i18n key pattern), clear form, close modal
    → Failure: show error message, preserve all form data, show retry button
```

**Flow 4: Countdown Logic**
```
On mount (client:load):
  → Calculate diff between now and October 18, 2026
  → If before: render "{X} months, {Y} days" (bilingual via $language + translations.ts)
  → If on/after: render celebration message (bilingual via countdown.celebration i18n key)
  → Set interval to update daily (months+days granularity, not per-second)
```

### File Organization Patterns

#### Configuration Files (Project Root)

| File | Purpose | Modify Frequency |
|---|---|---|
| `package.json` | Dependencies, scripts (`dev`, `build`, `preview`) | When adding dependencies |
| `astro.config.mjs` | Site URL, base path, React + Tailwind integrations | Rarely |
| `tsconfig.json` | `strict: true`, path aliases `@/*`, Astro base config | Rarely |
| `tailwind.config.mjs` | Design tokens (colors, fonts, spacing), content paths | When adding tokens |
| `components.json` | shadcn/ui configuration (style, alias, rsc: false) | Never (set once) |
| `.env.example` | Documented env vars template | When adding env vars |
| `.gitignore` | `node_modules/`, `dist/`, `.env`, `.astro/` | Rarely |

#### Source Organization

By type, not by feature. This project has ~17 components supporting a single page. Feature-based organization would create unnecessary nesting.

| Directory | Contents | Convention |
|---|---|---|
| `src/pages/` | Single `index.astro` (composes all sections) | Astro file-based routing |
| `src/layouts/` | `BaseLayout.astro` (HTML shell, head, body wrapper) | One layout for SPA |
| `src/sections/` | Astro section components (zero JS, `data-i18n`) | `kebab-case.astro` |
| `src/components/` | React islands (interactive, hydrated) | `PascalCase.tsx` |
| `src/components/ui/` | shadcn/ui primitives (CLI-managed, never modify) | `kebab-case.tsx` |
| `src/stores/` | nanostores atoms (3 atoms only) | `kebab-case.ts`, `$camelCase` exports |
| `src/i18n/` | Translation files + global script + types | `locale-code.ts` |
| `src/data/` | Typed constant data (events, keyframes) | `kebab-case.ts` |
| `src/schemas/` | Zod validation schemas | `kebab-case.ts` |
| `src/lib/` | Shared utilities (`cn()`) | `kebab-case.ts` |
| `src/styles/` | Global CSS (Tailwind directives, base resets) | Single `global.css` |
| `src/assets/` | Images, geo data, icons (processed by Astro) | Subdirectories by type |

#### Test Organization

Testing is deprioritized for this wedding site with a fixed deadline. Primary guardrails:

| Check | Command | Enforcement |
|---|---|---|
| Type checking | `npx tsc --noEmit` | CI + pre-commit |
| Build verification | `npm run build` | CI + pre-commit |
| RTL lint | `rg '\b(pl-\|pr-\|ml-\|mr-\|text-left\|text-right)\b' src/` | Manual (must return 0 results) |
| Lighthouse audit | Lighthouse CI in `deploy.yml` | CI (non-blocking, report-only) |

**Testing escalation gate:** Testing remains deprioritized unless: (a) a regression is introduced that build verification wouldn't catch, (b) Eric explicitly requests test coverage, or (c) a component's complexity warrants unit tests during implementation (e.g., countdown date logic, RSVP validation edge cases). If escalated: Vitest for unit tests (co-located as `*.test.ts`), Playwright for E2E (in `tests/e2e/`).

#### Asset Organization

| Location | Contents | Processing |
|---|---|---|
| `public/favicon.svg` | Favicon | Served as-is |
| `public/og-image.jpg` | Open Graph image for WhatsApp previews | Served as-is |
| `public/fonts/` | Self-hosted `.woff2` font files | Served as-is (preloaded in `<head>`) |
| `src/assets/images/` | Hero photo, placeholders | Astro `<Image>` optimizes (WebP/AVIF, responsive) |
| `src/assets/geo/` | TopoJSON world geometry | Imported as JSON module by GlobeJourney |
| `src/assets/icons/` | SVG icons (logo) | Imported as Astro components or inline |

### Development Workflow Integration

#### Development Server

```bash
npm run dev          # Astro dev server (Vite-powered, port 4321)
                     # HMR for Astro + React components
                     # Tailwind JIT compilation
                     # No .env needed (GAS URL falls back to placeholder)
```

#### Build Process

```bash
npm run build        # Astro static build → dist/
                     # 1. TypeScript compilation
                     # 2. Astro renders .astro pages to static HTML
                     # 3. React islands compiled to separate JS chunks
                     # 4. Tailwind CSS purged and minified
                     # 5. Assets optimized (images → WebP/AVIF)
                     # 6. Output: dist/sitemariage/ (respects base path)

npx tsc --noEmit     # Standalone type check (catches errors Astro build may miss)
```

#### Deployment Pipeline (`.github/workflows/deploy.yml`)

```
Push to main branch
  ↓
Job: build-and-deploy
  ├── Step 1: actions/checkout@v4
  ├── Step 2: actions/setup-node@v4 (Node 20)
  ├── Step 3: npm ci (clean install from lockfile)
  ├── Step 4: npm run build
  │            └── Env: PUBLIC_GAS_URL from GitHub repo secrets
  ├── Step 5: withastro/action@v3 (upload dist/ as Pages artifact)
  ├── Step 6: actions/deploy-pages@v4 (deploy to GitHub Pages)
  └── Step 7: Lighthouse CI (non-blocking, report-only)
               └── Monitors: FCP <1.5s, LCP <2.5s, Accessibility ≥90
```

**Environment variable flow:**
```
GitHub repo Settings → Secrets → PUBLIC_GAS_URL
  → Injected as env var in build step
    → Astro replaces import.meta.env.PUBLIC_GAS_URL at build time
      → Inlined as string constant in RsvpForm chunk
```

#### Pre-commit Verification

```bash
npm run build && npx tsc --noEmit    # Both must pass
rg '\b(pl-|pr-|ml-|mr-|text-left|text-right)\b' src/    # Must return 0 results
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

All major technology choices are compatible and verified:
- Astro 5.17.3 + @astrojs/react 4.4.2 + React 19: Confirmed compatible
- Tailwind CSS 4.x + shadcn/ui 3.8.5: Compatible. `cn()` utility is the canonical composition pattern
- nanostores + @nanostores/react: Purpose-built for Astro islands. ~1KB gzipped
- GSAP 3 + ScrollTrigger: npm-installed, `registerPlugin` once per entry point, `scrub: true` (boolean) enforced
- D3-geo (tree-shaken) + React: "React container + D3 internals" pattern avoids DOM ownership conflicts
- React Hook Form + Zod + @hookform/resolvers: Standard form validation stack

One version tension (Zod version bundled with Astro vs standalone) is a `package.json` verification during INFRA-1 — no architectural impact.

**Pattern Consistency:**

- Naming conventions internally consistent across all 6 file types + i18n keys + nanostores exports
- i18n hybrid pattern (React `useStore` vs Astro `data-i18n`) clearly delineated with "never cross the patterns" rule
- GSAP split (script tags for static, useEffect for islands) is clean and consistent
- RTL enforcement via logical CSS properties comprehensive, with grep-based lint check

**Structure Alignment:**

- Directory structure (~50 files) maps cleanly to all architectural decisions
- By-type organization appropriate for ~17-component single-page application
- 4 architectural boundaries clearly documented with explicit communication rules
- All integration points properly placed within structure

**Contradictions found:** None. The architecture is internally coherent.

### Requirements Coverage Validation ✅

**Functional Requirements (29/29 covered):**

| Category | FRs | Status |
|---|---|---|
| Globe Journey | FR1-FR6 | ✅ GlobeJourney.tsx + StaticMapFallback.tsx + keyframes + events |
| Event Information | FR7-FR9 | ✅ EventModal.tsx + Radix Dialog + events.ts + i18n |
| RSVP | FR10-FR15 | ✅ RsvpForm.tsx + HeaderControls.tsx + Zod + URLSearchParams + AbortController |
| Language & Localization | FR16-FR20 | ✅ HeaderControls.tsx + $language + i18n-global.ts + TranslationKey type |
| Hero & Countdown | FR21-FR23 | ✅ hero-section.astro + Countdown.tsx + countdown.celebration i18n key |
| Practical Information | FR24-FR25 | ✅ practical-info.astro + data-i18n + i18n-global.ts |
| Navigation & Layout | FR26-FR29 | ✅ BaseLayout.astro + header.astro + footer.astro + ARIA + keyboard nav |

**Non-Functional Requirements (24/24 covered):**

| Category | NFRs | Status | Notes |
|---|---|---|---|
| Performance | NFR1-NFR4 | ✅ | Static HTML first, progressive hydration, French defaults, independent islands |
| Performance | NFR5-NFR6 | ✅ | Pre-computed keyframes, scrub:true for 1:1 scroll fidelity |
| Performance | NFR7 | ✅ | Radix Dialog + client:visible pre-hydration |
| Performance | NFR8 | ⚠️ Revised | <35KB initial / <110KB total (justified: progressive island loading) |
| Performance | NFR9 | ✅ | D3-managed SVG with minimal nodes |
| Accessibility | NFR10-NFR18 | ✅ | Radix focus trap, ARIA, keyboard nav, reduced-motion, 44px targets, lang/dir |
| Security | NFR19-NFR21 | ✅ | HTTPS, no client storage, Zod + GAS validation |
| Integration | NFR22-NFR24 | ✅ | URLSearchParams, 10s timeout, form data preservation |

NFR8 deviation is justified: Revised budget documented with detailed breakdown. Effective UX matches a <35KB site due to Astro's progressive loading.

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical technologies include specific versions
- Initialization command sequence fully specified (4 steps)
- All npm dependencies listed with install commands
- Implementation sequence (10 ordered steps) respects dependency chains

**Structure Completeness:**
- Complete directory tree with ~50 annotated files
- Configuration files documented with expected content
- shadcn/ui components explicitly listed (8 components)
- Asset organization specified (public/ vs src/assets/)

**Pattern Completeness:**
- 15 explicit enforcement rules for AI agents
- Canonical code examples (GSAP import, nanostores, TypeScript patterns)
- RSVP error handling fully specified
- Build verification + RTL lint documented

### Gap Analysis Results

**Critical Gaps: None**

No gaps that would block implementation. All 29 FRs and 24 NFRs have architectural support.

**Important Gaps (documentation-level, non-blocking):**

1. **CSP meta tag references Google Fonts CDN** — Should be `font-src 'self'` only (self-hosted fonts). Fix during INFRA-2.
2. **Font pair ambiguity** — Playfair Display + DM Sans (PRD/UX spec body) vs Cormorant Garamond + Inter (UX spec tailwind config example). Needs Eric's confirmation during INFRA-2. Architecture tokens (`font-heading`, `font-body`) are font-agnostic.
3. **`$activeEvent` and `$rsvpOpen` introduced in Step 5** but not in Step 4a State Management section. Document flow issue only — complete picture clear from Steps 5-6.
4. **Toast vs in-modal RSVP feedback** not specified in data flow. Both architecturally supported. UX spec provides guidance for implementing agent.
5. **`topojson-client` dependency** missing for TopoJSON parsing. Add during globe implementation, or pre-process to GeoJSON at build time.

**Nice-to-Have Gaps:**

6. Skip navigation link (minor a11y enhancement, add during INFRA-2)
7. React error boundary for globe island (Astro static HTML is inherent fallback)
8. Explicit "no dark mode" note (prevents speculative implementation)
9. InvitationBorder component (Phase 2, correctly omitted from MVP)

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed (29 FRs, 24 NFRs, 7 categories)
- [x] Scale and complexity assessed (Low domain / Medium technical)
- [x] Technical constraints identified (6 hard constraints)
- [x] Cross-cutting concerns mapped (i18n, performance, a11y, responsive, progressive enhancement)

**✅ Starter Template**

- [x] Template selected with rationale (Official Astro CLI path)
- [x] Initialization commands fully specified (4-step sequence)
- [x] All dependencies listed (7 additional packages)
- [x] Versions verified (Astro 5.17.3, shadcn 3.8.5, @astrojs/react 4.4.2)

**✅ Architectural Decisions**

- [x] State management (nanostores, 3 atoms)
- [x] i18n architecture (hybrid: React useStore + Astro data-i18n)
- [x] Component architecture (5 React islands + static Astro sections)
- [x] GSAP integration (script tags + useEffect split)
- [x] Performance budget revised (<35KB initial / <110KB total)
- [x] Globe architecture (React container + D3 internals + pre-computed keyframes)
- [x] Infrastructure (GitHub Actions, PUBLIC_GAS_URL, Lighthouse CI)
- [x] Data architecture (typed TypeScript constants, Zod for RSVP)
- [x] Security (no auth, CSP, no client storage)
- [x] API (single GAS POST with URLSearchParams)

**✅ Implementation Patterns**

- [x] Naming conventions (6 file types + i18n keys + nanostores)
- [x] Structure patterns (by-type, complete tree)
- [x] Code patterns (React, TypeScript, GSAP, imports)
- [x] Communication patterns (3 atoms, one-writer-per-atom)
- [x] Process patterns (no loading states, error handling, a11y, RTL)
- [x] Style patterns (Tailwind hierarchy, shadcn/ui, design tokens)
- [x] Build verification (build + tsc + RTL lint)
- [x] 15 AI agent enforcement rules

**✅ Project Structure**

- [x] Complete directory structure (~50 files)
- [x] v1 → v2 migration strategy (v1-archive branch)
- [x] FR-to-file mapping complete (29 FRs + 5 INFRA stories)
- [x] Data type definitions (Event, EventId, GlobeKeyframe)
- [x] 4 architectural boundaries defined
- [x] 4 data flows documented
- [x] Integration points mapped
- [x] Development workflow documented
- [x] Pre-commit verification specified

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**

1. **Exhaustive requirements traceability** — Every FR and NFR maps to specific files
2. **Clear boundary enforcement** — 4 boundaries prevent common integration mistakes
3. **Resolved tension points** — All 6 key architectural tensions explicitly addressed
4. **AI agent enforcement rules** — 15 rules target exact divergence points
5. **Progressive implementation sequence** — 10 ordered steps respect all dependencies

**Areas for Future Enhancement:**

1. Font pair confirmation (Playfair Display + DM Sans vs Cormorant Garamond + Inter) — Eric's decision
2. `topojson-client` dependency — add during globe story
3. Phase 2 components (InvitationBorder, Toast integration, skip nav) — future stories
4. Testing — deprioritized with documented escalation gate

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use 15 enforcement rules as non-negotiable constraints
- Respect project structure, boundaries, and naming conventions
- Run `npm run build && npx tsc --noEmit` before every commit
- When ambiguous, escalate to Eric rather than making assumptions

**First Implementation Priority — INFRA-1: Project Scaffolding:**

```bash
# Step 1: Archive v1 codebase
git checkout -b v1-archive && git push -u origin v1-archive && git checkout main

# Step 2: Create Astro project
npm create astro@latest sitemariage-v2 -- --template with-tailwindcss --add react --install --git

# Step 3: Add path aliases to tsconfig.json
# Add: "baseUrl": ".", "paths": { "@/*": ["./src/*"] }

# Step 4: Initialize shadcn/ui
npx shadcn@latest init

# Step 5: Add shadcn/ui components
npx shadcn@latest add dialog button input label textarea checkbox select toast

# Step 6: Install additional dependencies
npm install gsap d3-geo @types/d3-geo react-hook-form @hookform/resolvers nanostores @nanostores/react
npm install -D eslint prettier eslint-plugin-astro prettier-plugin-astro

# Step 7: Configure astro.config.mjs
# site: 'https://elmagow.github.io', base: '/sitemariage/', output: 'static'
```

After INFRA-1, proceed to INFRA-2 (BaseLayout.astro) → INFRA-4 (nanostores) → INFRA-5 (i18n system), following the implementation sequence in the Decision Impact Analysis.
