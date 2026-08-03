// Presentation Designer: picks a set of visual "hints" for the
// published dashboard based on which fact types were extracted. Every
// hint corresponds to a component or layout the UI already knows how
// to render — the designer just declares intent.

import type { DbExtractedFact, Subject } from "@/types/database";
import type { ReviewFinding } from "./types";

export type PresentationHint =
  | "quality_ring"
  | "confidence_bar"
  | "big_number_value"
  | "milestone_ratio"
  | "spi_cpi_pair"
  | "sla_availability"
  | "risk_callout"
  | "governance_summary";

interface Result {
  hints: readonly PresentationHint[];
  findings: readonly ReviewFinding[];
}

/**
 * Given the corpus and subject, decide which visualisations to promote
 * and raise design findings when key numbers are absent.
 */
export function designPresentation(
  subject: Subject,
  facts: readonly DbExtractedFact[],
): Result {
  const hints = new Set<PresentationHint>([
    "quality_ring",
    "confidence_bar",
  ]);
  const findings: ReviewFinding[] = [];
  const factTypes = new Set(facts.map((f) => f.fact_type));

  if (factTypes.has("contract_value")) hints.add("big_number_value");
  if (factTypes.has("schedule_status")) hints.add("milestone_ratio");
  if (factTypes.has("physical_progress")) hints.add("spi_cpi_pair");
  if (factTypes.has("sla_performance")) hints.add("sla_availability");
  if (factTypes.has("open_risk")) hints.add("risk_callout");
  if (
    factTypes.has("issuing_authority") ||
    factTypes.has("evaluation_weights")
  ) {
    hints.add("governance_summary");
  }

  // Subject-specific "missing headline number" nudges.
  if (subject === "construction" && !factTypes.has("physical_progress")) {
    findings.push({
      agent: "presentation",
      severity: "warning",
      message_en:
        "Construction dashboard missing planned-vs-actual progress. Add SPI/CPI numbers if available.",
      message_ar:
        "لوحة الإنشاءات تفتقد التقدّم المخطّط مقابل الفعلي. أضف مؤشّرَي SPI/CPI إن توفّرا.",
    });
  }
  if (
    subject === "operations_maintenance" &&
    !factTypes.has("sla_performance")
  ) {
    findings.push({
      agent: "presentation",
      severity: "warning",
      message_en:
        "O&M dashboard missing SLA numbers (availability %, MTTR).",
      message_ar:
        "لوحة التشغيل والصيانة تفتقد أرقام مستوى الخدمة (الإتاحة %، متوسّط زمن الإصلاح).",
    });
  }
  if (
    subject === "tender_evaluation" &&
    !factTypes.has("bidder_scores")
  ) {
    findings.push({
      agent: "presentation",
      severity: "warning",
      message_en:
        "Tender dashboard missing bidder scores — the executive audience expects a scored comparison.",
      message_ar:
        "لوحة العطاءات تفتقد درجات المتقدّمين — يتوقّع الجمهور التنفيذي مقارنةً مُقيَّمة.",
    });
  }

  return { hints: [...hints], findings };
}
