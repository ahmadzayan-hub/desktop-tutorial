# Mutabasir

**The Director's Lens · Executive Intelligence Platform**

> From paperwork to board insight in 90 seconds.

Mutabasir converts unstructured project documents into board-grade bilingual executive dashboards. Powered by **Basira**, our extraction engine, every figure is traced to its source and every dashboard passes 11 director-grade quality gates before publishing.

## Stack

- Next.js 15 (App Router, RSC) · React 19 · TypeScript strict
- Tailwind CSS 4 · Dubai Font · IBM Plex Sans Arabic · JetBrains Mono
- Motion v12 (Framer Motion successor) for the interactive layer
- Supabase (Postgres + Auth + Storage + Edge Functions)
- Anthropic Claude Sonnet 4.6 + Haiku 4.5
- Playwright for A4 PDF rendering
- Vercel hosting

## Subjects (v1)

- Contract Management
- Tender Evaluation

## Themes (8 generic presets)

Civic · Petrol · Sand · Rail · Utility · Guardian · Slate · Custom. Every theme shares one strict traffic-light status palette (green / amber / red).

## Development

```bash
npm install
cp .env.example .env.local   # fill in real keys
npm run dev
```

Visit http://localhost:3000.

## Scripts

```bash
npm run dev         # Next.js dev server
npm run build       # Production build
npm run start       # Run production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest run (smoke + dictionary parity)
```

## Status

**Phase 1 · Foundation** is complete. Auth shells, project CRUD against an in-memory store, eight-theme system, motion layer, bilingual native UAE Arabic UI, search + filter on projects, toast notifications, marketing pages (Pricing, FAQ, Privacy, Terms), 404 + error boundaries, dynamic sitemap and OG image, health endpoint. The Supabase migration SQL is ready at `supabase/migrations/0001_initial_schema.sql` to be applied once keys are provisioned.

See `docs/ARCHITECTURE.md` for the full system design.

---

Built by Beyond Connect General Trading L.L.C · Dubai
