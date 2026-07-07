# VERTEX changelog

Notable changes to the VERTEX platform. Semantic versioning
(major.minor.patch) once we cut a 1.0.0 tag.

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
