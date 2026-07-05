"use client";

import { useState } from "react";
import {
  CheckCheck,
  Copy as CopyIcon,
  Download,
  Languages,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Section, Empty } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SimpleMarkdown } from "@/components/markdown/simple-markdown";
import { useLocale } from "@/lib/i18n/locale-provider";
import { audienceOptions } from "@/lib/brief/composer";
import type { BriefAudience } from "@/types/database";
import type { PipelineBrief } from "@/lib/store/pipeline-store";
import { cn } from "@/lib/utils/cn";

interface Props {
  brief: PipelineBrief | null;
  audience: BriefAudience;
  onSelectAudience: (a: BriefAudience) => void;
  briefLocale: "en" | "ar";
  onSelectLocale: (l: "en" | "ar") => void;
  canGenerate: boolean;
  generating: boolean;
  onGenerate: () => void;
}

export function BriefCard({
  brief,
  audience,
  onSelectAudience,
  briefLocale,
  onSelectLocale,
  canGenerate,
  generating,
  onGenerate,
}: Props) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const [copied, setCopied] = useState(false);

  const text = brief ? (briefLocale === "ar" ? brief.text_ar : brief.text_en) : "";

  function handleCopy() {
    if (!text) return;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleDownload() {
    if (!text) return;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brief-${briefLocale}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Section
      icon={<Languages className="h-4 w-4" />}
      title={t.pipeline.brief.title}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500">
            {t.pipeline.brief.audience}
          </label>
          <Select
            value={audience}
            onChange={(e) => onSelectAudience(e.target.value as BriefAudience)}
            className="mt-1"
          >
            {audienceOptions().map((a) => (
              <option key={a.id} value={a.id}>
                {isAr ? a.label_ar : a.label_en}
              </option>
            ))}
          </Select>
        </div>
        <Button size="sm" onClick={onGenerate} disabled={!canGenerate || generating}>
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {brief ? t.pipeline.brief.regenerate : t.pipeline.brief.generate}
        </Button>
      </div>

      {!brief ? (
        <div className="mt-5">
          <Empty title={t.pipeline.brief.empty} />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              {(["en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onSelectLocale(l)}
                  className={cn(
                    "rounded-md px-3 py-1 font-medium transition-colors",
                    briefLocale === l
                      ? "bg-white text-brand-navy shadow-sm"
                      : "text-slate-500 hover:text-brand-navy",
                  )}
                >
                  {t.pipeline.brief.toggle[l]}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" onClick={handleCopy}>
                {copied ? (
                  <CheckCheck className="h-3.5 w-3.5" />
                ) : (
                  <CopyIcon className="h-3.5 w-3.5" />
                )}
                {copied ? t.pipeline.brief.copied : t.pipeline.brief.copy}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" />
                {t.pipeline.brief.download}
              </Button>
            </div>
          </div>
          <div
            dir={briefLocale === "ar" ? "rtl" : "ltr"}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 text-sm leading-relaxed text-slate-800"
          >
            <SimpleMarkdown text={text} />
          </div>
        </div>
      )}
    </Section>
  );
}
