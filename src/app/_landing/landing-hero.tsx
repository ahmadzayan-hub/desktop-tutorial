"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/motion/count-up";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export function LandingHero() {
  const { t, dir } = useLocale();
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24" dir={dir}>
      <div className="grid items-center gap-12 lg:grid-cols-5">
        <Stagger className="lg:col-span-3" staggerChildren={0.1}>
          <StaggerItem>
            <span className="inline-flex items-center gap-2 rounded-full bg-rta-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rta-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-rta-red" />
              {t.landing.eyebrow}
            </span>
          </StaggerItem>
          <StaggerItem>
            <h1 className="display-tight mt-5 text-balance text-4xl font-bold leading-[1.05] text-rta-navy sm:text-5xl lg:text-[56px]">
              {t.landing.heroTitle}
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              {t.landing.heroBody}
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up">
                <Button size="lg">{t.landing.ctaPrimary}</Button>
              </Link>
              <Link href="#how">
                <Button variant="secondary" size="lg">
                  {t.landing.ctaSecondary}
                </Button>
              </Link>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
              <Metric label="seconds" value={90} />
              <Metric label="sections" value={12} />
              <Metric label="gates" value={11} />
            </div>
          </StaggerItem>
        </Stagger>

        <div className="lg:col-span-2">
          <HeroDashboardCard />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2">
      <div className="num display-tight text-2xl font-bold text-rta-navy">
        <CountUp to={value} />
      </div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </div>
    </div>
  );
}

function HeroDashboardCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-rta-navy/5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Sample dashboard
            </p>
            <p className="display-tight text-base font-semibold text-rta-navy">
              SENER · Director Review
            </p>
          </div>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1"
          >
            <motion.span
              className="h-2 w-2 rounded-full bg-status-amber"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[11px] font-semibold text-amber-900">
              Watch
            </span>
          </motion.span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { label: "Value", value: "12.4M" },
            { label: "Invoiced", value: "7.8M" },
            { label: "Remaining", value: "4.6M" },
          ].map((tile, i) => (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2"
            >
              <p className="text-[10px] font-medium text-slate-500">
                {tile.label}
              </p>
              <p className="num display-tight mt-0.5 text-sm font-bold text-rta-navy">
                AED {tile.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5">
          {[
            { color: "bg-status-green", text: "Mobilisation complete" },
            { color: "bg-status-amber", text: "33kV study under review" },
            { color: "bg-status-red", text: "Penalty exposure on M5" },
          ].map((row, i) => (
            <motion.div
              key={row.text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 + i * 0.1 }}
              className="flex items-center gap-2.5 rounded-md bg-slate-50 px-2.5 py-1.5"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${row.color}`} />
              <span className="text-xs text-slate-700">{row.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[10px] font-medium text-slate-500">
            Cited from 16 documents
          </span>
          <span className="text-[10px] font-semibold text-rta-navy">
            mutabasir.ae
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute -bottom-4 -left-4 hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:flex sm:items-center sm:gap-2"
      >
        <span className="grid h-7 w-7 place-items-center rounded-md bg-rta-navy text-[10px] font-bold text-white">
          AR
        </span>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Bilingual
          </p>
          <p
            dir="rtl"
            lang="ar"
            className="text-xs font-semibold text-rta-navy"
          >
            رسالة المدير العام
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
