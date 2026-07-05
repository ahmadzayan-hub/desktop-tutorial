# Beyond Style UAE — monorepo

Two independent projects for **Beyond Style UAE** (BEYOND CONNECT GENERAL
TRADING L.L.C, Dubai). Each project lives in its own named directory,
has its own `package.json`, its own `vercel.json`, its own `README.md`,
and deploys to its own Vercel project. **Neither project imports code
from the other.**

| Directory | Role | Stack | Deploy target |
|-----------|------|-------|---------------|
| [`beyond-style-console/`](./beyond-style-console/README.md) | Owner-facing sales operating console — draft replies, guardrails, approvals, orders, reports | Next.js 14 (App Router) + Supabase + configurable AI provider | Vercel (Next.js) |
| [`beyond-style-storefront/`](./beyond-style-storefront/README.md) | Customer-facing storefront — Home, product, cart, checkout, thank-you, admin | Vite + React 19 + Hono API + Drizzle + Stripe | Vercel (Vite SPA) |

## Working in this monorepo

Each project is fully self-contained. Run everything from inside the
project's directory:

```bash
# Console (owner control tower)
cd beyond-style-console && npm install && npm run dev   # → http://localhost:3000

# Storefront (customer site)
cd beyond-style-storefront && npm install && npm run dev # → http://localhost:5173
```

## Deployment

Each project needs its own Vercel project pointing at its own
directory as **Root Directory**:

| Vercel project | Root Directory | Framework |
|----------------|----------------|-----------|
| console | `beyond-style-console` | Next.js |
| storefront | `beyond-style-storefront` | Vite |

The repo root has a passthrough `vercel.json` (`ignoreCommand: exit 0`)
so any Vercel project still pointing at the repo root **stops silently
instead of failing** after this restructure — until Root Directory is
updated in that project's Vercel UI.

Environment variables live per-project (Vercel UI → Settings → Env):

- **Console**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `AI_PROVIDER`
  (`openai` \| `anthropic` \| `gemini` \| `mock`) + the matching provider key,
  and `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` if
  NotebookLM integration is enabled.
- **Storefront**: `DATABASE_URL`, Stripe keys (`STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`), Cloudinary keys if used — see
  [`beyond-style-storefront/OVERVIEW.md`](./beyond-style-storefront/OVERVIEW.md).

## Why a monorepo

The owner console and the customer storefront ship under the same brand
and share the same product catalogue but they have different runtimes
(Next.js vs Vite), different auth models (Supabase Auth vs
public/session), and different release cadences. Keeping them in one
repo lets us coordinate schema and pricing changes; scoping deploys per
directory keeps CI clean.

## Adding a new project

1. Create a top-level directory named after the project.
2. Add its own `package.json`, `README.md`, and `vercel.json`.
3. In Vercel UI: create a new project pointing at this repo with Root
   Directory set to the new subdirectory.
4. Register the project in the table at the top of this README.
