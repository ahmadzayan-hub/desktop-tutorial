# External Dependency Map — W3

Method: manifest + config inspection, no secret values read or printed.

| Project | Hosting | Data / backend | Auth | Payments | AI provider | Other |
|---|---|---|---|---|---|---|
| masaar | Vercel | Supabase (`beyond-style`, **INACTIVE**) | Supabase Auth + middleware | — | — | Google Sheets sink, WhatsApp webhook |
| mutabasir | Vercel | Supabase (optional; demo works without) | Supabase Auth | — | on-device WebLLM | — |
| Maktab | Vercel | Supabase | Supabase Auth | **Stripe** (`@stripe/stripe-js`) | AI client (`src/lib/ai`) | — |
| vertex | Vercel | Supabase (`borurrzvunlzdnxiossh` per `.mcp.json`) | Supabase Auth | — | mock provider default | nightly pg_dump backup workflow |
| 66 | Vercel | none (in-memory per run) | RBAC in-process | — | **Anthropic** via Model Gateway, optional | deterministic fallback |
| 33 RailMind | none yet | none (sample data) | — | — | none | proposes to **Maximo**, never writes |
| Pitchora | none yet | Supabase | Supabase Auth | Stripe | AI client | Capacitor mobile shell |
| lahza | Vercel | Supabase | — | — | — | — |
| Draftly | unverified | Supabase | Supabase Auth | — | — | browser extension + mobile shell |

## Supabase projects (3 total, account-wide)

| Project | Region | Status | Used by |
|---|---|---|---|
| `alkahtani-os` | us-east-1 | ACTIVE_HEALTHY | `22` (presumed) |
| `beyond-style` | ap-south-1 | **INACTIVE** | masaar — blocks migration `0006` |
| `agentic-os` | ap-south-1 | **INACTIVE** | agentic-os-enterprise |

**Blocker:** masaar's RBAC/RLS/state-machine migration (`0006`) cannot be
applied while `beyond-style` is paused. Restore was attempted and denied by
the environment's permission layer; this is an owner action.

## Secret handling

No `.env` files are committed in any inspected repo; `.env.example` only.
No secret values were read or printed at any point in this audit.
