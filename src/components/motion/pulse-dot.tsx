"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";
import type { RagStatus } from "@/types/database";

interface PulseDotProps {
  status: RagStatus;
  className?: string;
}

const colorClass: Record<RagStatus, string> = {
  green: "bg-status-green",
  amber: "bg-status-amber",
  red: "bg-status-red",
  draft: "bg-slate-400",
};

export function PulseDot({ status, className }: PulseDotProps) {
  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5", className)}>
      <motion.span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full opacity-60",
          colorClass[status],
        )}
        animate={{
          scale: [1, 1.9, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <span
        aria-hidden
        className={cn(
          "relative h-2.5 w-2.5 rounded-full",
          colorClass[status],
        )}
      />
    </span>
  );
}
