# Security & Responsible-AI Assessment — Maktab

Risk-based review aligned with OWASP Top 10, OWASP API Security Top 10, and OWASP
LLM guidance. Evidence is from this repository; unverified items are labelled.

## Summary

**Solid foundations** (RLS, per-request authorization, signed webhooks, server-only
secrets, validated inputs) with **two notable gaps** (no rate limiting; no CSP) and
one **scheduled** dependency risk (Next 16). Not yet release-hardened.

## OWASP Top 10 / API

| Area | Status | Evidence |
| --- | --- | --- |
| Broken access control (A01 / API1 BOLA) | ✅ tested | `requireUser()` + `user_id` scoping + object-ownership check on `DELETE /api/files/[id]` (404 for other-user objects) — unit-tested |
| Broken authentication (API2) | ✅ | Supabase Auth + cookie session; `requireUser()` gate on protected routes |
| Multi-tenant isolation | ✅ | Postgres **RLS**: 62 policy statements across `supabase/migrations/*` |
| Injection | ✅ (parameterized) | Supabase query builder (no raw SQL in routes); **zod** input validation in 12 API files |
| Security misconfiguration (A05) | ⚠️ improving | 5 base headers + a **`Content-Security-Policy-Report-Only`** baseline now set in `next.config.mjs`; enforce it (with nonces) after verifying against real traffic |
| CORS (A05) | ⚠️ finding | `/api/*` sets `Access-Control-Allow-Origin: *`. Not credential-exploitable (browsers block `*` + credentials), but overly permissive; scope it to the app origin (+ the extension's origin) once the extension's needs are confirmed |
| Sensitive-data exposure / errors (A09) | ✅ fixed | `handleError()` no longer returns internal error messages on 500s; logs server-side only |
| Secrets | ✅ | only `.env.example` / `.env.production.example` tracked, placeholders only; service-role key used server-side; AI keys in `lib/ai` (server) |
| Payment integrity | ✅ tested | Stripe webhook rejects missing/invalid signatures before any DB write (unit-tested) |
| Vulnerable dependencies (A06) | ⚠️ scheduled | `npm audit` 5 high, all bound to the Next 16 migration (`docs/NEXT_16_MIGRATION_PLAN.md`) |
| Rate limiting / anti-automation (API4) | ⚠️ partial | best-effort limiter now in `src/middleware.ts` on `/api/auth/*` (20/min) and `/api/ask-mba\|tutor\|sessions` (40/min), fail-open + unit-tested. **In-memory / per-instance on serverless** — add a shared store (Upstash/Vercel KV) for a hard global cap |
| SSRF, CSRF | ⚠️ unverified | needs review of any user-supplied URL fetch and state-changing GET/POST CSRF posture |

## Priority security actions

1. **Rate limiting** on auth, AI, and Server Actions (edge middleware / Upstash / platform WAF). Highest-leverage gap; also the interim DoS mitigation.
2. **Add a Content-Security-Policy** header (report-only first).
3. **Complete the Next 16 upgrade** to clear the 5 high advisories.
4. Verify CSRF on state-changing routes and review any server-side URL fetching for SSRF.

## Responsible AI

| Dimension | Status |
| --- | --- |
| Server-side model calls | ✅ keys never reach the client (`lib/ai/client.ts`) |
| Provider abstraction | ✅ `AI_PROVIDER` switch (Anthropic / OpenAI / Ollama) |
| Grounding / RAG | ✅ retrieval layer in `src/lib/rag` |
| Prompt management | ⚠️ prompts in `src/lib/llm/prompts.ts` — not versioned or evaluated |
| Structured-output validation | ⚠️ partial (zod exists; not confirmed on all AI outputs) |
| **Prompt-injection defense** | ❌ not tested |
| **Evaluation suite** (hallucination, grounding, injection, bias, EN/AR quality) | ❌ absent — see `docs/AI_EVALUATION_PLAN.md` (to be authored) |
| Human oversight of high-impact output | ⚠️ document intended-use, limitations, and escalation |
| Privacy: data classification, retention, deletion | ✅ account **export** + **delete** endpoints exist (authz-tested); retention policy to be documented |

## Recommended governance artifacts (not yet present)

- AI evaluation plan + fixtures (sanitized, no user data).
- Documented intended/prohibited use, known limitations, and model/prompt versioning.
- Audit logging for admin and AI actions.

## Verification note

Static + unit-test evidence only. Runtime security testing (auth session lifecycle,
CSRF, live RLS behaviour, penetration testing) requires a deployed environment and
is **not** covered here.
