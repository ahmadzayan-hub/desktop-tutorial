"use client";

import { motion } from "motion/react";
import { useLocale } from "@/lib/i18n/locale-provider";
import { FadeInView } from "@/components/motion/fade-in";
import { StaggerInView, StaggerItem } from "@/components/motion/stagger";

export function LandingOutputs() {
  const { t, dir } = useLocale();
  return (
    <section className="border-y border-slate-200 bg-gradient-to-b from-white to-slate-50 py-24" dir={dir}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <FadeInView>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rta-red">
              {t.landing.outputsEyebrow}
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="display-tight mt-3 text-balance text-3xl font-bold text-rta-navy sm:text-4xl">
              {t.landing.outputsTitle}
            </h2>
          </FadeInView>
        </div>

        <StaggerInView
          className="mt-14 grid gap-5 md:grid-cols-3"
          staggerChildren={0.12}
        >
          {t.landing.outputCards.map((card) => (
            <StaggerItem key={card.title}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-rta-navy/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-rta-navy">
                    {card.chip}
                  </span>
                </div>
                <h3 className="display-tight mt-5 text-xl font-semibold text-rta-navy">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {card.body}
                </p>
                <motion.div
                  className="mt-6 h-32 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-3"
                  whileHover={{ borderColor: "#171C8F" }}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex gap-1.5">
                      <span className="h-1.5 w-12 rounded-full bg-rta-navy/30" />
                      <span className="h-1.5 w-6 rounded-full bg-rta-navy/15" />
                    </div>
                    <div className="space-y-1">
                      <span className="block h-1.5 w-full rounded-full bg-rta-navy/10" />
                      <span className="block h-1.5 w-4/5 rounded-full bg-rta-navy/10" />
                      <span className="block h-1.5 w-3/5 rounded-full bg-rta-navy/10" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
                      <span className="h-1.5 w-1.5 rounded-full bg-status-amber" />
                      <span className="h-1.5 w-1.5 rounded-full bg-status-red" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerInView>
      </div>
    </section>
  );
}
