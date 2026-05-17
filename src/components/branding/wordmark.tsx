"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

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
  const inner = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <motion.div
        whileHover={{ rotate: 6, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className={cn(
          "relative grid place-items-center rounded-lg bg-brand-navy text-white",
          s.logo,
        )}
        aria-hidden
      >
        <svg viewBox="0 0 32 32" className="h-2/3 w-2/3" fill="none">
          <path
            d="M6 22V10h3l5 8 5-8h3v12h-3v-7l-4 6h-2l-4-6v7H6z"
            fill="currentColor"
          />
        </svg>
        <motion.span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-red"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="flex flex-col leading-tight">
        <span className={cn("display-tight font-semibold text-brand-navy", s.title)}>
          Mutabasir
        </span>
        {showTagline && (
          <span className={cn("font-medium text-slate-500", s.tag)}>
            The Director&apos;s Lens
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return inner;
  return <Link href={href as never}>{inner}</Link>;
}
