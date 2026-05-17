"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";
import { FadeInView } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils/cn";

export function LandingFaq() {
  const { t, dir } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="border-y border-slate-200 bg-white py-20 sm:py-24"
      dir={dir}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <FadeInView>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
              {t.landing.faqEyebrow}
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="display-tight mt-3 text-balance text-2xl font-bold text-brand-navy sm:text-3xl md:text-4xl">
              {t.landing.faqTitle}
            </h2>
          </FadeInView>
        </div>

        <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/50">
          {t.landing.faqItems.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-white/60 sm:px-6 sm:py-5"
                >
                  <span className="display-tight text-sm font-semibold text-brand-navy sm:text-base">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-navy/10 text-brand-navy",
                    )}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 sm:px-6 sm:pb-6">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
