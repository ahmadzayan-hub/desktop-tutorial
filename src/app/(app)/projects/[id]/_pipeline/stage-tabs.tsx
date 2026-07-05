"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type StageId = "upload" | "extract" | "brief" | "publish";

export interface Stage {
  id: StageId;
  label: string;
  done: boolean;
  disabled: boolean;
}

interface Props {
  stages: Stage[];
  active: StageId;
  onSelect: (id: StageId) => void;
}

// Segmented control across the 4 pipeline stages. Sits above the active
// card and doubles as a progress indicator (done stages show a check).
export function StageTabs({ stages, active, onSelect }: Props) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      <ol className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        {stages.map((s, i) => {
          const isActive = s.id === active;
          return (
            <li key={s.id} className="relative">
              <button
                type="button"
                onClick={() => !s.disabled && onSelect(s.id)}
                disabled={s.disabled}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-brand-navy"
                    : s.disabled
                      ? "cursor-not-allowed text-slate-300"
                      : "text-slate-500 hover:text-brand-navy",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="stage-active"
                    className="absolute inset-0 -z-0 rounded-xl bg-brand-navy/10"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                    s.done
                      ? "bg-brand-navy text-white"
                      : isActive
                        ? "bg-brand-navy/15 text-brand-navy"
                        : "bg-slate-100 text-slate-500",
                  )}
                >
                  {s.done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                </span>
                <span className="relative z-10 truncate">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
