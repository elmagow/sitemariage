# Agent Instructions — sitemariage

The task should be done with the relevant bmad subagents. Keeping context free.

## Project Overview
Wedding website for Anael & Eric (October 18-20, 2026, Tel Aviv, Israel).
Single-page, trilingual (French default, Hebrew RTL, English), hosted on GitHub Pages.

**Live URL:** `https://elmagow.github.io/sitemariage/`
**GitHub repo:** `https://github.com/elmagow/sitemariage` (private)

## Tech Stack (v2 — Astro)
- **Framework:** Astro 5 (Islands Architecture)
- **UI:** React 19 (interactive islands) + TypeScript
- **Bundler:** Vite 6 (inside Astro)
- **Components:** shadcn/ui + Radix UI primitives
- **Animation:** GSAP 3 + ScrollTrigger (globe), D3.js (geographic projection)
- **Styles:** Tailwind CSS v4 + shadcn/ui design tokens (no preprocessor)
- **i18n:** Hybrid — nanostores (`$language`) for React + `data-i18n` for Astro sections
- **Validation:** Zod + react-hook-form
- **Deploy:** GitHub Actions -> GitHub Pages (`base: '/sitemariage/'`)

## Key Rules (must follow exactly)

### RSVP Form
- POST to Google Apps Script using `URLSearchParams` — **NOT** `FormData`
- GAS endpoint URL comes from `import.meta.env.PUBLIC_GAS_URL`
- Set via GitHub Secrets (key: `PUBLIC_GAS_URL`) for production
- Local dev: create `.env` with `PUBLIC_GAS_URL=...` (not committed)
- Fallback: `PASTE_YOUR_GAS_URL_HERE` placeholder

### GSAP
- `scrub: true` — **never** `scrub: 1.5` or any numeric value (mobile fidelity)
- Import path: `import { ScrollTrigger } from 'gsap/ScrollTrigger'`
- Register plugin: `gsap.registerPlugin(ScrollTrigger)` inside useEffect

### Islands Architecture
- React islands hydrate independently — use `client:load` for interactive-on-load, `client:visible` for below-fold
- Astro sections are static HTML with `data-i18n` attributes
- State shared between islands via nanostores (`$language`, `$rsvpOpen`, `$activeEvent`)

### i18n / Language
- French is the default language (`lang="fr"` on `<html>`)
- Hebrew is RTL — `dir="rtl"` set dynamically via `i18n-global.ts`
- Hebrew font override uses `.hebrew` class on `<html>` + CSS in `global.css`
- Hebrew uses `Frank Ruhl Libre` via `--font-hebrew` CSS variable
- All `data-i18n` elements must be pre-populated with French defaults (prevents flash)
- React islands use `t(key, lang)` function + `useStore($language)` for reactivity
- Translation files: `src/i18n/fr.ts` and `src/i18n/he.ts` (typed via `Translations`)

### CSS / Design Tokens
- All colors MUST use Tailwind tokens (`bg-background`, `text-foreground`, `text-primary`, `bg-accent`, etc.)
- Wedding palette extended tokens: `wedding-primary`, `wedding-accent1`, `wedding-accent2`, `wedding-dark`, `wedding-light`, `wedding-olive`, `wedding-surface`
- **Exception:** D3/SVG imperative code uses hex constants (mirroring `--color-wedding-*` tokens)
- Use `font-heading` for Playfair Display (display font)
- Use `font-body` for DM Sans (body font)
- Use `font-hebrew` for Frank Ruhl Libre (Hebrew only)
- **NEVER use physical CSS directional properties:**
  - `pl-` -> `ps-`, `pr-` -> `pe-`, `ml-` -> `ms-`, `mr-` -> `me-`
  - `text-left` -> `text-start`, `text-right` -> `text-end`
  - `text-center` is fine (not directional)

### React Components
- **Named exports only** — never `export default`
- UI primitives from `src/components/ui/` (shadcn/ui generated)
- Custom islands in `src/components/` (PascalCase `.tsx`)
- All components use `cn()` from `src/lib/utils.ts` for class merging

### Accessibility
- All interactive elements: `min-h-11` (44px touch target)
- Form validation: `aria-invalid`, `role="alert"` for errors
- `prefers-reduced-motion`: static fallback for globe animation
- Skip-to-content link in BaseLayout
- Modal focus trapping via Radix Dialog

### Git / Deploy
- **Always commit and push after completing any task**
- Remote: `https://github.com/elmagow/sitemariage` (HTTPS, authenticated via `gh` CLI as `elmagow`)
- Branch: `v2-astro` (deploy workflow watches this branch)
- Every push to `v2-astro` triggers auto-deploy via `.github/workflows/deploy.yml`
- Run `npm run build` and confirm zero errors before committing

## Project Structure
```
sitemariage/
├── .github/workflows/deploy.yml   # GitHub Actions -> GitHub Pages
├── astro.config.mjs               # Astro 5 + React + Tailwind v4
├── tsconfig.json                   # Strict TS, path aliases (@/*)
├── package.json                    # Astro 5 + React 19 + GSAP + D3 + shadcn
├── components.json                 # shadcn/ui configuration
├── .env.example                    # PUBLIC_GAS_URL placeholder
├── public/
│   ├── favicon.svg                 # A&E monogram
│   └── fonts/                      # Self-hosted Playfair Display, DM Sans, Frank Ruhl Libre
├── src/
│   ├── assets/
│   │   └── geo/world-110m.json    # TopoJSON world map for D3
│   ├── components/
│   │   ├── HeaderControls.tsx      # Lang switcher + RSVP button island
│   │   ├── Countdown.tsx           # Hero countdown timer
│   │   ├── GlobeJourney.tsx        # D3 + GSAP ScrollTrigger globe
│   │   ├── StaticMapFallback.tsx   # prefers-reduced-motion fallback
│   │   ├── EventModal.tsx          # Event detail modal (Radix Dialog)
│   │   ├── RsvpForm.tsx            # RSVP modal (react-hook-form + zod)
│   │   └── ui/                     # shadcn/ui primitives (dialog, button, input, etc.)
│   ├── data/
│   │   ├── events.ts               # 4 wedding events with coordinates
│   │   └── globe-keyframes.ts      # 8 keyframes for globe scroll animation
│   ├── i18n/
│   │   ├── translations.ts         # t() function, TranslationKey type
│   │   ├── i18n-global.ts          # data-i18n DOM updater (subscribes to $language)
│   │   ├── fr.ts                   # French translations (default)
│   │   └── he.ts                   # Hebrew translations (RTL)
│   ├── layouts/
│   │   └── BaseLayout.astro        # HTML shell, fonts, CSP, OG tags
│   ├── lib/
│   │   └── utils.ts                # cn() helper (clsx + tailwind-merge)
│   ├── pages/
│   │   └── index.astro             # Single page: assembles all sections + islands
│   ├── schemas/
│   │   └── rsvp.ts                 # Zod schema for RSVP form
│   ├── sections/
│   │   ├── header.astro            # Fixed header with HeaderControls island
│   │   ├── hero-section.astro      # Hero with Countdown island
│   │   ├── globe-section.astro     # Globe container with GlobeJourney island
│   │   ├── practical-info.astro    # 6-card grid (pure Astro, data-i18n)
│   │   └── footer.astro            # Footer (pure Astro, data-i18n)
│   ├── stores/
│   │   ├── language.ts             # $language atom ('fr' | 'he')
│   │   ├── rsvp-open.ts            # $rsvpOpen atom (boolean)
│   │   └── active-event.ts         # $activeEvent atom (EventId | null)
│   └── styles/
│       └── global.css              # Tailwind v4, font-faces, shadcn tokens, wedding palette
└── _bmad-output/
    └── implementation-artifacts/
        └── tech-spec-anael-eric-wedding-website.md
```

## Pending Human Actions
- **GitHub Pages:** Enable in repo settings -> Pages -> Source -> GitHub Actions
- **GAS URL:** Add `PUBLIC_GAS_URL` to GitHub repo secrets
- **Event times:** Currently "Horaire a confirmer" / TBD in translation files — update when confirmed
- **Photos:** Add real wedding photos when available
- **English:** Third language (EN) not yet implemented — add `en.ts` when needed
