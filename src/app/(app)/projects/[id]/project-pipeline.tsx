"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileUp,
  FileText,
  Trash2,
  Sparkles,
  Cpu,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy as CopyIcon,
  CheckCheck,
  ExternalLink,
  Printer,
  Globe,
  ShieldCheck,
  Languages,
  X,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useLocale } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils/cn";
import type { DbProject, DbExtractedFact, BriefAudience } from "@/types/database";
import {
  type PipelineDocument,
  type PipelineBrief,
  type PipelineSnapshot,
  type PipelineState,
  classifyByFilename,
  formatBytes,
  loadPipeline,
  newId,
  readFilePreview,
  savePipeline,
} from "@/lib/store/pipeline-store";
import { extractText } from "@/lib/parsers/document-text";
import {
  AVAILABLE_MODELS,
  DEFAULT_MODEL_ID,
  type LlmProgress,
  type LlmStatus,
  ensureEngine,
  getLoadedModelId,
  unloadEngine,
} from "@/lib/llm/web-llm";
import { extractFactsWithLlm } from "@/lib/extraction/llm-extractor";
import { runMockExtraction, describeFactType, formatFactPayload } from "@/lib/extraction/mock-extractor";
import { audienceOptions, composeBrief } from "@/lib/brief/composer";

interface Props {
  project: DbProject;
}

const MAX_FILES = 25;

export function ProjectPipeline({ project }: Props) {
  const { t, locale, dir } = useLocale();
  const isAr = locale === "ar";

  // Persisted state
  const [state, setState] = useState<PipelineState>({
    documents: [],
    facts: [],
    briefs: [],
    snapshots: [],
  });
  const [hydrated, setHydrated] = useState(false);
  // Per-document parsed text — not persisted (could exceed localStorage quota).
  const [docTexts, setDocTexts] = useState<Record<string, string>>({});
  const [docPages, setDocPages] = useState<Record<string, number>>({});

  useEffect(() => {
    setState(loadPipeline(project.id));
    setHydrated(true);
  }, [project.id]);

  useEffect(() => {
    if (!hydrated) return;
    savePipeline(project.id, state);
  }, [hydrated, project.id, state]);

  // --- Upload ---
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parsing, setParsing] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setParsing(true);
    const queue = Array.from(files).slice(0, MAX_FILES - state.documents.length);
    const newDocs: PipelineDocument[] = [];
    const newTexts: Record<string, string> = {};
    const newPages: Record<string, number> = {};
    for (const file of queue) {
      const cls = classifyByFilename(file.name);
      const id = newId("doc");
      const preview = await readFilePreview(file);
      const parsed = await extractText(file);
      if (parsed.text) {
        newTexts[id] = parsed.text;
        newPages[id] = parsed.pages;
      }
      newDocs.push({
        id,
        project_id: project.id,
        filename: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        document_type: cls.type,
        classification_confidence: cls.confidence,
        preview_text: preview ?? parsed.text.slice(0, 500) ?? null,
        created_at: new Date().toISOString(),
      });
    }
    setState((s) => ({ ...s, documents: [...s.documents, ...newDocs] }));
    setDocTexts((m) => ({ ...m, ...newTexts }));
    setDocPages((m) => ({ ...m, ...newPages }));
    setParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeDocument(id: string) {
    setState((s) => ({
      ...s,
      documents: s.documents.filter((d) => d.id !== id),
      facts: s.facts.filter((f) => f.document_id !== id),
    }));
    setDocTexts((m) => {
      const { [id]: _omit, ...rest } = m;
      return rest;
    });
    setDocPages((m) => {
      const { [id]: _omit, ...rest } = m;
      return rest;
    });
  }

  // --- AI engine ---
  const [llmProgress, setLlmProgress] = useState<LlmProgress>({
    status: "idle",
    progress: 0,
    text: "",
    model_id: getLoadedModelId(),
    error: null,
  });
  const [selectedModelId, setSelectedModelId] = useState<string>(
    getLoadedModelId() ?? DEFAULT_MODEL_ID,
  );

  async function handleLoadModel() {
    try {
      await ensureEngine(selectedModelId, (status) => {
        setLlmProgress(adaptStatus(status, selectedModelId));
      });
    } catch {
      // status already reflected
    }
  }

  async function handleUnload() {
    await unloadEngine();
    setLlmProgress({
      status: "idle",
      progress: 0,
      text: "",
      model_id: null,
      error: null,
    });
  }

  // --- Extraction ---
  const [extracting, setExtracting] = useState(false);
  const [extractionMeta, setExtractionMeta] = useState<{
    used_llm: boolean;
    model_id: string | null;
    fallback_reason: string | null;
  } | null>(null);

  async function handleExtract() {
    if (state.documents.length === 0) return;
    setExtracting(true);
    try {
      // If a model is loaded, try LLM extraction first. Otherwise run mock directly.
      if (getLoadedModelId()) {
        const result = await extractFactsWithLlm({
          projectId: project.id,
          subject: project.subject,
          authorityEn: project.client_authority_en,
          counterpartyEn: project.counterparty_en,
          documents: state.documents,
          documentTexts: docTexts,
        });
        setState((s) => ({ ...s, facts: result.facts }));
        setExtractionMeta({
          used_llm: result.used_llm,
          model_id: result.model_id,
          fallback_reason: result.fallback_reason,
        });
      } else {
        const facts = runMockExtraction({
          projectId: project.id,
          subject: project.subject,
          documents: state.documents,
          authorityEn: project.client_authority_en,
          counterpartyEn: project.counterparty_en,
        });
        setState((s) => ({ ...s, facts }));
        setExtractionMeta({
          used_llm: false,
          model_id: null,
          fallback_reason: null,
        });
      }
    } finally {
      setExtracting(false);
    }
  }

  function toggleVerified(factId: string) {
    setState((s) => ({
      ...s,
      facts: s.facts.map((f) =>
        f.id === factId ? { ...f, user_verified: !f.user_verified } : f,
      ),
    }));
  }

  // --- Brief ---
  const [audience, setAudience] = useState<BriefAudience>("director");
  const [briefLocale, setBriefLocale] = useState<"en" | "ar">(locale);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  function handleGenerateBrief() {
    if (state.facts.length === 0) return;
    setGeneratingBrief(true);
    try {
      const composed = composeBrief({
        projectName: project.name,
        subject: project.subject,
        audience,
        authorityEn: project.client_authority_en,
        authorityAr: project.client_authority_ar,
        counterpartyEn: project.counterparty_en,
        counterpartyAr: project.counterparty_ar,
        facts: state.facts,
        locale: briefLocale,
      });
      const brief: PipelineBrief = {
        id: newId("brief"),
        project_id: project.id,
        text_en: composed.text_en,
        text_ar: composed.text_ar,
        audience,
        created_at: new Date().toISOString(),
      };
      setState((s) => ({ ...s, briefs: [brief, ...s.briefs] }));
    } finally {
      setGeneratingBrief(false);
    }
  }

  const latestBrief = state.briefs[0] ?? null;

  // --- Publish ---
  const quality = useMemo(() => {
    const has_documents = state.documents.length > 0;
    const has_facts = state.facts.length > 0;
    const has_brief = state.briefs.length > 0;
    const has_high = state.facts.some((f) => f.confidence === "HIGH");
    const has_risk = state.facts.some((f) => f.fact_type === "open_risk");
    const score = [has_documents, has_facts, has_brief, has_high, has_risk].filter(Boolean)
      .length;
    return { has_documents, has_facts, has_brief, has_high, has_risk, score };
  }, [state]);

  function handlePublish() {
    if (!latestBrief) return;
    const snapshot: PipelineSnapshot = {
      id: newId("snap"),
      project_id: project.id,
      brief_id: latestBrief.id,
      share_token: newId("share").slice(0, 16),
      published: true,
      override_note: null,
      created_at: new Date().toISOString(),
      quality: {
        has_documents: quality.has_documents,
        has_facts: quality.has_facts,
        has_brief: quality.has_brief,
        score: quality.score,
      },
    };
    setState((s) => ({ ...s, snapshots: [snapshot, ...s.snapshots] }));
  }

  const latestSnapshot = state.snapshots[0] ?? null;

  // --- Render ---
  if (!hydrated) {
    return (
      <Card>
        <CardBody className="py-10 text-center text-sm text-slate-500">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      <StageRail
        stages={[
          { id: "upload", label: t.pipeline.stages.upload, done: state.documents.length > 0 },
          { id: "extract", label: t.pipeline.stages.extract, done: state.facts.length > 0 },
          { id: "brief", label: t.pipeline.stages.brief, done: state.briefs.length > 0 },
          { id: "publish", label: t.pipeline.stages.publish, done: state.snapshots.length > 0 },
        ]}
      />

      <UploadCard
        documents={state.documents}
        parsing={parsing}
        pages={docPages}
        onPick={() => fileInputRef.current?.click()}
        onFiles={handleFiles}
        onRemove={removeDocument}
        fileInputRef={fileInputRef}
      />

      <AiCard
        progress={llmProgress}
        selectedModelId={selectedModelId}
        onSelectModel={setSelectedModelId}
        onLoad={handleLoadModel}
        onUnload={handleUnload}
      />

      <ExtractCard
        facts={state.facts}
        documents={state.documents}
        meta={extractionMeta}
        running={extracting}
        canRun={state.documents.length > 0}
        onRun={handleExtract}
        onToggleVerified={toggleVerified}
      />

      <BriefCard
        brief={latestBrief}
        audience={audience}
        onSelectAudience={setAudience}
        briefLocale={briefLocale}
        onSelectLocale={setBriefLocale}
        canGenerate={state.facts.length > 0}
        generating={generatingBrief}
        onGenerate={handleGenerateBrief}
        isAr={isAr}
      />

      <PublishCard
        snapshot={latestSnapshot}
        brief={latestBrief}
        projectId={project.id}
        quality={quality}
        onPublish={handlePublish}
      />
    </div>
  );
}

// ---------- subcomponents --------------------------------------------------

function adaptStatus(
  s: {
    phase: "idle" | "checking" | "downloading" | "ready" | "error";
    progress?: number;
    text?: string;
    modelId?: string;
    message?: string;
  },
  modelId: string,
): LlmProgress {
  switch (s.phase) {
    case "idle":
      return { status: "idle", progress: 0, text: "", model_id: null, error: null };
    case "checking":
      return {
        status: "checking_support",
        progress: 0,
        text: "Checking WebGPU…",
        model_id: modelId,
        error: null,
      };
    case "downloading":
      return {
        status: "downloading",
        progress: s.progress ?? 0,
        text: s.text ?? "",
        model_id: modelId,
        error: null,
      };
    case "ready":
      return {
        status: "ready",
        progress: 1,
        text: "Ready",
        model_id: s.modelId ?? modelId,
        error: null,
      };
    case "error":
      return {
        status: s.message?.toLowerCase().includes("webgpu") ? "unsupported" : "error",
        progress: 0,
        text: s.message ?? "Error",
        model_id: modelId,
        error: s.message ?? "Error",
      };
  }
}

function StageRail({
  stages,
}: {
  stages: { id: string; label: string; done: boolean }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-3">
        {stages.map((s, i) => (
          <li key={s.id} className="flex items-center gap-1.5 sm:gap-3">
            <span
              className={cn(
                "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-[10px] font-bold",
                s.done
                  ? "bg-brand-navy text-white"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {s.done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "font-medium",
                s.done ? "text-brand-navy" : "text-slate-500",
              )}
            >
              {s.label}
            </span>
            {i < stages.length - 1 && (
              <span className="hidden h-px w-6 bg-slate-200 sm:inline-block" />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function UploadCard({
  documents,
  parsing,
  pages,
  onPick,
  onFiles,
  onRemove,
  fileInputRef,
}: {
  documents: PipelineDocument[];
  parsing: boolean;
  pages: Record<string, number>;
  onPick: () => void;
  onFiles: (f: FileList | null) => void;
  onRemove: (id: string) => void;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
}) {
  const { t, locale } = useLocale();
  const [over, setOver] = useState(false);
  const totalBytes = documents.reduce((n, d) => n + d.size_bytes, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <FileUp className="h-4 w-4 text-brand-navy" />
            {t.pipeline.upload.title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <p className="mb-4 text-xs leading-relaxed text-slate-500">
          {t.pipeline.upload.hint}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,.csv,.json,.log,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            onFiles(e.dataTransfer.files);
          }}
          onClick={onPick}
          animate={{ borderColor: over ? "#171C8F" : "#CBD5E1" }}
          className="cursor-pointer rounded-xl border-2 border-dashed bg-slate-50/70 py-10 text-center transition-colors"
        >
          <FileUp className="mx-auto h-6 w-6 text-brand-navy" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            {t.pipeline.upload.drop}
          </p>
          <Button type="button" size="sm" className="mt-4" onClick={(e) => { e.stopPropagation(); onPick(); }}>
            {t.pipeline.upload.choose}
          </Button>
        </motion.div>

        {parsing && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t.pipeline.upload.parsing}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {documents.length === 0 ? (
            <p className="text-xs text-slate-400">{t.pipeline.upload.empty}</p>
          ) : (
            <>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {t.pipeline.upload.count
                  .replace("{n}", String(documents.length))
                  .replace("{bytes}", formatBytes(totalBytes, locale))}
              </p>
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                <AnimatePresence initial={false}>
                  {documents.map((d) => (
                    <motion.li
                      key={d.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {d.filename}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {formatBytes(d.size_bytes, locale)} ·{" "}
                          {pages[d.id]
                            ? t.pipeline.upload.parsed.replace("{n}", String(pages[d.id]))
                            : t.pipeline.upload.textOnly}{" "}
                          · {d.document_type}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(d.id)}
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-red"
                        aria-label={t.pipeline.upload.remove}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function AiCard({
  progress,
  selectedModelId,
  onSelectModel,
  onLoad,
  onUnload,
}: {
  progress: LlmProgress;
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  onLoad: () => void;
  onUnload: () => void;
}) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const status: LlmStatus = progress.status;
  const selected = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ?? AVAILABLE_MODELS[1]!;

  let badge: { color: string; label: string };
  if (status === "ready") {
    badge = { color: "bg-emerald-100 text-emerald-700", label: t.pipeline.ai.statusReady };
  } else if (status === "unsupported") {
    badge = { color: "bg-amber-100 text-amber-700", label: t.pipeline.ai.statusUnsupported };
  } else if (status === "error") {
    badge = { color: "bg-rose-100 text-rose-700", label: progress.text || "Error" };
  } else if (status === "downloading" || status === "loading" || status === "checking_support") {
    badge = {
      color: "bg-slate-100 text-slate-700",
      label: t.pipeline.ai.progress
        .replace("{pct}", String(Math.round(progress.progress * 100)))
        .replace("{text}", progress.text || ""),
    };
  } else {
    badge = { color: "bg-slate-100 text-slate-500", label: t.pipeline.ai.statusOff };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Cpu className="h-4 w-4 text-brand-navy" />
            {t.pipeline.ai.title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium",
            badge.color,
          )}
        >
          {status === "downloading" || status === "loading" || status === "checking_support" ? (
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

        {(status === "downloading" || status === "loading") && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full bg-brand-navy"
              animate={{ width: `${Math.max(2, progress.progress * 100)}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500">
              {t.pipeline.ai.select}
            </label>
            <Select
              value={selectedModelId}
              onChange={(e) => onSelectModel(e.target.value)}
              disabled={status === "downloading" || status === "loading"}
              className="mt-1"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} · {Math.round(m.size_mb)} MB
                </option>
              ))}
            </Select>
            <p className="mt-1 text-[11px] text-slate-500">
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
                disabled={status === "downloading" || status === "loading" || status === "unsupported"}
              >
                <Download className="h-3.5 w-3.5" />
                {t.pipeline.ai.download}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          {t.pipeline.ai.warning.replace(
            "{size}",
            `${Math.round(selected.size_mb)} MB`,
          )}{" "}
          · {t.pipeline.ai.privacyNote}
        </p>
      </CardBody>
    </Card>
  );
}

function ExtractCard({
  facts,
  documents,
  meta,
  running,
  canRun,
  onRun,
  onToggleVerified,
}: {
  facts: DbExtractedFact[];
  documents: PipelineDocument[];
  meta: { used_llm: boolean; model_id: string | null; fallback_reason: string | null } | null;
  running: boolean;
  canRun: boolean;
  onRun: () => void;
  onToggleVerified: (id: string) => void;
}) {
  const { t, locale } = useLocale();
  const grouped = useMemo(() => {
    const g: Record<"key_terms" | "performance" | "risk", DbExtractedFact[]> = {
      key_terms: [],
      performance: [],
      risk: [],
    };
    for (const f of facts) {
      const meta = describeFactType(f.fact_type, locale);
      g[meta.group].push(f);
    }
    return g;
  }, [facts, locale]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-gold" />
            {t.pipeline.extract.title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div className="flex flex-wrap items-center gap-3">
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
          {meta && facts.length > 0 && (
            <span className="text-[11px] text-slate-500">
              {meta.used_llm
                ? t.pipeline.extract.sourceLlm.replace("{model}", meta.model_id ?? "")
                : meta.fallback_reason
                  ? t.pipeline.extract.fallback.replace(
                      "{reason}",
                      meta.fallback_reason,
                    )
                  : t.pipeline.extract.sourceMock}
            </span>
          )}
        </div>

        {facts.length === 0 ? (
          <p className="mt-4 text-xs text-slate-400">
            {t.pipeline.extract.empty}
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {(["key_terms", "performance", "risk"] as const).map((group) =>
              grouped[group].length === 0 ? null : (
                <section key={group}>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {t.pipeline.extract.groups[group]}
                  </h3>
                  <ul className="space-y-2">
                    {grouped[group].map((f) => {
                      const meta = describeFactType(f.fact_type, locale);
                      const doc = documents.find((d) => d.id === f.document_id);
                      const tone =
                        f.confidence === "HIGH"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : f.confidence === "MEDIUM"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-50 text-slate-600 border-slate-200";
                      return (
                        <li
                          key={f.id}
                          className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-brand-navy">
                                {meta.label}
                              </p>
                              <p className="mt-0.5 text-slate-700">
                                {formatFactPayload(
                                  f.fact_type,
                                  f.payload_json,
                                  locale,
                                )}
                              </p>
                              {f.citation_quote && (
                                <p className="mt-1 border-s-2 border-slate-200 ps-2 text-[11px] italic text-slate-500">
                                  “{f.citation_quote}”
                                  {f.citation_page
                                    ? ` · ${t.pipeline.extract.page.replace("{n}", String(f.citation_page))}`
                                    : ""}
                                  {doc ? ` · ${doc.filename}` : ""}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                  tone,
                                )}
                              >
                                {f.confidence}
                              </span>
                              <button
                                type="button"
                                onClick={() => onToggleVerified(f.id)}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                                  f.user_verified
                                    ? "bg-brand-navy text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                                )}
                              >
                                {f.user_verified ? (
                                  <>
                                    <CheckCheck className="h-2.5 w-2.5" />
                                    {t.pipeline.extract.verified}
                                  </>
                                ) : (
                                  t.pipeline.extract.verify
                                )}
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ),
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function BriefCard({
  brief,
  audience,
  onSelectAudience,
  briefLocale,
  onSelectLocale,
  canGenerate,
  generating,
  onGenerate,
  isAr,
}: {
  brief: PipelineBrief | null;
  audience: BriefAudience;
  onSelectAudience: (a: BriefAudience) => void;
  briefLocale: "en" | "ar";
  onSelectLocale: (l: "en" | "ar") => void;
  canGenerate: boolean;
  generating: boolean;
  onGenerate: () => void;
  isAr: boolean;
}) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const text = brief
    ? briefLocale === "ar"
      ? brief.text_ar
      : brief.text_en
    : "";

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
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Languages className="h-4 w-4 text-brand-navy" />
            {t.pipeline.brief.title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardBody>
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
          <p className="mt-4 text-xs text-slate-400">{t.pipeline.brief.empty}</p>
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
              className={cn(
                "prose prose-sm max-w-none rounded-xl border border-slate-200 bg-slate-50/60 p-5 text-slate-800",
                "prose-headings:text-brand-navy prose-headings:font-semibold prose-strong:text-brand-navy",
              )}
            >
              <MarkdownLite text={text} />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function PublishCard({
  snapshot,
  brief,
  projectId,
  quality,
  onPublish,
}: {
  snapshot: PipelineSnapshot | null;
  brief: PipelineBrief | null;
  projectId: string;
  quality: {
    has_documents: boolean;
    has_facts: boolean;
    has_brief: boolean;
    has_high: boolean;
    has_risk: boolean;
    score: number;
  };
  onPublish: () => void;
}) {
  const { t } = useLocale();
  const failing = 5 - quality.score;
  const canPublish = quality.has_brief && quality.has_facts && quality.has_documents;

  const checks: Array<{ ok: boolean; label: string }> = [
    { ok: quality.has_documents, label: t.pipeline.publish.checks.documents },
    { ok: quality.has_facts, label: t.pipeline.publish.checks.facts },
    { ok: quality.has_brief, label: t.pipeline.publish.checks.brief },
    { ok: quality.has_high, label: t.pipeline.publish.checks.highConfidence },
    { ok: quality.has_risk, label: t.pipeline.publish.checks.risk },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-navy" />
            {t.pipeline.publish.title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t.pipeline.publish.quality}
          </div>
          <ul className="space-y-1.5 text-sm">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                {c.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <X className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className={c.ok ? "text-slate-700" : "text-slate-400"}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] font-medium">
            {failing === 0 ? (
              <span className="text-emerald-700">{t.pipeline.publish.qualityPass}</span>
            ) : (
              <span className="text-amber-700">
                {t.pipeline.publish.qualityFail.replace("{n}", String(failing))}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onPublish} disabled={!canPublish || !brief} size="sm">
            <Globe className="h-3.5 w-3.5" />
            {snapshot ? t.pipeline.publish.republish : t.pipeline.publish.publish}
          </Button>
          {snapshot && (
            <>
              <a
                href={`/projects/${projectId}/published`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary" size="sm">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t.pipeline.publish.open}
                </Button>
              </a>
              <a
                href={`/projects/${projectId}/published?print=1`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="ghost" size="sm">
                  <Printer className="h-3.5 w-3.5" />
                  {t.pipeline.publish.print}
                </Button>
              </a>
            </>
          )}
        </div>

        {snapshot && (
          <p className="mt-3 text-[11px] text-slate-500">
            {t.pipeline.publish.published} · {new Date(snapshot.created_at).toLocaleString()}
          </p>
        )}
        {!brief && (
          <p className="mt-3 text-xs text-slate-400">{t.pipeline.publish.empty}</p>
        )}
      </CardBody>
    </Card>
  );
}

// Minimal markdown rendering for headings, bold and paragraphs.
// We don't pull in a full markdown library — the brief templates are
// constrained and predictable.
function MarkdownLite({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="mt-4 first:mt-0">
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={i} className="mt-4 first:mt-0">
              {trimmed.slice(2)}
            </h2>
          );
        }
        return (
          <p key={i}>
            {renderInline(trimmed)}
          </p>
        );
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
