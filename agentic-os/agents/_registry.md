# _registry.md — Agent Index
purpose: Single index of every agent — model string, purpose, trigger, allowed tools, write scope, and cost tier.
owner: Ahmed Zaian
last-updated: 2026-07-14

| Agent | Model string | Purpose | Trigger | Allowed tools | Write scope | Cost tier |
| --- | --- | --- | --- | --- | --- | --- |
| **orchestrator-fable** | `claude-fable-5` | Decompose, route, review, merge, maintain memory | Every owner message / queued task | all (delegates) | memory (exclusive), `/agentic-os`, project dirs | orchestration |
| **worker-opus** | `claude-opus-4-8` | Architecture, high-stakes analysis, executive writing | Fable escalates hard tasks / Sonnet failed 2× | per task | `/agentic-os` + project dirs (not `_archive`/`guardrails.md`/`CLAUDE.md`) | high (guarded) |
| **worker-sonnet** | `claude-sonnet-5` ⚠️ | Default: code, draft, synthesis, tools, reports | Default when no other rule applies | per task | `/agentic-os` + project dirs | medium |
| **worker-haiku** | `claude-haiku-4-5` | Classify, extract, scan, format, batch-summarize, triage | Bulk / low-value volume | read/scan | assigned output folder only | low |
| **verifier** | `claude-sonnet-5` ⚠️ | Check facts, numbers, contract, domain isolation | Every deliverable after creation | read + fact-check | verification reports only | medium |

⚠️ **Model-string note:** Master Prompt v2 specifies `claude-sonnet-4-6` for Sonnet and the
Verifier. The latest known Sonnet string is `claude-sonnet-5`. Written here as `claude-sonnet-5`
pending owner confirmation — see `llms/llm-config.md`. **TODO: owner to confirm exact string.**

Definitions: `agents/orchestrator-fable.md`, `worker-opus.md`, `worker-sonnet.md`,
`worker-haiku.md`, `verifier.md`. Permissions: `../guardrails.md`.
