# Mutabasir · Architecture

## Mission

Convert unstructured project documents (contracts, monthly reports, best-and-final offers, meeting minutes, invoices, technical notes) into board-grade bilingual executive dashboards in under 90 seconds, rendered in a privacy-safe, configurable design system.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 App Router · React 19 · TypeScript strict · Tailwind 4 |
| Backend | Supabase (Postgres 15, Auth, Storage, Edge Functions) |
| AI | Anthropic Claude Sonnet 4.6 (heavy) + Haiku 4.5 (fast) |
| PDF | Playwright headless Chromium on Vercel Edge |
| Hosting | Vercel Pro |
| Monitoring | Sentry · Vercel Analytics |

## Folder layout

```
src/
├── app/
│   ├── (auth)/sign-in, sign-up
│   ├── (app)/projects, new, settings
│   ├── _landing/  landing sections (hero, stats, features, FAQ, pricing, ...)
│   ├── _legal/    privacy + terms long-form content
│   ├── pricing, faq, privacy, terms  marketing pages
│   ├── api/health  monitoring endpoint
│   ├── opengraph-image.tsx  dynamic OG image
│   ├── robots.ts, sitemap.ts
│   └── layout.tsx, page.tsx, not-found.tsx, error.tsx
├── components/
│   ├── ui/         primitives + toast system
│   ├── motion/     fade, stagger, count-up, pulse-dot
│   ├── branding/   wordmark, locale toggle
│   ├── dashboard/  the 12 section components (Phase 3)
│   ├── editor/     click-to-edit (Phase 3)
│   └── brief/      brief form (Phase 3)
├── lib/
│   ├── supabase/   client + server wrappers (Phase 2)
│   ├── anthropic/  API wrapper (Phase 2)
│   ├── prompts/    the 5 prompt layers (Phase 2-4)
│   ├── themes/     8 generic presets (Civic, Petrol, Sand, Rail,
│   │               Utility, Guardian, Slate, Custom)
│   ├── i18n/       native bilingual (en + ar) dictionary + provider
│   ├── store/      mock store (Phase 1 only)
│   └── utils/      cn, dates, format
└── types/          database, facts, sections, themes

supabase/
├── migrations/     0001_initial_schema.sql (six tables + RLS)
└── storage/        bucket setup
```

## Database

Six tables, all RLS-enabled:

- **profiles** — 1:1 with `auth.users`
- **projects** — owner-scoped containers (`subject`, `theme`, parties, dates)
- **documents** — source files in Storage, classified per ingestion
- **extracted_facts** — structured facts with `citation_page`, `citation_quote`, `confidence`, `user_verified`
- **briefs** — user one-paragraph briefs feeding composition
- **snapshots** — versioned composed dashboards with quality-gate results

Storage buckets:
- `project-documents` — 100 MB cap, PDF/DOCX/XLSX only
- `dashboard-pdfs` — generated A4 PDFs

## The 5 prompt layers

| Layer | Purpose |
|---|---|
| 1 · Project Brain | Database tables (this doc) |
| 2 · Ingestion | Six prompts: contract, MPR, BAFO, MoM, invoice, technical note |
| 3 · Composition | Brief → 8-12 sections from the library with reasons |
| 4 · Quality Gate | 11-point director review, blocks publish |
| 5 · Voice | PDF · WhatsApp · Formal Arabic letter |

Production prompts live in `src/lib/prompts/`. See `docs/PROMPTS.md`.

## The 12 dashboard sections

| ID | Section | Purpose |
|---|---|---|
| S01 | Header | Always first |
| S02 | Status Ribbon | RAG headline |
| S03 | KPI Performance | Traffic-light scores |
| S04 | Money Picture | Value · Spent · Remaining |
| S05 | Mobilisation | Resource progress |
| S06 | Project/Bidder List | Up to 10 entries |
| S07 | RAG Summary | Working · Watching · Acting |
| S08 | Risk Heat Map | 5×5 |
| S09 | Risk Register | List |
| S10 | Milestones | With countdowns |
| S11 | Decision Log | Tabled-By + Next-Step tags |
| S12 | Footer | Always last |

## Rules that never bend

R1 traffic-light only · R2 never invent data · R3 bilingual default · R4 RLS everywhere · R5 no secrets in git · R6 quality gate blocks publish · R7 citation traceability is a UI feature · R8 fail loudly on low confidence · R9 fixed font stack · R10 production quality.

## Phase status

- ✅ **Phase 1** Foundation — auth shells, project CRUD, themes, migration SQL, marketing pages (Pricing/FAQ/Privacy/Terms), motion layer, bilingual native UAE Arabic, responsive design, toast system, search/filter
- ⏳ **Phase 2** Document ingestion — uploader, classifier, six extractors
- ⏳ **Phase 3** Composition — brief + 12 section components + layout engine
- ⏳ **Phase 4** Quality gate + exports — Playwright PDF, WhatsApp, Arabic letter
- ⏳ **Phase 5** Tender evaluation + polish
