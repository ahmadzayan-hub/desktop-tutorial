"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";

const FEATURES: { titleKey: any; bodyKey: any; icon: string }[] = [
  { titleKey: "feat.brand.title",    bodyKey: "feat.brand.body",    icon: "🛡️" },
  { titleKey: "feat.evidence.title", bodyKey: "feat.evidence.body", icon: "📊" },
  { titleKey: "feat.pptx.title",     bodyKey: "feat.pptx.body",     icon: "📑" },
  { titleKey: "feat.rtl.title",      bodyKey: "feat.rtl.body",      icon: "ع🅰" },
  { titleKey: "feat.quality.title",  bodyKey: "feat.quality.body",  icon: "🎯" },
  { titleKey: "feat.regen.title",    bodyKey: "feat.regen.body",    icon: "🔁" },
];

const V2_KEYS: any[] = ["v2.outline", "v2.theme", "v2.share", "v2.compare", "v2.assets", "v2.demo"];

const QUALITY_DIMS: { labelKey: any; value: number }[] = [
  { labelKey: "Brand Compliance",  value: 100 },
  { labelKey: "Evidence Integrity", value: 96 },
  { labelKey: "Arabic RTL",         value: 99 },
  { labelKey: "Visual Quality",     value: 98 },
];

export function Hero() {
  const { t } = useI18n();

  return (
    <div className="space-y-16">
      {/* ── Hero v2 ─────────────────────────────────────────────── */}
      <section className="pq-hero">
        <div className="pq-mesh" aria-hidden />
        <div className="pq-hero-grid">
          {/* Left: messaging + stats + CTAs */}
          <div>
            <span className="pq-hero-eyebrow">
              <span aria-hidden>●</span> {t("land.pill")}
            </span>
            <h1 className="mt-5" style={{ color: "var(--pq-text)" }}>
              {t("land.h1")}
            </h1>
            <p className="mt-5 text-lg max-w-xl" style={{ color: "var(--pq-text-soft)", lineHeight: 1.55 }}>
              {t("land.lede")}
            </p>

            <div className="pq-stats" aria-label="Headline stats">
              <div className="pq-stat">
                <div className="pq-stat-num">12k+</div>
                <div className="pq-stat-label">{t("hero.stat.decks")}</div>
              </div>
              <div className="pq-stat">
                <div className="pq-stat-num">EN · AR</div>
                <div className="pq-stat-label">{t("hero.stat.langs")}</div>
              </div>
              <div className="pq-stat">
                <div className="pq-stat-num">10</div>
                <div className="pq-stat-label">{t("hero.stat.dims")}</div>
              </div>
              <div className="pq-stat">
                <div className="pq-stat-num">99.9%</div>
                <div className="pq-stat-label">{t("hero.stat.uptime")}</div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
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

            {/* How it works micro-strip */}
            <div className="pq-howit">
              {[1, 2, 3].map((n) => (
                <div key={n} className="pq-howit-step">
                  <div className="pq-howit-num">{n}</div>
                  <div className="text-sm" style={{ color: "var(--pq-text-soft)", lineHeight: 1.4 }}>
                    {t(`hero.howit.step${n}` as any)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live boardroom-readiness preview */}
          <div className="pq-preview" aria-label={t("hero.preview.title")}>
            <div className="pq-preview-header">
              <span>{t("hero.preview.title")}</span>
              <span className="pq-preview-live">{t("common.live")}</span>
            </div>
            <div className="pq-preview-score">
              <span>97</span>
              <span className="pq-preview-score-unit">/ 100</span>
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--pq-text-mute)" }}>
              {t("hero.preview.score")}
            </div>
            <div className="pq-preview-rows">
              {QUALITY_DIMS.map((d) => (
                <div key={d.labelKey} className="pq-preview-row">
                  <div className="pq-preview-row-top">
                    <span>{d.labelKey}</span>
                    <span style={{ fontWeight: 600 }}>{d.value}</span>
                  </div>
                  <div className="pq-preview-bar">
                    <i style={{ width: `${d.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted by strip ───────────────────────────────────── */}
      <section className="pq-trust-strip" aria-label="Trust">
        <span className="pq-trust-label">{t("hero.trust")}</span>
        <span className="pq-trust-logo">EMIRATES&nbsp;GROUP</span>
        <span className="pq-trust-logo">ETIHAD</span>
        <span className="pq-trust-logo">ARAMCO</span>
        <span className="pq-trust-logo">QATAR&nbsp;ENERGY</span>
        <span className="pq-trust-logo">DP&nbsp;WORLD</span>
        <span className="pq-trust-logo">MUBADALA</span>
      </section>

      {/* ── Differentiator features ────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <Frame4D key={String(f.titleKey)} className="p-6">
            <div className="text-2xl mb-2" aria-hidden>{f.icon}</div>
            <h3 className="text-base font-semibold" style={{ color: "var(--pq-text)" }}>
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
