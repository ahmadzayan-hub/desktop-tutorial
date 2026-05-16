"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Wordmark } from "@/components/branding/wordmark";
import { LocaleToggle } from "@/components/branding/locale-toggle";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";

export function LandingHeader() {
  const { t } = useLocale();
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark size="md" showTagline />
        <nav className="flex items-center gap-2">
          <LocaleToggle />
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              {t.nav.signIn}
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">{t.nav.signUp}</Button>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
