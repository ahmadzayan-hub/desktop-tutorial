---
purpose: Human-readable tool registry (authoritative data: tools-config.json)
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Tool registry

Authoritative machine-readable registry: `tools-config.json`
(schema: `schemas/tool.schema.json`). Tools are denied by default;
role, domain, action, and environment must all be allowed.

| Tool | Purpose | External side effect | Approval | Health |
| --- | --- | --- | --- | --- |
| filesystem-local | task-scoped file IO | no | no | untested |
| sqlite-state | authoritative state store | no | no | untested |
| git-local | task-branch version control | yes (push) | yes | untested |

No tool is healthy without a recorded test (`agentic-os tool health <id>`).
Repeated failures (3 consecutive) auto-suspend the tool and open an incident.
