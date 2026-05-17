"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  FileSliders,
  Languages,
  Gauge,
  RotateCcw,
  BadgeCheck,
  Sparkles,
  ArrowUp,
  ChevronDown,
  Mic,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";
import { TEMPLATES } from "@/lib/presentiq/templates/registry";
import {
  AuroraWord,
  Magnetic,
  ParallaxMesh,
  Reveal,
  Tilt,
} from "@/components/presentiq/ui/motion";

const FEATURES: { titleKey: any; bodyKey: any; Icon: LucideIcon }[] = [
  { titleKey: "feat.brand.title",    bodyKey: "feat.brand.body",    Icon: ShieldCheck },
  { titleKey: "feat.pptx.title",     bodyKey: "feat.pptx.body",     Icon: FileSliders },
  { titleKey: "feat.rtl.title",      bodyKey: "feat.rtl.body",      Icon: Languages },
  { titleKey: "feat.quality.title",  bodyKey: "feat.quality.body",  Icon: Gauge },
  { titleKey: "feat.regen.title",    bodyKey: "feat.regen.body",    Icon: RotateCcw },
  { titleKey: "feat.evidence.title", bodyKey: "feat.evidence.body", Icon: BadgeCheck },
];

const V2_KEYS: any[] = ["v2.outline", "v2.theme", "v2.share", "v2.compare", "v2.assets", "v2.demo"];

type TplCategory = "all" | "pitch" | "proposal" | "boardroom" | "training" | "tender";

// Categorise the registry templates so the landing's chip filter works.
const TPL_CATEGORY: Record<string, Exclude<TplCategory, "all">> = {
  scqa_brief:             "proposal",
  boardroom_decision:     "boardroom",
  investor_business_case: "pitch",
  uae_gov_committee:      "boardroom",
  qbr_steering:           "boardroom",
  okr_review:             "boardroom",
  tender_response:        "tender",
  training_bilingual:     "training",
  pestel_strategy:        "proposal",
};

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

  const filteredCards = TEMPLATES.filter((tp) =>
    tplCat === "all" ? true : TPL_CATEGORY[tp.code] === tplCat,
  );

  const brandName = lang === "ar" ? "بِتشورا" : "Pitchora";
  // For Arabic, the headline is shorter so we use a smaller letter step.
  const letterStep = lang === "ar" ? 70 : 55;

  // Trust marquee items, duplicated twice for an unbroken loop.
  const TRUST = lang === "ar"
    ? ["مجالس الإدارة", "اللجان الحكومية", "الشركاء الاستشاريون", "لجان التوجيه", "حالات العمل", "فِرَق العلاقات الحكومية", "مديرو المنتجات"]
    : ["BOARDROOMS", "GOVERNMENT COMMITTEES", "CONSULTING PARTNERS", "STEERING COMMITTEES", "BUSINESS CASES", "GR TEAMS", "PRODUCT LEADERS"];

  return (
    <div className="space-y-16">
      {/* ── Hero v0.5 — Pitchora composer + parallax aurora ───────── */}
      <section className="pq-composer-hero" style={{ position: "relative", isolation: "isolate" }}>
        <div className="pq-mesh pq-aurora-flow" aria-hidden />
        <ParallaxMesh intensity={28} />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Animated Pitchora wordmark — letter-by-letter aurora */}
          <div className="pq-rise" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
            <AuroraWord
              text={brandName}
              className="block"
              start={120}
              step={letterStep}
            />
          </div>

          {/* Mode tabs */}
          <div className="pq-mode-tabs pq-rise pq-rise-2" role="tablist" aria-label="Generation mode">
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
            </button>
          </div>

          {/* Hero question */}
          <h1 className="pq-composer-hero-h1 pq-rise pq-rise-3">
            <Sparkles className="pq-emoji" aria-hidden size={28} />
            <span className="pq-aurora-underline">
              {lang === "ar" ? "من أين نبدأ؟" : "Where should we begin?"}
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="pq-rise pq-rise-3"
            style={{
              textAlign: "center",
              marginTop: "0.5rem",
              marginBottom: "1.5rem",
              color: "var(--pq-text-secondary)",
              fontSize: "0.95rem",
              lineHeight: 1.5,
            }}
          >
            {t("brand.tagline")}
          </p>

          {/* Composer */}
          <div className="pq-liquid-card pq-composer-card pq-rise pq-rise-4" dir={lang === "ar" ? "rtl" : "ltr"}>
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
                <Plus aria-hidden size={16} strokeWidth={2.2} />
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
                <ChevronDown aria-hidden size={14} />
              </label>
              <button
                type="button"
                className="pq-liquid-icon-btn"
                aria-label={lang === "ar" ? "إدخال صوتي" : "Voice input"}
                title={lang === "ar" ? "قريباً" : "Coming soon"}
              >
                <Mic aria-hidden size={16} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                className="pq-composer-send"
                onClick={submit}
                aria-label={lang === "ar" ? "ابدأ التوليد" : "Start generation"}
                title={lang === "ar" ? "ابدأ" : "Start"}
              >
                <ArrowUp aria-hidden size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* CTA row underneath the composer (magnetic + ghost) */}
          <div className="pq-hero-cta-row pq-rise pq-rise-5" style={{ marginTop: "1.5rem" }}>
            <Magnetic as="a" href="/presentiq/projects/new" className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill" style={{ padding: "0.85rem 1.6rem", fontSize: "0.95rem" }}>
              {t("land.cta.start")} <span className="pq-flip" aria-hidden>→</span>
            </Magnetic>
            <Magnetic as="a" href="/presentiq/dashboard" className="pq-btn pq-btn-liquid pq-btn-liquid-pill" style={{ padding: "0.85rem 1.4rem", fontSize: "0.9rem" }}>
              {t("land.cta.dashboard")}
            </Magnetic>
          </div>
        </div>
      </section>

      {/* ── Templates strip ───────────────────────────────────────── */}
      <Reveal as="section" className="pq-templates" variant="single">
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

        <Reveal variant="stagger" className="pq-tpl-grid">
          {/* Create blank */}
          <Tilt as="a" href="/presentiq/projects/new" className="pq-tpl-card pq-tpl-card-blank" max={4}>
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
          </Tilt>

          {filteredCards.map((tp) => {
            const title = lang === "ar" ? tp.nameAr : tp.nameEn;
            return (
              <Tilt
                key={tp.code}
                as="a"
                href={`/presentiq/projects/new?template=${tp.code}`}
                className="pq-tpl-card"
                max={5}
              >
                <div className="pq-tpl-card-cover" data-tone={tp.tone}>
                  <span>{title}</span>
                </div>
                <div className="pq-tpl-card-foot">
                  <div className="pq-tpl-card-title">{title}</div>
                  <div className="pq-tpl-card-sub">
                    {tp.framework} · {tp.defaultSlides} {lang === "ar" ? "شريحة" : "slides"}
                  </div>
                </div>
              </Tilt>
            );
          })}
        </Reveal>
      </Reveal>

      {/* ── Capability strip — verifiable platform facts only ───── */}
      <Reveal as="section" className="pq-stats pq-stats-flat" variant="stagger">
        <div className="pq-stat">
          <div className="pq-stat-num">EN · AR</div>
          <div className="pq-stat-label">{t("hero.stat.langs")}</div>
        </div>
        <div className="pq-stat">
          <div className="pq-stat-num">10</div>
          <div className="pq-stat-label">{t("hero.stat.dims")}</div>
        </div>
        <div className="pq-stat">
          <div className="pq-stat-num">PPTX</div>
          <div className="pq-stat-label">{lang === "ar" ? "مخرج قابل للتحرير" : "Editable export"}</div>
        </div>
        <div className="pq-stat">
          <div className="pq-stat-num">RTL</div>
          <div className="pq-stat-label">{lang === "ar" ? "تخطيطات معكوسة" : "Mirrored layouts"}</div>
        </div>
      </Reveal>

      {/* ── How it works ──────────────────────────────────────────── */}
      <Reveal as="section" variant="stagger">
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
      </Reveal>

      {/* ── Built-for marquee — animated trust strip ─────────────── */}
      <Reveal as="section" className="pq-trust-strip pq-marquee" variant="single">
        <span className="pq-trust-label" style={{ flexShrink: 0, paddingInlineEnd: "1.5rem" }}>
          {lang === "ar" ? "مُصمَّم لـ" : "Built for"}
        </span>
        <div className="pq-marquee-track">
          {TRUST.concat(TRUST).map((label, i) => (
            <span key={i} className="pq-trust-logo" style={{ whiteSpace: "nowrap" }}>
              {label}
            </span>
          ))}
        </div>
      </Reveal>

      {/* ── Differentiator features ───────────────────────────────── */}
      <Reveal
        as="section"
        variant="stagger"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {FEATURES.map((f) => {
          const Icon = f.Icon;
          return (
            <Tilt key={String(f.titleKey)} max={4}>
              <Frame4D className="p-6">
                <div
                  className="grid place-items-center w-10 h-10 rounded-xl mb-3"
                  style={{
                    background: "rgba(159,205,99,0.14)",
                    color: "var(--pq-primary)",
                    border: "1px solid rgba(159,205,99,0.32)",
                  }}
                  aria-hidden
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold" style={{ color: "var(--pq-text-main)" }}>
                  {t(f.titleKey)}
                </h3>
                <p className="text-sm mt-2" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.55 }}>
                  {t(f.bodyKey)}
                </p>
              </Frame4D>
            </Tilt>
          );
        })}
      </Reveal>

      {/* ── What's new in v0.5 ────────────────────────────────────── */}
      <Reveal as="section" variant="single">
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
      </Reveal>
    </div>
  );
}
