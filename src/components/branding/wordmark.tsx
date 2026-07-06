"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ApertureMark } from "./aperture-mark";
import { useLocale } from "@/lib/i18n/locale-provider";

interface WordmarkProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

const sizes = {
  sm: { logo: "h-7 w-7", title: "text-base", tag: "text-[10px]" },
  md: { logo: "h-9 w-9", title: "text-lg", tag: "text-xs" },
  lg: { logo: "h-12 w-12", title: "text-2xl", tag: "text-sm" },
} as const;

export function Wordmark({
  href = "/",
  size = "md",
  showTagline = false,
  className,
}: WordmarkProps) {
  const s = sizes[size];
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const inner = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <motion.div
        whileHover={{ rotate: 12, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg shadow-sm",
          s.logo,
        )}
        aria-hidden
      >
        <ApertureMark />
        <motion.span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-red"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            "display-tight font-semibold tracking-tight text-brand-navy",
            s.title,
          )}
        >
          {isAr ? "مُتَبَصِّر" : "Mutabasir"}
        </span>
        {showTagline && (
          <span className={cn("font-medium text-slate-500", s.tag)}>
            {isAr ? "عدسة المدير" : "The Director’s Lens"}
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return inner;
  return <Link href={href as never}>{inner}</Link>;
}
