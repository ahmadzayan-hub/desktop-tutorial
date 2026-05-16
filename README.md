# Mutabasir

**Government Executive Intelligence Platform**

Converts unstructured project documents into board-grade bilingual executive dashboards in under 90 seconds. Built for UAE government PMO offices.

## Stack

- Next.js 15 (App Router, RSC) · TypeScript strict
- Tailwind CSS 4 · Dubai Font · IBM Plex Sans Arabic · JetBrains Mono
- Supabase (Postgres + Auth + Storage + Edge Functions)
- Anthropic Claude (Sonnet 4.6 + Haiku 4.5)
- Playwright for A4 PDF rendering
- Vercel hosting

## Subjects (v1)

- Contract Management
- Tender Evaluation

## Development

```bash
npm install
cp .env.example .env.local   # fill in real keys
npm run dev
```

Visit http://localhost:3000.

## Status

Phase 1 · Foundation. Auth UI and project CRUD wired to an in-memory mock store. Supabase migration SQL is ready in `supabase/migrations/0001_initial_schema.sql` to be applied once keys are provisioned.

See `docs/ARCHITECTURE.md` for the full system design.

---

Built by Eng. Ahmed Zaian · Beyond Connect General Trading L.L.C · Dubai
