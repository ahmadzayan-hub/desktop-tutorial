# Tweenz AI — Application Threat Model

**Framework**: STRIDE  
**Scope**: Full-stack Next.js 14 application + Supabase backend + third-party APIs  
**Last reviewed**: 2026-07-06  
**Status**: Living document — update after any architectural change

---

## 1. System Overview

```
Browser / Mobile PWA
        │ HTTPS
        ▼
┌───────────────────────┐
│   Next.js App Router  │  (Vercel Edge / Node.js runtime)
│                       │
│  /app       – pages   │
│  /api       – routes  │◄──── Browser Extension (API key auth)
│  /api/v1    – public  │◄──── External integrations
│  /api/webhooks/stripe │◄──── Stripe (HMAC signature)
└───────┬───────────────┘
        │ Service Role Key / Anon Key
        ▼
┌───────────────────────┐       ┌─────────────────┐
│      Supabase         │       │   OpenAI Whisper │
│  auth / db / storage  │       │   (transcription)│
└───────────────────────┘       └─────────────────┘
        │
        ▼
┌───────────────────────┐
│   Stripe Billing      │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│   Ollama / LLM        │
│   (local or remote)   │
└───────────────────────┘
```

### Trust Boundaries

| Boundary | Description |
|----------|-------------|
| **B1** | Public internet → Next.js API routes |
| **B2** | Next.js → Supabase (service role vs anon key) |
| **B3** | Next.js → OpenAI / Ollama |
| **B4** | Stripe → Next.js webhook endpoint |
| **B5** | Browser extension → `/api/extension/*` |

---

## 2. STRIDE Threat Analysis

### S — Spoofing

| ID | Asset | Threat | Severity | Status |
|----|-------|--------|----------|--------|
| S-1 | Supabase session | Session cookie theft via XSS allows attacker to impersonate any user | HIGH | Mitigated by Supabase httpOnly cookies; **CSP now added** |
| S-2 | Extension API | Empty `EXTENSION_API_KEY` falls through to DB lookup — attacker can try any key against DB | MEDIUM | **Fixed**: requireApiKey already guards with `if (env.extensionApiKey && ...)` |
| S-3 | Admin route | Admin Supabase client falls back to anon key if service role key is absent — attacker who is any authenticated user might pass role check | HIGH | **Fixed**: route now throws if service role key missing |
| S-4 | Stripe webhook | Without signature verification, attacker could send fake `customer.subscription.updated` to grant free Pro access | HIGH | Mitigated — `stripe.webhooks.constructEvent` enforced |

### T — Tampering

| ID | Asset | Threat | Severity | Status |
|----|-------|--------|----------|--------|
| T-1 | File uploads | Path traversal: file names with `../` could escape storage prefix | MEDIUM | Mitigated by `[^a-zA-Z0-9.-]→_` regex in `files/route.ts` |
| T-2 | API responses | CORS wildcard allows any origin to call all `/api/*` routes and read responses | CRITICAL | **Fixed**: restricted to production origin + localhost dev |
| T-3 | Prompt inputs | Prompt text sent to LLM without length cap — could inflate API costs via large payloads | MEDIUM | Partial: extension route caps `raw_prompt` at 8000 chars via Zod; verify all AI routes |
| T-4 | Transcribe audio | No auth on production transcribe endpoint — anyone can send audio and burn OpenAI quota | HIGH | **Fixed**: added `requireUser()` guard |

### R — Repudiation

| ID | Asset | Threat | Severity | Status |
|----|-------|--------|----------|--------|
| R-1 | LLM usage | API routes return HTTP 200 for LLM errors (`{unavailable:true}`) — failures never appear in server error logs or alerting | MEDIUM | Accepted trade-off for demo mode; production monitoring should alert on `unavailable:true` rate |
| R-2 | Admin actions | No audit log for admin user list queries or role changes | LOW | Supabase dashboard logs provide fallback |
| R-3 | Stripe events | Webhook handler does not persist raw event for replay/audit | LOW | Stripe dashboard provides event history |

### I — Information Disclosure

| ID | Asset | Threat | Severity | Status |
|----|-------|--------|----------|--------|
| I-1 | API errors | `detail: String(e)` in transcribe error responses may leak internal paths or upstream error messages | MEDIUM | Acceptable at 502/500 level; consider stripping `detail` in prod |
| I-2 | Env vars | `SUPABASE_SERVICE_ROLE_KEY` exposed client-side if accidentally prefixed `NEXT_PUBLIC_` | HIGH | Not current; guard: never add NEXT_PUBLIC_ prefix to secrets |
| I-3 | LLM base URL | `base_url` field in `{unavailable:true}` response exposes internal Ollama endpoint | LOW | Only in error responses; acceptable for dev-mode debugging |
| I-4 | User enumeration | `/api/admin/users` returns email addresses without pagination limit enforcement | LOW | Route is admin-only; Supabase RLS is a secondary guard |

### D — Denial of Service

| ID | Asset | Threat | Severity | Status |
|----|-------|--------|----------|--------|
| D-1 | AI routes | No rate limiting on `/api/transcribe`, `/api/tutor`, `/api/study-packs` — attacker can exhaust OpenAI/Ollama quota | HIGH | **Open**: add Upstash/Redis rate limiter on AI routes |
| D-2 | File upload | 50 MB per-file limit set in `files/route.ts` | MEDIUM | Mitigated — limit enforced |
| D-3 | Webhook flood | Stripe webhook has no per-IP rate limit at Next.js level | LOW | Stripe throttles at source; Vercel has DDoS protection |

### E — Elevation of Privilege

| ID | Asset | Threat | Severity | Status |
|----|-------|--------|----------|--------|
| E-1 | Admin routes | Only cookie-session `getUser()` + DB role check — no middleware-level role enforcement; a server misconfiguration could skip the DB check | MEDIUM | Layered check is present; middleware-level admin guard would add depth |
| E-2 | Service role key | If `SUPABASE_SERVICE_ROLE_KEY` falls back to anon key, attacker authenticated as any user might bypass RLS | HIGH | **Fixed in admin route** |
| E-3 | Org membership | `requireUserOrg` trusts `x-org-id` header from the client — attacker who knows another org's ID could attempt API calls against it | MEDIUM | Membership check mitigates: `supabase.from("memberships").select.eq("org_id",orgId)` |

---

## 3. Security Controls in Place

| Control | Location | Notes |
|---------|----------|-------|
| HSTS | `next.config.mjs` | `max-age=63072000; includeSubDomains; preload` |
| X-Frame-Options | `next.config.mjs` | `SAMEORIGIN` — prevents clickjacking |
| X-Content-Type-Options | `next.config.mjs` | `nosniff` |
| Referrer-Policy | `next.config.mjs` | `strict-origin-when-cross-origin` |
| Permissions-Policy | `next.config.mjs` | Camera/geo off; microphone self only |
| **CSP** | `next.config.mjs` | **Added**: blocks inline scripts, unknown origins |
| **CORS** | `next.config.mjs` | **Fixed**: origin-restricted |
| Stripe signature | `webhooks/stripe` | `stripe.webhooks.constructEvent` |
| Auth cookies | Supabase SSR | httpOnly, SameSite via Supabase library |
| File type allowlist | `files/route.ts` | Checked at upload; 50 MB cap |
| Zod input validation | extension/v1 routes | Enforced schema with length caps |

---

## 4. Open / Accepted Risks

| Risk | Decision | Owner |
|------|----------|-------|
| No rate limiter on AI routes | Open — add Upstash rate limiter | Eng |
| LLM errors return HTTP 200 | Accepted for demo/dev-mode; add monitoring alert | Ops |
| No audit log for admin actions | Low priority; Supabase logs cover | Eng |
| `detail` field in 5xx responses | Acceptable — only shown server-side error text | Eng |
| Ollama endpoint in error body | Low — dev-mode only | Eng |

---

## 5. Recommended Next Steps (Priority Order)

1. **Rate limiting** — add Upstash Redis rate limiter to `/api/transcribe`, `/api/tutor`, `/api/study-packs` (D-1)
2. **CSP reporting** — add `report-uri` or `report-to` directive pointing at a CSP violations endpoint for ongoing monitoring
3. **Middleware-level admin guard** — enforce `role=admin` in middleware before admin routes, not only in route handlers (E-1)
4. **Strip error detail in production** — remove `detail: String(e)` from 5xx responses when `NODE_ENV === "production"` (I-1)
5. **Monitoring alert** — alert if `unavailable:true` response rate exceeds threshold (R-1)
6. **Org-ID validation** — verify `x-org-id` header is a valid UUID before DB lookup to prevent malformed queries (E-3)
