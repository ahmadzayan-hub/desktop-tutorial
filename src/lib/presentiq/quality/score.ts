/**
 * Quality scoring engine — 10 dimensions.
 *
 * Each dimension returns 0..100. The Boardroom Readiness score is
 * a weighted aggregation of the others.
 */

import type { BrandRulesContext, EvidenceItem, Slide, QualityReport } from "../types";
import { validatePalette, validateLayoutDensity, validateText } from "../brand/governance";
import { validateSlideRtl } from "../rtl/validate";
import { scanForFakeApproval } from "../security/guardrail";

type Inputs = {
  slides: Slide[];
  ctx: BrandRulesContext;
  evidence: EvidenceItem[];
  templateCompliance?: number; // 0..100; pass-through from renderer
};

export function scoreDeck(input: Inputs): QualityReport {
  const findings: QualityReport["findings"] = [];
  const recommendations: QualityReport["recommendations"] = [];

  const brand = brandCompliance(input, findings);
  const evidence = evidenceIntegrity(input, findings);
  const rtl = rtlScore(input, findings);
  const simplicity = slideSimplicity(input, findings);
  const visual = visualQuality(input, findings);
  const exec = executiveClarity(input, findings);
  const a11y = accessibility(input, findings);
  const halluc = hallucinationRisk(input, findings);
  const tmpl = input.templateCompliance ?? 100;

  // Boardroom readiness — weighted aggregation
  const readiness =
    0.20 * brand +
    0.20 * evidence +
    0.10 * rtl +
    0.10 * simplicity +
    0.10 * visual +
    0.10 * exec +
    0.05 * a11y +
    0.10 * (100 - halluc) +
    0.05 * tmpl;

  if (brand < 80) recommendations.push({ dimension: "brand_compliance", action: "Re-run Brand Governance and tighten palette + terminology." });
  if (evidence < 80) recommendations.push({ dimension: "evidence_integrity", action: "Mark unverifiable claims as [Input Required]." });
  if (rtl < 90 && input.ctx.language.rtl_required) recommendations.push({ dimension: "rtl", action: "Run the RTL agent and replace ASCII punctuation." });
  if (simplicity < 70) recommendations.push({ dimension: "slide_simplicity", action: "Reduce words per slide. Use one idea per surface." });
  if (halluc > 30) recommendations.push({ dimension: "hallucination_risk", action: "Replace unsupported approvals with assessments." });

  return {
    scores: {
      boardroom_readiness: round1(readiness),
      brand_compliance: round1(brand),
      evidence_integrity: round1(evidence),
      rtl: round1(rtl),
      slide_simplicity: round1(simplicity),
      visual_quality: round1(visual),
      executive_clarity: round1(exec),
      accessibility: round1(a11y),
      hallucination_risk: round1(halluc),
      template_compliance: round1(tmpl),
    },
    findings,
    recommendations,
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------------

function brandCompliance(
  { slides, ctx }: Inputs,
  findings: QualityReport["findings"],
): number {
  let total = 0;
  for (const slide of slides) {
    const used = collectUsedHexes(slide);
    const palette = validatePalette(used, ctx);
    const density = validateLayoutDensity(slide, ctx);
    const allText = [slide.title_en ?? "", slide.key_message_en ?? "", slide.title_ar ?? "", slide.key_message_ar ?? ""].join(" \n ");
    const tone = validateText(allText, ctx);
    if (tone.length) findings.push({ dimension: "brand_compliance", severity: "warn", message: tone[0].message });
    total += 0.4 * palette + 0.4 * density + 0.2 * (tone.length === 0 ? 100 : 60);
  }
  return slides.length ? total / slides.length : 100;
}

function collectUsedHexes(slide: Slide): string[] {
  const out: string[] = [];
  const palette = slide.visual_json?.palette ?? [];
  for (const c of palette) if (typeof c === "string") out.push(c);
  return out;
}

function evidenceIntegrity(
  { slides, evidence }: Inputs,
  findings: QualityReport["findings"],
): number {
  if (!slides.length) return 100;
  let withRefs = 0;
  for (const slide of slides) {
    const refs = slide.evidence_refs ?? [];
    if (refs.length) withRefs += 1;
  }
  const ratio = withRefs / slides.length;
  if (ratio < 0.6) {
    findings.push({
      dimension: "evidence_integrity",
      severity: "warn",
      message: `${Math.round((1 - ratio) * 100)}% of slides have no linked evidence`,
    });
  }
  // Penalise [Input Required] presence on boardroom-critical slides
  const inputRequiredCount = evidence.filter((e) => e.classification === "input_required").length;
  return Math.max(0, 100 * ratio - inputRequiredCount * 2);
}

function rtlScore({ slides, ctx }: Inputs, findings: QualityReport["findings"]): number {
  if (!ctx.language.rtl_required) return 100;
  let sum = 0;
  for (const s of slides) {
    const r = validateSlideRtl(s, ctx);
    sum += r.score;
    if (r.findings.length) findings.push({ dimension: "rtl", severity: "warn", message: `Slide ${s.slide_number}: ${r.findings[0].rule}` });
  }
  return slides.length ? sum / slides.length : 100;
}

function slideSimplicity({ slides, ctx }: Inputs, _findings: QualityReport["findings"]): number {
  let sum = 0;
  for (const s of slides) sum += validateLayoutDensity(s, ctx);
  return slides.length ? sum / slides.length : 100;
}

function visualQuality({ slides }: Inputs, _findings: QualityReport["findings"]): number {
  // Boost when slide has structured visual model (chart/timeline/process etc).
  let sum = 0;
  for (const s of slides) {
    const k = (s.content_json as any)?.kind;
    sum += k && k !== "bullets" ? 95 : 60;
  }
  return slides.length ? sum / slides.length : 100;
}

function executiveClarity({ slides }: Inputs, findings: QualityReport["findings"]): number {
  let sum = 0;
  for (const s of slides) {
    const title = s.title_en ?? "";
    if (title.length < 6) {
      findings.push({ dimension: "executive_clarity", severity: "warn", message: `Slide ${s.slide_number}: weak title` });
      sum += 50;
      continue;
    }
    const wordy = title.split(/\s+/).length;
    sum += wordy >= 6 ? 95 : 75; // executive titles tend to be statements
  }
  return slides.length ? sum / slides.length : 100;
}

function accessibility({ slides }: Inputs, _findings: QualityReport["findings"]): number {
  // Heuristic: presence of speaker notes + chart titles improves accessibility.
  let sum = 0;
  for (const s of slides) {
    let score = 70;
    if (s.speaker_notes_en) score += 15;
    if ((s.content_json as any)?.kind === "chart" && (s.content_json as any)?.spec?.title) score += 15;
    sum += Math.min(100, score);
  }
  return slides.length ? sum / slides.length : 100;
}

function hallucinationRisk({ slides, evidence }: Inputs, findings: QualityReport["findings"]): number {
  if (!slides.length) return 0;
  let risk = 0;
  for (const s of slides) {
    const fakeApp = scanForFakeApproval([s.title_en, s.key_message_en, s.title_ar, s.key_message_ar].filter(Boolean).join(" "));
    if (!fakeApp.ok) {
      risk += 25;
      findings.push({ dimension: "hallucination_risk", severity: "error", message: `Slide ${s.slide_number}: fake approval detected` });
    }
    const refs = s.evidence_refs ?? [];
    if (!refs.length) risk += 6;
    const hasNumbers = /\d/.test([s.key_message_en, s.title_en].filter(Boolean).join(" "));
    if (hasNumbers && !refs.length) risk += 10;
  }
  // Adjust: presence of explicit input_required classifications shows discipline → reduce risk
  const required = evidence.filter((e) => e.classification === "input_required").length;
  risk -= Math.min(20, required * 2);
  return Math.max(0, Math.min(100, risk));
}
