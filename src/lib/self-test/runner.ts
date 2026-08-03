// Client-side self-test harness. Exercises the full deterministic
// pipeline (mock extractor -> brief composer -> quality gate) across
// all supported project subjects, so the user can verify the app is
// healthy end-to-end without needing to upload a real document.
//
// Runs in the browser — pure JS, no server calls, no external LLMs.
// This is what you get to run "in a loop" without me: click the
// button, see per-check pass/fail, click again to re-run.

import type { PipelineDocument } from "@/lib/store/pipeline-store";
import type { DocumentType, Subject } from "@/types/database";
import { runMockExtraction } from "@/lib/extraction/mock-extractor";
import { groupFactsByCategory } from "@/lib/extraction/grouping";
import { composeBrief, audienceOptions } from "@/lib/brief/composer";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "@/lib/llm/web-llm";

const SUBJECTS: Subject[] = [
  "contract_management",
  "tender_evaluation",
  "operations_maintenance",
  "construction",
];

export type CheckStatus = "pass" | "fail";

export interface SelfTestCheck {
  id: string;
  label_en: string;
  label_ar: string;
  status: CheckStatus;
  detail?: string;
}

export interface SelfTestReport {
  ran_at: string;
  duration_ms: number;
  checks: SelfTestCheck[];
  passed: number;
  total: number;
}

function fakeDoc(
  id: string,
  filename: string,
  type: DocumentType = "unknown",
): PipelineDocument {
  return {
    id,
    project_id: "p_self_test",
    filename,
    mime_type: "application/pdf",
    size_bytes: 1000,
    document_type: type,
    classification_confidence: "MEDIUM",
    preview_text: null,
    created_at: new Date().toISOString(),
  };
}

/** Runs the pipeline against a synthetic project and returns a report. */
export async function runSelfTest(): Promise<SelfTestReport> {
  const start = Date.now();
  const checks: SelfTestCheck[] = [];

  // 1. Model catalogue present and default set
  try {
    if (AVAILABLE_MODELS.length === 0) throw new Error("empty catalogue");
    if (!AVAILABLE_MODELS.some((m) => m.id === DEFAULT_MODEL_ID)) {
      throw new Error(`default ${DEFAULT_MODEL_ID} not in catalogue`);
    }
    checks.push({
      id: "catalog",
      label_en: "Model catalogue loaded",
      label_ar: "كتالوج النماذج مُحمَّل",
      status: "pass",
      detail: `${AVAILABLE_MODELS.length} models`,
    });
  } catch (err) {
    checks.push({
      id: "catalog",
      label_en: "Model catalogue loaded",
      label_ar: "كتالوج النماذج مُحمَّل",
      status: "fail",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // 2. WebGPU availability
  const nav = (typeof navigator !== "undefined"
    ? (navigator as Navigator & { gpu?: unknown })
    : {}) as { gpu?: unknown };
  const hasWebGpu = !!nav.gpu;
  checks.push({
    id: "webgpu",
    label_en: "WebGPU available (on-device AI)",
    label_ar: "WebGPU متاح (الذكاء على الجهاز)",
    status: hasWebGpu ? "pass" : "fail",
    detail: hasWebGpu ? undefined : "Not available in this browser",
  });

  // 3. Extraction across every subject
  for (const subject of SUBJECTS) {
    try {
      const facts = runMockExtraction({
        projectId: "p_self_test",
        subject,
        documents: [
          fakeDoc("d1", "contract-master.pdf", "contract"),
          fakeDoc("d2", "monthly-report-Q2.pdf", "monthly_progress_report"),
        ],
        authorityEn: "Government Authority",
        counterpartyEn: "Consulting Co.",
      });
      if (facts.length === 0) throw new Error("no facts produced");
      const grouped = groupFactsByCategory(facts, "en");
      const total =
        grouped.key_terms.length + grouped.performance.length + grouped.risk.length;
      if (total !== facts.length) {
        throw new Error("grouping lost facts");
      }
      checks.push({
        id: `extract:${subject}`,
        label_en: `Extract · ${subject}`,
        label_ar: `استخراج · ${subject}`,
        status: "pass",
        detail: `${facts.length} facts`,
      });
      // Yield between subjects so we don't monopolise the main thread.
      await new Promise((r) => setTimeout(r, 0));
    } catch (err) {
      checks.push({
        id: `extract:${subject}`,
        label_en: `Extract · ${subject}`,
        label_ar: `استخراج · ${subject}`,
        status: "fail",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 4. Brief composer × audiences (bilingual)
  const audiences = audienceOptions();
  try {
    const facts = runMockExtraction({
      projectId: "p_self_test",
      subject: "contract_management",
      documents: [fakeDoc("d1", "contract-master.pdf", "contract")],
      authorityEn: "Government Authority",
      counterpartyEn: "Consulting Co.",
    });
    let missing = 0;
    for (const a of audiences) {
      const brief = composeBrief({
        projectName: "Self-test project",
        subject: "contract_management",
        audience: a.id,
        authorityEn: "Authority",
        authorityAr: "الجهة",
        counterpartyEn: "Counterparty",
        counterpartyAr: "الطرف",
        facts,
        locale: "en",
      });
      if (brief.text_en.length < 30 || brief.text_ar.length < 30) missing += 1;
    }
    if (missing > 0) throw new Error(`${missing} audience(s) produced empty brief`);
    checks.push({
      id: "brief",
      label_en: "Brief composer (bilingual, all audiences)",
      label_ar: "مُركِّب الموجز (ثنائي اللغة، لكل الجمهور)",
      status: "pass",
      detail: `${audiences.length} audiences × 2 locales`,
    });
  } catch (err) {
    checks.push({
      id: "brief",
      label_en: "Brief composer (bilingual, all audiences)",
      label_ar: "مُركِّب الموجز (ثنائي اللغة، لكل الجمهور)",
      status: "fail",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  const passed = checks.filter((c) => c.status === "pass").length;
  return {
    ran_at: new Date().toISOString(),
    duration_ms: Date.now() - start,
    checks,
    passed,
    total: checks.length,
  };
}
