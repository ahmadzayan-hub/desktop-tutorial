# SKILL: status
purpose: Health-check skill — on "/status" or "status", Fable reports OS state in under 25 lines.
owner: Ahmed Zaian
last-updated: 2026-07-14

## Output contract
- **deliverable:** terminal report (markdown), **under 25 lines**
- **structure:** the six sections below, in order
- **language:** en (or bilingual on request)
- **length:** ≤ 25 lines
- **domain:** cross-cutting (system meta — not a knowledge domain; reads all memory, writes none)
- **min-tier:** haiku (Fable assembles; no content creation)

## Trigger
Owner types `/status` or `status`.

## Report (Fable produces, ≤25 lines)
1. **Progress per domain** — done / in progress / blocked (from `memory/progress.md`), for
   `rta | bcgt | mba | brand | personal`.
2. **Top 5 queue items** (from `memory/queue.md`).
3. **Memory health** — count of raw session logs in `memory/sessions/`, date of last compaction,
   and files older than 30 days.
4. **Tool health** — any MCP tools failing auth or unused 30+ days (from `mcp/tools-registry.md`).
5. **Cost this week** — from `memory/routing-log.md`, plus Opus call count.
6. **Open TODOs requiring owner input.**

## Rules
- Read-only. Never mutates memory.
- If a source file is missing/empty, say so on that line rather than inventing a value.
