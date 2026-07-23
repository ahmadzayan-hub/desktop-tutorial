---
purpose: Human-readable view of the cost ledger (authoritative data: cost_events table)
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Cost ledger

Authoritative record: `cost_events` table in `memory/state.db`
(fields per spec section 25: date, task-id, role, model, provider,
usage-type, input/output units, estimated/actual cost, currency,
calculation-basis, confidence).

Rules: costs are never fabricated; subscription usage records
`actual-cost: unavailable`; the session stops before exceeding the
configured ceiling (ceilings currently TODO in `config/budgets.yaml`);
the fourth HEAVY call in a session requires approval.

No entries yet — the ledger fills as tasks run
(`agentic_os.reporting.cost.record_llm_call`). Weekly totals appear in
`/status` as measured, estimated, or "cost unavailable".
