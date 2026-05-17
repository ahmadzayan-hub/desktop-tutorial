"use client";

import {
  Anchor,
  Calendar,
  History,
  Languages,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useLocale } from "@/lib/i18n/locale-provider";
import { FadeInView } from "@/components/motion/fade-in";
import { StaggerInView, StaggerItem } from "@/components/motion/stagger";

const ICONS = {
  anchor: Anchor,
  languages: Languages,
  palette: Palette,
  "shield-check": ShieldCheck,
  history: History,
  calendar: Calendar,
} as const;

export function LandingFeatures() {
  const { t, dir } = useLocale();
  return (
    <section className="py-20 sm:py-24" dir={dir}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <FadeInView>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
              {t.landing.featuresEyebrow}
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="display-tight mt-3 text-balance text-2xl font-bold leading-tight text-brand-navy sm:text-3xl md:text-4xl">
              {t.landing.featuresTitle}
            </h2>
          </FadeInView>
        </div>

        <StaggerInView
          className="mt-12 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3"
          staggerChildren={0.06}
        >
          {t.landing.featureItems.map((feat) => {
            const Icon = ICONS[feat.icon as keyof typeof ICONS] ?? Anchor;
            return (
              <StaggerItem key={feat.title}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-navy/10 text-brand-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="display-tight mt-4 text-base font-semibold text-brand-navy">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feat.body}
                  </p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerInView>
      </div>
    </section>
  );
}
