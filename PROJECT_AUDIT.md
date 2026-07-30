# Project Audit · Beyond Style UAE Order Control Console

Single-cycle transformation audit. Findings triaged P0 through P3, then the
subset fixed in this cycle is marked [FIXED]. Everything not marked FIXED is
carried forward to the next cycle with a concrete recommendation.

## What this product is (reconstructed from the repo)

An owner-approved sales operating console for a UAE social-commerce trading
business (BEYOND CONNECT GENERAL TRADING L.L.C dba Beyond Style UAE). The
value proposition is discipline before automation: an AI agent drafts every
customer reply, the owner approves it, a guardrail engine catches unsafe
claims / privacy leaks / stock over-promises before the owner ever sees the
send button, and every approval flows into an audit log.

### Primary user
The store owner and (later) trained operators, working from mobile and desktop.

### Primary jobs to be done
1. Never miss a hot lead in the DM inbox.
2. Answer price / stock / delivery questions correctly the first time.
3. Approve a compliant reply in seconds, not minutes.
4. Track every paid order through dispatch and delivery.
5. Show up on Sunday morning knowing exactly what happened last week.

## What already works well

- 22 routes covering the full ops surface: dashboard, inbox, intake, orders,
  customers, couriers, payments, inventory, offers, suppliers, reviews,
  reports, integrations, settings, prompts, audit.
- Guardrail engine (`src/lib/guardrails.ts`) enforcing product-claim,
  privacy, price, VAT, stock, and courier rules — 20 unit tests passing.
- Demo mode fallback (`src/lib/demo/seed.ts`) so every page renders
  meaningful data before Supabase is wired.
- Dashboard tells the "discipline is working" story: revenue trend,
  guardrail activity (7-day pass rate + top rules hit), attention queue.
- PWA manifest is complete: standalone display, portrait, maskable icons,
  shortcuts, theme colors. Installs on Android home screen.
- Brand system unified across ops console and storefront (gold #C9A96E,
  ink #0A0A0A, cream #F5F1E8, Cormorant Garamond display).
- SECURITY.md STRIDE threat model committed.

## Findings

### P0 · Critical

| # | Finding | Where | Status |
|---|---|---|---|
| P0-1 | `/api/analyze` was completely unguarded. Anyone on the internet could invoke it and burn AI provider tokens. | `src/app/api/analyze/route.ts` | **[FIXED]** origin check + Supabase auth requirement + payload cap + best-effort in-memory throttle. Persistent rate limit tracked as follow-up (needs Vercel KV / Upstash). |

### P1 · High

| # | Finding | Where | Status |
|---|---|---|---|
| P1-1 | No security headers on any response. Missing X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, Permissions-Policy. | `next.config.mjs` | **[FIXED]** All 6 headers added, applied to every route. |
| P1-2 | No `loading.tsx` boundary. Every navigation into a force-dynamic route showed a blank pane until the server-side Promise.all completed. | `src/app/` | **[FIXED]** Streamed skeleton for header + KPI row + content. |
| P1-3 | Content-Security-Policy not set. Third-party script injection is not blocked by default. | `next.config.mjs` | Deferred. CSP needs a nonce-based server render pass to allow the JSON-LD and service-worker inline scripts safely; too big for this cycle without regression risk. |
| P1-4 | Audit log rows are mutable by anyone with DB write access. Tamper-evidence gap. | `supabase/` migrations | Deferred. Requires an insert-only RLS policy + optional per-row signature chain. Documented in SECURITY.md priority 1. |
| P1-5 | Supabase RLS policies are not committed to the repo. Deployment can silently drift. | `supabase/` | Deferred. Needs migration files owned by whoever configured Supabase. |
| P1-6 | Owner 2FA not enforced. | Supabase auth config | Deferred. Enable TOTP in Supabase dashboard — a config change, not a code change. |

### P2 · Medium

| # | Finding | Where | Status |
|---|---|---|---|
| P2-1 | `InboxClient.tsx` is 288 lines and mixes state, presentation, and business rules. | `src/app/inbox/InboxClient.tsx` | Deferred. Refactor into `hooks/useDraftApproval.ts` + smaller presentational components before adding the next inbox feature. |
| P2-2 | No `middleware.ts` refreshing Supabase auth cookies. Long-lived tabs may 401 silently. | root | Deferred. Add `src/middleware.ts` per the `@supabase/ssr` recipe. |
| P2-3 | `next.config.mjs` did not disable `x-powered-by`. Small info-leak. | `next.config.mjs` | **[FIXED]** `poweredByHeader: false`. |
| P2-4 | No `NEXT_PUBLIC_APP_URL` fallback for `metadataBase` when running on a Vercel preview. | `src/app/layout.tsx` | Deferred. Read from `VERCEL_URL` in a preview branch. |
| P2-5 | No `robots-meta` or `noindex` runtime guard — relies on `robots.ts` alone; a leaked preview URL is still fetchable. | `src/app/robots.ts` | Deferred. Add a `X-Robots-Tag: noindex` response header for non-production hosts. |

### P3 · Low

| # | Finding | Where | Status |
|---|---|---|---|
| P3-1 | 1 `as any` cast in the codebase. | src/ | Kept. Isolated to a demo boundary, low blast radius. |
| P3-2 | 0 `TODO / FIXME / HACK` markers. Clean codebase. | src/ | No action. |
| P3-3 | `tsconfig.tsbuildinfo` was being regenerated on every build. | root | Already gitignored via `*.tsbuildinfo` in a prior cycle. |
| P3-4 | Dependency versions: Next.js 14.2.15 has a December-2025 CVE; ESLint 8 EOL; `glob@7.2.3` vulnerable. | `package.json` | Deferred. Coordinated dep bump warrants its own cycle so lint config and next/font are re-validated. |
| P3-5 | No E2E tests. Only unit tests (guardrails + notebooklm-oauth). | `tests/` | Deferred. Playwright happy-path sweep is highest-value follow-up test work. |

## Cycle summary — what improved

| Dimension | Before | After |
|---|---|---|
| `/api/analyze` cost/DoS exposure | Anonymous, unlimited | Origin-checked, auth-required, size-capped, throttled |
| Response security headers | 0 sent | 6 sent on every route |
| Perceived navigation latency | Blank until data returns | Skeleton streams instantly via `loading.tsx` |
| Info leak via HTTP fingerprint | `x-powered-by: Next.js` | Header suppressed |
| Documented threat model | SECURITY.md (STRIDE) present | Cross-linked from PROJECT_AUDIT.md follow-ups |

## Verified in this cycle

- `tsc --noEmit` · clean
- `next lint` · 0 warnings, 0 errors
- `vitest run` · 31 / 31 passing
- `next build` · Compiled successfully, 22 routes + `/robots.txt`

## Next cycle · recommended in priority order

1. **Persistent rate limit for `/api/analyze`** using Vercel KV or Upstash — the in-memory throttle only stops bursts inside a single warm serverless instance.
2. **CSP with nonce-based inline scripts** — measurable defense against script injection in exchange for one refactor of `dangerouslySetInnerHTML` in `layout.tsx`.
3. **Insert-only RLS on `audit_logs`** + commit all Supabase RLS migrations to `supabase/migrations/`.
4. **Playwright happy-path E2E** covering: login → inbox → draft approval → order dispatched → audit log entry.
5. **Refactor `InboxClient.tsx`** before its next feature lands.
6. **Coordinated dep bump** (Next.js patch, ESLint 9, drop deprecated `@supabase/auth-helpers-*` in favor of `@supabase/ssr`).
