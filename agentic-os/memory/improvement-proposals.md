---
purpose: Controlled improvement proposals — the OS never rewrites its own kernel
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Improvement proposals

## IP-001 (open)
- observed-problem: Checkpoint B (protected files) is POLICY-ONLY.
- proposed-change: pre-commit hook that blocks commits touching protected
  files without a recorded approval in the store.
- risk: low; test-method: golden task + CLI smoke; approval-status: pending.

## IP-002 (open)
- observed-problem: cost ceilings are TODO, so ceiling enforcement is idle.
- proposed-change: owner sets per-session/weekly ceilings in budgets.yaml.
- approval-status: pending owner input.
