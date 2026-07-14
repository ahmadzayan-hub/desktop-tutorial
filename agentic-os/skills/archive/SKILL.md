---
purpose: Archive an approved obsolete file under _archive/ instead of deleting it
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
minimum-role: orchestrator
write-scope: _archive/ and the migration records in memory/
deliverable: file moved to _archive/ with hash record and reason
structure: original path, archive path, hash, approval reference, reason
language: en
length: one record per archived file
input-contract: file path plus explicit owner approval for archiving
output-contract: file exists under _archive/ with identical hash; original location recorded; nothing deleted
verification-level: standard
success-criteria: hash identical before and after; approval recorded; rollback possible
acceptance-tests: tests/migration/test_migration.py::test_execute_verifies_hashes_and_rollback_restores
required-evidence: sha256 before/after and the approval record
prohibited-content: deletion; archiving unapproved files; overwriting archive contents
failure-conditions: hash mismatch; missing approval; original still referenced by live code
review-owner: Ahmed Zaian
---

# /archive

Archiving is a migration-map `archive` action executed through
`agentic-os migrate` with Checkpoint A approval — the same batching, hash
verification, and rollback guarantees apply. Delete does not exist.
