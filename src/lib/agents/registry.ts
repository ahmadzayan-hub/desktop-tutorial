// The seven specialist agents. Each declares its focus area and the
// fact types it claims from the shared extraction. Add a new agent by
// appending to AGENTS and (if needed) extending AgentId in ./types.

import type { AgentSpec } from "./types";

export const AGENTS: readonly AgentSpec[] = [
  {
    id: "technical",
    name_en: "Technical Expert",
    name_ar: "الخبير الفنّي",
    focus_en: "Scope, technical performance, physical progress, HSE.",
    focus_ar: "النطاق والأداء الفنّي والتقدّم المادّي والصحّة والسلامة.",
    tone: "navy",
    icon: "Cpu",
    fact_types: [
      "project_scope",
      "physical_progress",
      "asset_inventory",
      "sla_performance",
      "hse_performance",
      "milestone_status",
    ],
  },
  {
    id: "contract",
    name_en: "Contract Expert",
    name_ar: "خبير العقود",
    focus_en: "Parties, term, governing law, termination, LDs.",
    focus_ar: "الأطراف والمدّة والقانون الحاكم والإنهاء وغرامات التأخير.",
    tone: "violet",
    icon: "FileText",
    fact_types: [
      "contracting_parties",
      "term",
      "governing_law",
      "service_contract",
      "termination",
      "liquidated_damages",
    ],
  },
  {
    id: "financial",
    name_en: "Financial Expert",
    name_ar: "الخبير المالي",
    focus_en: "Contract value, payment terms, change orders, cash flow.",
    focus_ar: "قيمة العقد وشروط الدفع وأوامر التغيير والتدفّق النقدي.",
    tone: "emerald",
    icon: "DollarSign",
    fact_types: [
      "contract_value",
      "payment_terms",
      "invoiced_to_date",
      "change_orders",
    ],
  },
  {
    id: "administration",
    name_en: "Administration Expert",
    name_ar: "الخبير الإداري",
    focus_en: "Governance, evaluation weights, award, submission windows.",
    focus_ar: "الحوكمة وأوزان التقييم والترسية ومواعيد التقديم.",
    tone: "sky",
    icon: "ClipboardCheck",
    fact_types: [
      "issuing_authority",
      "evaluation_weights",
      "bidder_scores",
      "submission_deadline",
      "recommended_award",
    ],
  },
  {
    id: "pmi",
    name_en: "Project Manager · PMI",
    name_ar: "مدير المشروع · PMI",
    focus_en: "Schedule variance, SPI/CPI, backlog, delivery risk.",
    focus_ar: "انحراف الجدول ومؤشّرات SPI/CPI والمتأخّرات ومخاطر التسليم.",
    tone: "gold",
    icon: "Compass",
    fact_types: [
      "schedule_status",
      "work_order_backlog",
      "open_risk",
    ],
  },
  {
    id: "presentation",
    name_en: "Presentation Designer",
    name_ar: "مصمّم العروض والتقارير",
    focus_en: "Chart selection, hierarchy, executive layout choices.",
    focus_ar: "اختيار الرسوم البيانيّة والتسلسل الهرمي وخيارات التصميم التنفيذي.",
    tone: "rose",
    icon: "LayoutDashboard",
    // Presentation designer doesn't claim facts — it emits presentation
    // hints in the AgentReport instead.
    fact_types: [],
  },
  {
    id: "language",
    name_en: "Language Reviewer (AR + EN)",
    name_ar: "مراجع اللغة (عربي + إنجليزي)",
    focus_en: "Grammar, punctuation, mixed digits, RTL/LTR direction.",
    focus_ar: "القواعد وعلامات الترقيم واختلاط الأرقام واتّجاه النصّ.",
    tone: "amber",
    icon: "Languages",
    fact_types: [],
  },
] as const;

export const AGENTS_BY_ID = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<(typeof AGENTS)[number]["id"], AgentSpec>;
