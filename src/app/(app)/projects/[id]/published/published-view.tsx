"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle2, FileText, Sparkles, ShieldCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { formatDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { DbProject } from "@/types/database";
import { loadPipeline, type PipelineState } from "@/lib/store/pipeline-store";
import { describeFactType, formatFactPayload } from "@/lib/extraction/mock-extractor";

interface Props {
  project: DbProject;
}

export function PublishedView({ project }: Props) {
  const { t, locale, dir } = useLocale();
  const isAr = locale === "ar";
  const search = useSearchParams();
  const shouldPrint = search.get("print") === "1";

  const [state, setState] = useState<PipelineState | null>(null);
  useEffect(() => {
    setState(loadPipeline(project.id));
  }, [project.id]);

  useEffect(() => {
    if (!shouldPrint || !state) return;
    const t = window.setTimeout(() => window.print(), 600);
    return () => window.clearTimeout(t);
  }, [shouldPrint, state]);

  const brief = state?.briefs[0] ?? null;
  const snapshot = state?.snapshots[0] ?? null;

  const grouped = useMemo(() => {
    const facts = state?.facts ?? [];
    const g: Record<"key_terms" | "performance" | "risk", typeof facts> = {
      key_terms: [],
      performance: [],
      risk: [],
    };
    for (const f of facts) {
      const meta = describeFactType(f.fact_type, locale);
      g[meta.group].push(f);
    }
    return g;
  }, [state, locale]);

  const subjectLabel = t.subjects[project.subject];

  return (
    <div dir={dir} className="bg-slate-50 print:bg-white">
      <div className="mx-auto max-w-3xl px-5 py-10 print:max-w-none print:px-0 print:py-0">
        {!shouldPrint && (
          <div className="mb-6 flex justify-end print:hidden">
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              {t.pipeline.publish.print}
            </Button>
          </div>
        )}

        {!state || !brief || !snapshot ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            {t.pipeline.publish.empty}
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:shadow-none"
          >
            <header className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>{isAr ? "مُتابِصِر · لوحة المدير" : "Mutabasir · Director's Lens"}</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  {t.pipeline.publish.published}
                </span>
              </div>
              <h1 className="display-tight mt-3 text-3xl font-bold text-brand-navy">
                {project.name}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {subjectLabel} ·{" "}
                {locale === "ar" && project.client_authority_ar
                  ? project.client_authority_ar
                  : project.client_authority_en ?? ""}
                {project.counterparty_en
                  ? ` ↔ ${
                      locale === "ar" && project.counterparty_ar
                        ? project.counterparty_ar
                        : project.counterparty_en
                    }`
                  : ""}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isAr ? "صدر في" : "Published on"} {formatDate(snapshot.created_at)}
              </p>
            </header>

            <section className="mt-6">
              <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-navy">
                <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
                {isAr ? "الموجز التنفيذي" : "Executive brief"}
              </div>
              <div
                dir={isAr ? "rtl" : "ltr"}
                className="prose prose-sm max-w-none text-slate-800 prose-headings:text-brand-navy prose-headings:font-semibold prose-strong:text-brand-navy"
              >
                <BriefBody text={isAr ? brief.text_ar : brief.text_en} />
              </div>
            </section>

            <section className="mt-8 grid gap-5 sm:grid-cols-2">
              {(["key_terms", "performance", "risk"] as const).map((group) =>
                grouped[group].length === 0 ? null : (
                  <div
                    key={group}
                    className={cn(
                      "rounded-xl border border-slate-200 bg-slate-50/60 p-4",
                      group === "risk" && "border-amber-200 bg-amber-50/40",
                    )}
                  >
                    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {t.pipeline.extract.groups[group]}
                    </h3>
                    <ul className="space-y-2.5">
                      {grouped[group].map((f) => {
                        const meta = describeFactType(f.fact_type, locale);
                        return (
                          <li key={f.id}>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              {meta.label}
                            </p>
                            <p className="mt-0.5 text-sm text-slate-800">
                              {formatFactPayload(
                                f.fact_type,
                                f.payload_json,
                                locale,
                              )}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ),
              )}
            </section>

            <section className="mt-8 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  {isAr ? "بوابة الجودة · " : "Quality gate · "}
                  {snapshot.quality.score}/5
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {state.documents.length} {isAr ? "مستند" : "document(s)"}
                </span>
                <span>
                  {isAr ? "كود اللقطة" : "Snapshot"}: {snapshot.share_token}
                </span>
              </div>
            </section>
          </motion.article>
        )}
      </div>
    </div>
  );
}

function BriefBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const trimmed = b.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="mt-4 first:mt-0">
              {trimmed.slice(3)}
            </h3>
          );
        }
        const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**") ? (
                <strong key={j}>{p.slice(2, -2)}</strong>
              ) : (
                <span key={j}>{p}</span>
              ),
            )}
          </p>
        );
      })}
    </>
  );
}
