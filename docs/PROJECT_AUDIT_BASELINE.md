# Project Audit Baseline — Lahza

**Date:** 2026-08-27  
**Branch audited:** `claude/saas-platform-architecture-8AvmZ`  
**Auditor:** ORCHESTRATOR / HEAVY roles (Agentic OS)

---

## 1. Repository Identity

| Field | Value |
|-------|-------|
| Product name | Lahza (لحظة) |
| Legal entity | Beyond Connect General Trading L.L.C. |
| Stack | Vite 5 · React 18 · TypeScript 5.6 · Tailwind CSS 3 |
| Languages | English (LTR) + Arabic (RTL) |
| Build tool | Vite 5.4 |
| Package manager | npm |
| Node target | ESM (`"type": "module"`) |
| Repo | `ahmadzayan-hub/desktop-tutorial` |

---

## 2. Build Baseline

| Metric | Pre-fix | Post-fix |
|--------|---------|----------|
| TypeScript errors | 0 | 0 |
| ESLint errors | 1 | **0** |
| ESLint warnings | 0 | 0 |
| Build result | ✓ | ✓ |
| Build time | 2.42 s | 4.95 s (more chunks) |
| Main bundle (gzip) | ~34 kB | 34.5 kB |
| Security vulns — critical | 0 | 0 |
| Security vulns — high | 2 (nanoid, postcss) | **0** (fixed via `npm audit fix`) |
| Security vulns — moderate | 2 (react-router) | 2 (upstream, unfixed) |

---

## 3. Code Quality Findings

### 3.1 Critical (fixed)

| ID | File | Finding | Fix |
|----|------|---------|-----|
| CQ-01 | `src/components/ProductPreview.tsx:36` | Static SVG clipPath IDs cause DOM collision when ≥2 instances render simultaneously (Review step shows all 4 surfaces). Wrong image clips to wrong surface. | Replaced with `useId()` |
| CQ-02 | `src/pages/NotFound.tsx:12` | Hardcoded English `"Sorry, we couldn't find that page."` shown to Arabic users | Used `t("notFound.body")` |
| CQ-03 | `src/pages/customize/steps.tsx:286` | Hardcoded English `"⚠︎ please confirm"` in Arabic name-spelling assistant | Used `t("common.pleaseConfirm")` |
| CQ-04 | `src/components/Header.tsx:27` | `useEffect(() => setOpen(false), [pathname])` triggers `react-hooks/set-state-in-effect` lint error; also synchronous setState in effect can cause cascading renders | Removed effect; close menu via `onClick` on NavLinks |
| CQ-05 | `src/components/Header.tsx:43,86` | `aria-label="Primary"` and `aria-label="Mobile"` hardcoded English — screen readers always announce in English regardless of UI language | Replaced with `t("nav.primaryNav/mobileNav")` |
| CQ-06 | App-wide | No `ErrorBoundary` anywhere — any unhandled React render error produces a blank white page with no recovery path | Added `ErrorBoundary` class component; wraps full app |
| CQ-07 | `src/App.tsx` | Legal pages (Privacy/Terms/Refund) imported eagerly, defeating route-level code splitting | Converted to `lazy()` |
| CQ-08 | `src/lib/demoData.ts` | Order refs use `BCM-` prefix; `src/lib/id.ts` generates `LHZ-` refs — inconsistent brand ID | Renamed all refs to `LHZ-` |

### 3.2 Pre-launch blockers (not yet fixed — require business input)

| ID | File | Finding |
|----|------|---------|
| PL-01 | `src/lib/brand.ts` | `licenseNumber: "TODO-XXXXXX"` — displayed in footer; `sellerValueSet()` guard prevents checkout but not footer display |
| PL-02 | `src/lib/brand.ts` | `trn: "TODO-15-DIGIT-TRN"` — required for VAT-compliant invoices |
| PL-03 | `src/lib/brand.ts` | `phone: "+971 4 000 0000"` and `whatsapp: "971500000000"` — placeholder numbers |
| PL-04 | `src/lib/ai.ts` | `moderateImage()` fails open when `VITE_AI_ENDPOINT` is unset — every image passes content moderation in production |

### 3.3 Technical debt (future sprints)

| ID | Finding |
|----|---------|
| TD-01 | No test infrastructure — 0 unit tests, 0 integration tests, 0 e2e tests |
| TD-02 | `src/lib/orderMessage.ts` WhatsApp message strings hardcoded in English only |
| TD-03 | `react-router-dom` moderate security advisory (open redirect) — upstream, needs version upgrade evaluation |
| TD-04 | No skip-to-content `<a>` link in Layout (i18n key added, implementation pending) |

---

## 4. i18n Coverage

| Language | Keys | Missing keys (pre-fix) | Missing keys (post-fix) |
|----------|------|----------------------|------------------------|
| `en.ts` | ~515 | 7 (notFound, close, skipToContent, pleaseConfirm, primaryNav, mobileNav) | 0 |
| `ar.ts` | mirrors `en.ts` exactly via `Dict` type | same 7 | 0 |

**Structural enforcement:** `Dict = Widen<typeof en>` — `ar.ts` must satisfy `Dict` at compile time. Adding a key to `en.ts` without adding it to `ar.ts` produces a TypeScript error.

---

## 5. Performance Baseline

| Metric | Value |
|--------|-------|
| Main bundle (gzip) | 34.5 kB |
| Router chunk (gzip) | 53.4 kB |
| Largest route chunk (Customize) | 26.7 kB / 7.4 kB gz |
| Legal chunk | 1.0 kB / 0.5 kB gz |
| Build time | 4.95 s |
| Code splitting strategy | `React.lazy()` per route; manual Vite chunks for react/router |
| PWA | Service worker + manifest; Android prompt; iOS instructions |
| Image optimisation | No `<img>` lazy-loading attr; no modern format conversion in pipeline |
| Font loading | Google Fonts CDN (IBM Plex Sans Arabic); no `font-display: swap` override |

---

## 6. Security Summary

| Category | Status |
|----------|--------|
| npm audit — high | 0 (fixed: nanoid, postcss path traversal) |
| npm audit — moderate | 2 remaining (react-router open redirect — upstream) |
| Content Security Policy | Not set (SPA served by Vite preview/static host) |
| HTTPS enforcement | Depends on hosting — not configurable in-repo |
| WhatsApp order data | Sent in URL params — no server storage; privacy by design |
| AI content moderation | Fails open without `VITE_AI_ENDPOINT` (see PL-04) |
| Admin console | No authentication — demo-only; must gate before production |
| PDPL photo consent | Enforced in customise flow before upload |

---

## 7. Accessibility

| Item | Status |
|------|--------|
| Semantic HTML (nav, main, header, footer) | ✓ |
| `aria-label` on nav landmarks | ✓ (fixed, now i18n) |
| `role="img"` + `aria-label` on SVG previews | ✓ (now uses i18n surface names) |
| Keyboard navigation | ✓ (all interactive elements are focusable) |
| Skip-to-content link | i18n key added; `<a>` element not yet in Layout |
| Colour contrast (brand palette) | Not formally audited — visual assessment only |
| Screen reader testing | Not performed |

---

_This document was generated during the Phase 1 audit. Update after each sprint._
