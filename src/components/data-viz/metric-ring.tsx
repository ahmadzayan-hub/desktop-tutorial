// Zero-dependency SVG donut ring for a 0..1 score, with an optional
// centred label. Uses stroke-dasharray so we don't need any charting
// library. Locale-aware percentage rendering (Eastern-Arabic digits
// when Arabic).

import { formatPercent } from "@/lib/utils/numbers";

interface Props {
  value: number; // 0..1
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  tone?: "gold" | "emerald" | "amber" | "navy";
  locale?: "en" | "ar";
}

const TONE: Record<NonNullable<Props["tone"]>, { arc: string; track: string; text: string }> = {
  gold: { arc: "#D4A017", track: "#F1E9CE", text: "#12175E" },
  emerald: { arc: "#059669", track: "#D1FAE5", text: "#12175E" },
  amber: { arc: "#D97706", track: "#FEF3C7", text: "#12175E" },
  navy: { arc: "#171C8F", track: "#E0E7FF", text: "#12175E" },
};

export function MetricRing({
  value,
  size = 96,
  strokeWidth = 10,
  label,
  sublabel,
  tone = "navy",
  locale = "en",
}: Props) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * clamped;
  const gap = c - dash;
  const cx = size / 2;
  const cy = size / 2;
  const palette = TONE[tone];
  const pct = formatPercent(clamped, locale);

  return (
    <div
      className="inline-flex flex-col items-center gap-1"
      role="img"
      aria-label={label ? `${label}: ${pct}` : pct}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={palette.track}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={palette.arc}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy}
          dominantBaseline="central"
          textAnchor="middle"
          fill={palette.text}
          fontWeight="700"
          fontSize={size * 0.26}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {pct}
        </text>
      </svg>
      {(label || sublabel) && (
        <div className="text-center leading-tight">
          {label && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              {label}
            </p>
          )}
          {sublabel && (
            <p className="text-[10px] text-slate-500">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
