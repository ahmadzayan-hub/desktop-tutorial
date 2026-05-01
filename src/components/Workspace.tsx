"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { safeFetch } from "@/lib/safe-fetch";
import {
  detectIntentLocal,
  generateQuestionsLocal,
  reconstructPromptLocal,
  type LocalQuestion
} from "@/lib/local-engine";
import type { TargetModel } from "@/lib/types";
import VoiceInput from "@/components/VoiceInput";
import FileUpload, { type AttachedFile, formatAttachedAsContext } from "@/components/FileUpload";

interface PromptVersion {
  id: string;
  version: number;
  target_model: TargetModel;
  final_prompt: string;
  rationale: string | null;
}

interface UIQuestion {
  id: string;
  position: number;
  question: string;
  rationale: string | null;
  required: boolean;
}

interface UISession {
  id: string;
  intent: string;
  intent_confidence: number;
  questions: UIQuestion[];
  source: "cloud" | "local";
}

export default function Workspace() {
  const t = useT();
  const { locale } = useI18n();
  const [raw, setRaw] = useState("");
  const [model, setModel] = useState<TargetModel>("generic");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [session, setSession] = useState<UISession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [rationale, setRationale] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Hydrate a starter dropped from /templates
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stash = sessionStorage.getItem("po_starter");
    if (stash) {
      try {
        const { text, model: m } = JSON.parse(stash) as { text: string; model: TargetModel };
        setRaw(text);
        if (m) setModel(m);
      } catch { /* ignore */ }
      sessionStorage.removeItem("po_starter");
    }
  }, []);

  /** Compose raw + attached files into a single string passed to the engine. */
  function composedPrompt(): string {
    return raw + formatAttachedAsContext(files, locale);
  }

  async function startSession(quick = false) {
    setLoading(true); setError(null); setInfo(null); setFinalPrompt(null); setRationale(null);
    const composed = composedPrompt();

    const r = await safeFetch<{ session: { id: string; intent: string | null; intent_confidence: number | null; questions: UIQuestion[]; prompt_versions?: PromptVersion[] }; mode: string }>(
      "/api/sessions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_prompt: composed, target_model: model, quick })
      }
    );

    if (r.ok && r.data) {
      const s = r.data.session;
      setSession({
        id: s.id,
        intent: s.intent ?? "other",
        intent_confidence: s.intent_confidence ?? 0,
        questions: s.questions ?? [],
        source: "cloud"
      });
      setAnswers({});
      if (r.data.mode === "quick" && s.prompt_versions?.length) {
        setFinalPrompt(s.prompt_versions[0].final_prompt);
        setRationale(s.prompt_versions[0].rationale);
      }
      setLoading(false);
      return;
    }
    runLocal(quick, composed);
  }

  function runLocal(quick: boolean, composed: string) {
    const intent = detectIntentLocal(composed);
    if (quick) {
      const result = reconstructPromptLocal({
        raw: composed, intent: intent.intent, qa: [], targetModel: model, locale
      });
      setSession({
        id: "local",
        intent: intent.intent,
        intent_confidence: intent.confidence,
        questions: [],
        source: "local"
      });
      setFinalPrompt(result.final_prompt);
      setRationale(result.rationale);
      setInfo(locale === "ar" ? "وضع محلي — لا يحتاج إلى اتصال." : "Running locally — no backend needed.");
      setLoading(false);
      return;
    }
    const questions: LocalQuestion[] = generateQuestionsLocal(composed, intent.intent, locale);
    setSession({
      id: "local",
      intent: intent.intent,
      intent_confidence: intent.confidence,
      questions,
      source: "local"
    });
    setAnswers({});
    setInfo(locale === "ar" ? "وضع محلي — لا يحتاج إلى اتصال." : "Running locally — no backend needed.");
    setLoading(false);
  }

  async function submitAnswers() {
    if (!session) return;
    setLoading(true); setError(null);
    const composed = composedPrompt();

    if (session.source === "local") {
      const qa = session.questions
        .map((q) => ({ question: q.question, answer: (answers[q.id] ?? "").trim() }))
        .filter((p) => p.answer.length > 0);
      const result = reconstructPromptLocal({
        raw: composed, intent: session.intent as never, qa, targetModel: model, locale
      });
      setFinalPrompt(result.final_prompt);
      setRationale(result.rationale);
      setLoading(false);
      return;
    }

    const payload = Object.entries(answers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([question_id, answer]) => ({ question_id, answer }));
    if (payload.length > 0) {
      await safeFetch(`/api/sessions/${session.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload })
      });
    }
    const r = await safeFetch<{ version: PromptVersion }>(`/api/sessions/${session.id}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_model: model })
    });
    if (!r.ok || !r.data) {
      const qa = session.questions
        .map((q) => ({ question: q.question, answer: (answers[q.id] ?? "").trim() }))
        .filter((p) => p.answer.length > 0);
      const result = reconstructPromptLocal({
        raw: composed, intent: session.intent as never, qa, targetModel: model, locale
      });
      setFinalPrompt(result.final_prompt);
      setRationale(result.rationale);
      setInfo(locale === "ar" ? "أُكمل الموجِّه محليًا بعد تعذّر الخادم." : "Completed locally after server was unreachable.");
    } else {
      setFinalPrompt(r.data.version.final_prompt);
      setRationale(r.data.version.rationale);
    }
    setLoading(false);
  }

  function reset() {
    setSession(null); setAnswers({}); setFinalPrompt(null); setRationale(null); setError(null); setInfo(null);
  }

  async function copyFinal() {
    if (!finalPrompt) return;
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function appendVoice(text: string) {
    setRaw((cur) => (cur ? cur.trim() + " " + text : text));
  }

  const beforeStats = useMemo(() => stats(raw), [raw]);
  const afterStats = useMemo(() => (finalPrompt ? stats(finalPrompt) : null), [finalPrompt]);

  const hasOutput = Boolean(finalPrompt || (session && session.questions.length > 0));

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className={
        "grid gap-4 sm:gap-6 " +
        (hasOutput ? "lg:grid-cols-2" : "lg:grid-cols-1 lg:max-w-3xl lg:mx-auto")
      }>
        {/* Input column */}
        <section className="card shadow-sm relative overflow-hidden">
          <svg
            aria-hidden="true"
            className="absolute -top-6 -right-6 w-24 h-24 sm:w-28 sm:h-28 opacity-20 pointer-events-none rtl:right-auto rtl:-left-6"
            viewBox="0 0 100 100" fill="none"
          >
            <defs>
              <linearGradient id="sp" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
            <path d="M50 5 L58 42 L95 50 L58 58 L50 95 L42 58 L5 50 L42 42 Z" fill="url(#sp)"/>
          </svg>

          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <label className="text-sm font-medium">{t("ws.label.raw")}</label>
            <span className="text-xs text-slate-500 tabular-nums">
              {t("ws.stats", { chars: beforeStats.chars, words: beforeStats.words })}
            </span>
          </div>

          <div className="mt-2 relative">
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={6}
              className="w-full pe-14 min-h-[140px] sm:min-h-[180px] resize-y"
              placeholder={t("ws.placeholder.raw")}
            />
            <div className="absolute bottom-2 end-2">
              <VoiceInput onTranscript={appendVoice} />
            </div>
          </div>

          <FileUpload files={files} onChange={setFiles} className="mt-4" />

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <label className="text-sm shrink-0">{t("ws.target")}</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as TargetModel)}
              className="grow sm:grow-0 min-w-[140px]"
            >
              <option value="generic">{t("ws.model.generic")}</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="claude">Claude</option>
              <option value="copilot">Copilot</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {session && (
              <button onClick={reset} className="btn-ghost border border-slate-300 col-span-2 sm:col-span-1">
                {t("ws.btn.new_session")}
              </button>
            )}
            <button
              onClick={() => startSession(true)}
              disabled={loading || raw.length < 3}
              className="btn-ghost border border-slate-300"
            >
              {t("ws.btn.quick")}
            </button>
            <button
              onClick={() => startSession(false)}
              disabled={loading || raw.length < 3}
              className="btn-primary"
            >
              {loading ? t("ws.btn.working") : session ? t("ws.btn.restart") : t("ws.btn.start")}
            </button>
          </div>

          {info && (
            <div className="mt-3 rounded-md border border-sky-200 bg-sky-50 text-sky-800 p-3 text-sm flex items-start gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <span>{info}</span>
            </div>
          )}
          {error && (
            <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 p-3 text-sm">
              <div className="font-medium">{error.message}</div>
              {error.hint && <div className="text-rose-700 text-xs mt-1">{error.hint}</div>}
            </div>
          )}
        </section>

        {/* Output column — only when there is something to show */}
        {hasOutput && (
          <section className="space-y-4 sm:space-y-6">
            {session && session.questions.length > 0 && !finalPrompt && (
              <div className="card shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-sm text-slate-500">{t("ws.detected_intent")}</div>
                    <div className="font-medium flex items-center gap-2">
                      <IntentBadge intent={session.intent} />
                      <span className="text-xs text-slate-500">
                        {t("ws.confidence", { percent: Math.round(session.intent_confidence * 100) })}
                      </span>
                    </div>
                  </div>
                  {session.source === "local" && (
                    <span className="text-[10px] uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-0.5 rounded">local</span>
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  <div className="text-sm font-medium">{t("ws.questions_title")}</div>
                  {session.questions
                    .sort((a, b) => a.position - b.position)
                    .map((q) => (
                      <div key={q.id}>
                        <label className="block text-sm font-medium">{q.question}</label>
                        {q.rationale && <div className="text-xs text-slate-500 mt-0.5">{q.rationale}</div>}
                        <textarea
                          rows={2}
                          className="w-full mt-2"
                          value={answers[q.id] ?? ""}
                          onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
                        />
                      </div>
                    ))}
                  <button onClick={submitAnswers} disabled={loading} className="btn-primary w-full sm:w-auto">
                    {loading ? t("ws.btn.generating") : t("ws.btn.generate")}
                  </button>
                </div>
              </div>
            )}

            {finalPrompt && (
              <>
                <div className="card shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-medium flex items-center gap-2">
                      <SparkIcon /> {t("ws.final_title")}
                    </div>
                    <button onClick={copyFinal} className="btn-ghost border border-slate-300">
                      {copied ? t("ws.copied") : t("ws.btn.copy")}
                    </button>
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm border border-slate-200 max-h-[60vh] overflow-auto">
{finalPrompt}
                  </pre>
                  {rationale && (
                    <details className="mt-3 text-sm text-slate-600">
                      <summary className="cursor-pointer">{t("ws.why")}</summary>
                      <p className="mt-2">{rationale}</p>
                    </details>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="card">
                    <div className="text-xs text-slate-500 mb-1">{t("ws.before")}</div>
                    <pre className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm border border-slate-200 max-h-60 overflow-auto">
{raw}
                    </pre>
                    <div className="text-xs text-slate-500 mt-2">
                      {t("ws.stats", { chars: beforeStats.chars, words: beforeStats.words })}
                    </div>
                  </div>
                  <div className="card">
                    <div className="text-xs text-slate-500 mb-1">{t("ws.after")}</div>
                    <pre className="whitespace-pre-wrap rounded bg-emerald-50 p-3 text-sm border border-emerald-200 max-h-60 overflow-auto">
{finalPrompt}
                    </pre>
                    <div className="text-xs text-slate-500 mt-2">
                      {afterStats && t("ws.stats", { chars: afterStats.chars, words: afterStats.words })}
                      {afterStats && (
                        <span className="ms-2 text-emerald-700">
                          {t("ws.added_words", { n: Math.max(0, afterStats.words - beforeStats.words) })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function stats(s: string) {
  const trimmed = s.trim();
  return { chars: trimmed.length, words: trimmed ? trimmed.split(/\s+/).length : 0 };
}

function IntentBadge({ intent }: { intent: string }) {
  const tone: Record<string, string> = {
    coding: "bg-violet-50 text-violet-700",
    writing: "bg-sky-50 text-sky-700",
    research: "bg-amber-50 text-amber-700",
    analysis: "bg-emerald-50 text-emerald-700",
    planning: "bg-rose-50 text-rose-700",
    creative: "bg-pink-50 text-pink-700",
    design: "bg-fuchsia-50 text-fuchsia-700",
    conversation: "bg-cyan-50 text-cyan-700",
    other: "bg-slate-100 text-slate-600"
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${tone[intent] ?? tone.other}`}>{intent}</span>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 L13.5 9 L21 12 L13.5 15 L12 22 L10.5 15 L3 12 L10.5 9 Z" fill="url(#sg)"/>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
