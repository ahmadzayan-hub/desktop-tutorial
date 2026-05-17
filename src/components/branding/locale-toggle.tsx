"use client";

import { motion } from "motion/react";
import { useLocale } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils/cn";

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, toggleLocale } = useLocale();
  const isAr = locale === "ar";

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
      className={cn(
        "relative inline-flex h-9 w-[78px] items-center rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-navy/40",
        className,
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute top-1 h-7 w-9 rounded-full bg-brand-navy shadow-sm",
          isAr ? "right-1" : "left-1",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "relative z-10 flex-1 text-center transition-colors",
          !isAr ? "text-white" : "text-slate-500",
        )}
      >
        EN
      </span>
      <span
        className={cn(
          "relative z-10 flex-1 text-center font-bold transition-colors",
          isAr ? "text-white" : "text-slate-500",
        )}
        dir="rtl"
        lang="ar"
      >
        ع
      </span>
    </button>
  );
}
