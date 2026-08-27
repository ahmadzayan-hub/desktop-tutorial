# Changelog

All notable changes to Lahza are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — branch `claude/saas-platform-architecture-8AvmZ`

### Fixed
- **i18n coverage** — added `notFound.{title,body}`, `common.{close,skipToContent,pleaseConfirm}`, `nav.{primaryNav,mobileNav}` to both `en.ts` and `ar.ts`; Arabic users no longer see raw English on the 404 page or the name-spelling assistant warning
- **ProductPreview SVG clipPath ID collision** — replaced static `id=\`clip-${surface}\`` with `useId()`-derived unique IDs so multiple preview instances on the Review step clip correctly
- **Header ESLint error** (`react-hooks/set-state-in-effect`) — removed `useEffect(() => setOpen(false), [pathname])`; mobile menu now closes via `onClick={closeMenu}` on each NavLink, which is both lint-clean and semantically correct
- **Header aria-labels** — `aria-label="Primary"` and `aria-label="Mobile"` replaced with `t("nav.primaryNav")` / `t("nav.mobileNav")` so screen-reader announcements are bilingual
- **steps.tsx hardcoded string** — `"⚠︎ please confirm"` on line 286 replaced with `t("common.pleaseConfirm")`
- **demoData order prefix** — all `BCM-` refs renamed to `LHZ-` to match the `id.ts` generator and avoid brand confusion

### Added
- **ErrorBoundary** (`src/components/ErrorBoundary.tsx`) — class component wrapping the entire app tree; unhandled render errors now show a recovery UI with a "Try again" button instead of a blank white screen
- **ESLint v9 flat config** (`eslint.config.js`) — replaces the missing config; rules: `@typescript-eslint/recommended`, `react-hooks/recommended`, with `no-unused-vars` and `no-explicit-any` as warnings

### Changed
- **App.tsx** — Legal pages (Privacy, Terms, Refund) converted from eager imports to `lazy()` + `Suspense`; reduces initial JS parse cost for users who never visit legal pages
- **App.tsx** — wrapped in `<ErrorBoundary>` at the outermost level

### Build metrics (post-fix)
| Metric | Value |
|--------|-------|
| TypeScript errors | 0 |
| ESLint errors | 0 |
| Build time | 4.95 s |
| Main bundle (gzip) | 34.5 kB |
| Router chunk (gzip) | 53.4 kB |
| Security vulns (high) | 0 |
| Security vulns (moderate) | 2 (react-router, upstream) |

---

## [0.9.0-beta] — 2026-Q2 (prior work on `main`)

### Added
- Bilingual (EN/AR) i18n system with `Dict` structural type enforcing parity between `en.ts` and `ar.ts`
- Vite 5 + React 18 + TypeScript 5.6 + Tailwind CSS 3 stack
- Route-level lazy loading for all pages except Home
- PWA support: `manifest.webmanifest`, `public/sw.js`, Android install prompt, iOS detection
- AI feature façade (`src/lib/ai.ts`) — all features offline/deterministic by default; `VITE_AI_ENDPOINT` routes to real provider
- UAE compliance: brand config with VAT TRN placeholder, `sellerValueSet()` guard, PDPL photo-consent enforced in the customise flow
- WhatsApp order hand-off (`src/lib/whatsapp.ts`)
- Admin console (`/console`) with demo data, no public auth required
- 7-step Customise flow with live SVG product preview
- Corporate & Events, Gallery, Pricing, FAQ, Delivery, Contact pages
- Legal pages: Privacy Policy, Terms of Service, Refund Policy

---

_Versions prior to 0.9.0 are not documented here._
