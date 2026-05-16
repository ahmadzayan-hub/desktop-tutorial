import { z } from "zod";

export const Confidence = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Confidence = z.infer<typeof Confidence>;

export const Citation = z.object({
  citation_page: z.number().int().min(1).nullable(),
  citation_quote: z.string().max(300).nullable(),
  confidence: Confidence,
});

export const MissingField = z.object({
  field: z.string(),
  reason: z.string(),
});

export const Bilingual = z.object({
  en: z.string(),
  ar: z.string(),
});

export const ContractKpi = z.object({
  name_en: z.string(),
  name_ar: z.string(),
  description: z.string(),
  penalty_rate: z.number(),
  penalty_unit: z.enum(["per_day", "per_event", "per_month"]),
  cap_pct: z.number(),
  citation_page: z.number().int().min(1),
  citation_quote: z.string().max(300),
  confidence: Confidence,
});

export const ContractFacts = z.object({
  contract_reference: z.string(),
  contract_title_en: z.string(),
  contract_title_ar: z.string(),
  contract_value_excl_vat: z.number(),
  currency: z.string().length(3),
  vat_pct: z.number(),
  duration_months: z.number(),
  commencement_date: z.string(),
  client_org_en: z.string(),
  client_org_ar: z.string(),
  consultant_org_en: z.string(),
  consultant_org_ar: z.string(),
  performance_bond: z.object({
    value: z.number(),
    pct: z.number(),
    type: z.string(),
  }),
  professional_indemnity_cap: z.number(),
  force_majeure_clause_present: z.boolean(),
  order_of_precedence: z.array(z.string()),
  kpis: z.array(ContractKpi),
  work_packages: z.array(
    z.object({
      code: z.string(),
      name_en: z.string(),
      name_ar: z.string(),
      mandatory: z.boolean(),
      value: z.number().nullable(),
      duration_months: z.number().nullable(),
      scope_summary_en: z.string(),
      scope_summary_ar: z.string(),
      key_personnel: z.array(z.string()),
    }),
  ),
  missing_fields: z.array(MissingField),
  ambiguities: z.array(
    z.object({
      description: z.string(),
      options: z.array(z.string()),
    }),
  ),
});

export type ContractFacts = z.infer<typeof ContractFacts>;

export const RiskEntry = z.object({
  title_en: z.string(),
  title_ar: z.string(),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  mitigation: z.string(),
  owner: z.string(),
  status: z.enum(["open", "mitigating", "closed"]),
  citation_page: z.number().int().min(1),
  citation_quote: z.string().max(300),
  confidence: Confidence,
});

export const MprFacts = z.object({
  report_period_start: z.string(),
  report_period_end: z.string(),
  prepared_by: z.string(),
  cumulative_planned_value: z.number(),
  cumulative_actual_cost: z.number(),
  cumulative_earned_value: z.number(),
  period_invoiced: z.number(),
  cumulative_invoiced: z.number(),
  percent_complete_weighted: z.number(),
  percent_complete_delivered: z.number(),
  schedule_performance_index: z.number(),
  cost_performance_index: z.number(),
  document_review_counts: z.array(
    z.object({
      workstream: z.string(),
      approved: z.number().int(),
      rejected: z.number().int(),
      pending: z.number().int(),
      total: z.number().int(),
    }),
  ),
  active_risks: z.array(RiskEntry),
  mobilisation_changes: z.array(
    z.object({
      role: z.string(),
      name: z.string(),
      action: z.enum(["mobilised", "replaced", "demobilised", "pending_interview"]),
      date: z.string(),
    }),
  ),
  milestones_met_this_period: z.array(
    z.object({
      name_en: z.string(),
      name_ar: z.string(),
      date: z.string(),
      citation_page: z.number().int().min(1),
      citation_quote: z.string().max(300),
    }),
  ),
  milestones_missed: z.array(
    z.object({
      name_en: z.string(),
      name_ar: z.string(),
      planned_date: z.string(),
      status: z.string(),
      mitigation: z.string(),
    }),
  ),
  upcoming_milestones_next_period: z.array(
    z.object({
      name_en: z.string(),
      name_ar: z.string(),
      target_date: z.string(),
      dependencies: z.array(z.string()),
    }),
  ),
  outstanding_decisions_required: z.array(
    z.object({
      description: z.string(),
      required_from: z.string(),
      deadline: z.string(),
    }),
  ),
  missing_fields: z.array(MissingField),
});

export type MprFacts = z.infer<typeof MprFacts>;
