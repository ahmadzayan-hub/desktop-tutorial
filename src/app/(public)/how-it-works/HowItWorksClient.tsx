"use client";
import Link from "next/link";
import { Upload, Brain, BarChart3, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { DictKey } from "@/lib/i18n/dictionaries";

const STEPS: { step: string; icon: React.ElementType; titleKey: DictKey; descKey: DictKey; color: string }[] = [
  { step: "01", icon: Upload,    titleKey: "howitworks.step1.title", descKey: "howitworks.step1.desc", color: "text-brand-600 bg-brand-100 dark:bg-brand-900/50"   },
  { step: "02", icon: Brain,     titleKey: "howitworks.step2.title", descKey: "howitworks.step2.desc", color: "text-teal-600 bg-teal-100 dark:bg-teal-900/50"     },
  { step: "03", icon: BarChart3, titleKey: "howitworks.step3.title", descKey: "howitworks.step3.desc", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50" },
  { step: "04", icon: Sparkles,  titleKey: "howitworks.step4.title", descKey: "howitworks.step4.desc", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/50"  },
];

export default function HowItWorksPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-gradient-to-br from-brand-950 to-teal-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("howitworks.page.title" as DictKey)}</h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">{t("howitworks.page.subtitle" as DictKey)}</p>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        {STEPS.map(({ step, icon: Icon, titleKey, descKey, color }, i) => (
          <div key={step} className={`flex gap-8 items-start ${i % 2 === 1 && !isAr ? "flex-row-reverse" : ""}`}>
            <div className="flex-shrink-0 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 ${color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <span className="text-3xl font-black text-slate-200 dark:text-slate-700">{step}</span>
            </div>
            <div className="flex-1 pt-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t(titleKey)}</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">{t(descKey)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-brand-600 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">{t("howitworks.cta.heading" as DictKey)}</h2>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">{t("howitworks.cta.sub" as DictKey)}</p>
        <Link href="/signup" className="btn bg-white text-brand-700 hover:bg-white/90 px-8 py-3.5 text-base font-semibold">
          {t("howitworks.cta.btn" as DictKey)} →
        </Link>
      </section>
    </main>
  );
}
