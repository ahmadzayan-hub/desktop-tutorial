// Multi-agent orchestration types. Each specialist agent operates over
// the same corpus (documents + already-extracted facts) but focuses on
// a distinct subset and produces its own "report" (facts of interest,
// review findings, presentation hints).

import type { DbExtractedFact } from "@/types/database";

export type AgentId =
  | "technical"
  | "contract"
  | "financial"
  | "administration"
  | "pmi"
  | "presentation"
  | "language";

export type AgentTone = "navy" | "gold" | "emerald" | "amber" | "rose" | "violet" | "sky";

export interface AgentSpec {
  id: AgentId;
  name_en: string;
  name_ar: string;
  focus_en: string;
  focus_ar: string;
  /** Colour token used by the UI badge. */
  tone: AgentTone;
  /** Emoji or lucide icon name — kept as a string to avoid coupling. */
  icon: string;
  /**
   * Fact types this agent claims from the shared extraction. Facts not
   * matching any agent's filter are tagged to `technical` by default.
   */
  fact_types: readonly string[];
}

export type SeverityLevel = "info" | "warning" | "error";

export interface ReviewFinding {
  agent: AgentId;
  severity: SeverityLevel;
  message_en: string;
  message_ar: string;
  /** Optional textual excerpt highlighting the issue. */
  excerpt?: string;
}

export interface AgentReport {
  agent: AgentId;
  /** Facts claimed by this agent from the shared extraction. */
  facts: DbExtractedFact[];
  /** Review findings this agent has to raise. */
  findings: ReviewFinding[];
  /**
   * Optional presentation hints (used by the Presentation Designer).
   * String keys like "quality_ring" | "confidence_bar" | "big_number" so
   * the UI can react without importing components here.
   */
  presentation_hints?: readonly string[];
}
