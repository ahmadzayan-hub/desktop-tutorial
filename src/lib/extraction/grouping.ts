import type { DbExtractedFact } from "@/types/database";
import { describeFactType } from "./mock-extractor";

export type FactGroup = "key_terms" | "performance" | "risk";

export interface GroupedFacts {
  key_terms: DbExtractedFact[];
  performance: DbExtractedFact[];
  risk: DbExtractedFact[];
}

/** Group facts by their category, ordered as key_terms -> performance -> risk. */
export function groupFactsByCategory(
  facts: DbExtractedFact[],
  locale: "en" | "ar",
): GroupedFacts {
  const g: GroupedFacts = { key_terms: [], performance: [], risk: [] };
  for (const f of facts) {
    const meta = describeFactType(f.fact_type, locale);
    g[meta.group].push(f);
  }
  return g;
}

export const FACT_GROUP_ORDER: FactGroup[] = [
  "key_terms",
  "performance",
  "risk",
];
