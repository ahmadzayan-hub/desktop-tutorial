# Project Audit — Baseline

_Evidence-based baseline captured before any code changes. Generated on the `improvement/production-uiux-performance` branch off `origin/main` (`d6dbeab`)._

## 0. Scope note (assumption register)

The audit master prompt was templated for an **AIB901 "AI in Business Organizations"** business-plan generator (Strategic/Business/Marketing plan hierarchy, course PDFs). **No such files or features exist in this repository.** The actual application is **"Maktab"** (`package.json` name `maktab@0.19.0`) — an **MBA study & AI-tutor SaaS**.

| Assumption | Evidence | Confidence | Decision |
| --- | --- | --- | --- |
| Target app = Maktab (this repo), not an AIB901 plan generator | Repo has no course/plan files; routes are `/tutor`, `/courses`, `/quizzes`, `/ask-mba`, Stripe subs | High | Audit the real app; mark plan-hierarchy deliverables N/A |
| Primary users = MBA students (+ instructors/admin) | `/(app)` routes, `admin` role, `ask-mba`, subscription tiers | High | Proceed |
| README is stale | README says "Prompt Orchestrator / Ollama"; real app is a study platform using Anthropic/OpenAI + Stripe | High | Flag as Gate-G defect |

## 1. Executive summary

The project **builds and passes its existing checks**, but it is **not release-ready**: the README describes a different product, dependency security has 2 critical + 5 high advisories outstanding, and automated test coverage is thin relative to a 50+ endpoint, auth+billing+AI surface.

## 2. Stack (verified)

- **Framework:** Next.js 14 (App Router, RSC) + React + TypeScript (strict).
- **Data:** Supabase (Postgres) with 3 migrations incl. Row-Level Security.
- **AI:** provider abstraction in `src/lib/llm` (Ollama) + `src/lib/ai`; env supports Anthropic & OpenAI; RAG in `src/lib/rag`.
- **Payments:** Stripe (subscription checkout, portal, `/api/webhooks/stripe`).
- **Email:** Resend. **i18n:** EN/AR (`src/lib/i18n`). **Extension:** Chrome MV3.
- **Tests:** Vitest (4 files). **Package manager:** npm.

## 3. Baseline gate results (reproducible)

| Gate | Command | Result |
| --- | --- | --- |
| Install | `npm install` | ✅ OK |
| Type check | `npm run typecheck` | ✅ 0 errors |
| Lint | `npm run lint` | ✅ 0 errors, 1 warning (`no-page-custom-font`, `src/app/layout.tsx`) |
| Unit tests | `npm run test` | ✅ 18/18 pass (4 files: template, clarification, formatter, ollama) |
| Build | `npm run build` | ✅ OK |
| Security | `npm audit` | ⚠️ **14 → 5** after safe upgrades (0 critical, 0 moderate; 5 high remain, all bound to the Next 16 major migration) |
| Secrets | `git ls-files \| grep .env` | ✅ only `.env.example` / `.env.production.example`, placeholders only |

## 4. Findings by severity

### Critical — RESOLVED
- **C1 — Dependency vulnerabilities:** the two criticals (`@vitest/mocker`, and the moderate/high cluster) were cleared by upgrading **vitest 2 → 4** (dev-only, tests re-verified 18/18) and **next 14.2.15 → 14.2.35** (safe patch). `npm audit`: 14 → 5, **0 critical**.

### High
- **H1 — Residual highs require the Next 16 major migration (SCHEDULED):** the 5 remaining highs are all bound to Next 16 — `next` (Server-Actions DoS), bundled `postcss` (XSS in stringify), and the `eslint-config-next` / `@next/eslint-plugin-next` / `glob` toolchain (glob CLI command injection). `next@14.2.35` is the latest 14.x and does **not** clear the DoS advisory (patched only in ≥16.3.0). Upgrading 14→16 is breaking (async `cookies()`/`headers()`/`params`, config changes across 50+ routes) and must be a dedicated, fully-tested migration — not a rushed `audit fix --force`.
  - **Interim mitigation for the runtime DoS:** rate-limit / size-cap Server Action payloads at the edge (middleware or platform WAF) until the migration lands. The eslint/glob items are dev/CI-only, not runtime-exploitable.
- **H2 — README does not match the product (Gate G):** README markets "Prompt Orchestrator" (Ollama, zero AI fees, Chrome-extension-first). The real app is an MBA study/tutor SaaS using Anthropic/OpenAI + Stripe. Setup instructions, folder map, and feature list are stale → misleads contributors and operators.
- **H3 — Test coverage vs. risk surface:** 18 tests cover 4 pure-logic service files. **Untested:** all 50+ API routes, auth flows, RLS ownership, Stripe webhook signature handling, account export/delete (GDPR), AI orchestration/tutor. No integration or E2E layer.

### Medium
- **M1 — `next lint` font warning** in `src/app/layout.tsx` (`@next/next/no-page-custom-font`) — affects font-load performance.
- **M2 — Provider secrets & privileged AI calls:** need to confirm all Anthropic/OpenAI/Stripe/Supabase-service-role calls are server-only (no keys in client bundles). Requires targeted review (Phase 5).
- **M3 — No CI workflow** enforcing typecheck/lint/test/build/audit on PRs (no `.github/workflows` for the app).

### Low
- **L1 — Applied:** non-breaking `npm audit fix` resolved 4 highs (`brace-expansion`, `js-yaml`, `nanoid`, `ws`); typecheck/tests/build re-verified green. (Only `package-lock.json` changed.)

## 5. Recommended implementation priority

1. **H2 — Rewrite README** to the real product (safe, high-value, reversible). _Candidate for this branch now._
2. **C1/H1 — Security upgrades** (Next 16 + vitest 4): needs your authorization (breaking, behavior-affecting).
3. **H3 — Test pyramid**: add integration tests for auth/RLS/Stripe-webhook/account-deletion; E2E for core journeys.
4. **M3 — CI gate**; **M1** font fix; **M2** secret-boundary review.

## 6. What was NOT changed

No production code, routes, data, migrations, or features were modified. Only: (a) this document, and (b) a non-breaking `npm audit fix` (lockfile only). No PR, merge, or deploy performed (per operating rule 10).
