"use client";

import Link from "next/link";
import { Check, Star } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { FadeInView } from "@/components/motion/fade-in";
import { StaggerInView, StaggerItem } from "@/components/motion/stagger";
import { cn } from "@/lib/utils/cn";

export function LandingPricing() {
  const { t, dir } = useLocale();
  return (
    <section
      id="pricing"
      className="py-20 sm:py-24"
      dir={dir}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <FadeInView>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
              {t.landing.pricingEyebrow}
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="display-tight mt-3 text-balance text-2xl font-bold text-brand-navy sm:text-3xl md:text-4xl">
              {t.landing.pricingTitle}
            </h2>
          </FadeInView>
        </div>

        <StaggerInView
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          staggerChildren={0.1}
        >
          {t.landing.pricingTiers.map((tier) => (
            <StaggerItem key={tier.name}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className={cn(
                  "relative h-full rounded-2xl border bg-white p-6 shadow-sm transition-shadow sm:p-7",
                  tier.highlight
                    ? "border-brand-navy shadow-lg ring-2 ring-brand-navy/10"
                    : "border-slate-200 hover:shadow-md",
                )}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-navy px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    <Star className="h-3 w-3" fill="currentColor" />
                    {dir === "rtl" ? "الأكثر شعبية" : "Most popular"}
                  </span>
                )}
                <h3 className="display-tight text-xl font-bold text-brand-navy">
                  {tier.name}
                </h3>
                <p className="display-tight num mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {tier.priceMonthly}
                </p>
                <p className="mt-1 text-xs text-slate-500">{tier.priceNote}</p>

                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-status-green/10 text-status-green">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  <Link
                    href={tier.name.toLowerCase().includes("enterprise") || tier.name.includes("المؤسّ") ? "#contact" : "/sign-up"}
                  >
                    <Button
                      className="w-full"
                      variant={tier.highlight ? "primary" : "secondary"}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerInView>
      </div>
    </section>
  );
}
