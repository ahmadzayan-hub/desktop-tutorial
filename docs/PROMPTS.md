# Mutabasir · Prompt Layers

The production prompts are the irreplaceable IP. They have been tuned against real UAE government documents. Do not paraphrase casually.

## Layer 1 · Project Brain

The database. See `supabase/migrations/0001_initial_schema.sql`.

## Layer 2 · Ingestion (six prompts)

All ingestion prompts share a system message contract:

- Never invent values. Missing fields go in `missing_fields[]` with a reason.
- Every value carries `citation_page`, `citation_quote` (≤300 chars), `confidence` (HIGH/MEDIUM/LOW).
- Formal Arabic government register: `وفق الخطة المعتمدة` not `حسب الخطة`. No transliterated English. No em-dashes.
- Output: JSON only, no prose, no markdown fences.

Prompt files (Phase 2):

- `src/lib/prompts/ingestion/contract.ts`
- `src/lib/prompts/ingestion/mpr.ts`
- `src/lib/prompts/ingestion/bafo.ts`
- `src/lib/prompts/ingestion/mom.ts`
- `src/lib/prompts/ingestion/invoice.ts`
- `src/lib/prompts/ingestion/technical-note.ts`

Tender-evaluation extensions (Phase 5):

- `src/lib/prompts/ingestion/tender-submission.ts`
- `src/lib/prompts/ingestion/evaluation-criteria.ts`

## Layer 3 · Composition

Input: brief + extracted facts for one project.
Output: 8-12 ordered sections from the library, each with reason + fact_ids; clarifying questions; honest framing note; proposed status ribbon.

File (Phase 3): `src/lib/prompts/composition.ts`

## Layer 4 · Quality Gate

11 gates returned with status (PASS/FAIL/WARN), evidence, fix suggestion. Overall grade (A/B+/B/C/F), `would_present_to_board`, `blocked_from_publish`.

File (Phase 4): `src/lib/prompts/quality-gate.ts`

## Layer 5 · Voice

- `voice/pdf.ts` — rendered HTML for the A4 dashboard
- `voice/whatsapp.ts` — 5-line bilingual summary, 0-2 emoji max
- `voice/arabic-letter.ts` — formal Director-General letter, Arabic-Indic numerals for refs, Western numerals for AED amounts

Full prompt text is committed verbatim per Part 7 of the master spec.
