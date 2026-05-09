/**
 * Synthetic blueprint + slides generator for demo mode.
 *
 * No Anthropic key required. Produces a plausible boardroom blueprint
 * and a 6-slide deck so the trial flow runs end-to-end.
 */

import type { Blueprint, Slide } from "../types";

export function buildDemoBlueprint(input: {
  title: string;
  audience?: string | null;
  objective?: string | null;
  decision_required?: string | null;
  target_slide_count?: number;
}): Blueprint {
  const n = Math.max(6, Math.min(input.target_slide_count ?? 8, 14));
  const structure: Blueprint["recommended_structure"] = [];
  const baseTitles = [
    "Cover & Context",
    "Executive Summary",
    "Current Situation",
    "Key Risks & Mitigations",
    "Strategic Options",
    "Recommendation",
    "Financial Impact",
    "Timeline & Milestones",
    "Stakeholder Map",
    "Quality & Compliance",
    "Decision Required",
    "Next Steps",
    "Appendix",
    "Glossary",
  ];
  for (let i = 0; i < n; i++) {
    structure.push({
      slide_number: i + 1,
      title: baseTitles[i] ?? `Section ${i + 1}`,
      purpose:
        i === 0
          ? "Set the scene and frame the decision."
          : i === n - 1
          ? "Close with next steps and ownership."
          : "Drive the audience toward the recommended decision.",
    });
  }
  return {
    objective: input.objective ?? "Brief the executive committee and obtain a clear decision.",
    audience_logic: `Audience is ${input.audience ?? "executive director"}. Lead with decision, support with evidence.`,
    key_message:
      "Recommend a single, action-oriented option grounded in evidence; flag residual risk and ask for approval to proceed.",
    storyline: [
      "Frame: where we are now.",
      "What changed and why it matters.",
      "Options considered and trade-offs.",
      "Recommended option + rationale.",
      "What we need from the board.",
    ],
    recommended_structure: structure,
    missing_data: [
      "Confirmed financial baseline (Q3 actuals)",
      "Latest risk register (post-incident updates)",
      "Vendor SLA breach evidence (if any)",
    ],
  };
}

export function buildDemoSlides(opts: {
  title: string;
  language_mode: "en" | "ar" | "bilingual";
  blueprint: Blueprint;
}): Slide[] {
  const { title, language_mode, blueprint } = opts;
  const slides: Slide[] = blueprint.recommended_structure.map((s, i) => {
    const content =
      i === 0
        ? { kind: "cover" as const, title, subtitle: blueprint.key_message, date: new Date().toISOString().slice(0, 10) }
        : i === 1
        ? {
            kind: "exec_summary" as const,
            bullets: [
              "Q3 portfolio results show 78% on-track, 14% at risk, 8% off-track.",
              "Recommended Option B reduces operational risk by 32% within 90 days.",
              "Capex impact: AED 4.8M; payback in 7 months; brand/customer NPS protected.",
              "Approval requested to proceed with Option B and quarterly review cadence.",
            ],
          }
        : i === blueprint.recommended_structure.length - 2
        ? {
            kind: "decision" as const,
            recommendation: "Approve Option B — accelerated maintenance and predictive analytics rollout.",
            rationale: [
              "Lowest residual risk profile of the three options.",
              "Strong evidence baseline from internal incident data and supplier SLAs.",
              "Aligned with strategic direction and CFO's cost guidance.",
            ],
          }
        : i === blueprint.recommended_structure.length - 1
        ? {
            kind: "next_steps" as const,
            actions: [
              { owner: "COO", due: "+14d", action: "Mobilise programme team and PMO." },
              { owner: "CFO", due: "+21d", action: "Confirm capex allocation and reporting." },
              { owner: "Risk", due: "+30d", action: "Refresh risk register and assurance plan." },
            ],
          }
        : { kind: "bullets" as const, bullets: [s.purpose, "Evidence: see appendix.", "Owner & timeline tracked in PMO."] };

    const title_en = s.title;
    const title_ar = mockArabic(title_en);

    return {
      slide_number: s.slide_number,
      title_en,
      title_ar,
      purpose: s.purpose,
      key_message_en: s.purpose,
      key_message_ar: mockArabic(s.purpose),
      content_json: language_mode === "bilingual" ? { kind: "bilingual", en: content, ar: content } : content,
      visual_json: { layout: "boardroom", iconography: "line" },
      speaker_notes_en: `${s.title}: lead the decision conversation.`,
      speaker_notes_ar: mockArabic(`${s.title}: قُد المحادثة نحو القرار.`),
      status: "generated",
      animation_plan: { entrance: "fade" },
    };
  });
  return slides;
}

// Tiny EN→AR demo mapping (header-only, not a real translator).
function mockArabic(en: string): string {
  const dict: Record<string, string> = {
    "Cover & Context": "الغلاف والسياق",
    "Executive Summary": "الملخّص التنفيذي",
    "Current Situation": "الوضع الحالي",
    "Key Risks & Mitigations": "أبرز المخاطر والمعالجات",
    "Strategic Options": "الخيارات الاستراتيجية",
    "Recommendation": "التوصية",
    "Financial Impact": "الأثر المالي",
    "Timeline & Milestones": "الجدول الزمني والمراحل",
    "Stakeholder Map": "خارطة أصحاب المصلحة",
    "Quality & Compliance": "الجودة والامتثال",
    "Decision Required": "القرار المطلوب",
    "Next Steps": "الخطوات التالية",
    "Appendix": "ملحقات",
    "Glossary": "المصطلحات",
  };
  return dict[en] ?? en;
}
