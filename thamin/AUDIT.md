# Thamin | Independent audit report

Date: 20 July 2026. Scope: full `thamin/` application. Method: code inspection,
static analysis, automated tests, and runtime smoke tests against the built
server. Findings are classified P0 (critical) to P3 (low). Every fix listed as
resolved was verified by a passing test or a live request.

## Product map (discovery summary)

- **Business objective**: protect margin and standardize pricing decisions for
  Beyond Style UAE fashion accessories sold via Instagram, WhatsApp and COD
  delivery across the UAE.
- **Users**: Admin (rules, overrides), Manager (approvals, rates, imports),
  Sales (pricing, quotes), Viewer (read only).
- **Primary journeys**: price an item (from catalog, by photo, or manually);
  send a bilingual customer quote; approve pending prices; maintain rates,
  suppliers and the catalog; monitor margins and alerts.
- **Source of truth**: the deterministic pricing engine; the assistant and the
  photo module can never set a price directly.
- **Data**: real catalog, supplier, delivery policy, bundle ladder and message
  templates imported from the operations master workbook.

## Findings and resolutions

| # | Severity | Area | Finding | Resolution |
| --- | --- | --- | --- | --- |
| 1 | P1 | Security | `AUTH_SECRET` fell back to a known development value; in production this would let anyone forge a session cookie for any role | Fail closed: production now refuses to start signing sessions without a real secret. Development keeps the convenience fallback |
| 2 | P2 | Privacy | The pricing assistant accepted any `conversationId`, so one signed-in user could read and extend another user's conversation memory | Ownership check added; a foreign conversation id silently starts a fresh private conversation |
| 3 | P2 | Reliability | Approval push notifications were fired without `await`; serverless platforms may kill the process before delivery | Sends are now awaited in both the submit and import flows |
| 4 | P2 | Reliability | Sequential quote numbers (`count + 1`) collide under concurrent creation, failing the unique constraint with a 500 | Retry loop with the next number, up to 5 attempts |
| 5 | P2 | Governance | The admin-configured approval threshold (`approvalThresholdAed`) existed in settings but was enforced nowhere, so a sales account could send a quote of any size | Enforced at quote creation: totals above the threshold require a manager account, with a bilingual explanation |
| 6 | P2 | Correctness | Catalog re-import flipped unchanged products back to pending approval when the sheet omitted a cost or price column | Status is re-opened only when a value is present in the sheet and actually different |
| 7 | P2 | Robustness | A malformed stored warnings payload would crash the whole history page | Tolerant parse with a safe empty fallback |
| 8 | P3 | Naming | CSV export still carried the pre-rename filename | Renamed to `thamin-costing.csv` |

## Known limitations (documented, not defects)

- The login rate limiter and push subscription pruning are per-instance
  in-memory or best-effort; a multi-region deployment should move rate
  limiting to the database or an edge store.
- The `xlsx` dependency (catalog import) has upstream advisories; exposure is
  limited because import is manager-only and file size is capped. Track
  upstream releases.
- Photos fall back to inline database storage until Supabase Storage
  credentials are configured (documented in README).
- SQLite is the zero-setup development database; production requires the
  one-line switch to Postgres described in README and docs/VERCEL-FIX.md.

## Assumption register

| Assumption | Evidence | Confidence | If wrong |
| --- | --- | --- | --- |
| Delivery is usually charged to the customer on top | Delivery Policy sheet, message templates, unit economics of the 79 AED hero product | High | One toggle in the calculator reverses it |
| Bundle ladder 79/129/159 is intentional even though 3 pcs sits under the 25% minimum margin | Product Catalog sheet | High | Engine already surfaces the shortfall and floors at 164 |
| Items are stainless steel fashion accessories unless verified otherwise | Safe Claims control list in Phase 3 settings | High | Safe-claims wording is a prompt rule and note, not a data constraint |
| Quote numbers only need uniqueness, not gapless sequence | No accounting requirement found in the workbook | Medium | Switch to a database sequence |

## Verification of this audit round

- 27 automated tests pass, TypeScript check clean, production build clean.
- Runtime checks against the built server: sales quote above threshold
  rejected with 403 and bilingual message; manager quote above threshold
  accepted; quote numbering intact; history page renders; production-mode
  auth refuses the fallback secret.
