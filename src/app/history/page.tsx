"use client";

import { useEffect, useState } from "react";

interface SessionRow {
  id: string;
  raw_prompt: string;
  intent: string | null;
  status: string;
  target_model: string | null;
  created_at: string;
  updated_at: string;
}

export default function HistoryPage() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/sessions");
        if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
        const data = await r.json();
        if (!cancelled) setRows(data.sessions ?? []);
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">History</h1>
      {loading && <p className="mt-4 text-slate-500">Loading…</p>}
      {error && <p className="mt-4 text-rose-600">{error}</p>}
      <div className="mt-6 space-y-3">
        {rows.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{new Date(s.created_at).toLocaleString()}</span>
              <span>
                {s.intent ?? "—"} · {s.target_model ?? "generic"} · {s.status}
              </span>
            </div>
            <p className="mt-2 text-sm line-clamp-3">{s.raw_prompt}</p>
          </div>
        ))}
        {!loading && rows.length === 0 && <p className="text-slate-500">No sessions yet.</p>}
      </div>
    </div>
  );
}
