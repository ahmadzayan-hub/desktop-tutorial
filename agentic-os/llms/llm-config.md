# llm-config.md — Model Strings, API/Subscription Boundary, Pricing
purpose: Canonical model strings per tier, the API-vs-subscription boundary, pricing notes, and local-fallback placeholder.
owner: Ahmed Zaian
last-updated: 2026-07-14

## Model strings per tier

| Tier | Role | Model string | Status |
| --- | --- | --- | --- |
| Orchestrator | Fable | `claude-fable-5` | confirmed by prompt |
| Worker (deep) | Opus | `claude-opus-4-8` | confirmed by prompt |
| Worker (default) | Sonnet | `claude-sonnet-5` | ⚠️ prompt v2 said `claude-sonnet-4-6`; latest known is `claude-sonnet-5` — **TODO: owner confirm** |
| Worker (bulk) | Haiku | `claude-haiku-4-5` | prompt said `claude-haiku-4-5`; exact API id may be `claude-haiku-4-5-20251001` — **TODO confirm** |
| Verifier | Sonnet-tier | `claude-sonnet-5` | ⚠️ same as Sonnet above — **TODO confirm** |

> Accuracy note: model strings above marked ⚠️/TODO are flagged rather than assumed. Do not treat
> the corrected strings as final until the owner confirms against the current API model list.

## API vs subscription boundary — **TODO (owner input required)**
Fill which tiers run on the Claude Code **subscription** vs a metered **API key**:

| Tier | Runs via | Notes |
| --- | --- | --- |
| Fable | `TODO: subscription | api` | |
| Opus | `TODO: subscription | api` | high-cost; guarded in guardrails.md |
| Sonnet | `TODO: subscription | api` | |
| Haiku | `TODO: subscription | api` | high volume — cost sensitive |
| Verifier | `TODO: subscription | api` | |

## Pricing notes — **TODO (owner input required)**
- Per-tier $/Mtok input and output: `TODO` (fill from current pricing page; do not guess).
- Per-session cost ceiling lives in `../guardrails.md` §2: `TODO: SET VALUE`.

## Local fallback
- `TODO`: local LLM fallback is a **v2 candidate**, deliberately excluded for now (add only after
  `routing-log.md` shows 3+ weeks of consistent use).
