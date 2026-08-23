# Maktab — مكتب

**Your MBA, on one desk.** A bilingual (English / Arabic) study platform for MBA
students that brings courses, an AI tutor, quizzes, flashcards, study packs,
grades, deadlines, and a weekly brief together in one place.

Built on **Next.js 14 (App Router) + Supabase (Postgres + RLS)** with a
pluggable AI provider (Anthropic / OpenAI / Ollama) and **Stripe** subscriptions.

## Features

- **AI tutor & Ask-MBA** — grounded Q&A and tutoring over course material (RAG).
- **Courses & lectures** — course pages, lecture view, and emailed lecture notes.
- **Active recall** — quizzes, flashcards, and generated study packs.
- **Planning** — calendar, tasks, deadlines, timeline, and a weekly brief.
- **Progress** — grades, achievements, and a personal dashboard.
- **Collaboration** — messages and a group-project space.
- **Accounts & billing** — email/Google auth, onboarding, Stripe Student/Pro
  subscriptions (monthly & annual), and self-serve account export/deletion.
- **Bilingual** — full English/Arabic UI with RTL support.
- **Admin** — users, stats, feedback, and announcements.
- **Browser extension** — a Chrome (Manifest V3) companion in `extension/`.

## Stack

- **Framework:** Next.js 14 (App Router, React Server Components) + TypeScript (strict)
- **Data & auth:** Supabase (Postgres, Row-Level Security, SSR auth helpers)
- **AI:** provider-abstracted via `AI_PROVIDER` (Anthropic / OpenAI / Ollama); RAG in `src/lib/rag`
- **Payments:** Stripe (Checkout, Billing Portal, webhooks)
- **Email:** Resend
- **UI:** Tailwind, framer-motion, lucide-react, recharts
- **Validation:** zod · **Tests:** Vitest

## Project structure

```
src/
  app/
    (public)/         marketing + legal (features, pricing, faq, privacy, terms, …)
    (auth)/           login, signup, reset-password
    (app)/            authenticated product (dashboard, tutor, courses, quizzes,
                      flashcards, grades, calendar, tasks, subscription, admin, …)
    api/              50+ route handlers (auth, courses, tutor, quizzes, files,
                      subscription, webhooks/stripe, account/export, account/delete, …)
  lib/
    ai/  llm/  rag/   AI provider, prompts, retrieval
    services/         orchestration, clarification, formatter, template, auth
    supabase/  stripe/  i18n/  db/   integrations & helpers
supabase/migrations/  0001_init.sql, 0002_feedback.sql, 0003_tweenz_schema.sql (schema + RLS)
extension/            Chrome MV3 extension
docs/                 API, DEPLOY, DESKTOP, MOBILE, audit + assessment reports
```

## Quick start

```bash
# 1. Install
npm install

# 2. Configure (never commit real values)
cp .env.example .env.local
#   Fill in the keys listed below.

# 3. Apply the database schema to your Supabase project
#   psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_init.sql
#   (then 0002_…, 0003_…) — or paste into the Supabase SQL editor.

# 4. Run
npm run dev        # http://localhost:3000
```

### Environment variables

Copy `.env.example` and fill in your own values (all secrets stay server-side):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only privileged DB access |
| `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` | AI provider selection & keys |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe |
| `STRIPE_*_PRICE_ID` | Student / Pro monthly & annual price IDs |
| `RESEND_API_KEY`, `EMAIL_FROM` | transactional email |
| `NEXT_PUBLIC_APP_URL` | canonical app URL |

## Scripts

```bash
npm run dev         # local dev server
npm run build       # production build
npm run start       # serve the production build
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run test        # vitest run
```

## Documentation

- [docs/API.md](docs/API.md) — API reference
- [docs/DEPLOY.md](docs/DEPLOY.md) — deployment
- [docs/PROJECT_AUDIT_BASELINE.md](docs/PROJECT_AUDIT_BASELINE.md) — production-readiness audit baseline

## Browser extension

Load `extension/` via `chrome://extensions` → Developer mode → **Load unpacked**,
then set the API base URL and key on the extension's Options page.

## Status

Pre-1.0. See [docs/PROJECT_AUDIT_BASELINE.md](docs/PROJECT_AUDIT_BASELINE.md) for
current release-readiness gaps (dependency upgrades and test coverage in progress).
