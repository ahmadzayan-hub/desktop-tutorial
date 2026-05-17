"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles, Rocket, Building2, Crown, ShieldHalf } from "lucide-react";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";
import { Magnetic, Reveal, Tilt } from "@/components/presentiq/ui/motion";
import { PLANS } from "@/lib/presentiq/stripe/plans";

const PLAN_ICONS: Record<string, any> = {
  trial: Sparkles,
  pro: Rocket,
  business: Building2,
  enterprise: Crown,
  gov_private: ShieldHalf,
};

export function Pricing() {
  const { lang } = useI18n();
  const [annual, setAnnual] = useState(false);

  const heading = lang === "ar" ? "أسعار شفّافة. ابدأ مجاناً." : "Transparent pricing. Start free.";
  const sub = lang === "ar"
    ? "ادفع شهرياً أو سنوياً ووفّر بحدود ٢٠٪. كل الباقات تشمل تصدير PPTX قابل للتحرير ودعم العربية وRTL."
    : "Pay monthly or annually and save ~20%. Every plan includes editable PPTX, Arabic-RTL, and the boardroom-readiness score.";

  return (
    <div className="space-y-12">
      <Reveal as="header" variant="single">
        <div style={{ textAlign: "center" }}>
          <span className="pq-pill pq-pill-strong">{lang === "ar" ? "الأسعار" : "Pricing"}</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: "var(--pq-text-main)" }}>
            {heading}
          </h1>
          <p className="mt-3 mx-auto max-w-2xl text-base" style={{ color: "var(--pq-text-secondary)" }}>
            {sub}
          </p>

          <div className="pq-toggle-row" style={{ marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.85rem", color: annual ? "var(--pq-text-secondary)" : "var(--pq-text-main)", fontWeight: 600 }}>
              {lang === "ar" ? "شهري" : "Monthly"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual((v) => !v)}
              className="pq-billing-toggle"
              data-on={annual ? "true" : "false"}
            >
              <span className="pq-billing-toggle-knob" />
            </button>
            <span style={{ fontSize: "0.85rem", color: annual ? "var(--pq-text-main)" : "var(--pq-text-secondary)", fontWeight: 600 }}>
              {lang === "ar" ? "سنوي" : "Annual"}
            </span>
            <span className="pq-pill" style={{ marginInlineStart: "0.4rem" }}>{lang === "ar" ? "وفّر ٢٠٪" : "Save 20%"}</span>
          </div>
        </div>
      </Reveal>

      <Reveal variant="stagger" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANS.filter((p) => p.code !== "gov_private").map((p, i) => {
          const isFeatured = p.code === "pro";
          const price = annual ? Math.round(p.annualUsd / 12) : p.monthlyUsd;
          const priceLabel = p.monthlyUsd === 0 && p.code === "enterprise" ? (lang === "ar" ? "تواصل معنا" : "Contact us") : `$${price}`;
          const periodLabel = p.monthlyUsd === 0 ? "" : (lang === "ar" ? "/شهر" : "/mo");
          const PlanIcon = PLAN_ICONS[p.code] ?? Sparkles;

          return (
            <Tilt key={p.code} max={3}>
              <Frame4D
                variant={isFeatured ? "pine" : undefined}
                className="p-6 h-full flex flex-col"
                interactive={false}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PlanIcon size={20} strokeWidth={2} style={{ color: "var(--pq-primary)" }} aria-hidden />
                    <h3 className="text-lg font-semibold" style={{ color: "var(--pq-text-main)" }}>{p.name}</h3>
                  </div>
                  {isFeatured && <span className="pq-pill pq-pill-strong">{lang === "ar" ? "الأكثر شيوعاً" : "Most popular"}</span>}
                </div>
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                  <span style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--pq-text-main)" }}>{priceLabel}</span>
                  <span style={{ fontSize: "0.9rem", color: "var(--pq-text-secondary)" }}>{periodLabel}</span>
                </div>
                <ul style={{ marginTop: "1.2rem", display: "grid", gap: "0.55rem", flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--pq-text-secondary)" }}>
                      <Check size={16} strokeWidth={2.2} style={{ color: "var(--pq-primary)", marginTop: "0.18rem", flexShrink: 0 }} aria-hidden />
                      {f}
                    </li>
                  ))}
                  {p.decksPerMonth !== null && (
                    <li className="flex items-start gap-2 text-sm" style={{ color: "var(--pq-text-secondary)" }}>
                      <Check size={16} strokeWidth={2.2} style={{ color: "var(--pq-primary)", marginTop: "0.18rem", flexShrink: 0 }} aria-hidden />
                      {p.decksPerMonth} {lang === "ar" ? "عرضاً شهرياً" : "decks / month"}
                    </li>
                  )}
                  {p.brandKits !== null && (
                    <li className="flex items-start gap-2 text-sm" style={{ color: "var(--pq-text-secondary)" }}>
                      <Check size={16} strokeWidth={2.2} style={{ color: "var(--pq-primary)", marginTop: "0.18rem", flexShrink: 0 }} aria-hidden />
                      {p.brandKits} {lang === "ar" ? "هويّة علامة" : p.brandKits === 1 ? "brand kit" : "brand kits"}
                    </li>
                  )}
                </ul>
                <div style={{ marginTop: "1.2rem" }}>
                  <Magnetic
                    as="a"
                    href={p.code === "enterprise" ? "/presentiq/contact" : "/presentiq/projects/new"}
                    className={`pq-btn pq-btn-liquid pq-btn-liquid-pill ${isFeatured ? "pq-btn-liquid-primary" : ""}`}
                    style={{ width: "100%", justifyContent: "center", padding: "0.7rem 1rem", fontSize: "0.9rem" }}
                  >
                    {p.code === "enterprise"
                      ? (lang === "ar" ? "تواصل معنا" : "Contact sales")
                      : (lang === "ar" ? "ابدأ الآن" : "Get started")}
                  </Magnetic>
                </div>
              </Frame4D>
            </Tilt>
          );
        })}
      </Reveal>

      <Reveal variant="single">
        <Frame4D variant="pine" className="p-8" interactive={false}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold" style={{ color: "var(--pq-text-main)" }}>
                {lang === "ar" ? "النشر الحكومي الخاص" : "Government Private Deployment"}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--pq-text-secondary)" }}>
                {lang === "ar"
                  ? "استضافة داخل الإمارات، نموذج خاص، مفاتيح يديرها العميل، اتفاقية معالجة بيانات مخصّصة."
                  : "UAE-hosted, private model, customer-managed keys, custom DPA."}
              </p>
            </div>
            <Link
              href="/presentiq/contact"
              className="pq-btn pq-btn-liquid pq-btn-liquid-pill"
              style={{ padding: "0.7rem 1.4rem" }}
            >
              {lang === "ar" ? "تحدّث مع المؤسس" : "Talk to founder"} →
            </Link>
          </div>
        </Frame4D>
      </Reveal>

      <Reveal variant="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            q: lang === "ar" ? "هل يمكنني الإلغاء في أي وقت؟" : "Can I cancel anytime?",
            a: lang === "ar" ? "نعم — لا عقود طويلة. تُلغي اشتراكك في أي وقت من بوّابة الفوترة." : "Yes — no long-term contracts. Cancel anytime in the billing portal.",
          },
          {
            q: lang === "ar" ? "هل المحتوى آمن؟" : "Is my content secure?",
            a: lang === "ar" ? "نعم. مسارات لكل مستأجر، تخزين آمن، روابط موقّعة قصيرة العمر، وسجل تدقيق." : "Yes. Per-tenant prefixes, secure storage, short-lived signed URLs, and full audit log.",
          },
          {
            q: lang === "ar" ? "كم تستغرق الترقية؟" : "How fast is the upgrade?",
            a: lang === "ar" ? "فوريّ. الفوترة من Stripe، والميزات تُفعّل في ثوانٍ بعد الدفع." : "Instant. Stripe-billed; features unlock seconds after payment.",
          },
        ].map((item, i) => (
          <Frame4D key={i} className="p-6" interactive={false}>
            <h4 className="font-semibold" style={{ color: "var(--pq-text-main)" }}>{item.q}</h4>
            <p className="mt-2 text-sm" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.55 }}>{item.a}</p>
          </Frame4D>
        ))}
      </Reveal>
    </div>
  );
}
