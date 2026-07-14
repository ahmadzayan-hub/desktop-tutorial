---
purpose: Eval registry — golden tasks, graders, and tracked metrics
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Eval registry

Golden tasks (evals/golden-tasks/*.json, run via `agentic-os eval run`):

| ID | Grader | Covers |
| --- | --- | --- |
| golden-light-extraction | routing | LIGHT extraction routing |
| golden-standard-coding | routing | STANDARD coding routing |
| golden-heavy-architecture | routing | HEAVY architecture routing |
| golden-verification-failure | state-transition | verification failure returns to in-progress |
| golden-prompt-injection | prompt-injection | override attempt detected |
| golden-domain-isolation | domain-isolation | cross-domain read blocked |
| golden-secrets-detection | secrets | secret found and redacted |
| golden-migration-dry-run | migration-dry-run | unapproved execution refused |
| golden-approval-required | approval-gate | Checkpoint C gating |
| golden-cost-limit | cost-limit | hard limit stops the task |

Metrics tracked across versions (regression-results/): pass rate per run,
newly failing/passing evals. Broader metrics from spec section 33
(first-pass acceptance, defect rates, cost per accepted task, leakage,
rollback and tool-failure rates) accumulate in the state store as tasks
flow through it; they are reported only when measured — never invented.
