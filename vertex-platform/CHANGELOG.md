# VERTEX changelog

Notable changes to the VERTEX platform. Semantic versioning
(major.minor.patch) once we cut a 1.0.0 tag.

## 0.6.0 - Testing suite - vitest + Playwright

- Vitest is wired with jsdom, coverage via v8, and a light setup file
  that shims `window.matchMedia`.
- 30 unit tests across four suites cover the pure logic:
  `formatters` (currency, date, percent, relative, email and password
  validation), `mock-analyzer` (determinism, output shape), `storage`
  (MIME + size validation, byte formatting, path sanitisation),
  `dashboard-stats` (traffic-light thresholds).
- Playwright is wired against a pre-installed Chromium via
  `PLAYWRIGHT_CHROMIUM_PATH` in local dev, or `npx playwright install
  --with-deps chromium` in CI.
- 15 e2e tests cover: landing page rendering + language toggle to RTL,
  auth gates + form validation for email + password policy, and the
  eight public discoverability files each returning 200 with the right
  content type.
- npm scripts added: `test`, `test:watch`, `test:coverage`, `e2e`,
  `e2e:install`.
- GitHub Actions workflow split into two jobs: `quality` (typecheck,
  lint, unit tests, build, dist artefact) and `e2e` (installs
  Playwright + Chromium, runs the browser suite, uploads the HTML
  report on failure).
- `.gitignore` adds coverage, playwright-report, test-results.

## 0.5.0 - Session 6 - analytics + PDF reports

- `/analytics` - portfolio wide view. Four summary cards (portfolio
  compliance, findings 30d, open obligations, active insurance),
  compliance by project bar chart (top 12), findings by type donut,
  findings by severity bar chart, findings per week line chart (12
  weeks).
- `/reports` - generate PDF for a submission or a project. jsPDF +
  jspdf-autotable. Every generation writes an audit_log entry.
  - Submission report: header stripe with the VERTEX mark, submission
    meta table, findings table grouped by severity with clause refs
    and evidence quotes.
  - Project report: header stripe, contract meta, submissions table,
    obligations table, KPI penalties table, insurance table.
- `useAnalytics` hook rolls up submissions, ai_findings, obligations,
  insurance in a single pass (five parallel Supabase queries).
- vite manualChunks isolates jspdf into its own chunk so it only
  streams on `/reports`.
- Sidebar shows Analytics and Reports; command palette lists both.

## 0.4.0 - Session 5 - KPI, obligations, insurance

Three new pages that turn VERTEX from a submission review app into an
operational contract control tower.

- `/kpi` - KPI tracker. Filter by project and window (3, 6, 12 months),
  summary cards (this month, window total, open for approval, contract
  KPI cap), penalty trend bar chart, full penalty table with per-row
  admin approval and audit entries on approve or revoke.
- `/obligations` - obligations grouped into four buckets (overdue,
  at risk, on track, complete). Filter by project and type
  (deliverable, payment, renewal, approval, compliance). Each row shows
  description, project, type, due date, days remaining, critical path
  chip, and the associated KPI leverage.
- `/insurance` - insurance renewals grouped by bucket (expired,
  expiring within 30 days, active, renewed). Upload evidence in place;
  the file lands in the `submissions` bucket at
  `<project_id>/insurance/<policy_id>/<file>`, `renewal_evidence_url`
  is patched, `renewal_status` becomes `renewed`, and an audit entry
  is written.
- Hooks: `useKpiTracking`, `useObligations`, `useInsurance` (with
  `uploadEvidence`).
- Types: `KpiRecord`, `Obligation`, `InsurancePolicy`, plus enums
  `ObligationType`, `ObligationStatus`, `RenewalStatus`.
- Locales: `kpiPage`, `obligationsPage`, `insurancePage` sections
  added in EN and AR with formal Arabic register.
- Sidebar shows the three new destinations. Command palette lists them
  in the static route hits.
- Every new page is `React.lazy`. Bundle sizes on load:
  KpiTracker 2.8 KB gzip, Obligations 1.9 KB gzip, InsuranceRenewals
  2.2 KB gzip.

## 0.3.0 - Hardening

Performance, resilience, and operations.

- Code splitting: every authenticated route is `React.lazy`. Initial JS
  bundle drops from a single 924 KB blob to a landing shell plus
  vendored chunks (React, router, i18n, Supabase, charts) that stream in
  on demand.
- Manual chunks in `vite.config.ts` isolate the biggest deps so the
  landing page ships around 100 KB gzipped.
- Realtime: `useSubmission` subscribes to Supabase `postgres_changes`
  for submissions, ai_findings, and comments filtered to the current
  submission id. The tab updates without a refresh when analysis
  completes, a comment lands, or another reviewer approves.
- Global command palette (`Cmd K` / `Ctrl K`): fuzzy search across
  routes, projects (by name and contract ref), and submissions (by
  document name). Debounced Supabase queries; keyboard nav.
- Skeleton loaders replace the spinner on the Dashboard so the shape of
  the page appears immediately.
- Root `ErrorBoundary` wraps the whole app so a single component throw
  does not blank the screen; users see a friendly recovery card.
- Security headers on Vercel: HSTS, X-Content-Type-Options, X-Frame,
  Referrer-Policy, Permissions-Policy, cross origin isolation, and a
  strict CSP (`connect-src` limited to Supabase, Anthropic and OpenAI).
- Long lived cache headers on hashed assets; short revalidation on the
  service worker and manifest.
- SPA rewrites in `vercel.json` so the router owns navigation and the
  Service Worker is served with `Service-Worker-Allowed: /`.
- Docs: `docs/SECURITY.md` (data classification, CSP notes, key
  handling) and `docs/DEPLOY.md` (environments, migrations, Edge
  Function deploy, rollback, incident response).
- CI: `.github/workflows/vertex-ci.yml` runs typecheck, lint, build, and
  `npm audit` on every PR touching `vertex-platform/**`.

## 0.2.0 - Productization

Brand, landing page, PWA, SEO, and Arabic language pass.

- New Logo component and SVG icon set for the browser tab, PWA install,
  iOS home screen, and social share cards.
- Public Landing page at `/` with hero, six-feature grid, three-step
  "how it works", and install CTA. Fully bilingual.
- PWA: `manifest.webmanifest`, `service-worker.js`, `useInstallPrompt`
  hook. Installable on Android from the browser.
- SEO: title, description, canonical, hreflang, Open Graph, Twitter
  card, JSON-LD graph for `SoftwareApplication`, `Organization`, and
  `WebSite`.
- AIO: `robots.txt`, `sitemap.xml` with hreflang alternates, and
  `llms.txt` briefing.
- Every locale string reviewed and rewritten. Every em-dash and
  ellipsis removed from the codebase. Arabic register is formal.

## 0.1.0 - Session 2 - dashboard, upload, AI

- Dashboard with traffic-light stat cards, compliance trend line,
  submissions donut, activity feed, and alerts panel.
- Upload wizard: project, type, file, confirm. Uploads to the private
  `submissions` bucket.
- AI analysis service abstracted over mock, Anthropic, OpenAI, and a
  Supabase Edge Function. Provider keys stay in Supabase secrets.
- Submission Detail with tabs for Findings, Preview, Comments, and
  History; approval workflow with audit log.

## 0.0.1 - Session 1 - foundation

- Vite + React + TypeScript + Tailwind mobile first scaffold.
- Supabase migration `0001_vertex_init.sql`: 10 tables, 36 RLS policies,
  helper functions.
- Email and Password auth with Supabase.
- Bilingual `en` and `ar` with `i18next`, right to left via CSS logical
  properties.
- Protected routes, header, sidebar, footer, skip link.
