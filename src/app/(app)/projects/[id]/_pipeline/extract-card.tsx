"use client";

import { useMemo } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Section, Empty } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { FactItem } from "@/components/facts/fact-item";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { DbExtractedFact } from "@/types/database";
import type { PipelineDocument } from "@/lib/store/pipeline-store";
import {
  FACT_GROUP_ORDER,
  groupFactsByCategory,
} from "@/lib/extraction/grouping";

interface Props {
  facts: DbExtractedFact[];
  documents: PipelineDocument[];
  meta: {
    used_llm: boolean;
    model_id: string | null;
    fallback_reason: string | null;
  } | null;
  running: boolean;
  canRun: boolean;
  onRun: () => void;
  onToggleVerified: (id: string) => void;
}

export function ExtractCard({
  facts,
  documents,
  meta,
  running,
  canRun,
  onRun,
  onToggleVerified,
}: Props) {
  const { t, locale } = useLocale();
  const grouped = useMemo(
    () => groupFactsByCategory(facts, locale),
    [facts, locale],
  );

  const pageLabel = (n: number) => t.pipeline.extract.page.replace("{n}", String(n));

  const sourceLine =
    meta && facts.length > 0
      ? meta.used_llm
        ? t.pipeline.extract.sourceLlm.replace("{model}", meta.model_id ?? "")
        : meta.fallback_reason
          ? t.pipeline.extract.fallback.replace("{reason}", meta.fallback_reason)
          : t.pipeline.extract.sourceMock
      : null;

  return (
    <Section
      icon={<Sparkles className="h-4 w-4 text-brand-gold" />}
      title={t.pipeline.extract.title}
      hint={sourceLine ?? undefined}
      action={
        <Button onClick={onRun} disabled={!canRun || running} size="sm">
          {running ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t.pipeline.extract.running}
            </>
          ) : facts.length === 0 ? (
            t.pipeline.extract.run
          ) : (
            t.pipeline.extract.runAgain
          )}
        </Button>
      }
    >
      {facts.length === 0 ? (
        <Empty
          icon={<Sparkles className="h-4 w-4" />}
          title={t.pipeline.extract.empty}
        />
      ) : (
        <div className="space-y-6">
          {FACT_GROUP_ORDER.map((group) =>
            grouped[group].length === 0 ? null : (
              <section key={group}>
                <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {t.pipeline.extract.groups[group]}
                </h3>
                <div className="grid gap-2.5 md:grid-cols-2">
                  {grouped[group].map((f) => (
                    <FactItem
                      key={f.id}
                      fact={f}
                      documents={documents}
                      locale={locale}
                      pageLabel={pageLabel}
                      verified={f.user_verified}
                      onToggleVerified={onToggleVerified}
                      verifyLabel={t.pipeline.extract.verify}
                      verifiedLabel={t.pipeline.extract.verified}
                    />
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </Section>
  );
}
