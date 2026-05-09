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
    primary: "#425722",   // Zaytouni — olive
    secondary: "#2A3815", // Deep olive
    accent: ["#7B8E58", "#B68B3E", "#F4F2E9", "#2A3815", "#A0AC78", "#D8B265"],
    background: "#FFFFFF",
    surface: "#FAF8EE",
    foreground: "#1B2410",
  },
  typography: {
    en_primary: "Inter",
    en_fallback: ["Calibri", "Arial"],
    ar_primary: "IBM Plex Sans Arabic",
    ar_fallback: ["Tajawal", "Noto Kufi Arabic", "Cairo", "Dubai"],
    title_size_pt: [32, 40],
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
    palette: ["#425722", "#7B8E58", "#B68B3E", "#A0AC78", "#D8B265", "#2A3815"],
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
    primary: "#425722",
    secondary: "#2A3815",
    accent: ["#B68B3E", "#D4AF37", "#7B8E58", "#F4F2E9"],
    background: "#FFFFFF",
    surface: "#FAF8EE",
    foreground: "#1B2410",
  },
  language: {
    ...corporateDefault.language,
    tone: "consulting_partner",
  },
};

// ─── Curated palettes ────────────────────────────────────────────────
// Hand-picked, modern boardroom palettes the wizard exposes as one-click
// "apply" cards. Each palette ships with a chart ramp and an EN+AR font
// suggestion; the foreground/background are tuned for WCAG AA contrast.

export type CuratedPalette = {
  id: string;
  nameEn: string;
  nameAr: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string[];
    background: string;
    surface: string;
    foreground: string;
  };
  charts: string[];
  fonts: {
    en_primary: string;
    ar_primary: string;
  };
};

export const CURATED_PALETTES: CuratedPalette[] = [
  {
    id: "zaytouni",
    nameEn: "Zaytouni — Olive",
    nameAr: "زيتوني — أخضر زيتي",
    colors: {
      primary: "#425722", secondary: "#2A3815",
      accent: ["#7B8E58", "#B68B3E", "#F4F2E9", "#A0AC78", "#D8B265", "#2A3815"],
      background: "#FFFFFF", surface: "#FAF8EE", foreground: "#1B2410",
    },
    charts: ["#425722", "#7B8E58", "#B68B3E", "#A0AC78", "#D8B265", "#2A3815"],
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
  },
  {
    id: "midnight",
    nameEn: "Midnight — Indigo & Gold",
    nameAr: "منتصف الليل — نيلي وذهبي",
    colors: {
      primary: "#1E1B4B", secondary: "#312E81",
      accent: ["#6366F1", "#FBBF24", "#E0E7FF", "#A5B4FC", "#FDE68A", "#312E81"],
      background: "#FFFFFF", surface: "#F5F3FF", foreground: "#0F0E2C",
    },
    charts: ["#1E1B4B", "#6366F1", "#FBBF24", "#A5B4FC", "#FDE68A", "#312E81"],
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
  },
  {
    id: "sand",
    nameEn: "Sand — Bronze & Charcoal",
    nameAr: "رمل — برونزي وفحمي",
    colors: {
      primary: "#1F2937", secondary: "#B45309",
      accent: ["#D97706", "#92400E", "#FEF3C7", "#374151", "#9CA3AF", "#FBBF24"],
      background: "#FFFFFF", surface: "#FAF7F2", foreground: "#111827",
    },
    charts: ["#1F2937", "#B45309", "#D97706", "#92400E", "#9CA3AF", "#FBBF24"],
    fonts: { en_primary: "Source Sans 3", ar_primary: "Tajawal" },
  },
  {
    id: "slate",
    nameEn: "Boardroom — Slate & Emerald",
    nameAr: "قاعة المجلس — رمادي وزمردي",
    colors: {
      primary: "#0F172A", secondary: "#065F46",
      accent: ["#10B981", "#22D3EE", "#E2E8F0", "#94A3B8", "#34D399", "#1E293B"],
      background: "#FFFFFF", surface: "#F8FAFC", foreground: "#0F172A",
    },
    charts: ["#0F172A", "#10B981", "#22D3EE", "#94A3B8", "#34D399", "#1E293B"],
    fonts: { en_primary: "Inter", ar_primary: "Cairo" },
  },
];

// Curated EN/AR font pairs — used by the brand-kit picker in the wizard.
export const FONT_PAIRS: { id: string; en: string; ar: string; label: string }[] = [
  { id: "inter-plex",    en: "Inter",          ar: "IBM Plex Sans Arabic", label: "Inter · IBM Plex" },
  { id: "source-tajawal",en: "Source Sans 3",  ar: "Tajawal",              label: "Source Sans · Tajawal" },
  { id: "inter-cairo",   en: "Inter",          ar: "Cairo",                label: "Inter · Cairo" },
  { id: "lora-amiri",    en: "Lora",           ar: "Amiri",                label: "Lora · Amiri (formal)" },
  { id: "system",        en: "system-ui",      ar: "system-ui",            label: "System default" },
];

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
