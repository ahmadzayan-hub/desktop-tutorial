import { cn } from "@/lib/utils/cn";
import type { RagStatus } from "@/types/database";

interface StatusDotProps {
  status: RagStatus;
  label?: string;
  className?: string;
}

const statusClasses: Record<RagStatus, string> = {
  green: "bg-status-green",
  amber: "bg-status-amber",
  red: "bg-status-red",
  draft: "bg-slate-400",
};

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className={cn("h-2.5 w-2.5 rounded-full", statusClasses[status])}
      />
      {label ? <span className="text-sm text-slate-700">{label}</span> : null}
    </span>
  );
}
