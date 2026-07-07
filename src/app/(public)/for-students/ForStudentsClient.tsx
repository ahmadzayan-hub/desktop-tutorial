"use client";
import Link from "next/link";
import { Clock, Target, BookOpen, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { DictKey } from "@/lib/i18n/dictionaries";

const ITEMS: { icon: React.ElementType; titleKey: DictKey; descKey: DictKey }[] = [
  { icon: Clock,    titleKey: "forstudents.item1.title", descKey: "forstudents.item1.desc" },
  { icon: Target,   titleKey: "forstudents.item2.title", descKey: "forstudents.item2.desc" },
  { icon: BookOpen, titleKey: "forstudents.item3.title", descKey: "forstudents.item3.desc" },
  { icon: Globe,    titleKey: "forstudents.item4.title", descKey: "forstudents.item4.desc" },
];

export default function ForStudentsPage() {
  const { t } = useI18n();

  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-gradient-to-br from-navy-900 to-brand-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="badge bg-white/20 text-white mb-6 text-sm">{t("forstudents.page.badge" as DictKey)}</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("forstudents.page.title" as DictKey)}</h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">{t("forstudents.page.subtitle" as DictKey)}</p>
          <Link href="/signup" className="btn bg-white text-brand-700 hover:bg-slate-50 px-8 py-4 text-base font-semibold">
            {t("forstudents.page.cta" as DictKey)}
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
          {t("forstudents.section.title" as DictKey)}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {ITEMS.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className="flex gap-4">
              <div className="p-3 bg-brand-100 dark:bg-brand-900/50 rounded-xl h-fit flex-shrink-0">
                <Icon className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t(titleKey)}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900 py-16 px-4 text-center">
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">{t("forstudents.pricing.label" as DictKey)}</p>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t("forstudents.pricing.title" as DictKey)}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{t("forstudents.pricing.sub" as DictKey)}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/pricing" className="btn-secondary btn-lg">{t("forstudents.pricing.view" as DictKey)}</Link>
          <Link href="/signup" className="btn-primary btn-lg">{t("forstudents.pricing.start" as DictKey)}</Link>
        </div>
      </section>
    </main>
  );
}
