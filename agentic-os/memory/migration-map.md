---
purpose: APPROVED migration map (Checkpoint A, 2026-07-14) — every file keeps its place
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Migration map (Checkpoint A: APPROVED 2026-07-14)

Owner approved all proposed defaults on 2026-07-14 (chat reply: "all");
approval recorded in the approvals table against TASK-20260714-001.
Confirmed domains: Lahza (src/, public/) -> bcgt; Wisal family -> personal;
legacy agent-os/ -> system, kept untouched; landing/ -> brand.

Full machine-readable map: `agentic-os migration-plan --json`
(regenerated on demand; 225 rows with per-file sha256). Summary:

| Action | Files | Meaning |
| --- | --- | --- |
| keep | 227 | classification approved; stays in place |
| ask-me | 0 | all resolved by owner approval on 2026-07-14 |
| copy/move/archive/rename | 0 | nothing is moved in this bootstrap |

Proposed domain classification (defaults applied, pending confirmation):

| Path | Proposed domain | Classification | Confidence |
| --- | --- | --- | --- |
| agentic-os/, .github/, docs/, root infra files | system | internal | high |
| landing/ (Beyond Style UAE) | brand | internal | high |
| src/, public/ (Lahza coffee-gifts app) | bcgt | confidential | approved |
| wisal-web/, wisal-desktop/, android-wife-assistant/, telegram-wife-assistant/ | personal | confidential | approved |
| agent-os/ (legacy Wisal docs workspace) | system | internal | approved (keep as-is) |

## Resolution
All three ask-me questions were answered by owner approval of the defaults
(2026-07-14). No file was moved, renamed, archived, or deleted.
Rollback: n/a — nothing moved.
