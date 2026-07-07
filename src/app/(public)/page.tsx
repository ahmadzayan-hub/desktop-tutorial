"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import {
  BookOpen, Brain, FileText, BarChart2, Calendar,
  Languages, Zap, MessageSquare, CheckCircle2, ArrowLeft, ArrowRight,
  GraduationCap
} from "lucide-react";

const STEP_ICONS = ["📚", "🎙️", "📋", "✨", "🤖", "🎯"];

const FEATURE_ICONS = [
  BookOpen, Brain, FileText, BarChart2,
  Calendar, Languages, Zap, MessageSquare,
];

const STATS = [
  { en: "15+", labelEn: "AI features",            ar: "+15", labelAr: "ميزة ذكاء اصطناعي" },
  { en: "8",   labelEn: "study tools",             ar: "8",   labelAr: "أدوات دراسية" },
  { en: "100%",labelEn: "Arabic RTL support",      ar: "100%",labelAr: "دعم عربي كامل" },
  { en: "7",   labelEn: "days free trial",         ar: "7",   labelAr: "أيام تجريبية مجانية" },
];

export default function HomePage() {
  const { t, locale, dir } = useI18n();
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const featureKeys = [
    "dashboard", "ai_tutor", "study_packs", "grades",
    "deadlines", "bilingual", "weekly_brief", "ask_mba",
  ] as const;

  const stepKeys = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div dir={dir}>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-teal-50 dark:from-brand-950/40 dark:via-slate-950 dark:to-teal-950/30 pt-20 pb-24 px-4">
        {/* decorative orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -start-40 w-[600px] h-[600px] rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute top-1/3 -end-20 w-[400px] h-[400px] rounded-full bg-teal-400/10 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Brand pill */}
          <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300 mb-6 animate-fade-up">
            <GraduationCap size={13} />
            <span>{t("home.pill")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6 animate-stagger-1">
            {t("home.hero.title")}
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed animate-stagger-2">
            {t("home.hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 animate-stagger-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2 min-w-[180px]">
                {t("home.hero.cta_primary")}
                <Arrow size={16} />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="secondary" size="lg" className="min-w-[180px]">
                {t("home.hero.cta_secondary")}
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-400 dark:text-slate-500 animate-stagger-4">
            {t("home.hero.badge")}
          </p>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                {isAr ? s.ar : s.en}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {isAr ? s.labelAr : s.labelEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-14 tracking-tight">
            {t("home.how.title")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stepKeys.map((n, i) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl" aria-hidden>{STEP_ICONS[i]}</span>
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">
                    {isAr ? `الخطوة ${n}` : `Step ${n}`}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  {t(`home.how.step${n}.title` as any)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(`home.how.step${n}.body` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-14 tracking-tight">
            {t("home.features.title")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featureKeys.map((key, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={key}
                  className="group p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-brand-200 dark:hover:border-brand-800 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center mb-3 group-hover:bg-brand-200 dark:group-hover:bg-brand-900/60 transition-colors">
                    <Icon size={18} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">
                    {t(`home.features.${key}.title` as any)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t(`home.features.${key}.body` as any)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t("home.social_proof.title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            {t("home.social_proof.subtitle")}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "🎯", en: "Cites your actual lecture files", ar: "يستشهد بملفاتك فعلاً" },
              { icon: "🔒", en: "Your data stays private", ar: "بياناتك تبقى خاصة" },
              { icon: "🌐", en: "English and Arabic, fully RTL", ar: "عربي وإنجليزي بشكل كامل" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-start">
                <span className="text-xl" aria-hidden>{item.icon}</span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isAr ? item.ar : item.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ───────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            {t("home.pricing.title")}
          </h2>
          <p className="text-slate-400 dark:text-slate-500 mb-10 text-sm">
            {t("home.pricing.trial")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { name: t("pricing.free.name"),    price: "0",  features: isAr ? ["مقرر واحد","10 استعلامات/شهر"] : ["1 course","10 AI queries/month"] },
              { name: t("pricing.student.name"), price: "12", features: isAr ? ["10 مقررات","500 استعلام/شهر","مدرب ذكي"] : ["10 courses","500 AI queries/month","AI tutor"], popular: true },
              { name: t("pricing.pro.name"),     price: "22", features: isAr ? ["مقررات غير محدودة","أولوية في المعالجة"] : ["Unlimited courses","Priority AI"] },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-5 border text-start ${plan.popular ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-card-lg" : "border-slate-200 dark:border-slate-800"}`}>
                {plan.popular && (
                  <span className="inline-block text-[10px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded-full mb-2">
                    {t("pricing.popular")}
                  </span>
                )}
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{plan.name}</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">${plan.price}<span className="text-sm font-normal text-slate-400">{t("pricing.per_month")}</span></p>
                <ul className="space-y-1.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link href="/pricing">
            <Button variant="secondary" className="gap-2">
              {isAr ? "عرض جميع الخطط والمميزات" : "View all plans and features"}
              <Arrow size={15} />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-brand-600 to-brand-800 dark:from-brand-800 dark:to-brand-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            {isAr ? "ابدأ رحلتك في الماجستير بذكاء" : "Start your MBA journey smarter"}
          </h2>
          <p className="text-brand-200 mb-8">
            {isAr ? "7 أيام مجانية — لا بطاقة ائتمان — إلغاء في أي وقت." : "7-day free trial — no credit card — cancel anytime."}
          </p>
          <Link href="/signup">
            <Button size="lg" variant="ghost" className="bg-white text-brand-700 hover:bg-brand-50 gap-2 font-bold shadow-xl">
              {t("home.hero.cta_primary")}
              <Arrow size={16} />
            </Button>
          </Link>
          <p className="mt-4 text-brand-300 text-xs">{t("home.hero.badge")}</p>
        </div>
      </section>
    </div>
  );
}
