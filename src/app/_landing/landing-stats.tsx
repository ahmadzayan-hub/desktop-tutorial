"use client";

import { Clock, Layers, ShieldCheck, Languages } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { useLocale } from "@/lib/i18n/locale-provider";
import { FadeInView } from "@/components/motion/fade-in";
import { StaggerInView, StaggerItem } from "@/components/motion/stagger";

const ICONS = [Clock, Layers, ShieldCheck, Languages] as const;

export function LandingStats() {
  const { t, dir } = useLocale();
  return (
    <section className="border-y border-slate-200 bg-white py-16 sm:py-20" dir={dir}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeInView className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
            {t.landing.statsEyebrow}
          </p>
        </FadeInView>
        <StaggerInView
          className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          staggerChildren={0.08}
        >
          {t.landing.statsItems.map((stat, i) => {
            const Icon = ICONS[i] ?? Clock;
            return (
              <StaggerItem key={stat.label}>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center sm:p-6">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-brand-navy/10 text-brand-navy sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="num display-tight mt-4 text-3xl font-bold text-brand-navy sm:text-4xl">
                    <CountUp to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerInView>
      </div>
    </section>
  );
}
