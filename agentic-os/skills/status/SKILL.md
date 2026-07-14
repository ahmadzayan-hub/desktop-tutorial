---
purpose: Report current OS state when the user says /status or status
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
minimum-role: orchestrator
write-scope: none (read-only report)
deliverable: status snapshot text
structure: single block, one line per metric, under 25 lines
language: en
length: fewer than 25 lines
input-contract: none (reads SQLite store and memory/ tree)
output-contract: progress by domain; top 5 queue items; blocked tasks; active and orphan locks; raw/compacted session counts; last compaction; stale files >30d; tool failures and untested tools; HEAVY calls this week; measured/estimated cost or cost unavailable; security alerts; domain-isolation alerts; open protected-file changes; open TODOs
verification-level: basic
success-criteria: every listed metric present or explicitly marked unavailable; under 25 lines
acceptance-tests: tests/integration/test_cli_smoke.py::test_init_and_status
required-evidence: none (metrics read directly from the authoritative store)
prohibited-content: invented metrics; secrets; hidden chain-of-thought
failure-conditions: missing metric silently omitted; more than 25 lines; fabricated numbers
review-owner: Ahmed Zaian
---

# /status

Run `agentic-os status` (implementation:
`src/agentic_os/reporting/status.py`). Metrics that cannot be measured are
reported as unavailable — never invented.
