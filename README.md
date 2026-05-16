# Pitchora

> *Previously: PresentIQ*

**From a spark to a boardroom-ready deck, in minutes — with corporate
standards enforced automatically.**

Pitchora is the **idea-to-deck studio**: an AI agent platform that closes the
gap between a half-formed idea and a polished, brand-governed, evidence-
controlled, bilingual deck. It is not an LLM prompt wrapper — it is a
multi-agent workflow that combines:

1. Corporate brand governance
2. Evidence-controlled content generation
3. Editable PPTX rendering
4. Arabic-English bilingual + RTL capability
5. Boardroom storytelling
6. 10-dimension corporate quality scoring
7. Secure enterprise file handling
8. Human review and approval workflow
9. Fast per-slide regeneration
10. Export to PPTX and PDF

> **Mission:** behave like an AI-powered corporate presentation office.

## Why "Pitchora"

**Pitch + Aurora.** The act of pitching ideas + the luminous transformation
from spark to polished narrative. The single word names exactly the problem
the platform solves.

## Documentation

The 14 design documents live in [`docs/presentiq/`](./docs/presentiq/README.md):

1. [Product Requirements](./docs/presentiq/01-PRD.md)
2. [System Architecture](./docs/presentiq/02-ARCHITECTURE.md)
3. [Agent Workflow](./docs/presentiq/03-AGENT-WORKFLOW.md)
4. [Database Schema](./docs/presentiq/04-DATABASE.md)
5. [API Specification](./docs/presentiq/05-API.md)
6. [UI / Wireframes](./docs/presentiq/06-UI.md)
7. [Brand Governance Engine](./docs/presentiq/07-BRAND-GOVERNANCE.md)
8. [Evidence Engine](./docs/presentiq/08-EVIDENCE-ENGINE.md)
9. [Arabic RTL Engine](./docs/presentiq/09-ARABIC-RTL.md)
10. [PPTX Rendering Strategy](./docs/presentiq/10-PPTX-RENDERING.md)
11. [Security Architecture](./docs/presentiq/11-SECURITY.md)
12. [Billing Architecture](./docs/presentiq/12-BILLING.md)
13. [MVP Implementation Plan](./docs/presentiq/13-MVP-PLAN.md)
14. [Testing Plan](./docs/presentiq/14-TESTING.md)

## Stack

- **Frontend:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · Framer Motion · custom Pitchora motion primitives
- **API:** Next.js Route Handlers · Zod validation · Supabase Auth
- **DB:** Postgres (Supabase) + pgvector + Row-Level Security
- **AI:** Pluggable model providers (Anthropic, Mock) · 17-agent orchestrator · prompt registry · canonical-input cache
- **PPTX:** `pptxgenjs` · master slides · theme tokens · RTL paragraphs · charts/tables/diagrams · template intelligence
- **Billing:** Stripe Checkout + Customer Portal + signed Webhooks
- **Storage:** Supabase Storage (per-tenant prefixes) · short-lived signed URLs

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Apply database migration
psql "$SUPABASE_DB_URL" -f supabase/migrations/0010_presentiq_init.sql

# 4. Run dev server
npm run dev
# open http://localhost:3000/presentiq
```

> The product mounts at `/presentiq` for URL compatibility with v0.1–v0.4.
> Deep-links and shared URLs from earlier releases continue to work.

If `ANTHROPIC_API_KEY` is not set, the orchestrator falls back to a deterministic
mock provider so the full pipeline runs end-to-end without any API key.

## Project Layout

```
src/
  lib/presentiq/        engine: types, brand, evidence, RTL, security, quality,
                        AI orchestrator, prompts, PPTX renderer, template
                        intelligence, storage, Stripe, auth
  app/presentiq/        UI: landing, dashboard, wizard, editor, brand kits,
                        admin, billing
  app/api/presentiq/    REST: organisations, brand kits, projects, files,
                        blueprint, slides, regenerate, quality, exports,
                        comments, audit, billing webhook
  components/presentiq/ UI primitives + QualityPanel + motion primitives
                        (Reveal, Magnetic, Tilt, ParallaxMesh, AuroraWord)
docs/presentiq/         the 14 design documents
supabase/migrations/    0010_presentiq_init.sql (full DDL + RLS + seed)
```

## License

Proprietary. All rights reserved.
