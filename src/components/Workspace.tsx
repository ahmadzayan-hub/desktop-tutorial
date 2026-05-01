"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { safeFetch } from "@/lib/safe-fetch";

type TargetModel = "chatgpt" | "claude" | "copilot" | "gemini" | "generic";

interface Question {
  id: string;
  position: number;
  question: string;
  rationale: string | null;
  required: boolean;
}

interface PromptVersion {
  id: string;
  version: number;
  target_model: TargetModel;
  final_prompt: string;
  rationale: string | null;
}

interface SessionPayload {
  id: string;
  raw_prompt: string;
  intent: string | null;
  intent_confidence: number | null;
  status: string;
  target_model: TargetModel | null;
  questions: Question[];
  prompt_versions?: PromptVersion[];
}

const STARTER_KEYS: Array<{
  key: "ws.starter.refactor" | "ws.starter.tweet" | "ws.starter.research" | "ws.starter.bug" | "ws.starter.email" | "ws.starter.launch";
  text: string;
  model: TargetModel;
}> = [
  { key: "ws.starter.refactor", text: "Refactor my React data table component to be faster on large datasets.", model: "chatgpt" },
  { key: "ws.starter.tweet", text: "Write a tweet to promote my indie SaaS to developers.", model: "chatgpt" },
  { key: "ws.starter.research", text: "Summarize the state of vector databases for a non-technical CEO.", model: "claude" },
  { key: "ws.starter.bug", text: "Help me debug a flaky CI test in a Next.js app.", model: "copilot" },
  { key: "ws.starter.email", text: "Draft a polite reply declining a meeting invitation while leaving the door open.", model: "gemini" },
  { key: "ws.starter.launch", text: "Plan a 4-week launch checklist for a free tier SaaS.", model: "generic" }
];

export default function Workspace() {
  const t = useT();
  const [raw, setRaw] = useState("");
  const [model, setModel] = useState<TargetModel>("generic");
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [rationale, setRationale] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function startSession(quick = false) {
    setLoading(true); setError(null); setFinalPrompt(null); setRationale(null);
    const r = await safeFetch<{ session: SessionPayload; mode: "quick" | "clarify" }>("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_prompt: raw, target_model: model, quick })
    });
    setLoading(false);
    if (!r.ok || !r.data) {
      setError(r.error ?? { message: "unknown" });
      return;
    }
    setSession(r.data.session);
    setAnswers({});
    if (r.data.mode === "quick" && r.data.session.prompt_versions?.length) {
      const v = r.data.session.prompt_versions[0];
      setFinalPrompt(v.final_prompt);
      setRationale(v.rationale);
    }
  }

  async function submitAnswers() {
    if (!session) return;
    setLoading(true); setError(null);
    const payload = Object.entries(answers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([question_id, answer]) => ({ question_id, answer }));
    if (payload.length > 0) {
      const r1 = await safeFetch(`/api/sessions/${session.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload })
      });
      if (!r1.ok) {
        setError(r1.error ?? { message: "unknown" });
        setLoading(false);
        return;
      }
    }
    const r2 = await safeFetch<{ version: PromptVersion }>(`/api/sessions/${session.id}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_model: model })
    });
    setLoading(false);
    if (!r2.ok || !r2.data) {
      setError(r2.error ?? { message: "unknown" });
      return;
    }
    setFinalPrompt(r2.data.version.final_prompt);
    setRationale(r2.data.version.rationale);
  }

  function reset() {
    setSession(null); setAnswers({}); setFinalPrompt(null); setRationale(null); setError(null);
  }

  async function copyFinal() {
    if (!finalPrompt) return;
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const beforeStats = stats(raw);
  const afterStats = finalPrompt ? stats(finalPrompt) : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div className="card shadow-sm">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-medium">{t("ws.label.raw")}</label>
          <span className="text-xs text-slate-500">
            {t("ws.stats", { chars: beforeStats.chars, words: beforeStats.words })}
          </span>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={5}
          className="w-full mt-2"
          placeholder={t("ws.placeholder.raw")}
        />

        {!session && (
          <div className="mt-3">
            <div className="text-xs text-slate-500 mb-2">{t("ws.try_starter")}</div>
            <div className="flex flex-wrap gap-2">
              {STARTER_KEYS.map((s) => (
                <button
                  key={s.key}
                  className="btn-ghost border border-slate-300 text-xs"
                  onClick={() => { setRaw(s.text); setModel(s.model); }}
                  type="button"
                >
                  {t(s.key)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <label className="text-sm">{t("ws.target")}</label>
          <select value={model} onChange={(e) => setModel(e.target.value as TargetModel)}>
            <option value="generic">{t("ws.model.generic")}</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="copilot">Copilot</option>
            <option value="gemini">Gemini</option>
          </select>
          <div className="flex-1" />
          {session && <button onClick={reset} className="btn-ghost">{t("ws.btn.new_session")}</button>}
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

        {error && (
          <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 p-3 text-sm">
            <div className="font-medium">{error.message}</div>
            {error.hint && <div className="text-rose-700 text-xs mt-1">{error.hint}</div>}
          </div>
        )}
      </div>

      {session && session.questions.length > 0 && !finalPrompt && (
        <div className="card shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">{t("ws.detected_intent")}</div>
              <div className="font-medium">
                {session.intent ?? "—"}{" "}
                <span className="text-xs text-slate-500">
                  {t("ws.confidence", { percent: Math.round((session.intent_confidence ?? 0) * 100) })}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">{t("ws.status", { status: session.status })}</div>
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
            <button onClick={submitAnswers} disabled={loading} className="btn-primary">
              {loading ? t("ws.btn.generating") : t("ws.btn.generate")}
            </button>
          </div>
        </div>
      )}

      {finalPrompt && (
        <>
          <div className="card shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t("ws.final_title")}</div>
              <button onClick={copyFinal} className="btn-ghost border border-slate-300">
                {copied ? t("ws.copied") : t("ws.btn.copy")}
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm border border-slate-200">
{finalPrompt}
            </pre>
            {rationale && (
              <details className="mt-3 text-sm text-slate-600">
                <summary className="cursor-pointer">{t("ws.why")}</summary>
                <p className="mt-2">{rationale}</p>
              </details>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <div className="text-xs text-slate-500 mb-1">{t("ws.before")}</div>
              <pre className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm border border-slate-200">
{raw}
              </pre>
              <div className="text-xs text-slate-500 mt-2">
                {t("ws.stats", { chars: beforeStats.chars, words: beforeStats.words })}
              </div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-500 mb-1">{t("ws.after")}</div>
              <pre className="whitespace-pre-wrap rounded bg-emerald-50 p-3 text-sm border border-emerald-200">
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
    </div>
  );
}

function stats(s: string) {
  const trimmed = s.trim();
  return {
    chars: trimmed.length,
    words: trimmed ? trimmed.split(/\s+/).length : 0
  };
}
