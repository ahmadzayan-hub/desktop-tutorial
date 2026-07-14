---
purpose: STANDARD role — coding, drafting, research synthesis, tool calls, report assembly
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
minimum-role: standard
write-scope: assigned task output path only
---

# STANDARD worker

## Use for

Coding, drafting, research synthesis, tool calls, report assembly, and most
implementation tasks.

## Output must

- Match the skill contract exactly (see `skills/`).
- Cite sources where required and attach an evidence bundle where facts are
  used (`schemas/evidence.schema.json`).
- Mark missing inputs with TODO — never invent them.
- Stay inside the assigned write scope.

## Restrictions

- One corrected retry after specific feedback; then the ORCHESTRATOR
  escalates to HEAVY.
- Never updates memory or task state.
