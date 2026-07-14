---
purpose: Decision log — durable decisions with rationale
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Decisions

## 2026-07-14 — Bootstrap decisions
- D-001: Build agentic-os/ as a purely additive tree; no existing file
  moved, renamed, archived, or deleted (Checkpoint A scope kept empty).
- D-002: Keep the legacy `agent-os/` (Wisal-scoped, Arabic docs) untouched;
  its fate is an ask-me item for the owner.
- D-003: Zero runtime dependencies (stdlib only) so operating the OS never
  triggers Checkpoint C package installs. Pydantic replaced by validated
  dataclasses; a minimal YAML-subset parser ships in utils/yaml_io.py.
- D-004: Python 3.11 compatibility (environment constraint; spec asked 3.12).
- D-005: SQLite at memory/state.db is authoritative; markdown is exported.
