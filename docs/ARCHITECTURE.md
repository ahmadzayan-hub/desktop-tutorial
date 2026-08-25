# Architecture — Maktab

A bilingual (EN/AR) MBA study & AI-tutor SaaS. Next.js 14 App Router (React
Server Components) on Supabase (Postgres + RLS), with a pluggable AI provider and
Stripe subscriptions.

## Layers

```
Browser / Chrome extension
        │  (HTTPS; auth session cookie)
        ▼
Next.js App Router
  src/app/(public)   marketing + legal (no auth)
  src/app/(auth)     login / signup / reset
  src/app/(app)      authenticated product (RSC pages)
  src/app/api/*      ~50 route handlers (the trust boundary)
  src/middleware.ts  session handling
        │
        ▼
src/lib  (server logic)
  env.ts             env parsing + isSupabaseConfigured()
  api-helpers.ts     safeRoute() wrapper + handleError() (uniform errors)
  db/, supabase/     server & service Supabase clients (cookie-based auth)
  services/          orchestration, clarification, formatter, template, auth
  ai/, llm/, rag/    AI provider (client.ts), prompts, retrieval/grounding
  stripe/            Stripe client + plan config
  i18n/              EN/AR dictionaries
        │
        ▼
External: Supabase (Postgres+RLS, Storage, Auth) · AI provider (Anthropic/OpenAI/Ollama)
          · Stripe · Resend
```

## Key patterns

- **`safeRoute()` wrapper** (`src/lib/api-helpers.ts`): every route can be wrapped
  so a missing-backend or thrown error degrades to a graceful `200 { unavailable }`
  or a **generic 500** — internal error text is never returned to clients.
- **Two Supabase clients:** a cookie-scoped **server client** (RLS-enforced, acts
  as the signed-in user) and a **service-role client** (privileged, server-only,
  used by the Stripe webhook and trusted jobs).
- **Authorization in depth:** routes call `requireUser()` (401 when unauthenticated)
  **and** scope queries by `user_id` / check object ownership; Postgres **RLS**
  (62 policy statements across the migrations) is the backstop.
- **Input validation:** `zod` schemas in 12 API route files.
- **AI provider abstraction** (`src/lib/ai/client.ts`, `src/lib/llm`): provider
  chosen via `AI_PROVIDER`; keys are read server-side only.

## Data flow (authenticated request)

1. RSC page or client calls `/api/*`.
2. `middleware.ts` maintains the Supabase auth session (cookies).
3. The handler runs `requireUser()`; unauthorized → 401.
4. Reads/writes go through the RLS-scoped server client, filtered by `user_id`.
5. Errors flow through `handleError()` → uniform, non-leaking responses.

## Trust boundaries

| Boundary | Control |
| --- | --- |
| Browser → API | auth session cookie, `requireUser()`, RLS, zod |
| API → Postgres | RLS policies + explicit `user_id` scoping |
| Stripe → webhook | signature verification (`constructEvent`) before any DB write |
| App → AI provider | server-side keys; provider isolated in `lib/ai`/`lib/llm` |
| Service-role key | server-only; never shipped to the client bundle |

## Deployment

Next.js on Vercel (implied by `NEXT_PUBLIC_APP_URL`/`VERCEL_URL` handling and
security headers in `next.config.mjs`). Supabase hosts Postgres/Auth/Storage.
See `docs/DEPLOY.md`.

## Known architectural gaps

- **No rate limiting / abuse protection** on API routes or AI endpoints (see the security assessment).
- **No CSP** among the 5 configured security headers.
- On **Next 14** (see `docs/NEXT_16_MIGRATION_PLAN.md`); the async-request-API
  migration is scheduled.
