"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ClipboardCheck,
  Compass,
  Cpu,
  DollarSign,
  FileText,
  Info,
  Languages,
  LayoutDashboard,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { FactItem } from "@/components/facts/fact-item";
import { useLocale } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/numbers";
import type { PipelineDocument } from "@/lib/store/pipeline-store";
import type { AgentId, AgentReport, AgentTone } from "@/lib/agents/types";
import { AGENTS_BY_ID } from "@/lib/agents/registry";

interface Props {
  reports: readonly AgentReport[];
  documents: readonly PipelineDocument[];
  pageLabel: (n: number) => string;
}

const ICONS: Record<string, LucideIcon> = {
  Cpu,
  FileText,
  DollarSign,
  ClipboardCheck,
  Compass,
  LayoutDashboard,
  Languages,
};

const TONE_CLASSES: Record<AgentTone, { chip: string; bar: string }> = {
  navy: { chip: "bg-brand-navy/10 text-brand-navy", bar: "bg-brand-navy" },
  gold: { chip: "bg-amber-100 text-amber-800", bar: "bg-amber-500" },
  emerald: { chip: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" },
  amber: { chip: "bg-orange-100 text-orange-700", bar: "bg-orange-500" },
  rose: { chip: "bg-rose-100 text-rose-700", bar: "bg-rose-500" },
  violet: { chip: "bg-violet-100 text-violet-700", bar: "bg-violet-500" },
  sky: { chip: "bg-sky-100 text-sky-700", bar: "bg-sky-500" },
};

export function AgentPanel({ reports, documents, pageLabel }: Props) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [active, setActive] = useState<AgentId>("technical");
  const activeReport = useMemo(
    () => reports.find((r) => r.agent === active) ?? reports[0],
    [reports, active],
  );

  const totalFindings = useMemo(
    () => reports.reduce((n, r) => n + r.findings.length, 0),
    [reports],
  );
  const totalClaimed = useMemo(
    () => reports.reduce((n, r) => n + r.facts.length, 0),
    [reports],
  );

  return (
    <Section
      icon={<LayoutDashboard className="h-4 w-4" />}
      title={isAr ? "الوكلاء المتخصّصون" : "Specialist agents"}
      hint={
        isAr
          ? `سبعة وكلاء يقرأون نفس المستندات من زوايا مختلفة · ${formatNumber(totalClaimed, locale)} واقعة موزَّعة · ${formatNumber(totalFindings, locale)} ملاحظة.`
          : `Seven agents read the same corpus from different angles · ${formatNumber(totalClaimed, locale)} facts partitioned · ${formatNumber(totalFindings, locale)} findings.`
      }
    >
      {/* Tab strip — horizontal-scroll on mobile */}
      <div className="-mx-1 overflow-x-auto pb-1">
        <div role="tablist" className="flex min-w-max gap-1 px-1">
          {reports.map((r) => {
            const spec = AGENTS_BY_ID[r.agent];
            const isActive = active === r.agent;
            const tone = TONE_CLASSES[spec.tone];
            const Icon = ICONS[spec.icon] ?? LayoutDashboard;
            const count = r.facts.length + r.findings.length;
            return (
              <button
                key={r.agent}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(r.agent)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? cn(tone.chip, "shadow-sm ring-1 ring-inset ring-black/5")
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{isAr ? spec.name_ar : spec.name_en}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "grid h-4 min-w-[1rem] place-items-center rounded-full px-1 text-[10px] font-bold",
                      isActive ? "bg-white/60" : "bg-slate-200 text-slate-700",
                    )}
                  >
                    {formatNumber(count, locale)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeReport && (
          <motion.div
            key={activeReport.agent}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            <ActiveAgentHeader agent={activeReport.agent} />

            {activeReport.findings.length > 0 && (
              <ul className="space-y-1.5">
                {activeReport.findings.map((f, i) => (
                  <FindingRow key={`${activeReport.agent}-${i}`} finding={f} />
                ))}
              </ul>
            )}

            {activeReport.presentation_hints &&
              activeReport.presentation_hints.length > 0 && (
                <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                    {isAr
                      ? "توصيات العرض التقديمي"
                      : "Presentation recommendations"}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {activeReport.presentation_hints.map((h) => (
                      <li
                        key={h}
                        className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-rose-700 shadow-sm"
                      >
                        {h.replace(/_/g, " ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {activeReport.facts.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2">
                {activeReport.facts.map((f) => (
                  <FactItem
                    key={f.id}
                    fact={f}
                    documents={documents as PipelineDocument[]}
                    locale={locale}
                    pageLabel={pageLabel}
                    compact
                  />
                ))}
              </div>
            ) : activeReport.findings.length === 0 &&
              !activeReport.presentation_hints?.length ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                {isAr
                  ? "لا يوجد شيء يخصّ هذا الوكيل بعد."
                  : "Nothing yet for this agent."}
              </p>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

function ActiveAgentHeader({ agent }: { agent: AgentId }) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const spec = AGENTS_BY_ID[agent];
  const Icon = ICONS[spec.icon] ?? LayoutDashboard;
  const tone = TONE_CLASSES[spec.tone];
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
          tone.chip,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">
          {isAr ? spec.name_ar : spec.name_en}
        </p>
        <p className="text-[11px] text-slate-500">
          {isAr ? spec.focus_ar : spec.focus_en}
        </p>
      </div>
    </div>
  );
}

function FindingRow({ finding }: { finding: import("@/lib/agents/types").ReviewFinding }) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const Icon =
    finding.severity === "error"
      ? XCircle
      : finding.severity === "warning"
        ? AlertTriangle
        : Info;
  const tone =
    finding.severity === "error"
      ? "bg-rose-50 border-rose-200 text-rose-800"
      : finding.severity === "warning"
        ? "bg-amber-50 border-amber-200 text-amber-800"
        : "bg-sky-50 border-sky-200 text-sky-800";
  return (
    <li
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
        tone,
      )}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">
          {isAr ? finding.message_ar : finding.message_en}
        </p>
        {finding.excerpt && (
          <p className="mt-0.5 truncate font-mono text-[10px] text-slate-600">
            {finding.excerpt}
          </p>
        )}
      </div>
    </li>
  );
}
