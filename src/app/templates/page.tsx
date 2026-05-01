"use client";

import { useEffect, useState } from "react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_public: boolean;
  body: { sections?: string[]; slots?: string[] };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/templates");
        if (!r.ok) throw new Error((await r.json()).error ?? r.statusText);
        const data = await r.json();
        if (!cancelled) setTemplates(data.templates ?? []);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <a href="/workspace" className="btn-ghost border border-slate-300">Open workspace</a>
      </div>
      {loading && <p className="mt-4 text-slate-500">Loading…</p>}
      {error && <p className="mt-4 text-rose-600">{error}</p>}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <div key={t.id} className="card">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t.name}</div>
              {t.is_public && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">public</span>}
            </div>
            {t.category && <div className="text-xs text-slate-500 mt-0.5">{t.category}</div>}
            {t.description && <p className="text-sm text-slate-600 mt-2">{t.description}</p>}
            {t.body?.sections && (
              <div className="mt-3 flex flex-wrap gap-1">
                {t.body.sections.map((s) => (
                  <span key={s} className="text-xs bg-slate-100 px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {!loading && templates.length === 0 && (
          <p className="text-slate-500">No templates yet.</p>
        )}
      </div>
    </div>
  );
}
