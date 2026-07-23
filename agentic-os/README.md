---
purpose: Entry point — what the Agentic OS is, how to run it, where everything lives
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Agentic OS

A tool-agnostic operating layer for this multi-project workspace:
role-based orchestration, risk-based routing, strict domain isolation,
approval-controlled autonomy, evidence-based verification, governed memory,
cost governance, security controls, migration safety, and evals — as working
code, not just documents.

## Quick start

```bash
cd agentic-os
python3 -m pytest                      # 107 tests, no network, no deps
PYTHONPATH=src python3 -m agentic_os.cli init
PYTHONPATH=src python3 -m agentic_os.cli status
PYTHONPATH=src python3 -m agentic_os.cli task create "Draft report" --domain system
PYTHONPATH=src python3 -m agentic_os.cli eval run
PYTHONPATH=src python3 -m agentic_os.cli doctor
```

Zero runtime dependencies (stdlib only) by design — no package installation
(Checkpoint C) is needed to operate the OS. `pip install -e .[dev]` adds the
`agentic-os` entry point plus pytest/ruff, and requires Checkpoint C approval.

## Map

| Where | What |
| --- | --- |
| `OS.md`, `guardrails.md` | Kernel and guardrails (PROTECTED — Checkpoint B) |
| `config/` | Machine-readable policy (models, routing, budgets, domains, approvals, verification, security, environments, logging) |
| `agents/`, `skills/` | Role definitions and skill contracts + registries |
| `tools/` | Tool registry (deny by default) and adapters |
| `schemas/` | JSON Schemas for tasks, evidence, verification, artifacts, tools, transfers, risks, incidents |
| `memory/` | SQLite state (authoritative, gitignored) + markdown exports, sessions, migration records |
| `brain/` | Domain-partitioned knowledge (one domain per folder), templates, lessons |
| `exchange/` | Controlled cross-domain transfer workflow |
| `evals/` | Golden tasks, graders, regression results |
| `src/agentic_os/` | Implementation (orchestration, security, memory, verification, tools, migration, evals, reporting, CLI) |
| `tests/` | Unit, integration, security, migration, and eval tests |
| `_archive/` | Approved obsolete files (nothing is ever deleted) |

## CLI

`init, scan, migration-plan, migrate --dry-run/--execute, rollback,
task create/list/show/update, route, verify, status, tool list/health,
risk list, incident list, eval run, export-markdown, compact-memory, doctor`
— all support `--json`, exit non-zero on failure, and append to the audit log.

## Honesty notes

- Enforcement status of every control is in `guardrails.md` — several
  controls are PARTIALLY-ENFORCED or POLICY-ONLY and say so.
- Cost ceilings and billing type (`usage-type`) are TODO pending owner input.
- The spec targets Python 3.12; this environment runs 3.11 and the code
  supports both (`requires-python >= 3.11`).
