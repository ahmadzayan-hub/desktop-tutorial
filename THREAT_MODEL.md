# Wasl · Threat Model (STRIDE)

Scope: the Wasl Next.js commerce console and its runtime environment (Vercel edge + Node runtime, Supabase Postgres/Auth/Storage, Google OAuth for NotebookLM, third-party AI provider, browser PWA on Android/iOS/desktop).

Purpose: give a single reference an engineer can open, orient, and reason about security gaps from — without having to reread the whole codebase.

Threat levels: **H** = high impact, exploit likely without control · **M** = medium · **L** = low.
Status: **DONE** shipped · **TODO** planned · **RISK** accepted risk (documented, no fix planned this quarter).

--------------------------------------------------------------------------
## 1. Trust boundaries & data flow

```
[ Browser / Android PWA ]
        │  HTTPS (public internet)
        ▼
[ Vercel Edge (Next.js) ] ─── /api/analyze ────► [ AI provider ]  (secret)
        │                                          (OpenAI/Anthropic/etc.)
        │
        ├── /api/integrations/notebooklm/* ─────► [ Google OAuth 2.0 ]
        │                                          (client id + secret)
        │
        └── server actions / RSC ──────────────► [ Supabase Postgres ]
                                                  (RLS + auth)
                                                  Storage bucket for uploads
```

Trust boundaries (each arrow above crosses one):

| # | Boundary                                     | Auth mechanism                     |
|---|----------------------------------------------|-------------------------------------|
| B1 | Public internet → Vercel                    | TLS, Vercel edge                    |
| B2 | Browser → Next.js server (RSC + route)      | Supabase Auth cookie (JWT)          |
| B3 | Next.js server → Supabase                    | anon or service-role JWT (env)      |
| B4 | Next.js server → AI provider                 | Bearer API key (env)                |
| B5 | Next.js server → Google OAuth                | Client secret (env), state cookie   |
| B6 | Next.js server ↔ owner cookie (OAuth tokens)| AES-256-GCM + httpOnly + secure     |

## 2. Assets

| Asset                       | Where                              | Sensitivity |
|-----------------------------|------------------------------------|-------------|
| Customer PII (phone, addr)  | Supabase customers / conversations | H           |
| Payment references          | Supabase payments                  | H           |
| Owner account credentials   | Supabase Auth                      | H           |
| AI-provider API key         | Env var (server-only)              | H           |
| Supabase service role       | Env var (server-only)              | H           |
| Google OAuth client secret  | Env var (server-only)              | H           |
| OAuth refresh tokens        | httpOnly cookie, AES-256-GCM       | H           |
| Prompt library (owner-edit) | Supabase prompts                   | M           |
| Order state (approvals)     | Supabase orders                    | M           |
| Public site pages           | Static / RSC                       | L           |

## 3. STRIDE per component

### 3.1 Public web surface

| S/T/R/I/D/E | Threat                                                                 | Level | Mitigation                                                                                          | Status |
|-------------|------------------------------------------------------------------------|-------|-----------------------------------------------------------------------------------------------------|--------|
| S           | Attacker phishes owner via lookalike domain                            | M     | Distinctive brand, favicon, HSTS on wasl.app                                                        | TODO   |
| T           | Malicious injection into DOM via reflected params                      | M     | React auto-escapes; no `dangerouslySetInnerHTML` on user input (only JSON-LD, sanitised)            | DONE   |
| R           | Owner denies approving a reply                                          | M     | `/audit` log records every approval + actor                                                          | DONE   |
| I           | Search engine indexes owner-console URLs                                | M     | `robots.ts` disallows `/inbox`, `/intake`, `/settings`, `/prompts`, `/integrations`, `/audit`, `/api` | DONE   |
| D           | DDoS floods `/api/analyze` → cost blow-up + provider rate-limit         | H     | Rate-limit at edge (Vercel WAF or Upstash), max req/min per IP + per session                        | TODO   |
| E           | XSS through customer message stored & rendered in dashboard             | M     | JSX escapes by default; verify no `innerHTML` when we later render markdown reply drafts             | DONE   |

### 3.2 API routes

| /api/analyze                                                                                              |
|-----------------------------------------------------------------------------------------------------------|
| **S**: no auth today → any visitor can invoke and spend AI credits. **H**, TODO: require Supabase session. |
| **T**: crafted `context` may include prompt-injection to manipulate LLM reply. **H**, DONE: guardrails engine + owner approval; TODO: prompt-injection scrubber on `customerMessage`. |
| **R**: no request logs. **M**, TODO: log request id, actor, prompt hash to Supabase for post-incident review. |
| **I**: model output could leak PII from other conversations if provider reuses context. **M**, DONE: no shared conversation memory; each analyze call is stateless. |
| **D**: unbounded body size or images. **M**, TODO: cap request body (1 MB), images (2 MB), and count (3). |
| **E**: `AnalyzeInput` zod-validated shape but `promptOverrides` accepts arbitrary strings that override any prompt key. **H**, TODO: whitelist which keys owners can override; require an authenticated owner session. |

| /api/integrations/notebooklm/authorize · callback · disconnect                                            |
|-----------------------------------------------------------------------------------------------------------|
| **S**: CSRF on callback → attacker swaps tokens. **M**, DONE: 24-byte `state` in httpOnly cookie, verified. |
| **T**: cookie tampering. **M**, DONE: AES-256-GCM sealed cookie; auth-tag protects integrity. |
| **R**: no log of who authorised / disconnected. **L**, TODO: emit audit event on connect/disconnect. |
| **I**: leak of client secret via error message. **M**, DONE: `safeBody` truncates and no secret is echoed. |
| **D**: repeated authorise loops from a bot could exhaust rate limit. **L**, TODO: 1 per minute per IP. |
| **E**: token cookie exists but `/api/*` doesn't enforce Supabase auth before using it. **M**, TODO: gate integration reads on an authenticated session. |

### 3.3 Data layer (Supabase)

| Threat                                                                                              | Level | Mitigation                                                                                       | Status |
|-----------------------------------------------------------------------------------------------------|-------|---------------------------------------------------------------------------------------------------|--------|
| RLS bypass (row-level security disabled or too permissive)                                          | H     | Every table must have RLS on. Policies: owner-scoped for `orders`, `payments`, `customers`, etc. Owner is identified via `auth.uid()`. **TODO**: audit `supabase/migrations` for missing `enable row level security`. | TODO   |
| Service-role key leak into browser bundle                                                            | H     | Server-only import (`src/lib/supabase/server.ts`); never `NEXT_PUBLIC_`. **DONE**.                | DONE   |
| SQL injection via string concatenation                                                              | L     | Supabase JS uses parameterised queries; no raw SQL in app. **DONE**.                              | DONE   |
| Malicious file upload to Storage bucket (double-extension, oversize, EXIF w/ location, RCE polyglot)| H     | Storage bucket policy: content-type allowlist (image/*), max 5 MB, strip EXIF server-side. **TODO** | TODO   |
| PII regurgitated by AI reply into shared dashboard                                                  | M     | Guardrail §14 privacy sweeps outgoing text; owner reviews. **DONE**.                              | DONE   |

### 3.4 AI provider

| Threat                                                        | Level | Mitigation                                                                                       | Status |
|---------------------------------------------------------------|-------|---------------------------------------------------------------------------------------------------|--------|
| Prompt injection via customer message                         | H     | Guardrail regex layer + owner human-in-the-loop; TODO: dedicated instruction-boundary hardening. | Partial|
| Model output contains harmful text or a private detail         | M     | Guardrail engine scans reply; owner reviews.                                                     | DONE   |
| Provider outage → owner console blocks                        | M     | Mock provider fallback returns safe placeholder.                                                 | DONE   |
| Cost spike from unbounded generation                          | M     | TODO: cap `max_tokens` per request; alert on daily spend > threshold.                            | TODO   |
| Data-residency (UAE regulatory): customer message crosses jurisdictions | M | Document which providers process in EU vs US vs UAE; disclose in privacy policy. | TODO |

### 3.5 Runtime / environment (Vercel + Supabase)

| Threat                                                                | Level | Mitigation                                                                                       | Status |
|------------------------------------------------------------------------|-------|---------------------------------------------------------------------------------------------------|--------|
| Env var leak (build logs, error pages)                                | H     | Vercel scrubs; app doesn't echo env in error boundaries. **DONE**.                                | DONE   |
| Missing security headers (CSP, HSTS, X-Frame-Options)                | H     | `vercel.json` sets X-Frame-Options=SAMEORIGIN, X-Content-Type-Options=nosniff, Referrer-Policy, Permissions-Policy `camera=(),microphone=(),geolocation=()`. **TODO**: Content-Security-Policy. | Partial|
| Clickjacking of critical actions                                     | M     | `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'` in future CSP.                          | DONE   |
| Session fixation                                                       | L     | Supabase Auth rotates JWT on sign-in; cookies are httpOnly.                                       | DONE   |
| Insecure deserialisation (JSON.parse on untrusted)                    | L     | zod schemas gate every deserialisation.                                                           | DONE   |
| Supply-chain (compromised npm dep)                                    | M     | `package-lock.json` committed; TODO: automated `npm audit` in CI + Dependabot.                    | TODO   |
| Compromised OAuth token cookie key                                    | M     | Falls back to `SUPABASE_SERVICE_ROLE_KEY` then a dev constant. **TODO**: force `INTEGRATION_TOKEN_SECRET` in prod. | TODO |
| Time-based side channel on state comparison                          | L     | `state` compared with `===`; state is high-entropy, so tolerable. RISK-accepted.                  | RISK   |

### 3.6 Client (PWA + service worker)

| Threat                                                        | Level | Mitigation                                                                                       | Status |
|---------------------------------------------------------------|-------|---------------------------------------------------------------------------------------------------|--------|
| Stale manifest scope allows a foreign origin to hijack install | L     | `scope: "/"`, deployed on `wasl.app` only.                                                       | DONE   |
| Service worker caches PII pages                                | M     | TODO: exclude `/inbox`, `/intake`, `/api/*` from any SW cache once SW ships.                     | TODO   |
| App-links open owner surfaces from untrusted invite            | L     | Deep links only affect anonymous public pages; owner surfaces need session.                       | DONE   |

## 4. Gap register (prioritised)

Ranked by risk and rough effort. Address top-down.

1. **[H] Gate `/api/analyze` behind Supabase auth.** Right now anyone with the URL can spend AI credits. Fix: check `supabase.auth.getUser()` at the top of the route.
2. **[H] Enforce RLS audit on every Supabase table.** Run `select tablename, rowsecurity from pg_tables where schemaname='public'` in Supabase; enable RLS + owner-scoped policies where missing.
3. **[H] Add rate limiting on `/api/analyze` and `/api/integrations/*`.** Upstash Redis or Vercel WAF (10 req/min/IP is enough).
4. **[H] Send Content-Security-Policy header.** Restrict `script-src 'self'`, `img-src 'self' data: blob:`, `connect-src 'self' https://*.supabase.co https://api.openai.com …`, `frame-ancestors 'self'`.
5. **[M] Cap request body + images on `/api/analyze`.** `bytesReceived` guard, 1 MB body / 2 MB image / 3 images max.
6. **[M] Whitelist `promptOverrides` keys against the PromptKey union.** Zod refinement, drop unknown keys.
7. **[M] Force `INTEGRATION_TOKEN_SECRET` in prod.** Throw at boot if unset (see `src/lib/integrations/secure-store.ts`).
8. **[M] Automate `npm audit` + Dependabot.** GitHub Actions job on push; fail on high vulns.
9. **[M] Log integration connect / disconnect / analyze to `/audit`.** Reuse existing `audit_logs` table; write from route handlers.
10. **[L] Rotate demo integration secret.** `wasl-demo-integration-secret` should never ship to prod. Remove the fallback once (7) is enforced.

## 5. Assumptions & out-of-scope

- Owner is trusted; the console is single-tenant per merchant. No multi-tenant privilege model.
- Customer messages are user-generated content but the owner is the only viewer of the console; they can inspect any raw payload.
- Physical device security of the owner's phone/laptop is out of scope.
- Wallet / payment-processor integration is not yet built; when it is, expand this doc with PCI-scope analysis.

## 6. Review cadence

- Quick pass on every PR that touches `src/app/api/`, `src/lib/supabase/`, `src/lib/integrations/`, or `vercel.json`.
- Full re-audit quarterly, and any time a new external dependency is added.
