# Project Migration Ledger

Principle in force: **PRESERVE > INVESTIGATE > DELETE**. Nothing is deleted in
this wave. Every entry records source ref + SHA so any recovery is reversible
by reverting a single commit.

| # | Date | Action | Source | SHA | Target | Backup / rollback | Status |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-23 | **Recover** PWA manifest + 4 icon assets lost in the `wasl → masaar` rename | `lahza-Private` `archive/wasl:src/app/manifest.ts`, `:public/{icon-192,icon-512,favicon,apple-touch-icon}.svg` | `5f052157dad04f22b088cec1d07c8f52f3ae0539` | `masaar` branch `feature/recover-pwa-manifest` | Source branch untouched in `lahza-Private`; recovery is one revertible commit; no history rewrite | Verified: typecheck, lint, 79 tests, build emits `/manifest.webmanifest` |

## Deliberately not recovered, with reason

| Asset | Source | Reason |
|---|---|---|
| `src/app/robots.ts`, `src/app/sitemap.ts` | `archive/wasl` | masaar sets `robots: { index: false, follow: false }` as an internal ops tool. Recovering SEO surfaces would contradict a current, deliberate product decision. |
| `public/sw.js` | `archive/wasl` | masaar registers no service worker. Shipping an unregistered SW file is dead weight and a stale-cache hazard. |
| `src/app/integrations/*` + `src/lib/integrations/{notebooklm,notebooklm-session,secure-store}.ts` + 3 OAuth API routes | `archive/wasl` | A complete Google OAuth (NotebookLM) subsystem. Re-introducing a third-party OAuth surface and secret handling into masaar is an owner decision, not a cleanup. **Awaiting approval.** |

## Structural changes NOT made (approval-gated per spec §3)

- No repo deletion, no branch deletion, no visibility change, no force push,
  no history rewrite, no domain reassignment. None attempted.
- `lahza-Private` retains all 74 branches.
