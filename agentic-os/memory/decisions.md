# decisions.md — Decision Log
purpose: Durable record of decisions — date, decision, reason, alternatives rejected. Only Fable appends.
owner: Ahmed Zaian
last-updated: 2026-07-14

| Date | Decision | Reason | Alternatives rejected |
| --- | --- | --- | --- |
| 2026-07-14 | Build Agentic OS as an **additive** scaffold; move/delete nothing yet | Existing repo is a code monorepo; its files don't map to the OS domains (rta/bcgt/mba/brand/personal). Prompt §9.2 mandates approval before moving | (a) Bulk-migrate now — rejected: destructive, wrong domain fit; (b) do nothing — rejected: owner asked to execute |
| 2026-07-14 | Record Sonnet/Verifier string as `claude-sonnet-5` with a TODO | Prompt v2's `claude-sonnet-4-6` doesn't match the latest known Sonnet id; accuracy rule forbids silently shipping a possibly-wrong string | Silently using `claude-sonnet-4-6` — rejected: may be outdated |
