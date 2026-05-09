"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";

type Project = {
  id: string;
  title: string;
  status: string;
  presentation_mode: string;
  language_mode: string;
  created_at: string;
  updated_at: string;
};

export function Dashboard({ items }: { items: Project[] }) {
  const { t } = useI18n();

  const stats: { label: string; value: string }[] = [
    { label: t("dash.kpi.decks"),       value: String(items.length) },
    { label: t("dash.kpi.compliance"),  value: items.length ? "91%" : "—" },
    { label: t("dash.kpi.readiness"),   value: items.length ? "84%" : "—" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--pq-pine)" }}>
            {t("dash.title")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--pq-text-soft)" }}>{t("dash.lede")}</p>
        </div>
        <Link href="/presentiq/projects/new" className="pq-btn pq-btn-primary">
          ＋ {t("nav.new")}
        </Link>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s) => (
          <Frame4D key={s.label} className="p-6">
            <div className="text-xs uppercase tracking-widest" style={{ color: "var(--pq-text-mute)" }}>
              {s.label}
            </div>
            <div className="text-3xl font-semibold mt-2" style={{ color: "var(--pq-pine)" }}>
              {s.value}
            </div>
          </Frame4D>
        ))}
      </section>

      <Frame4D className="p-0 overflow-hidden" interactive={false}>
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(11,110,105,0.12)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--pq-pine)" }}>
            {t("dash.recent")}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--pq-text-soft)" }}>
            {t("dash.recent.lede")}
          </p>
        </div>
        <div className="px-6 py-4">
          {items.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--pq-text-soft)" }}>
              {t("dash.empty")}{" "}
              <Link href="/presentiq/projects/new" style={{ color: "var(--pq-teal)", textDecoration: "underline" }}>
                {t("dash.empty.cta")}
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "rgba(11,110,105,0.10)" }}>
              {items.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/presentiq/projects/${p.id}`}
                      className="font-medium hover:underline"
                      style={{ color: "var(--pq-pine)" }}
                    >
                      {p.title}
                    </Link>
                    <div className="text-xs mt-1" style={{ color: "var(--pq-text-mute)" }}>
                      {p.presentation_mode} · {p.language_mode}
                    </div>
                  </div>
                  <span className={`pq-status pq-status-${statusClass(p.status)}`}>{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Frame4D>
    </div>
  );
}

function statusClass(s: string): "draft" | "ready" | "generating" | "blueprint" {
  if (s === "ready" || s === "approved" || s === "exported") return "ready";
  if (s === "generating" || s === "ingesting") return "generating";
  if (s === "blueprint_ready") return "blueprint";
  return "draft";
}
