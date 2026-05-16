"use client";

import { useLocale } from "@/lib/i18n/locale-provider";
import { FadeInView } from "@/components/motion/fade-in";

export function LandingProblem() {
  const { t, dir } = useLocale();
  return (
    <section className="border-y border-slate-200 bg-white/70 py-20" dir={dir}>
      <div className="mx-auto max-w-4xl px-6 text-center">
        <FadeInView>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rta-red">
            {t.landing.problemEyebrow}
          </p>
        </FadeInView>
        <FadeInView delay={0.1}>
          <h2 className="display-tight mt-3 text-balance text-3xl font-bold leading-tight text-rta-navy sm:text-4xl">
            {t.landing.problemTitle}
          </h2>
        </FadeInView>
        <FadeInView delay={0.2}>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            {t.landing.problemBody}
          </p>
        </FadeInView>
      </div>
    </section>
  );
}
