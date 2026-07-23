---
purpose: Run the VERIFIER check suite on a task deliverable at its required verification level
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
minimum-role: verifier
write-scope: verification records in the state store only
deliverable: verification result record
structure: result, level, checks performed, findings, independence record
language: en
length: one structured record per run
input-contract: task-id, verification level, artifact paths, optional evidence bundle
output-contract: result is exactly one of PASS, PASS-WITH-LIMITATIONS, FAIL, NOT-INDEPENDENTLY-VERIFIABLE with named findings
verification-level: standard
success-criteria: every check for the level executed; findings name exact violations; deliverable never modified
acceptance-tests: tests/integration/test_memory_and_verify.py
required-evidence: recorded checks list and findings in the verifications table
prohibited-content: rewriting or fixing the deliverable; PASS based on confidence or style
failure-conditions: human-mandatory auto-passing; skipped checks; unrecorded result
review-owner: Ahmed Zaian
---

# /verify

Run `agentic-os verify <task-id> [--level L] [--paths ...]`
(implementation: `src/agentic_os/verification/`). High-risk tasks require
enhanced or human-mandatory; human-mandatory never auto-passes.
