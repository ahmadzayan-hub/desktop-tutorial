"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/branding/wordmark";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";

export function NotFoundView() {
  const { t, dir } = useLocale();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
      dir={dir}
    >
      <Wordmark href="/" size="lg" showTagline className="justify-center" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="display-tight num mt-10 text-7xl font-bold text-rta-navy sm:text-8xl"
      >
        404
      </motion.p>
      <h1 className="display-tight mt-4 text-2xl font-semibold text-slate-800">
        {t.notFound.title}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {t.notFound.body}
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button size="lg">
            <ArrowLeft className={"h-4 w-4 " + (dir === "rtl" ? "rotate-180" : "")} />
            {t.notFound.back}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
