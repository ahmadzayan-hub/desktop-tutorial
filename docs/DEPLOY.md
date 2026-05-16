# Mutabasir · Deploy

## Prerequisites

- Node 22+, npm 10+
- A Supabase project (free tier is fine for early development)
- An Anthropic API key with at least $20 of credits
- A Vercel account (Pro recommended for Edge Function memory)
- A domain on Cloudflare (e.g. `mutabasir.ae`, Proxy off)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real keys
npm run dev
```

Visit http://localhost:3000.

## Supabase wiring (Phase 2 unlock)

```bash
# from project root with supabase CLI installed
supabase link --project-ref <YOUR_REF>
supabase db push   # applies supabase/migrations/0001_initial_schema.sql
# Then in the Supabase SQL editor, run supabase/storage/buckets.sql
```

Verify in Supabase Studio:
- All six tables exist
- RLS is enabled on all six (the toggle is on)
- `project-documents` and `dashboard-pdfs` buckets exist

## Environment variables (production)

In Vercel project settings, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `ANTHROPIC_API_KEY` (server-only)
- `ANTHROPIC_MODEL_HEAVY=claude-sonnet-4-6`
- `ANTHROPIC_MODEL_FAST=claude-haiku-4-5-20251001`
- `NEXT_PUBLIC_APP_URL=https://mutabasir.ae`

Never commit `.env.local` (rule R5).

## DNS

Cloudflare DNS record:
- `mutabasir.ae` → CNAME → `cname.vercel-dns.com` (Proxy OFF — Vercel handles TLS)

## Verification checklist before going live

- [ ] All RLS policies tested with two distinct test users
- [ ] Anthropic key has spend cap configured
- [ ] Sentry DSN connected
- [ ] First test project ingested 16 SENER PDFs successfully
- [ ] Quality gate blocks publish when one gate fails
- [ ] PDF export renders identically to v8 SENER reference
