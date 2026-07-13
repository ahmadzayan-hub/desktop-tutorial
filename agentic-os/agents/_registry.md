# _registry.md — Agent Registry
<!-- purpose: Index of all agents: model string, purpose, trigger, allowed tools, write scope, cost tier -->
<!-- owner: Fable -->
<!-- last-updated: 2026-07-14 -->

| Agent | Model String | Tier | Purpose | Default Trigger | Allowed Tools | Write Scope |
|---|---|---|---|---|---|---|
| Fable (Orchestrator) | claude-fable-5 | — | Decompose, route, review, merge, maintain memory | Every session start; every user request | All tools | Full (including memory/) |
| Sonnet (Worker) | claude-sonnet-4-6 | Default | Coding, drafting, synthesis, tool calling, report assembly | Any task not matching Haiku or Opus rules | All except external write tools | /agentic-os/ + project working dirs |
| Opus (Worker) | claude-opus-4-8 | High | Architecture decisions, complex analysis, high-stakes writing | Fable judges task genuinely hard; Sonnet failed twice | All except external write tools | /agentic-os/ + project working dirs |
| Haiku (Worker) | claude-haiku-4-5 | Cheap | Classification, extraction, formatting, scanning, batch summaries | High-volume, low-complexity, mechanical tasks | Read tools only | Assigned output folder only |
| Verifier | claude-sonnet-4-6 | Default | Fact-check, contract compliance, domain isolation check | After every worker deliverable, before it reaches Ahmed | Read tools + verification report write | Verification reports only |
