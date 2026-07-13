# Agentic OS (Claude OS)
purpose: Index and entry point for the Agentic OS — model-tier orchestration with guardrails, domain isolation, verification, and durable memory.
owner: Ahmed Zaian
last-updated: 2026-07-14

## Read order
1. `CLAUDE.md` — kernel: identity, orchestration protocol, domain rules.
2. `guardrails.md` — binding permissions, cost caps, forbidden actions.
3. `agents/_registry.md` — agent index → individual `agents/*.md`.
4. `llms/llm-config.md` — model strings + API/subscription boundary (has TODOs).
5. `MIGRATION-MAP.md` — proposed file classification (awaiting your approval).

## Layout
- `agents/` — orchestrator (Fable) + workers (Opus/Sonnet/Haiku) + verifier.
- `skills/` — skills with output contracts; `skills/status/` = `/status` health check.
- `mcp/` — MCP config + tool registry (templates; TODO to populate).
- `memory/` — `progress` · `queue` · `decisions` · `routing-log` · `archive-summaries` · `sessions/`.
- `brain/` — `knowledge/<domain>/` · `templates/` · `lessons.md`.
- `_archive/` — obsolete files (never deleted).

## 3 owner inputs still needed (see queue.md)
1. Cost ceiling → `guardrails.md` §2.
2. API vs subscription boundary + pricing → `llms/llm-config.md`.
3. Approve `MIGRATION-MAP.md` before any files move. Also confirm the Sonnet model string.

## Status
Scaffold built 2026-07-14, **non-destructive**. Not committed to git yet (placement is your call).
