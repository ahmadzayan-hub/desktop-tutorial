"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [query, setQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");

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

  const intents = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.intent && set.add(r.intent));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (intentFilter !== "all" && r.intent !== intentFilter) return false;
      if (!q) return true;
      return r.raw_prompt.toLowerCase().includes(q);
    });
  }, [rows, query, intentFilter]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">History</h1>

      <div className="mt-4 flex gap-2 flex-wrap">
        <input
          type="search"
          placeholder="Search prompts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)}>
          <option value="all">All intents</option>
          {intents.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500 self-center">
          {filtered.length} / {rows.length}
        </span>
      </div>

      {loading && <p className="mt-4 text-slate-500">Loading…</p>}
      {error && <p className="mt-4 text-rose-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {filtered.map((s) => (
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
        {!loading && filtered.length === 0 && (
          <p className="text-slate-500">
            {rows.length === 0 ? "No sessions yet." : "No sessions match your filters."}
          </p>
        )}
      </div>
    </div>
  );
}
