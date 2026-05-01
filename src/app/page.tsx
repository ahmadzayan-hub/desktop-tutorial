"use client";

import { useT } from "@/lib/i18n/I18nProvider";

export default function HomePage() {
  const t = useT();
  return (
    <div className="relative overflow-hidden">
      {/* soft gradient bg */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-brand-500/20 via-violet-500/10 to-cyan-400/10 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16 text-center">
        <span className="inline-block text-xs font-semibold tracking-wide uppercase rounded-full bg-brand-50 text-brand-700 px-3 py-1">
          {t("home.pill")}
        </span>
        <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight leading-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
          {t("home.title")}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">{t("home.subtitle")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/workspace" className="btn-primary">{t("home.cta.workspace")}</a>
          <a href="/templates" className="btn-ghost border border-slate-300">{t("home.cta.templates")}</a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card hover:shadow-md transition">
            <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-semibold">1</div>
            <div className="mt-3 font-medium">{t("home.step1.title")}</div>
            <p className="text-sm text-slate-600 mt-1">{t("home.step1.body")}</p>
          </div>
          <div className="card hover:shadow-md transition">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center font-semibold">2</div>
            <div className="mt-3 font-medium">{t("home.step2.title")}</div>
            <p className="text-sm text-slate-600 mt-1">{t("home.step2.body")}</p>
          </div>
          <div className="card hover:shadow-md transition">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold">3</div>
            <div className="mt-3 font-medium">{t("home.step3.title")}</div>
            <p className="text-sm text-slate-600 mt-1">{t("home.step3.body")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
