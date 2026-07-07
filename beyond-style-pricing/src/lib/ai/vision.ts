import { z } from 'zod';
import { extractJson, aiConfigured } from './client';

/**
 * Product photo analysis with hard guardrails:
 *  - never claims exact material, karat, purity, or weight
 *  - always returns a confidence level and the list of missing inputs
 *  - suggested prices are RANGES for orientation only; the formula engine
 *    computes the real price after the user confirms inputs.
 */

export const PhotoEstimateSchema = z.object({
  productType: z.enum([
    'NECKLACE', 'BRACELET', 'RING', 'EARRINGS', 'PENDANT', 'CHAIN', 'SET', 'OTHER',
  ]),
  visibleAppearance: z.string(), // e.g. "gold-tone", "silver-tone", "rose-gold-tone"
  possibleMaterials: z.array(z.string()).max(4), // candidates only, never confirmed
  components: z.object({
    chain: z.boolean(),
    clasp: z.boolean(),
    pendant: z.boolean(),
    stones: z.boolean(),
    engraving: z.boolean(),
    packagingVisible: z.boolean(),
  }),
  designComplexity: z.enum(['SIMPLE', 'MEDIUM', 'COMPLEX']),
  makingChargeLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  suggestedCategory: z.string(),
  suggestedTitleEn: z.string(),
  suggestedTitleAr: z.string(),
  suggestedDescriptionEn: z.string(),
  suggestedDescriptionAr: z.string(),
  customerPriceRangeAed: z.object({ min: z.number(), max: z.number() }),
  suggestedCostingFields: z.object({
    makingCharge: z.number().optional(),
    chainCost: z.number().optional(),
    claspCost: z.number().optional(),
    stoneCost: z.number().optional(),
    packagingCost: z.number().optional(),
  }),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  confidenceReason: z.string(),
  assumptions: z.array(z.string()),
  cannotConfirmFromPhoto: z.array(z.string()),
  missingInputsToAskUser: z.array(z.string()),
});

export type PhotoEstimate = z.infer<typeof PhotoEstimateSchema>;

const SYSTEM_PROMPT = `You are the vision module of the Beyond Style UAE jewelry pricing system.
Analyze the product photo and return ONLY a JSON object with this exact shape:
{
  "productType": "NECKLACE|BRACELET|RING|EARRINGS|PENDANT|CHAIN|SET|OTHER",
  "visibleAppearance": "gold-tone | silver-tone | rose-gold-tone | mixed | ...",
  "possibleMaterials": ["candidate materials by APPEARANCE only, e.g. 'gold-plated stainless steel', 'silver 925 (unverified)'"],
  "components": {"chain":bool,"clasp":bool,"pendant":bool,"stones":bool,"engraving":bool,"packagingVisible":bool},
  "designComplexity": "SIMPLE|MEDIUM|COMPLEX",
  "makingChargeLevel": "LOW|MEDIUM|HIGH",
  "suggestedCategory": "...",
  "suggestedTitleEn": "...", "suggestedTitleAr": "...",
  "suggestedDescriptionEn": "...", "suggestedDescriptionAr": "...",
  "customerPriceRangeAed": {"min": number, "max": number},
  "suggestedCostingFields": {"makingCharge"?: number, "chainCost"?: number, "claspCost"?: number, "stoneCost"?: number, "packagingCost"?: number},
  "confidence": "HIGH|MEDIUM|LOW",
  "confidenceReason": "...",
  "assumptions": ["..."],
  "cannotConfirmFromPhoto": ["..."],
  "missingInputsToAskUser": ["..."]
}

NON-NEGOTIABLE RULES:
1. NEVER state exact material, gold karat, silver purity, weight, dimensions, or authenticity — a photo cannot prove them. Describe appearance only ("gold-tone").
2. "cannotConfirmFromPhoto" MUST always include at least: exact material, purity/karat, weight in grams, supplier cost.
3. "missingInputsToAskUser" MUST list every costing input the user still needs to provide (weight, material confirmation, supplier quote, dimensions...).
4. Price range is orientation only for the UAE market — the formula engine sets the real price.
5. If the image is unclear, set confidence to LOW and explain why.
6. Arabic text must be natural, business-friendly Modern Standard Arabic.`;

// Baseline safety list merged into every result, whatever the model says.
const ALWAYS_UNCONFIRMABLE = [
  'Exact material and authenticity',
  'Gold karat / silver purity',
  'Weight in grams',
  'Supplier cost',
];

export async function analyzeProductPhoto(imageDataUri: string): Promise<PhotoEstimate> {
  if (!aiConfigured()) {
    throw new Error('AI_NOT_CONFIGURED');
  }
  const result = await extractJson({
    model: 'vision',
    parse: (raw) => PhotoEstimateSchema.parse(raw),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this jewelry product photo for pricing.' },
          { type: 'image_url', image_url: { url: imageDataUri } },
        ],
      },
    ],
  });
  return applyVisionGuardrails(result);
}

/** Post-hoc guardrail: scrub any hallucinated certainty from the model output. */
export function applyVisionGuardrails(est: PhotoEstimate): PhotoEstimate {
  const scrub = (s: string) =>
    s.replace(/\b(18|21|22|24)\s*[kK](arat)?\b/g, 'unverified karat')
     .replace(/\b(\d+(\.\d+)?)\s*(g|grams|جرام)\b/g, 'unverified weight');
  const missing = new Set([...est.missingInputsToAskUser]);
  ['Weight in grams', 'Material confirmation', 'Supplier quote'].forEach((m) => missing.add(m));
  return {
    ...est,
    suggestedTitleEn: scrub(est.suggestedTitleEn),
    suggestedDescriptionEn: scrub(est.suggestedDescriptionEn),
    possibleMaterials: est.possibleMaterials.map(
      (m) => (m.toLowerCase().includes('unverified') ? m : `${m} (unverified)`)
    ),
    cannotConfirmFromPhoto: Array.from(
      new Set([...ALWAYS_UNCONFIRMABLE, ...est.cannotConfirmFromPhoto])
    ),
    missingInputsToAskUser: Array.from(missing),
  };
}
