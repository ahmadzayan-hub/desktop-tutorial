---
purpose: Registry of all agent roles with model bindings and write scopes
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Agent registry

Model bindings come from `config/models.yaml`; JSON/YAML artifacts used by
roles are documented here per spec section 8.

| Role | File | Model (config) | Write scope | Talks to user |
| --- | --- | --- | --- | --- |
| orchestrator | `orchestrator.md` | claude-fable-5 | memory, routing, decisions, costs, risks, incidents | yes (only role) |
| heavy | `worker-heavy.md` | claude-fable-5 | assigned task output path only | no |
| standard | `worker-standard.md` | claude-sonnet-5 | assigned task output path only | no |
| light | `worker-light.md` | claude-haiku-4-5-20251001 | assigned output location only | no |
| verifier | `verifier.md` | claude-sonnet-5 (separate context) | verification records only | no |

Related machine-readable files: `config/models.yaml` (bindings),
`schemas/task.schema.json` (task contract), `tools/tools-config.json`
(which roles may use which tools).
