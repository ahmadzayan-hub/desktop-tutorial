/**
 * Built-in brand presets.
 *
 * Order of resolution:
 *   1. Mode preset (e.g. corporate_boardroom)
 *   2. Organisation brand kit (if selected and applicable)
 *   3. Corporate default
 *
 * v0.2: removed any single-organisation references.
 * "uae_pine_boardroom" is the new bilingual UAE-government-friendly preset
 * using the Pine palette (Pine / Teal / Emerald / Spearmint).
 */

import type { BrandRulesContext, PresentationMode } from "../types";

// Bilingual government / corporate boardroom terminology — neutral, no
// org-specific references. Use as a starting point for new brand kits.
export const bilingualTerminology: { en: string; ar: string }[] = [
  { en: "Government Entity", ar: "جهة حكومية" },
  { en: "Executive Committee", ar: "اللجنة التنفيذية" },
  { en: "Strategic Alignment", ar: "المواءمة الاستراتيجية" },
  { en: "Current Status", ar: "الوضع الحالي" },
  { en: "Key Risks", ar: "المخاطر الرئيسية" },
  { en: "Risk Mitigation", ar: "معالجة المخاطر" },
  { en: "Recommendation", ar: "التوصية" },
  { en: "Decision Required", ar: "القرار المطلوب" },
  { en: "Next Steps", ar: "الخطوات التالية" },
  { en: "Timeline", ar: "الجدول الزمني" },
  { en: "Stakeholder", ar: "صاحب المصلحة" },
  { en: "Operational Continuity", ar: "استمرارية التشغيل" },
  { en: "Customer Happiness", ar: "إسعاد المتعاملين" },
  { en: "Sustainability", ar: "الاستدامة" },
  { en: "Digital Transformation", ar: "التحول الرقمي" },
  { en: "Maintenance", ar: "الصيانة" },
  { en: "Asset Management", ar: "إدارة الأصول" },
  { en: "Safety", ar: "السلامة" },
  { en: "Quality", ar: "الجودة" },
  { en: "Compliance", ar: "الامتثال" },
  { en: "Audit", ar: "التدقيق" },
  { en: "Root Cause Analysis", ar: "تحليل السبب الجذري" },
  { en: "Corrective and Preventive Actions", ar: "الإجراءات التصحيحية والوقائية" },
];

// Backwards compatibility — older modules imported `rtaTerminology`.
// Keep the export name so we don't break consumers, but it's now neutral.
export const rtaTerminology = bilingualTerminology;

const FORBIDDEN_GENERIC = [
  "we have decided",
  "approved by HE",
  "CEO confirmed",
  "guaranteed",
  "100% safe",
  "zero risk",
  "no risk at all",
];

const corporateDefault: BrandRulesContext = {
  identity: { org_name: "Your Organisation", logos: {} },
  palette: {
    primary: "#013230",   // Pine
    secondary: "#0B6E69", // Teal
    accent: ["#50C8C2", "#D1F2F0", "#0B6E69", "#013230", "#5EEAD4", "#A7F3D0"],
    background: "#FFFFFF",
    surface: "#F4FBFA",
    foreground: "#013230",
  },
  typography: {
    en_primary: "Inter",
    en_fallback: ["Calibri", "Arial"],
    ar_primary: "IBM Plex Sans Arabic",
    ar_fallback: ["Tajawal", "Noto Kufi Arabic", "Cairo", "Dubai"],
    title_size_pt: [28, 36],
    body_size_pt: [14, 20],
    line_height: 1.35,
  },
  layout: {
    logo_placement: "top_right",
    safe_margins_in: 0.4,
    max_words_per_slide: 80,
    max_bullets_per_slide: 5,
    slide_density: "low",
  },
  charts: {
    palette: ["#013230", "#0B6E69", "#50C8C2", "#5EEAD4", "#A7F3D0", "#D1F2F0"],
    grid: "minimal",
    label_size_pt: 11,
  },
  iconography: { style: "line" },
  language: {
    tone: "formal_corporate",
    forbidden_phrases: [...FORBIDDEN_GENERIC],
    approved_terminology: [],
    arabic_required: false,
    rtl_required: false,
  },
  governance: {
    require_decision_slide: true,
    forbid_thank_you_slide: true,
    forbid_questions_slide: true,
    require_executive_summary: true,
    require_recommendation_slide: true,
    require_next_steps_slide: true,
  },
};

const uaePineBoardroom: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Government Entity", logos: {} },
  palette: {
    primary: "#013230",
    secondary: "#0B6E69",
    accent: ["#50C8C2", "#D1F2F0", "#0B6E69", "#013230", "#5EEAD4", "#A7F3D0"],
    background: "#FFFFFF",
    surface: "#F4FBFA",
    foreground: "#013230",
  },
  charts: {
    palette: ["#013230", "#0B6E69", "#50C8C2", "#5EEAD4", "#A7F3D0", "#D1F2F0"],
    grid: "minimal",
    label_size_pt: 11,
  },
  language: {
    tone: "government_executive",
    forbidden_phrases: [...FORBIDDEN_GENERIC, "approved by His Highness"],
    approved_terminology: bilingualTerminology,
    arabic_required: true,
    rtl_required: true,
  },
};

const governmentBoardroom: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Government Entity", logos: {} },
  palette: {
    primary: "#013230",
    secondary: "#0B6E69",
    accent: ["#50C8C2", "#D1F2F0", "#5EEAD4", "#A7F3D0"],
    background: "#FFFFFF",
    surface: "#F4FBFA",
    foreground: "#013230",
  },
  language: {
    ...corporateDefault.language,
    tone: "government_executive",
    arabic_required: true,
    rtl_required: true,
    approved_terminology: bilingualTerminology,
  },
};

const consultingPartner: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Consulting Firm", logos: {} },
  palette: {
    primary: "#013230",
    secondary: "#0B6E69",
    accent: ["#D4AF37", "#9CA3AF", "#0B6E69"],
    background: "#FFFFFF",
    surface: "#F4FBFA",
    foreground: "#013230",
  },
  language: {
    ...corporateDefault.language,
    tone: "consulting_partner",
  },
};

export const BUILT_IN_PRESETS: Record<PresentationMode | "default", BrandRulesContext> = {
  default: corporateDefault,
  corporate_boardroom: corporateDefault,
  government_boardroom: governmentBoardroom,
  rta_boardroom: uaePineBoardroom, // Legacy key — now resolves to neutral UAE Pine boardroom preset
  consulting_partner: consultingPartner,
  sales_pitch: corporateDefault,
  project_steering: corporateDefault,
  technical_to_executive: corporateDefault,
  strategy_deck: corporateDefault,
  kpi_dashboard: corporateDefault,
  training: corporateDefault,
  investor_business_case: corporateDefault,
  tender_proposal: corporateDefault,
};
