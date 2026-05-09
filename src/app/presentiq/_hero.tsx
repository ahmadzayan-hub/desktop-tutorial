"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";

const FEATURES: { titleKey: any; bodyKey: any }[] = [
  { titleKey: "feat.brand.title",    bodyKey: "feat.brand.body" },
  { titleKey: "feat.evidence.title", bodyKey: "feat.evidence.body" },
  { titleKey: "feat.pptx.title",     bodyKey: "feat.pptx.body" },
  { titleKey: "feat.rtl.title",      bodyKey: "feat.rtl.body" },
  { titleKey: "feat.quality.title",  bodyKey: "feat.quality.body" },
  { titleKey: "feat.regen.title",    bodyKey: "feat.regen.body" },
];

const V2_KEYS: any[] = ["v2.outline", "v2.theme", "v2.share", "v2.compare", "v2.assets", "v2.demo"];

export function Hero() {
  const { t } = useI18n();

  return (
    <div className="space-y-16">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative">
        <div className="pq-mesh" aria-hidden />
        <div className="relative text-center max-w-4xl mx-auto pt-6">
          <span className="pq-pill pq-pill-strong">{t("land.pill")}</span>
          <h1
            className="mt-7 font-semibold tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.06, color: "var(--pq-pine)" }}
          >
            {t("land.h1")}
          </h1>
          <p className="mt-5 text-lg" style={{ color: "var(--pq-text-soft)", lineHeight: 1.55 }}>
            {t("land.lede")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/presentiq/projects/new" className="pq-btn pq-btn-primary" style={{ padding: "0.85rem 1.6rem", fontSize: "0.95rem" }}>
              {t("land.cta.start")} <span className="pq-flip" aria-hidden>→</span>
            </Link>
            <Link href="/presentiq/dashboard" className="pq-btn pq-btn-secondary" style={{ padding: "0.85rem 1.5rem", fontSize: "0.95rem" }}>
              {t("land.cta.dashboard")}
            </Link>
            <Link href="/presentiq/contact" className="pq-btn pq-btn-ghost" style={{ padding: "0.85rem 1.2rem", fontSize: "0.95rem" }}>
              {t("land.cta.contact")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Differentiator features ────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <Frame4D key={String(f.titleKey)} className="p-6">
            <h3 className="text-base font-semibold" style={{ color: "var(--pq-pine)" }}>
              {t(f.titleKey)}
            </h3>
            <p className="text-sm mt-2" style={{ color: "var(--pq-text-soft)", lineHeight: 1.55 }}>
              {t(f.bodyKey)}
            </p>
          </Frame4D>
        ))}
      </section>

      {/* ── What's new in v0.2 ───────────────────────────────── */}
      <section>
        <Frame4D variant="pine" className="p-8 md:p-10" interactive={false}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: "var(--pq-spearmint)" }}>
              {t("v2.title")}
            </h2>
            <Link
              href="/presentiq/changelog"
              className="text-sm font-semibold underline-offset-4 hover:underline"
              style={{ color: "var(--pq-emerald)" }}
            >
              {t("nav.changelog")} →
            </Link>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {V2_KEYS.map((k) => (
              <li key={k} className="flex items-start gap-3 text-sm" style={{ color: "var(--pq-spearmint)", opacity: 0.92 }}>
                <span
                  className="mt-1 inline-block h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "var(--pq-emerald)" }}
                  aria-hidden
                />
                {t(k)}
              </li>
            ))}
          </ul>
        </Frame4D>
      </section>
    </div>
  );
}
