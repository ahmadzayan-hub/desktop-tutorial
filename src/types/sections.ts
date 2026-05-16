import type { ThemeMeta } from "@/lib/themes/types";
import type { Locale } from "@/lib/i18n/dictionary";

export type SectionId =
  | "S01"
  | "S02"
  | "S03"
  | "S04"
  | "S05"
  | "S06"
  | "S07"
  | "S08"
  | "S09"
  | "S10"
  | "S11"
  | "S12";

export type SectionVariant = "compact" | "standard" | "wide";

export interface SectionRef {
  section_id: SectionId;
  variant: SectionVariant;
  order: number;
  reason_en: string;
  reason_ar: string;
  fact_ids: string[];
}

export interface SectionContext {
  theme: ThemeMeta;
  locale: Locale;
}
