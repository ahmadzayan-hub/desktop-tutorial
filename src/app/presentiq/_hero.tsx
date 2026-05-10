"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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

type TplCategory = "all" | "pitch" | "proposal" | "boardroom" | "training" | "tender";

type TplCard = {
  code: string;
  title: string;
  badge: string;
  category: Exclude<TplCategory, "all">;
  tone: "orange" | "green" | "purple" | "blue" | "ink" | "lime" | "metro";
};

const TPL_CARDS: TplCard[] = [
  { code: "scqa_brief",            title: "Strategy Consulting Proposal", badge: "SCQA · 10",     category: "proposal",  tone: "orange" },
  { code: "boardroom_decision",    title: "Boardroom Decision",           badge: "Pyramid · 12",   category: "boardroom", tone: "green" },
  { code: "investor_business_case",title: "Founders Pitch Deck",          badge: "Pyramid · 14",   category: "pitch",     tone: "purple" },
  { code: "uae_gov_committee",     title: "Government Committee",         badge: "Bilingual · 12", category: "boardroom", tone: "metro" },
  { code: "qbr_steering",          title: "QBR Steering",                 badge: "RACI · 14",      category: "boardroom", tone: "ink" },
  { code: "okr_review",            title: "OKR Review",                   badge: "OKR · 9",        category: "boardroom", tone: "lime" },
  { code: "tender_response",       title: "Tender Response",              badge: "Pyramid · 18",   category: "tender",    tone: "blue" },
  { code: "training_bilingual",    title: "Training Module",              badge: "SCQA · 16",      category: "training",  tone: "green" },
];

export function Hero() {
  const { t, lang } = useI18n();
  const router = useRouter();

  const [mode, setMode] = useState<"classic" | "studio">("classic");
  const [prompt, setPrompt] = useState("");
  const [slides, setSlides] = useState(5);
  const [tplCat, setTplCat] = useState<TplCategory>("all");

  const placeholder = useMemo(
    () => (lang === "ar"
      ? "مثلاً: ١٠ شرائح عن التحول الرقمي للجنة التوجيه..."
      : "E.g. 10 slides on climate change for the steering committee…"),
    [lang],
  );

  const cats: { id: TplCategory; labelEn: string; labelAr: string }[] = [
    { id: "all",       labelEn: "All",            labelAr: "الكل" },
    { id: "pitch",     labelEn: "Pitch Deck",     labelAr: "عرض تأسيسي" },
    { id: "proposal",  labelEn: "Project Proposal", labelAr: "عرض مشروع" },
    { id: "boardroom", labelEn: "Boardroom",      labelAr: "مجلس الإدارة" },
    { id: "training",  labelEn: "Training",       labelAr: "تدريب" },
    { id: "tender",    labelEn: "Tender",         labelAr: "عطاء" },
  ];

  function submit() {
    const v = prompt.trim();
    const params = new URLSearchParams();
    if (v) params.set("prompt", v);
    params.set("slides", String(slides));
    params.set("mode", mode);
    router.push(`/presentiq/projects/new?${params.toString()}`);
  }

  function onTextareaKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  const filteredCards = tplCat === "all" ? TPL_CARDS : TPL_CARDS.filter((c) => c.category === tplCat);

  return (
    <div className="space-y-16">
      {/* ── Hero v0.5 — Chatly-style composer ─────────────────────── */}
      <section className="pq-composer-hero">
        <div className="pq-mesh" aria-hidden />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Mode tabs */}
          <div className="pq-mode-tabs" role="tablist" aria-label="Generation mode">
            <button
              role="tab"
              type="button"
              data-active={mode === "classic" ? "true" : "false"}
              onClick={() => setMode("classic")}
              className="pq-mode-tab"
            >
              <span aria-hidden>≡</span> {lang === "ar" ? "كلاسيكي" : "Classic"}
            </button>
            <button
              role="tab"
              type="button"
              data-active={mode === "studio" ? "true" : "false"}
              onClick={() => setMode("studio")}
              className="pq-mode-tab"
            >
              <span aria-hidden>◆</span>
              {lang === "ar" ? "استوديو" : "Studio"}
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "0.12rem 0.4rem",
                  borderRadius: 999,
                  background: "rgba(159,205,99,0.18)",
                  color: "var(--pq-primary)",
                  border: "1px solid rgba(159,205,99,0.36)",
                }}
              >
                Pro
              </span>
            </button>
          </div>

          {/* Hero question */}
          <h1 className="pq-composer-hero-h1">
            <span className="pq-emoji" aria-hidden>▣</span>
            {lang === "ar" ? "من أين نبدأ؟" : "Where should we begin?"}
          </h1>

          {/* Composer */}
          <div className="pq-liquid-card pq-composer-card" dir={lang === "ar" ? "rtl" : "ltr"}>
            <textarea
              className="pq-composer-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onTextareaKey}
              placeholder={placeholder}
              aria-label={placeholder}
              rows={2}
            />
            <div className="pq-composer-controls">
              <button
                type="button"
                className="pq-liquid-icon-btn"
                aria-label={lang === "ar" ? "إضافة مصدر" : "Attach a source"}
                onClick={() => router.push(`/presentiq/projects/new?step=sources`)}
                title={lang === "ar" ? "إضافة مصدر" : "Attach"}
              >
                <span aria-hidden>＋</span>
              </button>
              <span className="spacer" />
              <label className="pq-composer-slidesel">
                <select
                  value={slides}
                  onChange={(e) => setSlides(Number(e.target.value))}
                  aria-label={lang === "ar" ? "عدد الشرائح" : "Slide count"}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((n) => (
                    <option key={n} value={n}>
                      {n} {lang === "ar" ? "شريحة" : (n === 1 ? "slide" : "slides")}
                    </option>
                  ))}
                </select>
                <span aria-hidden>⌃</span>
              </label>
              <button
                type="button"
                className="pq-liquid-icon-btn"
                aria-label={lang === "ar" ? "إدخال صوتي" : "Voice input"}
                title={lang === "ar" ? "قريباً" : "Coming soon"}
              >
                <span aria-hidden>🎙</span>
              </button>
              <button
                type="button"
                className="pq-composer-send"
                onClick={submit}
                aria-label={lang === "ar" ? "ابدأ التوليد" : "Start generation"}
                title={lang === "ar" ? "ابدأ" : "Start"}
              >
                <span aria-hidden>↑</span>
              </button>
            </div>
          </div>

          {/* CTA row underneath the composer (liquid + ghost) */}
          <div className="pq-hero-cta-row" style={{ marginTop: "1.5rem" }}>
            <Link
              href="/presentiq/projects/new"
              className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill"
              style={{ padding: "0.85rem 1.6rem", fontSize: "0.95rem" }}
            >
              {t("land.cta.start")} <span className="pq-flip" aria-hidden>→</span>
            </Link>
            <Link
              href="/presentiq/dashboard"
              className="pq-btn pq-btn-liquid pq-btn-liquid-pill"
              style={{ padding: "0.85rem 1.4rem", fontSize: "0.9rem" }}
            >
              {t("land.cta.dashboard")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Templates strip ───────────────────────────────────────── */}
      <section className="pq-templates" aria-label="Templates">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: "var(--pq-text-main)" }}>
            {t("tpl.title")}
          </h2>
          <Link
            href="/presentiq/templates"
            className="pq-nav-link"
            style={{ padding: "0.4rem 0.8rem" }}
          >
            {lang === "ar" ? "عرض الكل" : "Browse all"} →
          </Link>
        </div>

        <div className="pq-tpl-chips" role="tablist" aria-label="Template categories">
          {cats.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              data-active={tplCat === c.id ? "true" : "false"}
              className="pq-tpl-chip"
              onClick={() => setTplCat(c.id)}
            >
              {lang === "ar" ? c.labelAr : c.labelEn}
            </button>
          ))}
        </div>

        <div className="pq-tpl-grid">
          {/* Create blank */}
          <Link href="/presentiq/projects/new" className="pq-tpl-card pq-tpl-card-blank">
            <div className="pq-tpl-card-cover" style={{ background: "transparent" }}>
              <div className="text-center">
                <div style={{ fontSize: "1.6rem", color: "var(--pq-text-secondary)" }} aria-hidden>＋</div>
                <div style={{ marginTop: "0.5rem", color: "var(--pq-text-secondary)", fontWeight: 600 }}>
                  {lang === "ar" ? "إنشاء فارغ" : "Create Blank"}
                </div>
              </div>
            </div>
            <div className="pq-tpl-card-foot">
              <div className="pq-tpl-card-title">{lang === "ar" ? "ابدأ من الصفر" : "Start from scratch"}</div>
              <div className="pq-tpl-card-sub">{lang === "ar" ? "أنت تتحكم بالكامل" : "Full control"}</div>
            </div>
          </Link>

          {filteredCards.map((c) => (
            <Link key={c.code} href={`/presentiq/projects/new?template=${c.code}`} className="pq-tpl-card">
              <div className="pq-tpl-card-cover" data-tone={c.tone}>
                <span>{c.title}</span>
              </div>
              <div className="pq-tpl-card-foot">
                <div className="pq-tpl-card-title">{c.title}</div>
                <div className="pq-tpl-card-sub">{c.badge}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────── */}
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

      {/* ── How it works ──────────────────────────────────────────── */}
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

      {/* ── Trust strip ───────────────────────────────────────────── */}
      <section className="pq-trust-strip" aria-label="Trust">
        <span className="pq-trust-label">{t("hero.trust")}</span>
        <span className="pq-trust-logo">EMIRATES&nbsp;GROUP</span>
        <span className="pq-trust-logo">ETIHAD</span>
        <span className="pq-trust-logo">ARAMCO</span>
        <span className="pq-trust-logo">QATAR&nbsp;ENERGY</span>
        <span className="pq-trust-logo">DP&nbsp;WORLD</span>
        <span className="pq-trust-logo">MUBADALA</span>
      </section>

      {/* ── Differentiator features ───────────────────────────────── */}
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

      {/* ── What's new in v0.3 ────────────────────────────────────── */}
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
