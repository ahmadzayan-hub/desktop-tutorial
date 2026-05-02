"use client";

import { useMemo, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import type { DictKey } from "@/lib/i18n/dictionaries";
import { analysePrompt } from "@/lib/reverse-analyzer";
import { suggestForDraft, localizedSuggestion } from "@/lib/live-suggestions";

const INTENT_KEY: Record<string, DictKey> = {
  coding: "intent.coding",     writing: "intent.writing",
  research: "intent.research", analysis: "intent.analysis",
  planning: "intent.planning", creative: "intent.creative",
  design: "intent.design",     conversation: "intent.conversation",
  image: "intent.image",       video: "intent.video",
  audio: "intent.audio",       software: "intent.software",
  website: "intent.website",   report: "intent.report",
  other: "intent.other"
};

/**
 * Reverse mode: paste a polished prompt, see why it's good.
 *
 * Renders an analysis: detected intent, quality dimensions, the structural
 * skeleton (which sections it has), and a single learning suggestion for the
 * weakest dimension. Fully local. no network calls.
 */
export default function ReverseMode() {
  const t = useT();
  const { locale } = useI18n();
  const [text, setText] = useState("");
  const [pushed, setPushed] = useState<{ before: number; after: number } | null>(null);

  const analysis = useMemo(() => (text.trim() ? analysePrompt(text) : null), [text]);
  const topSuggestion = useMemo(() => {
    if (!analysis) return null;
    return suggestForDraft(text, { intent: analysis.intent, locale }, 1)[0] ?? null;
  }, [text, analysis, locale]);

  function pushItFurther() {
    if (!topSuggestion || !analysis) return;
    const append = locale === "ar" ? topSuggestion.append_ar : topSuggestion.append_en;
    const beforeScore = analysis.score.total;
    const next = text.trim() + append;
    setText(next);
    // Re-score immediately so the user sees the delta
    const after = analysePrompt(next).score.total;
    setPushed({ before: beforeScore, after });
    setTimeout(() => setPushed(null), 4000);
  }

  return (
    <div className="card shadow-sm space-y-4">
      <div>
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <label htmlFor="reverse-input" className="text-sm font-medium">
            {t("reverse.label")}
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {analysis ? `${analysis.wordCount} ${t("reverse.words")}` : ""}
          </span>
        </div>
        <textarea
          id="reverse-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full mt-2 min-h-[140px] resize-y"
          placeholder={t("reverse.placeholder")}
        />
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{t("reverse.hint")}</p>
      </div>

      {analysis && (
        <div className="space-y-3">
          {/* Intent + score summary */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400">{t("reverse.detected_intent")}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
              {t(INTENT_KEY[analysis.intent] ?? "intent.other")}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · {Math.round(analysis.intentConfidence * 100)}%
            </span>
            <span className="ms-auto text-sm font-semibold tabular-nums">
              {analysis.score.total}/100
            </span>
          </div>

          {/* Section skeleton */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t("reverse.skeleton")}
            </div>
            {analysis.sections.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("reverse.no_sections")}</p>
            ) : (
              <ol className="list-decimal ms-5 space-y-0.5">
                {analysis.sections.map((s, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300">{s}</li>
                ))}
              </ol>
            )}
          </div>

          {/* Strengths */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-900/10 dark:border-emerald-800 p-3">
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
              {t("reverse.strengths")}
            </div>
            <ul className="text-xs space-y-0.5 text-emerald-900 dark:text-emerald-200">
              {analysis.hasRole && <li>• {t("reverse.has_role")}</li>}
              {analysis.score.audience >= 14 && <li>• {t("reverse.has_audience")}</li>}
              {analysis.score.format >= 14 && <li>• {t("reverse.has_format")}</li>}
              {analysis.score.structure >= 14 && <li>• {t("reverse.has_structure")}</li>}
              {analysis.hasCta && <li>• {t("reverse.has_cta")}</li>}
            </ul>
          </div>

          {/* Push-it-further: actionable, not just a hint */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 dark:bg-amber-900/10 dark:border-amber-800 p-3">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
              {t("reverse.learn")}
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200">
              {topSuggestion
                ? (locale === "ar" ? topSuggestion.preview_ar : topSuggestion.preview_en)
                : t(analysis.weakestSuggestion as DictKey)}
            </p>
            {topSuggestion && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={pushItFurther}
                  className="btn-primary text-xs"
                >
                  ✨ {t("ws.btn.push_further")}
                </button>
                {pushed && (
                  <span
                    className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium tabular-nums"
                    aria-live="polite"
                  >
                    {t("reverse.pushed", { before: pushed.before, after: pushed.after })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
