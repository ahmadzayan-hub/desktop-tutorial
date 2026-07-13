# guardrails.md — Binding Permissions, Cost Caps, Forbidden Actions
purpose: The binding guardrails Fable enforces on every task. This file must not be edited without explicit human approval in-session.
owner: Ahmed Zaian
last-updated: 2026-07-14

> Fable enforces this file on **every** task, before and after worker execution. If any check
> here fails, Fable stops and reports rather than proceeding.

## 1. Write permissions

| Agent | Read | Write |
| --- | --- | --- |
| **Fable** (orchestrator) | everything | memory files (exclusive), `/agentic-os` docs, project dirs |
| **Haiku** | everything | **only** its assigned output folder for the current task (read-only elsewhere) |
| **Sonnet** | everything | inside `/agentic-os` and project working dirs only |
| **Opus** | everything | inside `/agentic-os` and project working dirs only |
| **Verifier** | everything | **only** verification reports |

Hard rules:
- **Only Fable updates memory files.** Workers never touch `memory/`.
- Sonnet/Opus **never** write in `_archive/`, `guardrails.md`, or `CLAUDE.md`.
- Nothing writes outside the repo working tree.

## 2. Cost controls

- **Per-session API cost ceiling: `TODO: SET VALUE` (e.g. 5 USD).** Fable stops and asks the
  owner before exceeding it.
- **Opus calls** require a one-line justification in `memory/routing-log.md`.
- **More than 3 Opus calls in one session requires the owner's approval.**
- Fable logs a running cost note per task in the routing log.

## 3. Forbidden without explicit human approval in the same session

1. **Deleting any file** — archive to `_archive/` instead.
2. **Sending anything external** — email, WhatsApp, social posts, or API writes to third-party
   systems.
3. **Installing packages** or modifying system configuration.
4. **Editing `guardrails.md` or `CLAUDE.md`.**

Approval must be explicit and in the same session; approval in a prior session does not carry over.

## 4. Accuracy rules (binding on ALL agents)

- No invented facts, figures, sources, prices, clauses, or technical details.
- Uncertainty is stated explicitly.
- Unverifiable items are marked `UNVERIFIED: [what must be checked]`.
- Inference is labeled as inference.

## 5. Domain isolation (binding — see CLAUDE.md §5)

- One domain tag per task/file. No cross-domain loading, including "for context."
- `rta` content never leaks into `brand` or `bcgt` outputs.
- Cross-domain requests → Fable stops and asks the owner.

## 6. Enforcement checklist (Fable runs this per task)

- [ ] Task carries exactly one domain tag.
- [ ] Assigned tier is the cheapest that can do it; escalation logged if raised.
- [ ] Worker write scope matches this table.
- [ ] Output contract met (else returned with the named violation).
- [ ] Verification passed, or output flagged `UNVERIFIED: [reason]`.
- [ ] No forbidden action taken without in-session approval.
- [ ] Routing + cost logged in `memory/routing-log.md`.
