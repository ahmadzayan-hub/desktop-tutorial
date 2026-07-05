"use client";

import { motion } from "motion/react";
import { AlertCircle, CheckCircle2, Cpu, Download, Loader2 } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useLocale } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils/cn";
import { AVAILABLE_MODELS, type LlmProgress, type LlmStatus } from "@/lib/llm/web-llm";

interface Props {
  progress: LlmProgress;
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  onLoad: () => void;
  onUnload: () => void;
}

export function AiEngineCard({
  progress,
  selectedModelId,
  onSelectModel,
  onLoad,
  onUnload,
}: Props) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const status: LlmStatus = progress.status;
  const selected =
    AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ?? AVAILABLE_MODELS[1]!;

  const badge = statusBadge(status, progress, t);
  const busy =
    status === "downloading" || status === "loading" || status === "checking_support";

  return (
    <Section
      icon={<Cpu className="h-4 w-4" />}
      title={t.pipeline.ai.title}
      hint={t.pipeline.ai.privacyNote}
    >
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium",
          badge.color,
        )}
      >
        {busy ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : status === "ready" ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : status === "unsupported" || status === "error" ? (
          <AlertCircle className="h-3 w-3" />
        ) : (
          <Cpu className="h-3 w-3" />
        )}
        {badge.label}
      </div>

      {busy && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full bg-brand-navy"
            animate={{ width: `${Math.max(2, progress.progress * 100)}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500">
            {t.pipeline.ai.select}
          </label>
          <Select
            value={selectedModelId}
            onChange={(e) => onSelectModel(e.target.value)}
            disabled={busy}
            className="mt-1"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {Math.round(m.size_mb)} MB
              </option>
            ))}
          </Select>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {isAr ? selected.description_ar : selected.description_en}
          </p>
        </div>
        <div className="flex gap-2">
          {status === "ready" ? (
            <Button variant="secondary" size="sm" onClick={onUnload}>
              {t.pipeline.ai.unload}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onLoad}
              disabled={busy || status === "unsupported"}
            >
              <Download className="h-3.5 w-3.5" />
              {t.pipeline.ai.download}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        {t.pipeline.ai.warning.replace("{size}", `${Math.round(selected.size_mb)} MB`)}
      </p>
    </Section>
  );
}

interface Translations {
  pipeline: {
    ai: {
      statusReady: string;
      statusUnsupported: string;
      statusOff: string;
      progress: string;
    };
  };
}

function statusBadge(
  status: LlmStatus,
  progress: LlmProgress,
  t: Translations,
): { color: string; label: string } {
  if (status === "ready") {
    return {
      color: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      label: t.pipeline.ai.statusReady,
    };
  }
  if (status === "unsupported") {
    return {
      color: "bg-amber-50 text-amber-700 border border-amber-100",
      label: t.pipeline.ai.statusUnsupported,
    };
  }
  if (status === "error") {
    return {
      color: "bg-rose-50 text-rose-700 border border-rose-100",
      label: progress.text || "Error",
    };
  }
  if (status === "downloading" || status === "loading" || status === "checking_support") {
    return {
      color: "bg-slate-50 text-slate-700 border border-slate-200",
      label: t.pipeline.ai.progress
        .replace("{pct}", String(Math.round(progress.progress * 100)))
        .replace("{text}", progress.text || ""),
    };
  }
  return {
    color: "bg-slate-50 text-slate-500 border border-slate-200",
    label: t.pipeline.ai.statusOff,
  };
}
