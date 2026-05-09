/**
 * Built-in brand presets.
 *
 * Order of resolution:
 *   1. Mode preset (e.g. rta_boardroom)
 *   2. Organisation brand kit (if selected and applicable)
 *   3. Corporate default
 */

import type { BrandRulesContext, PresentationMode } from "../types";

export const rtaTerminology: { en: string; ar: string }[] = [
  { en: "Roads and Transport Authority", ar: "هيئة الطرق والمواصلات" },
  { en: "Government of Dubai", ar: "حكومة دبي" },
  { en: "Rail Agency", ar: "مؤسسة القطارات" },
  { en: "Trains Maintenance Department", ar: "إدارة صيانة القطارات" },
  { en: "Dubai Metro", ar: "مترو دبي" },
  { en: "Dubai Tram", ar: "ترام دبي" },
  { en: "Maintenance", ar: "الصيانة" },
  { en: "Asset Management", ar: "إدارة الأصول" },
  { en: "Operational Continuity", ar: "استمرارية التشغيل" },
  { en: "Safety", ar: "السلامة" },
  { en: "Customer Happiness", ar: "إسعاد المتعاملين" },
  { en: "Sustainability", ar: "الاستدامة" },
  { en: "Digital Transformation", ar: "التحول الرقمي" },
  { en: "Seamless and Sustainable Mobility", ar: "التنقل السلس والمستدام" },
  { en: "Strategic Alignment", ar: "المواءمة الاستراتيجية" },
  { en: "Current Status", ar: "الوضع الحالي" },
  { en: "Key Risks", ar: "المخاطر الرئيسية" },
  { en: "Recommendation", ar: "التوصية" },
  { en: "Decision Required", ar: "القرار المطلوب" },
  { en: "Next Steps", ar: "الخطوات التالية" },
  { en: "Contract Variation", ar: "تعديل العقد" },
  { en: "Extension of Time", ar: "تمديد المدة" },
  { en: "Root Cause Analysis", ar: "تحليل السبب الجذري" },
  { en: "Corrective and Preventive Actions", ar: "الإجراءات التصحيحية والوقائية" },
];

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
    primary: "#0F172A",
    secondary: "#2563EB",
    accent: ["#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    background: "#FFFFFF",
    surface: "#F8FAFC",
    foreground: "#0F172A",
  },
  typography: {
    en_primary: "Inter",
    en_fallback: ["Calibri", "Arial"],
    ar_primary: "Tajawal",
    ar_fallback: ["Noto Kufi Arabic", "Alexandria", "Dubai"],
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
    palette: ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#0EA5E9"],
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

const rtaBoardroom: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Roads and Transport Authority", logos: {} },
  palette: {
    primary: "#171C8F",
    secondary: "#EE0032",
    accent: ["#00B0B9", "#025EE1", "#00B154", "#FF7100", "#FFB800", "#8031C8"],
    background: "#FFFFFF",
    surface: "#F4F5F9",
    foreground: "#171C8F",
  },
  charts: {
    palette: ["#171C8F", "#EE0032", "#00B0B9", "#025EE1", "#00B154", "#FF7100"],
    grid: "minimal",
    label_size_pt: 11,
  },
  language: {
    tone: "government_executive",
    forbidden_phrases: [...FORBIDDEN_GENERIC, "approved by His Highness"],
    approved_terminology: rtaTerminology,
    arabic_required: true,
    rtl_required: true,
  },
};

const governmentBoardroom: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Government Entity", logos: {} },
  palette: {
    primary: "#0B3D2E",
    secondary: "#C8102E",
    accent: ["#0EA5E9", "#FFB800", "#8031C8", "#10B981"],
    background: "#FFFFFF",
    surface: "#F4F6F8",
    foreground: "#0B3D2E",
  },
  language: {
    ...corporateDefault.language,
    tone: "government_executive",
    arabic_required: true,
    rtl_required: true,
  },
};

const consultingPartner: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Consulting Firm", logos: {} },
  palette: {
    primary: "#111827",
    secondary: "#1F2937",
    accent: ["#D4AF37", "#9CA3AF", "#1F2937"],
    background: "#FFFFFF",
    surface: "#F3F4F6",
    foreground: "#111827",
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
  rta_boardroom: rtaBoardroom,
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
