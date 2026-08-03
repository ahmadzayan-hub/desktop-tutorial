// Stacked distribution bar for HIGH / MEDIUM / LOW confidence facts.
// Zero-dependency; uses flexbox with proportional widths.

import { cn } from "@/lib/utils/cn";

interface Counts {
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

interface Props {
  counts: Counts;
  labels?: { HIGH: string; MEDIUM: string; LOW: string };
  compact?: boolean;
}

const CLASS: Record<keyof Counts, string> = {
  HIGH: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-slate-400",
};

const TEXT: Record<keyof Counts, string> = {
  HIGH: "text-emerald-700",
  MEDIUM: "text-amber-700",
  LOW: "text-slate-600",
};

export function ConfidenceBar({ counts, labels, compact = false }: Props) {
  const total = counts.HIGH + counts.MEDIUM + counts.LOW;
  if (total === 0) return null;

  const keys: Array<keyof Counts> = ["HIGH", "MEDIUM", "LOW"];
  const l = labels ?? { HIGH: "High", MEDIUM: "Medium", LOW: "Low" };

  return (
    <div className={cn("w-full", compact ? "space-y-1" : "space-y-2")}>
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="img"
        aria-label={`${counts.HIGH} high, ${counts.MEDIUM} medium, ${counts.LOW} low confidence`}
      >
        {keys.map((k) =>
          counts[k] > 0 ? (
            <span
              key={k}
              className={cn("h-full", CLASS[k])}
              style={{ width: `${(counts[k] / total) * 100}%` }}
              title={`${l[k]}: ${counts[k]}`}
            />
          ) : null,
        )}
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium">
          {keys.map((k) => (
            <span
              key={k}
              className={cn("inline-flex items-center gap-1.5", TEXT[k])}
            >
              <span className={cn("h-2 w-2 rounded-full", CLASS[k])} />
              {l[k]} · {counts[k]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
