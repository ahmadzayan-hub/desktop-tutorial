"use client";

import { useState } from "react";

type TargetModel = "chatgpt" | "claude" | "copilot" | "generic";

interface Question {
  id: string;
  position: number;
  question: string;
  rationale: string | null;
  required: boolean;
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
  };
}

interface VersionResp {
  version: {
    id: string;
    version: number;
    target_model: TargetModel;
    final_prompt: string;
    rationale: string | null;
  };
}

export default function Workspace() {
  const [raw, setRaw] = useState("");
  const [model, setModel] = useState<TargetModel>("generic");
  const [session, setSession] = useState<SessionResp["session"] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [rationale, setRationale] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSession() {
    setLoading(true); setError(null); setFinalPrompt(null);
    try {
      const r = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_prompt: raw, target_model: model })
      });
      if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
      const data: SessionResp = await r.json();
      setSession(data.session);
      setAnswers({});
    } catch (e) {
      setError(String(e));
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
        if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
      }
      const f = await fetch(`/api/sessions/${session.id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_model: model })
      });
      if (!f.ok) throw new Error((await f.json()).error ?? f.statusText);
      const data: VersionResp = await f.json();
      setFinalPrompt(data.version.final_prompt);
      setRationale(data.version.rationale);
    } catch (e) {
      setError(String(e));
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div className="card">
        <label className="text-sm font-medium">Raw prompt</label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={5}
          className="w-full mt-2"
          placeholder="e.g. Help me refactor my React data table to be faster..."
        />
        <div className="mt-3 flex items-center gap-3">
          <label className="text-sm">Target model</label>
          <select value={model} onChange={(e) => setModel(e.target.value as TargetModel)}>
            <option value="generic">Generic</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="copilot">Copilot</option>
          </select>
          <div className="flex-1" />
          {session && <button onClick={reset} className="btn-ghost">New session</button>}
          <button onClick={startSession} disabled={loading || raw.length < 3} className="btn-primary">
            {loading ? "Working…" : session ? "Restart" : "Start"}
          </button>
        </div>
        {error && <p className="text-sm text-rose-600 mt-3">{error}</p>}
      </div>

      {session && (
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

          {session.questions.length > 0 ? (
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
          ) : (
            <div className="mt-4">
              <button onClick={submitAnswers} disabled={loading} className="btn-primary">
                {loading ? "Generating…" : "Generate final prompt"}
              </button>
            </div>
          )}
        </div>
      )}

      {finalPrompt && (
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
      )}
    </div>
  );
}
