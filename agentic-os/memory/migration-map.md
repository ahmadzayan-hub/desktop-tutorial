---
purpose: Approved-pending migration map — every file keeps its place; ask-me rows need owner decisions
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Migration map (Checkpoint A material)

Full machine-readable map: `agentic-os migration-plan --json`
(regenerated on demand; 225 rows with per-file sha256). Summary:

| Action | Files | Meaning |
| --- | --- | --- |
| keep | 39 | confidently classified; stays in place |
| ask-me | 186 | stays in place; domain assignment needs owner confirmation |
| copy/move/archive/rename | 0 | nothing is moved in this bootstrap |

Proposed domain classification (defaults applied, pending confirmation):

| Path | Proposed domain | Classification | Confidence |
| --- | --- | --- | --- |
| agentic-os/, .github/, docs/, root infra files | system | internal | high |
| landing/ (Beyond Style UAE) | brand | internal | high |
| src/, public/ (Lahza coffee-gifts app) | bcgt | confidential | LOW — ask-me: is Lahza a BCGT activity or its own brand? |
| wisal-web/, wisal-desktop/, android-wife-assistant/, telegram-wife-assistant/ | personal | confidential | LOW — ask-me: personal project or brand/bcgt product? |
| agent-os/ (legacy Wisal docs workspace) | system | internal | LOW — ask-me: keep as-is, fold into agentic-os/brain, or archive? |

## ask-me questions for the owner
1. Lahza (root app): which domain — bcgt, brand, or a new one?
2. Wisal family: personal or a business domain?
3. Legacy agent-os/: keep untouched, merge its memory/brain content into
   agentic-os/ via the exchange workflow, or archive under _archive/?

No file is moved, renamed, archived, or deleted until these are answered
and the map is approved (Checkpoint A). Rollback: n/a — nothing moved.
