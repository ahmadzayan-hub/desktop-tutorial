---
purpose: Adapter notes for running the Agentic OS under Claude Code
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Claude Code adapter

The only vendor adapter shipped, because Claude Code is the only coding tool
confirmed available at bootstrap time.

- Root `CLAUDE.md` points Claude Code at `/agentic-os/OS.md` (and `AGENTS.md`
  does the same for tools that read that convention).
- Model bindings in `config/models.yaml` use IDs confirmed in this
  environment; re-confirm availability before relying on them elsewhere.
- Keep generated edits on task branches (`agent/TASK-YYYYMMDD-NNN-*`) and
  require diff review before merging into the protected branch.
- External actions remain disabled (`config/environments.yaml`); Claude Code
  permission prompts are an additional, tool-level control — not a
  replacement for Checkpoints C/D.

For Cursor/Windsurf/other tools: add an equivalent pointer file referencing
`/agentic-os/OS.md`; add adapter notes here only once the tool is actually
in use.
