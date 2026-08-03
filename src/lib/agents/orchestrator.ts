// Orchestrator: takes the shared corpus + brief and returns one
// AgentReport per specialist agent. Deterministic, synchronous — no
// LLM calls, so it works everywhere the mock extractor works.

import type { DbExtractedFact, Subject } from "@/types/database";
import { AGENTS, AGENTS_BY_ID } from "./registry";
import type {
  AgentId,
  AgentReport,
  ReviewFinding,
} from "./types";
import { reviewBrief } from "./language-reviewer";
import { designPresentation } from "./presentation-designer";

export interface OrchestrateInput {
  subject: Subject;
  facts: readonly DbExtractedFact[];
  brief_text_en?: string;
  brief_text_ar?: string;
}

/**
 * Assign every fact to the first agent whose `fact_types` contains it.
 * Facts that don't match any specialist land on the Technical agent as
 * a catch-all, so the extract view never leaks facts.
 */
function partitionFacts(
  facts: readonly DbExtractedFact[],
): Record<AgentId, DbExtractedFact[]> {
  const bucket: Record<AgentId, DbExtractedFact[]> = {
    technical: [],
    contract: [],
    financial: [],
    administration: [],
    pmi: [],
    presentation: [],
    language: [],
  };

  for (const f of facts) {
    let claimed = false;
    for (const a of AGENTS) {
      if (a.fact_types.includes(f.fact_type)) {
        bucket[a.id].push(f);
        claimed = true;
        break;
      }
    }
    if (!claimed) bucket.technical.push(f);
  }
  return bucket;
}

/**
 * Cross-agent sanity findings that don't belong to any single specialist.
 */
function crossFindings(
  input: OrchestrateInput,
  byAgent: Record<AgentId, DbExtractedFact[]>,
): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  if (byAgent.contract.length === 0 && input.subject === "contract_management") {
    findings.push({
      agent: "contract",
      severity: "warning",
      message_en:
        "Contract-management project with zero contract facts. Upload the master agreement.",
      message_ar:
        "مشروع إدارة عقود بدون وقائع عقديّة. ارفع الاتّفاقيّة الأمّ.",
    });
  }
  if (byAgent.financial.length === 0) {
    findings.push({
      agent: "financial",
      severity: "info",
      message_en:
        "No financial facts extracted. Add the contract value / payment schedule for a director-grade view.",
      message_ar:
        "لا وقائع ماليّة مُستخرَجة. أضف قيمة العقد وجدول الدفعات لعرضٍ بمستوى المدير.",
    });
  }
  if (byAgent.pmi.length === 0) {
    findings.push({
      agent: "pmi",
      severity: "info",
      message_en:
        "No schedule/backlog/risk facts. PMI lens will show as empty until progress data is available.",
      message_ar:
        "لا وقائع جدولة/متأخّرات/مخاطر. عدسة PMI ستبقى فارغةً حتى تتوفّر بيانات التقدّم.",
    });
  }
  return findings;
}

export interface OrchestratorReport {
  reports: AgentReport[];
  total_findings: number;
  total_facts_claimed: number;
}

export function orchestrateAgents(input: OrchestrateInput): OrchestratorReport {
  const byAgent = partitionFacts(input.facts);
  const cross = crossFindings(input, byAgent);
  const design = designPresentation(input.subject, input.facts);
  const langFindings =
    input.brief_text_en && input.brief_text_ar
      ? reviewBrief({
          text_en: input.brief_text_en,
          text_ar: input.brief_text_ar,
        })
      : [];

  const reports: AgentReport[] = AGENTS.map((a) => {
    const facts = byAgent[a.id];
    // Every finding whose `agent` matches this specialist goes to it,
    // plus the specialist's own catch-all cross-findings.
    const findings: ReviewFinding[] = [];
    for (const f of cross) if (f.agent === a.id) findings.push(f);
    if (a.id === "presentation") findings.push(...design.findings);
    if (a.id === "language") findings.push(...langFindings);

    const report: AgentReport = { agent: a.id, facts, findings };
    if (a.id === "presentation") {
      return { ...report, presentation_hints: design.hints };
    }
    return report;
  });

  const total_findings = reports.reduce((n, r) => n + r.findings.length, 0);
  const total_facts_claimed = reports.reduce((n, r) => n + r.facts.length, 0);
  return { reports, total_findings, total_facts_claimed };
}

export function agentById(id: AgentId) {
  return AGENTS_BY_ID[id];
}
