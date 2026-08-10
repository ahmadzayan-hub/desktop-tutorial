# Changelog — مسار (Masaar)

All notable changes to this project are documented here.  
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [Unreleased] — improvement/production-uiux-performance

### Security
- Added sliding-window rate limiter to `POST /api/analyze` — 30 req/min/IP; returns 429 with `Retry-After` and `X-RateLimit-*` headers (resolves H-03)
- Added structured request logging to `/api/analyze` — latency, provider, guardrail worst_status per call
- Added Content Security Policy header (CSP) to all routes via `next.config.mjs`
- Added `Strict-Transport-Security` (HSTS) header — max-age 2 years, includeSubDomains, preload
- Changed `X-Frame-Options` from `SAMEORIGIN` to `DENY` (operator console should never be embedded)
- Added `X-DNS-Prefetch-Control`, extended `Permissions-Policy` to include `payment=()`
- Added `src/middleware.ts` — session-based route protection; all non-public routes redirect to `/login` when Supabase is configured; demo mode bypasses auth transparently

### Dependencies
- Upgraded Next.js `14.2.15` → `14.2.35` (latest patch in 14.x — reduces vulnerability count)
- Upgraded Vitest `2.1.2` → `3.2.7` (latest stable v3 — resolves esbuild dev-server vulnerability)
- Reduced npm vulnerabilities from 13 (2 critical, 8 high) to 5 (0 critical, 5 high)

### Quality
- Added `.eslintrc.json` — ESLint configured with `next/core-web-vitals`; `npm run lint` now runs non-interactively with 0 errors
- Added `compress: true` to `next.config.mjs` — enables Gzip/Brotli on all responses
- Added image optimization config — avif + webp formats, 60s minimum cache TTL

### Documentation (all new)
- `docs/PROJECT_AUDIT_BASELINE.md` — full audit: findings, severity, scores, reproduction steps
- `docs/ARCHITECTURE.md` — folder structure, data flow, route table, design decisions
- `docs/PRODUCT_REQUIREMENTS_AND_USER_JOURNEYS.md` — roles, journeys, FR matrix
- `docs/UX_UI_DESIGN_SYSTEM.md` — color tokens, typography, components, RTL rules, PWA config
- `docs/AI_SYSTEM_AND_PROMPT_ARCHITECTURE.md` — provider abstraction, pipeline, schema, governance
- `docs/AI_EVALUATION_PLAN.md` — evaluation dimensions, test cases, thresholds, schedule
- `docs/SECURITY_AND_RESPONSIBLE_AI_ASSESSMENT.md` — OWASP coverage, responsible AI controls
- `docs/PERFORMANCE_REPORT.md` — bundle analysis, Core Web Vitals targets, optimisation log
- `docs/REQUIREMENTS_TRACEABILITY_MATRIX.md` — §refs → code → tests → verification
- `docs/TEST_STRATEGY.md` — current coverage, gaps, recommended additions
- `docs/DEPLOYMENT_AND_ROLLBACK.md` — Vercel setup, env vars, rollback procedures
- `docs/RELEASE_READINESS_REPORT.md` — gate-by-gate assessment, verdict: Conditionally release-ready
- `CHANGELOG.md` — this file

### Fixed
- `README.md` quick-start corrected — removed `cd beyond-style-uae` (app is now at repo root)

---

## Previous Notable Milestones (from git history)

### Arabic Localisation (full bilingual rollout)
- All UI text converted to Arabic (primary) across all 18 pages
- Guardrail engine labels, analytics titles, and attention queue items Arabized
- `AnalysisPanel.tsx` fully Arabized (was entirely English)
- `login/page.tsx` fully Arabized
- `growth.ts` — removed 🤍 emoji from all 8 `RESOLUTION_TEMPLATES`; Arabized velocity and delivery window labels
- `analytics.ts` — Arabic conversion funnel stage names and attention queue items
- `data.ts` — Arabic `formatRelative()` time strings (الآن / منذ Xد/س/ي)

### NotebookLM OAuth Integration
- Full Google OAuth 2.0 authorization-code flow
- AES-256-GCM token encryption in httpOnly cookies (no DB required)
- CSRF protection via state cookie
- Pure helper functions, fully unit-tested (11 tests)

### PWA / Mobile
- `public/manifest.json` — Arabic app name "مسار", amber theme
- `public/sw.js` — network-first service worker, skips /api/
- `src/components/PwaInstall.tsx` — Arabic install prompt banner
- SEO metadata, Open Graph, Twitter card in root layout

### AI Pipeline
- Configurable provider wrapper (openai / anthropic / gemini / groq / together / mock)
- Zod-validated analysis output schema
- Guardrail engine: 10 checks, pure functions, 20 unit tests
- `/api/analyze` POST endpoint
- Mock provider for demo/CI without API key

### Core Dashboard
- KPIs: leads, hot leads, paid orders, disputes, revenue (7/30/today)
- Attention queue (`buildAttentionQueue`) — prioritised action items
- Conversion funnel chart (Recharts, lazy-loaded)
- Revenue trend by day chart
- Platform mix and emirate mix charts

### Record Pages (read-only)
- `/customers`, `/orders`, `/payments`, `/inventory`, `/offers`, `/couriers`, `/suppliers`, `/reviews`, `/audit`
- All backed by Supabase queries with demo fallback
- Kanban view on `/orders`
- Velocity cards on `/inventory`

### Guardrail Engine
- 9 guardrail checks (claim, privacy, price, stock, delivery, payment, VAT, Arabic name, length)
- Human approval matrix
- QC checklist
- Fraud signal screening
- `isOrderLocked()` — disputes block dispatch
- All pure functions, all unit-tested (20/20 scenarios passing)
