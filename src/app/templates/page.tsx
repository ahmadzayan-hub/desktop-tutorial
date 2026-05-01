"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { safeFetch } from "@/lib/safe-fetch";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_public: boolean;
  body: { sections?: string[]; slots?: string[] };
}

export default function TemplatesPage() {
  const t = useT();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await safeFetch<{ templates: Template[] }>("/api/templates");
      if (cancelled) return;
      if (!r.ok || !r.data) {
        setError(r.error ?? { message: "unknown" });
      } else {
        setTemplates(r.data.templates ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">{t("templates.title")}</h1>
        <a href="/workspace" className="btn-ghost border border-slate-300">{t("templates.open_workspace")}</a>
      </div>
      {loading && <p className="mt-4 text-slate-500">…</p>}
      {error && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 text-rose-800 p-3 text-sm">
          <div className="font-medium">{error.message}</div>
          {error.hint && <div className="text-rose-700 text-xs mt-1">{error.hint}</div>}
        </div>
      )}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div key={tpl.id} className="card hover:shadow-md transition">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{tpl.name}</div>
              {tpl.is_public && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                  {t("templates.public")}
                </span>
              )}
            </div>
            {tpl.category && <div className="text-xs text-slate-500 mt-0.5">{tpl.category}</div>}
            {tpl.description && <p className="text-sm text-slate-600 mt-2">{tpl.description}</p>}
            {tpl.body?.sections && (
              <div className="mt-3 flex flex-wrap gap-1">
                {tpl.body.sections.map((s) => (
                  <span key={s} className="text-xs bg-slate-100 px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {!loading && templates.length === 0 && !error && (
          <p className="text-slate-500">{t("templates.empty")}</p>
        )}
      </div>
    </div>
  );
}
