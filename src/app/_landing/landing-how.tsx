"use client";

import { motion } from "motion/react";
import { useLocale } from "@/lib/i18n/locale-provider";
import { FadeInView } from "@/components/motion/fade-in";
import { StaggerInView, StaggerItem } from "@/components/motion/stagger";

export function LandingHow() {
  const { t, dir } = useLocale();
  return (
    <section id="how" className="py-24" dir={dir}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <FadeInView>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
              {t.landing.howEyebrow}
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="display-tight mt-3 text-balance text-3xl font-bold text-brand-navy sm:text-4xl">
              {t.landing.howTitle}
            </h2>
          </FadeInView>
        </div>

        <StaggerInView
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          staggerChildren={0.1}
        >
          {t.landing.steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className="group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-navy/5 transition-all group-hover:bg-brand-navy/10" />
                <div className="relative">
                  <span className="display-tight num inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-base font-bold text-white">
                    {step.n}
                  </span>
                  <h3 className="display-tight mt-4 text-base font-semibold text-brand-navy">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.body}
                  </p>
                </div>
                {i < t.landing.steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute right-3 top-8 hidden text-slate-200 lg:block"
                  >
                    →
                  </span>
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerInView>
      </div>
    </section>
  );
}
