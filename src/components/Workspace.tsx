"use client";

import { useState } from "react";

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

interface SessionResp {
  session: {
    id: string;
    raw_prompt: string;
    intent: string | null;
    intent_confidence: number | null;
    status: string;
    target_model: TargetModel | null;
    questions: Question[];
    prompt_versions?: PromptVersion[];
  };
  mode?: "quick" | "clarify";
}

interface VersionResp {
  version: PromptVersion;
}

const STARTERS: Array<{ label: string; text: string; model: TargetModel }> = [
  {
    label: "Refactor a function",
    text: "Refactor my React data table component to be faster on large datasets.",
    model: "chatgpt"
  },
  {
    label: "Marketing tweet",
    text: "Write a tweet to promote my indie SaaS to developers.",
    model: "chatgpt"
  },
  {
    label: "Research brief",
    text: "Summarize the state of vector databases for a non-technical CEO.",
    model: "claude"
  },
  {
    label: "Bug investigation",
    text: "Help me debug a flaky CI test in a Next.js app.",
    model: "copilot"
  },
  {
    label: "Email reply",
    text: "Draft a polite reply declining a meeting invitation while leaving the door open.",
    model: "gemini"
  },
  {
    label: "Plan a launch",
    text: "Plan a 4-week launch checklist for a free tier SaaS.",
    model: "generic"
  }
];

export default function Workspace() {
  const [raw, setRaw] = useState("");
  const [model, setModel] = useState<TargetModel>("generic");
  const [session, setSession] = useState<SessionResp["session"] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [rationale, setRationale] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);

  async function startSession(quick = false) {
    setLoading(true); setError(null); setFinalPrompt(null);
    try {
      const r = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_prompt: raw, target_model: model, quick })
      });
      const data = await r.json();
      if (!r.ok) {
        setError({
          message: data.message ?? data.error ?? r.statusText,
          hint: data.hint
        });
        return;
      }
      const resp = data as SessionResp;
      setSession(resp.session);
      setAnswers({});
      // Quick mode already has a finalized prompt_version
      if (resp.mode === "quick" && resp.session.prompt_versions?.length) {
        const v = resp.session.prompt_versions[0];
        setFinalPrompt(v.final_prompt);
        setRationale(v.rationale);
      }
    } catch (e) {
      setError({ message: String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswers() {
    if (!session) return;
    setLoading(true); setError(null);
    try {
      const payload = Object.entries(answers)
        .filter(([, v]) => v.trim().length > 0)
        .map(([question_id, answer]) => ({ question_id, answer }));
      if (payload.length > 0) {
        const r = await fetch(`/api/sessions/${session.id}/answers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: payload })
        });
        if (!r.ok) {
          const d = await r.json();
          setError({ message: d.message ?? d.error ?? r.statusText, hint: d.hint });
          return;
        }
      }
      const f = await fetch(`/api/sessions/${session.id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_model: model })
      });
      const data = await f.json();
      if (!f.ok) {
        setError({ message: data.message ?? data.error ?? f.statusText, hint: data.hint });
        return;
      }
      const v = (data as VersionResp).version;
      setFinalPrompt(v.final_prompt);
      setRationale(v.rationale);
    } catch (e) {
      setError({ message: String(e) });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSession(null); setAnswers({}); setFinalPrompt(null); setRationale(null); setError(null);
  }

  async function copyFinal() {
    if (!finalPrompt) return;
    await navigator.clipboard.writeText(finalPrompt);
  }

  const beforeStats = stats(raw);
  const afterStats = finalPrompt ? stats(finalPrompt) : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div className="card">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-medium">Raw prompt</label>
          <span className="text-xs text-slate-500">
            {beforeStats.chars} chars · {beforeStats.words} words
          </span>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={5}
          className="w-full mt-2"
          placeholder="e.g. Help me refactor my React data table to be faster..."
        />

        {!session && (
          <div className="mt-3">
            <div className="text-xs text-slate-500 mb-2">Try a starter:</div>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s.label}
                  className="btn-ghost border border-slate-300 text-xs"
                  onClick={() => { setRaw(s.text); setModel(s.model); }}
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <label className="text-sm">Target model</label>
          <select value={model} onChange={(e) => setModel(e.target.value as TargetModel)}>
            <option value="generic">Generic</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="copilot">Copilot</option>
            <option value="gemini">Gemini</option>
          </select>
          <div className="flex-1" />
          {session && <button onClick={reset} className="btn-ghost">New session</button>}
          <button
            onClick={() => startSession(true)}
            disabled={loading || raw.length < 3}
            className="btn-ghost border border-slate-300"
            title="Skip clarifications and rebuild in one shot"
          >
            ⚡ Quick enhance
          </button>
          <button
            onClick={() => startSession(false)}
            disabled={loading || raw.length < 3}
            className="btn-primary"
          >
            {loading ? "Working…" : session ? "Restart" : "Start with questions"}
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
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Detected intent</div>
              <div className="font-medium">
                {session.intent ?? "unknown"}{" "}
                <span className="text-xs text-slate-500">
                  ({Math.round((session.intent_confidence ?? 0) * 100)}% confidence)
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">Status: {session.status}</div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="text-sm font-medium">Clarification questions</div>
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
              {loading ? "Generating…" : "Generate final prompt"}
            </button>
          </div>
        </div>
      )}

      {finalPrompt && (
        <>
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="font-medium">Final prompt</div>
              <button onClick={copyFinal} className="btn-ghost border border-slate-300">Copy</button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm border border-slate-200">
{finalPrompt}
            </pre>
            {rationale && (
              <details className="mt-3 text-sm text-slate-600">
                <summary className="cursor-pointer">Why this prompt</summary>
                <p className="mt-2">{rationale}</p>
              </details>
            )}
          </div>

          {/* Before / after */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <div className="text-xs text-slate-500 mb-1">Before</div>
              <pre className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm border border-slate-200">
{raw}
              </pre>
              <div className="text-xs text-slate-500 mt-2">
                {beforeStats.chars} chars · {beforeStats.words} words
              </div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-500 mb-1">After</div>
              <pre className="whitespace-pre-wrap rounded bg-emerald-50 p-3 text-sm border border-emerald-200">
{finalPrompt}
              </pre>
              <div className="text-xs text-slate-500 mt-2">
                {afterStats?.chars} chars · {afterStats?.words} words
                {afterStats && (
                  <span className="ml-2 text-emerald-700">
                    (+{Math.max(0, afterStats.words - beforeStats.words)} words of structure)
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
