"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { FadeInView } from "@/components/motion/fade-in";

export function LandingCta() {
  const { t, dir } = useLocale();
  return (
    <section className="px-6 pb-24" dir={dir}>
      <FadeInView>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-navy px-8 py-16 text-center text-white shadow-xl">
          <motion.div
            aria-hidden
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-red/20 blur-3xl"
            animate={{ x: [0, 12, 0], y: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl"
            animate={{ x: [0, -10, 0], y: [0, -6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative">
            <h2 className="display-tight text-balance text-3xl font-bold leading-tight sm:text-4xl">
              {t.landing.ctaFinal}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
              {t.landing.ctaFinalBody}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-white text-brand-navy hover:bg-slate-100 focus-visible:ring-white"
                >
                  {t.landing.ctaPrimary}
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  size="lg"
                  variant="ghost"
                  className="border border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  {t.nav.signIn}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </FadeInView>
    </section>
  );
}
