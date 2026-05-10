"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";

const FEATURES: { titleKey: any; bodyKey: any; icon: string }[] = [
  { titleKey: "feat.brand.title",    bodyKey: "feat.brand.body",    icon: "🛡" },
  { titleKey: "feat.pptx.title",     bodyKey: "feat.pptx.body",     icon: "📑" },
  { titleKey: "feat.rtl.title",      bodyKey: "feat.rtl.body",      icon: "ع" },
  { titleKey: "feat.quality.title",  bodyKey: "feat.quality.body",  icon: "◆" },
  { titleKey: "feat.regen.title",    bodyKey: "feat.regen.body",    icon: "↻" },
  { titleKey: "feat.evidence.title", bodyKey: "feat.evidence.body", icon: "✓" },
];

const V2_KEYS: any[] = ["v2.outline", "v2.theme", "v2.share", "v2.compare", "v2.assets", "v2.demo"];

export function Hero() {
  const { t } = useI18n();

  return (
    <div className="space-y-16">
      {/* ── Hero v0.4 — centered, single primary CTA, clean Obsidian-style ── */}
      <section className="pq-hero pq-hero-centered">
        <div className="pq-mesh" aria-hidden />
        <div className="pq-hero-centered-inner">
          <span className="pq-hero-eyebrow">
            <span aria-hidden>●</span> {t("land.pill")}
          </span>
          <h1 className="pq-hero-h1" style={{ color: "var(--pq-text-main)" }}>
            {t("land.h1.a")} <span className="pq-hl">{t("land.h1.hl")}</span> {t("land.h1.b")}
          </h1>
          <p className="pq-hero-lede" style={{ color: "var(--pq-text-secondary)" }}>
            {t("land.lede")}
          </p>

          <div className="pq-hero-cta-row">
            <Link
              href="/presentiq/projects/new"
              className="pq-btn pq-btn-primary"
              style={{ padding: "1rem 1.9rem", fontSize: "0.98rem" }}
            >
              {t("land.cta.start")} <span className="pq-flip" aria-hidden>→</span>
            </Link>
            <Link
              href="/presentiq/dashboard"
              className="pq-btn pq-btn-secondary"
              style={{ padding: "1rem 1.5rem", fontSize: "0.92rem" }}
            >
              {t("land.cta.dashboard")}
            </Link>
          </div>

          <div className="pq-trust-row pq-trust-row-centered">
            <div className="pq-trust-avatars" aria-hidden>
              <span className="av" />
              <span className="av" />
              <span className="av" />
              <span className="av" />
            </div>
            <div className="text-xs" style={{ color: "var(--pq-text-secondary)" }}>
              <div className="pq-trust-stars" aria-hidden>★ ★ ★ ★ ★</div>
              <div className="mt-0.5">{t("land.trusted")}</div>
            </div>
          </div>
        </div>

        <div className="pq-hero-mockup-wrap">
          <DashboardMockup />
        </div>
      </section>

      {/* ── Stats strip — compact, below mockup ──────────────────── */}
      <section className="pq-stats pq-stats-flat" aria-label="Headline stats">
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
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section>
        <div className="pq-howit">
          {[1, 2, 3].map((n) => (
            <div key={n} className="pq-howit-step">
              <div className="pq-howit-num">{n}</div>
              <div className="text-sm" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.4 }}>
                {t(`hero.howit.step${n}` as any)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────── */}
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
      <section
        id="product"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
        aria-label="Product features"
      >
        {FEATURES.map((f) => (
          <Frame4D key={String(f.titleKey)} className="p-6">
            <div
              className="grid place-items-center w-10 h-10 rounded-xl text-base font-bold mb-3"
              style={{
                background: "rgba(159,205,99,0.14)",
                color: "var(--pq-primary)",
                border: "1px solid rgba(159,205,99,0.32)",
              }}
              aria-hidden
            >
              {f.icon}
            </div>
            <h3 className="text-base font-semibold" style={{ color: "var(--pq-text-main)" }}>
              {t(f.titleKey)}
            </h3>
            <p className="text-sm mt-2" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.55 }}>
              {t(f.bodyKey)}
            </p>
          </Frame4D>
        ))}
      </section>

      {/* ── What's new in v0.3 ───────────────────────────────── */}
      <section id="resources">
        <Frame4D variant="pine" className="p-8 md:p-10" interactive={false}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: "var(--pq-text-main)" }}>
              {t("v2.title")}
            </h2>
            <Link
              href="/presentiq/changelog"
              className="text-sm font-semibold underline-offset-4 hover:underline"
              style={{ color: "var(--pq-primary)" }}
            >
              {t("nav.changelog")} →
            </Link>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {V2_KEYS.map((k) => (
              <li
                key={k}
                className="flex items-start gap-3 text-sm"
                style={{ color: "var(--pq-text-secondary)" }}
              >
                <span
                  className="mt-1 inline-block h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "var(--pq-primary)" }}
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

/* ── Dashboard mockup card ────────────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="pq-mockup" aria-label="PresentIQ dashboard preview">
      <div className="pq-mockup-bar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="label">PresentIQ · Boardroom Workspace</span>
      </div>
      <div className="pq-mockup-body">
        {/* Sidebar */}
        <div className="pq-mockup-pane pq-mockup-side">
          <ul>
            <li className="is-active">Overview</li>
            <li>Outline</li>
            <li>Brief</li>
            <li>Branding</li>
            <li>Sources</li>
            <li>Quality</li>
            <li>Export</li>
          </ul>
        </div>

        {/* Main pane: workflow rows */}
        <div className="pq-mockup-pane">
          <div className="text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: "var(--pq-text-muted)" }}>
            AI Agent Workflow
          </div>
          <div className="pq-mockup-workflow">
            {[
              { name: "Intake",      pct: 100, pip: "" as any },
              { name: "Evidence",    pct: 96,  pip: "t" },
              { name: "Strategy",    pct: 88,  pip: "" as any },
              { name: "Storytelling",pct: 92,  pip: "y" },
              { name: "Slide Arch.", pct: 84,  pip: "" as any },
              { name: "Copywriter",  pct: 78,  pip: "r" },
              { name: "Visual",      pct: 96,  pip: "" as any },
              { name: "RTL",         pct: 99,  pip: "t" },
              { name: "QA",          pct: 95,  pip: "" as any },
              { name: "Render",      pct: 100, pip: "" as any },
            ].map((r) => (
              <div key={r.name} className="row">
                <span>{r.name}</span>
                <span className="meter"><i style={{ width: `${r.pct}%` }} /></span>
                <span className={`pip ${r.pip}`} aria-hidden />
              </div>
            ))}
          </div>
        </div>

        {/* Score column */}
        <div className="pq-mockup-pane pq-mockup-score">
          <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--pq-text-muted)" }}>
            10-dimension score
          </div>
          <div className="ring" aria-hidden>
            <div>65</div>
          </div>
          <div className="pq-mockup-score-label">Boardroom Readiness</div>
          <div className="pq-mockup-rec">
            <strong style={{ color: "var(--pq-primary)" }}>Recommendations</strong>
            <div>Mark unverifiable claims as [Input Required].</div>
          </div>
        </div>
      </div>
    </div>
  );
}
