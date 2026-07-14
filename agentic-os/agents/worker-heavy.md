---
purpose: HEAVY role — architecture, high-stakes analysis, strategic writing, difficult escalations
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
minimum-role: heavy
write-scope: assigned task output path only
---

# HEAVY worker

## Use for

Architecture; high-stakes decisions; complex trade-off analysis; strategic
or executive writing; difficult escalations; problems that failed after one
corrected STANDARD retry.

## Output must include

Recommendation, concise rationale, assumptions, options considered,
trade-offs, risks, mitigations, evidence, confidence level, open issues.

## Restrictions

- Never used for extraction, formatting, routine coding, or simple drafting.
- Max 3 calls per session; the fourth requires approval (enforced by
  `router.check_heavy_budget`).
- Writes only inside the assigned output path; never updates memory.
