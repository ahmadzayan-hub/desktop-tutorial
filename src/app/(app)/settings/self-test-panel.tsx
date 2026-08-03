"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, PlayCircle, XCircle } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/numbers";
import { runSelfTest, type SelfTestReport } from "@/lib/self-test/runner";

export function SelfTestPanel() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [report, setReport] = useState<SelfTestReport | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    try {
      const r = await runSelfTest();
      setReport(r);
    } finally {
      setRunning(false);
    }
  }

  const allPassed = report ? report.passed === report.total : false;

  return (
    <Section
      icon={<PlayCircle className="h-4 w-4" />}
      title={isAr ? "فحص ذاتي" : "Self-test"}
      hint={
        isAr
          ? "يُشغّل خطّ الأنابيب الكامل (استخراج · موجز · بوّابة جودة) على مشروعٍ تجريبيّ ويُبلِغ عن كلّ فحص."
          : "Runs the full pipeline (extract · brief · quality gate) against a synthetic project and reports per-check status."
      }
      action={
        <Button size="sm" onClick={run} disabled={running}>
          {running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <PlayCircle className="h-3.5 w-3.5" />
          )}
          {isAr ? "شغّل الفحص" : "Run self-test"}
        </Button>
      }
    >
      {!report && !running ? (
        <p className="text-xs text-slate-500">
          {isAr
            ? "اضغط زرّ التشغيل أعلاه — الفحوصات تستغرق أقلّ من ثانية."
            : "Click Run above — the checks complete in under a second."}
        </p>
      ) : (
        <AnimatePresence mode="wait">
          {report && (
            <motion.div
              key={report.ran_at}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div
                className={cn(
                  "flex items-baseline justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium",
                  allPassed
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-amber-100 bg-amber-50 text-amber-700",
                )}
              >
                <span>
                  {formatNumber(report.passed, locale)}/
                  {formatNumber(report.total, locale)}{" "}
                  {isAr ? "فحوصات ناجحة" : "checks passed"}
                </span>
                <span className="tabular-nums text-[11px] opacity-70">
                  {formatNumber(report.duration_ms, locale)}
                  {isAr ? " م.ث" : " ms"}
                </span>
              </div>

              <ul className="space-y-1.5">
                {report.checks.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-2 rounded-md border border-slate-100 bg-white px-3 py-2 text-sm"
                  >
                    {c.status === "pass" ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "font-medium",
                          c.status === "pass" ? "text-slate-800" : "text-rose-700",
                        )}
                      >
                        {isAr ? c.label_ar : c.label_en}
                      </p>
                      {c.detail && (
                        <p className="text-[11px] text-slate-500">{c.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Section>
  );
}
