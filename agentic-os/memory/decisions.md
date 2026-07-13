# decisions.md — Decision Log
<!-- purpose: Record of significant decisions, reasons, and alternatives rejected -->
<!-- owner: Fable -->
<!-- last-updated: 2026-07-14 -->

| Date | Decision | Reason | Alternatives Rejected |
|---|---|---|---|
| 2026-07-14 | Agentic OS lives in `/agentic-os/` subfolder alongside Next.js code | Keeps product code and OS meta-layer cleanly separated; no changes to src/ needed | Separate repo (too much friction), root-level flat files (no structure) |
| 2026-07-14 | `apps/prompt-optimizer/` archived | Old separate project; not related to Tweenz AI MBA platform | Delete (rejected — guardrails forbid deletion) |
| 2026-07-14 | `apps/tweenz/` archived | Stale duplicate of root Next.js app; root is canonical | Delete (rejected — guardrails forbid deletion) |
| 2026-07-14 | `desktop/`, `extension/`, `mobile/` kept in place | May still be active wrappers; need Ahmed confirmation before any action | Archive (deferred — needs Ahmed input) |
| 2026-07-14 | Cost ceiling left as TODO | Ahmed must set this — no sensible default can be assumed | Pre-fill with $5 USD (rejected — could be wrong) |
| 2026-07-13 | Tweenz AI chosen as product name | Memorable, distinct, no conflicts on GitHub/Vercel | TweenzStudy, AcadAI, StudAI |
| 2026-07-13 | Server+Client component split for all public pages | Next.js 14 requires Server Components to export metadata; Client Components needed for useI18n() | Single file with "use client" (rejected — breaks metadata) |
| 2026-07-13 | Rate limit fallback: in-process Map if no Upstash | App must work without Redis configured; Map gives protection without crashing | Hard-fail if no Redis (rejected — bad DX for new devs) |
