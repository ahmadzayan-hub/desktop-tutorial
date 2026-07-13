# llm-config.md — Model Configuration
<!-- purpose: Model strings, API vs subscription boundary, pricing notes, local fallback -->
<!-- owner: Ahmed Zaian -->
<!-- last-updated: 2026-07-14 -->

## Model Strings

| Tier | Model ID | Notes |
|---|---|---|
| Orchestrator | `claude-fable-5` | Fastest reasoning model, orchestration only |
| Default Worker | `claude-sonnet-4-6` | Best cost/quality balance for most tasks |
| Heavy Worker | `claude-opus-4-8` | Highest capability; use sparingly (see guardrails) |
| Cheap Worker | `claude-haiku-4-5-20251001` | Lowest cost; batch and classification tasks |
| Verifier | `claude-sonnet-4-6` | Same as default worker; independent instance |

---

## API vs Subscription Boundary

`TODO: [Fill in which tiers run on Claude Code subscription vs which require API key + billing]`

Example structure to fill:
- Subscription (Claude Code Pro): Fable, Sonnet worker, Verifier, Haiku worker
- API key (Anthropic Console): Opus worker (or all if running via API)

---

## Pricing Notes (approximate — verify on Anthropic console)

| Model | Input | Output | Notes |
|---|---|---|---|
| claude-haiku-4-5 | $0.80/M tokens | $4/M tokens | Cheapest tier |
| claude-sonnet-4-6 | $3/M tokens | $15/M tokens | Default worker |
| claude-opus-4-8 | $15/M tokens | $75/M tokens | Use only when justified |
| claude-fable-5 | `UNVERIFIED: check Anthropic pricing page` | — | New model |

---

## Local Fallback

`TODO: [Identify if Ollama or other local LLM should be used as fallback for any tier]`

Current status: no local fallback configured.
