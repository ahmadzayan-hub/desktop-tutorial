"use client";

import { Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";
import { FadeInView } from "@/components/motion/fade-in";
import { StaggerInView, StaggerItem } from "@/components/motion/stagger";

export function LandingRules() {
  const { t, dir } = useLocale();
  return (
    <section className="py-24" dir={dir}>
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <FadeInView>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
              {t.landing.rulesEyebrow}
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="display-tight mt-3 text-balance text-3xl font-bold text-brand-navy sm:text-4xl">
              {t.landing.rulesTitle}
            </h2>
          </FadeInView>
        </div>

        <StaggerInView
          className="mt-12 grid gap-3 sm:grid-cols-2"
          staggerChildren={0.07}
        >
          {t.landing.rules.map((rule) => (
            <StaggerItem key={rule}>
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-status-green/10 text-status-green">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-slate-700">
                  {rule}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerInView>
      </div>
    </section>
  );
}
