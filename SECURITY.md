# Threat Model · Beyond Style UAE Order Control Console

Scope: the internal operator console (this Next.js app) and its immediate
environment. The public customer storefront in `beyond-style-uae/` has its own
threat surface not covered here.

## Assets (what an attacker would want)

1. Customer PII: names, phone numbers, addresses, order history.
2. Owner credentials to Supabase auth and by extension the whole DB.
3. AI provider API keys and prompt library (prompt-injection surface).
4. Payment link data and any evidence of payment.
5. Guardrail policy code (attacker who edits it can bypass the discipline layer).

## Trust boundaries

```
+-----------+   HTTPS   +--------------+   pg-conn  +-----------+
|  Browser  | <-------> | Next.js SSR  | <--------> | Supabase  |
+-----------+           +------+-------+            +-----------+
                               |
                               v
                        +------+-------+
                        |  AI provider |
                        |  (OpenAI/    |
                        |   Anthropic/ |
                        |   Gemini)    |
                        +--------------+
```

Sensitive boundaries: browser -> server, server -> DB, server -> AI provider,
owner -> approval flow -> outbound reply.

## STRIDE gap analysis

### S · Spoofing

| Gap | Where | Severity | Fix |
|---|---|---|---|
| No 2FA / MFA on owner login | Supabase auth defaults | High | Enable TOTP in Supabase auth settings; require it for owner role |
| No IP allowlist on operator surface | `/inbox`, `/orders`, `/settings` etc. | Medium | Add middleware guard for known-owner IPs or Cloudflare Access |
| No CSRF token on POST routes | `src/app/api/**/route.ts` | Medium | Add `Origin` check in a shared `safeRoute` wrapper |

### T · Tampering

| Gap | Where | Severity | Fix |
|---|---|---|---|
| Guardrail bypass via DB-override prompts | `/prompts` writes to `prompts` table | High | Add `guardrail_immutable_snippets` that always append at runtime; hash-lock the injected suffix |
| Audit log entries are mutable | `audit_logs` table | High | Insert-only RLS policy; append-only WAL; consider signed hashes chained per row |
| Client-side sends order status changes | `InboxClient.tsx` | Medium | Server-side revalidate status transition against a state machine on the server |

### R · Repudiation

| Gap | Where | Severity | Fix |
|---|---|---|---|
| Owner approvals lack cryptographic signature | approval action | High | Sign each approval with an owner key; store signature in `audit_logs.signature` |
| No non-repudiation on payment confirmations | `/payments` | Medium | Attach receipt hash and file blob to audit event |

### I · Information disclosure

| Gap | Where | Severity | Fix |
|---|---|---|---|
| Supabase RLS policies not committed to repo | `supabase/` | High | Add `supabase/migrations/*_rls.sql` covering every table; enforce `authenticated` only |
| Demo mode leaks realistic-looking sample rows | `src/lib/demo/seed.ts` | Low | Already sample data; hide behind explicit `?demo=1` in prod, not by default |
| Verbose error responses in dev leak stack traces | Next.js dev mode | Low | Ensure `NODE_ENV=production` on Vercel; error boundary already sanitises |
| PII may echo back to public storefront webhooks | none yet, but planned | High before shipping | Add server-side redaction before any outbound webhook fires |

### D · Denial of service

| Gap | Where | Severity | Fix |
|---|---|---|---|
| No rate limit on `/api/analyze` (calls AI provider) | `src/app/api/analyze/route.ts` | High (cost) | Token-bucket per IP + per authed user; hard daily cap per prompt key |
| No rate limit on login | Supabase auth default | Medium | Enable Supabase's built-in rate limits + Turnstile challenge |
| Unbounded row reads in `fetchRows` | `src/lib/data.ts` | Low | Enforce `limit` default of 200, opt-in for larger scans |

### E · Elevation of privilege

| Gap | Where | Severity | Fix |
|---|---|---|---|
| Single `owner` role, no viewer/staff separation | app-wide | High before hiring staff | Add `staff` role that can view but never `approve` |
| Prompt library edit access = full guardrail bypass | `/prompts` | High | Isolate DB-editable prompts from the guardrail-critical section (see Tampering above) |

## Environment / supply-chain

| Gap | Version now | Fix |
|---|---|---|
| Next.js 14.2.15 has published CVE | `package.json` | Bump to latest 14.x patch or 15.x LTS |
| `@supabase/auth-helpers-*` deprecated | project deps | Migrate to `@supabase/ssr` |
| ESLint 8.57.1 is end-of-life | dev dep | Bump to 9.x when Next.js supports it |
| `glob@7.2.3` transitively vulnerable | via next lint | Wait for upstream bump or pin newer `glob` |
| Secrets in env at runtime, no rotation policy | `.env.local` | Document 90-day rotation for OpenAI/Anthropic/Supabase service-role keys |
| No Content-Security-Policy header | `next.config.mjs` | Add strict CSP with `nonce`-based scripts |

## Priority queue

1. Guardrail-bypass hardening (Tampering) + insert-only audit RLS
2. Rate-limit `/api/analyze` (DoS + cost)
3. Enable owner 2FA and commit Supabase RLS migrations to the repo
4. Bump Next.js past the December 2025 CVE
5. Add CSP + Origin-check middleware
6. Add signed approval receipts (Repudiation)

## Out of scope for this doc

- Threat modeling for the customer storefront in `beyond-style-uae/`.
  Do a separate STRIDE for the Vite storefront + its MySQL / Cloudinary
  paths before any public launch.
- Physical / office-network threats.
- Privileged insider attacks against the owner's own machine.
