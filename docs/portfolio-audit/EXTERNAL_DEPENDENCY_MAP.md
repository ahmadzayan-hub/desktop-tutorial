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

## The full sweep — what a proper search found

Netlify was found by accident. That prompted a deliberate sweep for every
hosting and CI config across the portfolio, which is what should have been
done first. It found two more things.

### `annual-operation-plan-2026` is configured for three hosts at once

| Target | Config |
|---|---|
| Netlify | `netlify.toml` |
| Vercel | `vercel.json` |
| GitHub Pages | `.github/workflows/pages.yml` |

This audit recorded it as "GitHub Pages, disabled" and nothing else.

All three serve the same static plan documents, and **all three separately
pin which version is current**: a Netlify redirect, a Vercel rewrite, and a
Pages workflow, each naming `Annual_Operational_Plan_2026_V0_6.html`.

The `netlify.toml` comment says of its redirect: *"Update this on a new
version — one line, one place."* True inside that file. False across the
repository: publishing V0.7 means editing three files in two formats, and
missing one leaves a host quietly serving the old plan with no error
anywhere.

### `wisal` has three deployable surfaces, not one

`wisal-cloud-api/vercel.json`, `wisal-direct-relay/vercel.json` and
`wisal-web/vercel.json`. The deployment map lists a single `wisal` Vercel
project. Whether the other two are wired to anything is unknown from here.

### Everything else is clean

`masaar`, `Maktab`, `mutabasir`, `vertex`, `66`, `33`, `promptops`,
`Pitchora-studio-Private`, `desktop-tutorial` carry `vercel.json` only.
`draftly-Private`, `data-value-studio`, `exeflow` and `beyond-style-ops` carry
no hosting config at all. No Docker, Fly, Render, Railway, Cloudflare,
Firebase, Amplify, CircleCI, GitLab CI or Azure Pipelines config exists
anywhere in the portfolio.

## Not resolved

No Netlify credentials are available to this session, so site status, custom
domains and deploy state could not be read. **Owner action:** open the
Netlify dashboard, and for each of the three sites record what it serves and
on which domain. Until that exists, the deletion recommendations in
DEPLOYMENT_COLLISION_AUDIT.md should be treated as verified for Vercel and
unverified overall.
