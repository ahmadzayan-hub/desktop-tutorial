---
purpose: Risk register (authoritative: risks table; seeded at bootstrap)
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Risk register

| risk-id | description | domain | likelihood | impact | controls | owner | residual | review | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RISK-001 | Confidential material (rta/bcgt/personal) pasted into LLM prompts before retention settings confirmed | system | medium | high | llm-config TODO gate; classification defaults | Ahmed Zaian | medium until confirmed | 2026-08-13 | open |
| RISK-002 | Controls outside code paths are policy-only and can be bypassed by a human operator | system | medium | medium | enforcement matrix in guardrails.md keeps this visible; IP-001 | Ahmed Zaian | medium | 2026-08-13 | open |
| RISK-003 | Heuristic injection/secret detectors miss novel patterns | system | medium | medium | layered checks, evals, failure-library grows over time | Ahmed Zaian | low-medium | 2026-08-13 | open |
| RISK-004 | 186 files classified low-confidence (ask-me) could get wrong domain defaults | system | high | low | no action taken on ask-me rows; owner review pending | Ahmed Zaian | low | 2026-07-27 | open |
