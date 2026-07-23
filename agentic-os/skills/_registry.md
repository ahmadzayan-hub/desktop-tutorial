---
purpose: Registry of installed skills with role and verification bindings
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Skill registry

| Skill | Minimum role | Verification level | Deliverable |
| --- | --- | --- | --- |
| `status/` | orchestrator | basic | <25-line status snapshot |
| `migrate/` | orchestrator | enhanced | approved batched migration with rollback |
| `verify/` | verifier | standard | verification result record |
| `route/` | orchestrator | basic | recorded routing decision |
| `archive/` | orchestrator | standard | file archived under _archive/ (never deleted) |

Every SKILL.md carries the full output contract (spec section 13); contract
completeness is checked by `agentic-os doctor` and
`tests/unit` via `check_skill_contract`.
