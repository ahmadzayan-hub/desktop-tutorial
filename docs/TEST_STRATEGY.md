# Test Strategy — Maktab

## Tooling

- **Vitest** (`npm run test`), node environment, `src/**/*.test.ts`.
- **Type checking** (`npm run typecheck`) and **lint** (`npm run lint`) are part
  of the quality gate; CI runs all of them plus `build` (`.github/workflows/ci.yml`).

## Current coverage (33 tests, 9 files)

| Layer | Covered | Files |
| --- | --- | --- |
| Pure services | prompt templating, clarification, formatter, Ollama client | `src/lib/services/*.test.ts`, `src/lib/llm/ollama.test.ts` |
| Error/route backbone | `handleError` mapping + generic 500 (no leak); `safeRoute` short-circuit/passthrough/catch | `src/lib/api-helpers.test.ts` |
| Payment integrity | Stripe webhook rejects missing/invalid signatures with no side effects | `src/app/api/webhooks/stripe/route.test.ts` |
| Authorization (authz) | GDPR delete scoping; **BOLA/IDOR** on `files/[id]`; GDPR export scoping | `src/app/api/account/delete/*`, `files/[id]/*`, `account/export/*` |

### Approach for route-handler tests
Route handlers are unit-tested by mocking their boundary (`@/lib/db/supabase-server`,
`@/lib/stripe/client`) so tests assert **behavioural security contracts**
(status codes, no cross-user access, no side effects on rejection) without a live
database. Mocks are set to **throw if a privileged client is constructed on a
rejection path**, so "no side effect" is actually proven, not assumed.

## The pyramid — target vs. current

| Level | Target | Current |
| --- | --- | --- |
| Unit | business rules, validation, parsers, authz decisions | ✅ growing (33) |
| Integration | real DB ops, auth flows, RLS, Stripe webhook end-to-end, file handling | ❌ none (needs a test Supabase project) |
| E2E | onboarding, sign-in, AI generation, save/resume, export, mobile | ⚠️ started — **Playwright, 8 tests** over the public/no-auth surface (`e2e/public.spec.ts`); auth'd journeys still to add |
| Visual regression | key pages at 360/390/768/1024/1440px | ❌ none |

## Gaps & next priorities

1. **Integration tests** against a disposable Supabase (RLS actually enforced,
   auth session lifecycle, webhook → DB write). This is where RLS/auth claims get
   real verification (unit mocks cannot).
2. **E2E (Playwright)** for the top journeys, including EN/AR + mobile.
3. **AI evaluation suite** (see `docs/AI_EVALUATION_PLAN.md`) — grounding,
   hallucination, prompt-injection, numerical/financial consistency, EN/AR quality.
4. Coverage reporting + a minimum threshold on the critical `src/lib/services` and
   authz modules.

## Running

```bash
npm run typecheck
npm run lint
npm run test          # 33 tests
npm run build
npm audit --audit-level=critical
npm run test:e2e      # Playwright — boots the dev server, runs the public-surface E2E
```

## What tests do NOT cover (be explicit)

Unit tests assert contracts with mocked I/O. They do **not** prove: real RLS
enforcement, live auth/session behaviour, actual Stripe delivery, AI output
quality, or performance. Those require a deployed/integration environment
(operating rule 11).
