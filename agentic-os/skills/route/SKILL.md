---
purpose: Route a task to the cheapest capable role and record the decision
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
minimum-role: orchestrator
write-scope: routing_events in the state store only
deliverable: recorded routing decision
structure: task-id, task-type, chosen role, reason
language: en
length: one structured record per decision
input-contract: existing task-id plus a task-type from config/routing.yaml
output-contract: role is one of light/standard/heavy/verifier; reason recorded; escalations reference the failed attempt
verification-level: basic
success-criteria: decision matches config/routing.yaml defaults; every decision persisted
acceptance-tests: tests/unit/test_routing_and_limits.py; tests/integration/test_cli_smoke.py::test_route_and_verify
required-evidence: routing_events rows in the state store
prohibited-content: unrecorded routing; HEAVY for extraction/formatting/routine work
failure-conditions: fourth HEAVY call without approval; skipping the corrected-retry step
review-owner: Ahmed Zaian
---

# /route

Run `agentic-os route <task-id> --task-type <type>`. Escalation: one
corrected retry at the same role, then LIGHT→STANDARD→HEAVY; HEAVY failures
go to a human. Provider-outage retries are logged but don't count as
quality failures.
