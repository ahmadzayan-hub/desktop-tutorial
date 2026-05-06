"use client";

import { useT, useI18n } from "@/lib/i18n/I18nProvider";
import HeroIllustration from "@/components/HeroIllustration";
import PromptTrends from "@/components/PromptTrends";
import { PROMPT_METHODS } from "@/lib/prompt-methods";
import type { TargetModel } from "@/lib/types";

export default function HomePage() {
  const t = useT();
  const { locale } = useI18n();
  const ar = locale === "ar";

  return (
    <div className="relative overflow-hidden">
      {/* Background mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-brand-mesh" />
      {/* Extra glow blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-brand-500/15 via-violet-500/8 to-pink-400/8 blur-3xl" />
        <div className="absolute top-60 -end-20 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-amber-200/20 to-rose-200/8 blur-3xl" />
      </div>

      {/* Hero section */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-24 pb-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Copy */}
          <div className="text-center lg:text-start">
            <UAEBadge t={t} />
            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="text-gradient">{ar ? "منصة هندسة" : "Prompt"}</span>
              <br />
              <span className="text-slate-900 dark:text-white">{ar ? "الموجّهات الذكية" : "Intelligence"}</span>
              <br />
              <span className="text-slate-900 dark:text-white">{ar ? "للعالم العربي" : "Platform"}</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t("home.subtitle")}
            </p>

            {/* Feature pills */}
            <div className="mt-5 flex flex-wrap justify-center lg:justify-start gap-2">
              {[
                { icon: "🎯", text: ar ? "11 أسلوب موجّهات" : "11 Prompt Methods" },
                { icon: "🧠", text: ar ? "تحليل ميتا ذكي" : "Meta-AI Analysis" },
                { icon: "📊", text: ar ? "تقييم 10 محاور" : "10-Dim Scoring" },
                { icon: "🇦🇪", text: ar ? "عربي + إنجليزي" : "Arabic + English" },
              ].map(({ icon, text }) => (
                <span key={text} className="pill-brand gap-1.5">
                  <span>{icon}</span><span>{text}</span>
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
              <a href="/workspace" className="btn-primary px-6 py-3 text-base gap-2">
                <span>✨</span>
                <span>{t("home.cta.workspace")}</span>
              </a>
              <a href="/dashboard" className="btn-secondary px-5 py-3 text-base gap-2">
                <span>📊</span>
                <span>{ar ? "لوحة التحكم" : "Dashboard"}</span>
              </a>
            </div>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto lg:mx-0">
              {t("home.origin_long")}
            </p>
          </div>

          {/* Illustration */}
          <div className="order-first lg:order-last">
            <HeroIllustration className="w-full h-auto max-w-md sm:max-w-lg lg:max-w-none mx-auto animate-float" />
          </div>
        </div>
      </div>

      {/* How-it-works */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid sm:grid-cols-3 gap-4">
          <StepCard emoji="🎯" tone="brand"  title={t("home.step1.title")} body={t("home.step1.body")} />
          <StepCard emoji="🏗️" tone="violet" title={t("home.step2.title")} body={t("home.step2.body")} />
          <StepCard emoji="🏆" tone="emerald" title={t("home.step3.title")} body={t("home.step3.body")} />
        </div>
      </div>

      {/* 11 Methods preview */}
      <MethodsShowcase ar={ar} t={t} />

      {/* Examples */}
      <ExamplesSection />

      {/* Daily trends */}
      <PromptTrends locale={locale} />
    </div>
  );
}

function UAEBadge({ t }: { t: ReturnType<typeof useT> }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide bg-gradient-to-r from-emerald-50 via-white to-rose-50 dark:from-emerald-900/20 dark:via-slate-900 dark:to-rose-900/20 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
      <span aria-hidden="true" className="text-base leading-none">🇦🇪</span>
      <span className="text-slate-700 dark:text-slate-200">{t("home.pill")}</span>
    </span>
  );
}

function StepCard({ emoji, tone, title, body }: { emoji: string; tone: "brand" | "violet" | "emerald"; title: string; body: string }) {
  const tones: Record<string, string> = {
    brand:   "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
    violet:  "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  };
  return (
    <div className="card hover:shadow-card-hover transition group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${tones[tone]} group-hover:scale-110 transition-transform`}>
        {emoji}
      </div>
      <div className="mt-3 font-bold text-slate-900 dark:text-white">{title}</div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{body}</p>
    </div>
  );
}

function MethodsShowcase({ ar, t }: { ar: boolean; t: ReturnType<typeof useT> }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-14">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t("home.methods.title")}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {t("home.methods.subtitle")}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {PROMPT_METHODS.map((m) => (
          <a
            key={m.id}
            href="/workspace"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:shadow-brand transition-all group"
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-base text-white ${m.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
              {m.emoji}
            </span>
            <span>{ar ? m.name_ar : m.name_en}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              m.complexity === "beginner" ? "bg-emerald-50 text-emerald-600" :
              m.complexity === "intermediate" ? "bg-amber-50 text-amber-600" :
              "bg-rose-50 text-rose-600"
            }`}>
              {ar
                ? { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" }[m.complexity]
                : { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" }[m.complexity]
              }
            </span>
          </a>
        ))}
      </div>
      <div className="text-center mt-5">
        <a href="/workspace" className="btn-primary px-6 py-3 text-sm gap-2">
          ✨ {ar ? "جرّب جميع الأساليب" : "Try All Methods"}
        </a>
      </div>
    </div>
  );
}

function ExamplesSection() {
  const t = useT();
  type ExKey = "home.examples.coding.title" | "home.examples.writing.title" | "home.examples.analysis.title";
  type BodyKey = "home.examples.coding.body" | "home.examples.writing.body" | "home.examples.analysis.body";

  const examples: Array<{ titleKey: ExKey; bodyKey: BodyKey; model: TargetModel; tone: "violet" | "sky" | "emerald"; emoji: string }> = [
    { titleKey: "home.examples.coding.title",   bodyKey: "home.examples.coding.body",   model: "chatgpt", tone: "violet",  emoji: "💻" },
    { titleKey: "home.examples.writing.title",  bodyKey: "home.examples.writing.body",  model: "chatgpt", tone: "sky",     emoji: "✍️" },
    { titleKey: "home.examples.analysis.title", bodyKey: "home.examples.analysis.body", model: "claude",  tone: "emerald", emoji: "📊" },
  ];

  function tryExample(bodyKey: BodyKey, model: TargetModel) {
    const text = t(bodyKey);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("po_starter", JSON.stringify({ text, model }));
      window.location.href = "/workspace";
    }
  }

  const toneClass: Record<string, string> = {
    violet:  "border-violet-200 dark:border-violet-700 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-900 dark:to-slate-900",
    sky:     "border-sky-200 dark:border-sky-700 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-900",
    emerald: "border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-900",
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
        {t("home.examples.title")}
      </h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {examples.map((e) => (
          <button
            key={e.titleKey}
            onClick={() => tryExample(e.bodyKey, e.model)}
            className={`text-start rounded-2xl border p-5 hover:shadow-card-hover transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 group ${toneClass[e.tone]}`}
          >
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform" aria-hidden="true">{e.emoji}</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{t(e.titleKey)}</div>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">{t(e.bodyKey)}</p>
            <span className="mt-3 inline-block text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform">
              {t("home.examples.try")} →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
