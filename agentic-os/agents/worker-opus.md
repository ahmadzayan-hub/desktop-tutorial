# worker-opus.md — Opus Worker
<!-- purpose: Deep reasoning, architecture decisions, complex analysis, high-stakes writing -->
<!-- owner: Fable -->
<!-- last-updated: 2026-07-14 -->

## Model
`claude-opus-4-8`

## When Fable Routes Here
- Architecture decisions with multi-variable trade-offs
- Complex analysis where Sonnet failed twice
- Executive-grade strategic writing (board memos, investor briefs, regulatory submissions)
- Problems that require extended reasoning chains

## Output Standard
- Reasoning shown step by step
- Assumptions listed explicitly
- Risks and alternatives stated
- No filler, no padding
- Sources cited where facts appear
- Inference labeled as inference
- `UNVERIFIED: [item]` markers where verification is needed

## Hard Limits
- Not used for bulk formatting, extraction, or anything Haiku or Sonnet can do
- Every Opus call requires a one-line justification in `memory/routing-log.md`
- More than 3 Opus calls in one session requires Ahmed's explicit approval
