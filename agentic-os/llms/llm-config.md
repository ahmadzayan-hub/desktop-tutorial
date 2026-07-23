---
purpose: Model map with providers, usage types, capability notes, and fallbacks
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# LLM configuration

Machine-readable bindings: `config/models.yaml`. Facts below are limited to
what is verifiable in the active environment; unknowns are TODO — provider
facts are not invented.

| Role | Model | Provider | Usage type | Fallback |
| --- | --- | --- | --- | --- |
| orchestrator | claude-fable-5 | Anthropic | TODO (API vs subscription unconfirmed) | claude-sonnet-5 |
| heavy | claude-fable-5 | Anthropic | TODO | claude-sonnet-5 |
| standard | claude-sonnet-5 | Anthropic | TODO | claude-haiku-4-5-20251001 |
| light | claude-haiku-4-5-20251001 | Anthropic | TODO | claude-sonnet-5 |
| verifier | claude-sonnet-5 (separate context) | Anthropic | TODO | deterministic checks only |

- Capability notes: model IDs above were confirmed available in the Claude
  Code environment used to bootstrap this OS (2026-07-14). Context limits:
  TODO (not verified here; do not assume).
- Cost basis: TODO — until the owner confirms billing type, every ledger
  entry records `estimated-cost`/`actual-cost: unavailable`.
- Data-retention concerns: TODO — confirm the workspace's Anthropic data
  retention settings before placing restricted/confidential domain content
  into prompts.
- Single-model fallback: if only one model is available, all five roles
  remain separate behavioral modes with separate prompts and audit records.
- Last evaluation date: 2026-07-14 (`agentic-os eval run`, 10/10 passing).
