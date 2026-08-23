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

---

# Correction — Netlify was missed entirely

**Added 2026-08-23, after this map was written.** This document, and
DEPLOYMENT_MAP.md alongside it, mapped **only Vercel**. A second hosting
provider is attached to the portfolio and neither file mentioned it.

Found by accident: the check runs on `desktop-tutorial` PR #107 included
`Header rules`, `Redirect rules` and `Pages changed` from **two Netlify
sites**.

| Repo | Netlify | Config in repo? |
|---|---|---|
| `desktop-tutorial` | **two sites** — `gentle-sundae-3bd078`, `symphonious-madeleine-83e0ae` | **No.** Configured entirely in the Netlify dashboard. |
| `lahza` | `netlify.toml` present — Vite build, SPA fallback, asset cache headers | Yes |

## Why this matters more than the count suggests

Two conclusions in this audit were reached without knowing Netlify existed,
and both are now weaker than they read:

1. **DEPLOYMENT_COLLISION_AUDIT.md** recommends deleting 13 Vercel projects
   and verified that none holds a custom domain. That verification covered
   Vercel only. It says nothing about whether a Netlify site is serving a
   domain for the same repository.
2. **`desktop-tutorial` is classified as a migration archive** — a candidate
   for eventual retirement. Retiring it would silently break **two Netlify
   sites whose configuration exists nowhere in the repository**. There is no
   `netlify.toml` to inspect: build command, publish directory, environment
   and any custom domain live only in the Netlify dashboard, so nothing in
   git would warn anyone.

`lahza` is the safer case — its `netlify.toml` is committed, so the
configuration is at least legible. But it means `lahza` may be deployed
twice, on Vercel *and* Netlify, from the same branch. Which one answers on a
real domain is unknown from here.

## Not resolved

No Netlify credentials are available to this session, so site status, custom
domains and deploy state could not be read. **Owner action:** open the
Netlify dashboard, and for each of the three sites record what it serves and
on which domain. Until that exists, the deletion recommendations in
DEPLOYMENT_COLLISION_AUDIT.md should be treated as verified for Vercel and
unverified overall.
