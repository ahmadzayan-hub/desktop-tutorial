---
purpose: Plan and execute file migration safely — inventory, map, approval, batches, hashes, rollback
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
minimum-role: orchestrator
write-scope: files named in the approved migration map; memory/migration-*.md; memory/rollback-map.json
deliverable: executed migration batches with verification report and rollback map
structure: inventory, migration map table, batch results, exception list
language: en
length: as needed; map table one row per file
input-contract: read-only scan of the project tree (agentic-os scan)
output-contract: every file has action keep/copy/move/archive/rename/ask-me; hashes recorded pre and post; rollback map saved; nothing deleted
verification-level: enhanced
success-criteria: counts and hashes match after every batch; rollback map restores originals; zero deletions
acceptance-tests: tests/migration/test_migration.py
required-evidence: inventory hashes, per-batch hash comparison, rollback map file
prohibited-content: delete actions; unapproved moves; overwrites of existing destinations
failure-conditions: execution without Checkpoint A approval; hash mismatch; missing rollback
review-owner: Ahmed Zaian
---

# /migrate

Workflow: `agentic-os scan` → `agentic-os migration-plan` → present at
Checkpoint A → after approval `agentic-os migrate --execute --approved`
(small batches, hash-verified) → `agentic-os rollback` remains available.
The executor refuses non-dry-run execution without the approval flag.
