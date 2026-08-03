import { describe, expect, it } from "vitest";
import { AGENTS, AGENTS_BY_ID } from "./registry";
import { orchestrateAgents } from "./orchestrator";
import { reviewBrief } from "./language-reviewer";
import type { DbExtractedFact, Subject } from "@/types/database";

function fact(fact_type: string, id = fact_type): DbExtractedFact {
  return {
    id,
    project_id: "p",
    document_id: "d",
    fact_type,
    payload_json: { note: "x" },
    citation_page: 1,
    citation_quote: "q",
    confidence: "HIGH",
    user_verified: false,
    created_at: new Date().toISOString(),
  };
}

describe("agents · registry", () => {
  it("registers seven specialist agents with bilingual names", () => {
    expect(AGENTS.length).toBe(7);
    for (const a of AGENTS) {
      expect(AGENTS_BY_ID[a.id]).toBe(a);
      expect(a.name_en.length).toBeGreaterThan(2);
      expect(a.name_ar.length).toBeGreaterThan(2);
      expect(a.focus_en.length).toBeGreaterThan(5);
      expect(a.focus_ar.length).toBeGreaterThan(5);
    }
  });

  it("has no duplicate agent ids", () => {
    const ids = AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("agents · orchestrator", () => {
  const SUBJECTS: Subject[] = [
    "contract_management",
    "tender_evaluation",
    "operations_maintenance",
    "construction",
  ];

  it("partitions every fact to exactly one agent — none lost", () => {
    const facts = [
      fact("contract_value"),
      fact("payment_terms"),
      fact("contracting_parties"),
      fact("open_risk"),
      fact("unknown_type_should_fallback_to_technical"),
    ];
    const { reports, total_facts_claimed } = orchestrateAgents({
      subject: "contract_management",
      facts,
    });
    expect(total_facts_claimed).toBe(facts.length);
    // Every specialist has a report, in the registry order.
    expect(reports.map((r) => r.agent)).toEqual(AGENTS.map((a) => a.id));
  });

  it("emits at least one presentation hint per subject", () => {
    for (const subject of SUBJECTS) {
      const { reports } = orchestrateAgents({
        subject,
        facts: [fact("contract_value")],
      });
      const presentation = reports.find((r) => r.agent === "presentation")!;
      expect(presentation.presentation_hints?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("raises design finding when a subject-critical metric is missing", () => {
    const { reports } = orchestrateAgents({
      subject: "construction",
      facts: [], // missing physical_progress in particular
    });
    const presentation = reports.find((r) => r.agent === "presentation")!;
    expect(presentation.findings.length).toBeGreaterThan(0);
    expect(presentation.findings[0]!.message_en).toMatch(/progress/i);
  });
});

describe("agents · language reviewer", () => {
  it("flags Latin digits inside Arabic text", () => {
    const findings = reviewBrief({
      text_en: "This is a fine English sentence.",
      text_ar: "قيمة العقد 1500 درهم إماراتي.",
    });
    expect(findings.some((f) => f.message_en.match(/Latin digits/))).toBe(true);
  });

  it("flags Latin comma inside Arabic text", () => {
    const findings = reviewBrief({
      text_en: "OK.",
      text_ar: "الأطراف, الجهة والاستشاري.",
    });
    expect(findings.some((f) => f.message_en.match(/comma/))).toBe(true);
  });

  it("flags Eastern-Arabic digits inside English text", () => {
    const findings = reviewBrief({
      text_en: "The contract value is ١٥٠٠ AED.",
      text_ar: "قيمةٌ عاديّة.",
    });
    expect(findings.some((f) => f.message_en.match(/Eastern-Arabic/))).toBe(true);
  });

  it("flags doubled words", () => {
    const findings = reviewBrief({
      text_en: "The the value.",
      text_ar: "قيمة قيمة العقد.",
    });
    expect(findings.some((f) => f.message_en.match(/Doubled/))).toBe(true);
  });

  it("returns empty findings for clean bilingual text", () => {
    const findings = reviewBrief({
      text_en: "The contract value is AED 1,500.",
      text_ar: "قيمة العقد ١٫٥٠٠ درهم.",
    });
    // Only info-level noise allowed on clean text.
    const seriousErrors = findings.filter((f) => f.severity !== "info");
    expect(seriousErrors.length).toBe(0);
  });
});
