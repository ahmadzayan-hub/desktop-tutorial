"use client";

import type { CSSProperties } from "react";

type Variant = "horizontal" | "icon" | "wordmark" | "favicon";

type Props = {
  variant?: Variant;
  height?: number;
  className?: string;
  style?: CSSProperties;
  /** Render the "by Zaian" subline beneath the wordmark. */
  byline?: boolean;
};

/**
 * PresentIQ logo system — pure SVG so it sharpens at any DPI, ships with
 * no external assets, and inherits the green/gold accent through CSS
 * variables. The chart-icon mark mirrors the brand sheet: a soft-cornered
 * tile, a rising line + arrow, and four sparkle stars.
 */
export function Logo({
  variant = "horizontal",
  height = 28,
  className = "",
  style,
  byline = false,
}: Props) {
  if (variant === "icon" || variant === "favicon") {
    const size = height;
    return (
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className={className}
        style={style}
        aria-label="PresentIQ"
        role="img"
      >
        <Defs />
        <IconTile />
      </svg>
    );
  }

  if (variant === "wordmark") {
    const w = (height / 28) * 168;
    return (
      <svg
        viewBox="0 0 168 36"
        width={w}
        height={height}
        className={className}
        style={style}
        aria-label="PresentIQ"
        role="img"
      >
        <Defs />
        <Wordmark />
      </svg>
    );
  }

  // Horizontal — mark + wordmark side-by-side, optional "by Zaian" byline.
  const w = (height / 28) * (byline ? 226 : 220);
  return (
    <svg
      viewBox={byline ? "0 0 226 44" : "0 0 220 36"}
      width={w}
      height={byline ? (height / 36) * 44 : height}
      className={className}
      style={style}
      aria-label="PresentIQ"
      role="img"
    >
      <Defs />
      <g transform="translate(0,0)">
        <IconTile />
      </g>
      <g transform="translate(56,3)">
        <Wordmark />
      </g>
      {byline && (
        <text
          x={56 + 168}
          y={42}
          textAnchor="end"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="9"
          fontWeight="600"
          letterSpacing="0.18em"
          fill="var(--pq-byline, #C9D0C1)"
        >
          BY ZAIAN
        </text>
      )}
    </svg>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function Defs() {
  return (
    <defs>
      <linearGradient id="pq-tile-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#0F1F12" />
        <stop offset="55%"  stopColor="#162A18" />
        <stop offset="100%" stopColor="#0B1A0E" />
      </linearGradient>
      <linearGradient id="pq-line-stroke" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%"   stopColor="#7BB94A" />
        <stop offset="55%"  stopColor="#9FCD63" />
        <stop offset="100%" stopColor="#D4F08C" />
      </linearGradient>
      <linearGradient id="pq-arrow-stroke" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stopColor="#F4B63E" />
        <stop offset="100%" stopColor="#D5A84A" />
      </linearGradient>
      <linearGradient id="pq-word-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#F4F7EF" />
        <stop offset="100%" stopColor="#D6E8C0" />
      </linearGradient>
      <linearGradient id="pq-word-iq" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#9FCD63" />
        <stop offset="100%" stopColor="#D4F08C" />
      </linearGradient>
      <radialGradient id="pq-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="rgba(159,205,99,0.55)" />
        <stop offset="60%"  stopColor="rgba(159,205,99,0.10)" />
        <stop offset="100%" stopColor="rgba(159,205,99,0)" />
      </radialGradient>
      <filter id="pq-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function IconTile() {
  return (
    <g>
      {/* Outer green halo */}
      <rect x="2" y="2" width="44" height="44" rx="11" fill="url(#pq-glow)" opacity="0.9" />
      {/* Tile */}
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="9"
        fill="url(#pq-tile-fill)"
        stroke="#9FCD63"
        strokeOpacity="0.55"
        strokeWidth="0.9"
      />
      {/* Inner highlight */}
      <rect x="4.6" y="4.6" width="38.8" height="38.8" rx="8.5" fill="none" stroke="rgba(244,247,239,0.06)" />
      {/* Chart axes (subtle) */}
      <line x1="11" y1="34" x2="37" y2="34" stroke="rgba(159,205,99,0.35)" strokeWidth="0.8" />
      <line x1="11" y1="34" x2="11" y2="13" stroke="rgba(159,205,99,0.35)" strokeWidth="0.8" />
      {/* Rising line */}
      <path
        d="M12 30 L18 25 L24 27 L30 19 L36 14"
        fill="none"
        stroke="url(#pq-line-stroke)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pq-soft-glow)"
      />
      {/* Arrow head */}
      <path
        d="M32 14 L36 14 L36 18"
        fill="none"
        stroke="url(#pq-arrow-stroke)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkles */}
      <Sparkle cx={14} cy={14} r={1.6} />
      <Sparkle cx={38} cy={28} r={1.2} />
      <Sparkle cx={28} cy={11} r={1} />
    </g>
  );
}

function Sparkle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const a = r * 2.4;
  return (
    <g fill="#D4F08C" opacity="0.9">
      <circle cx={cx} cy={cy} r={r * 0.55} />
      <path
        d={`M${cx - a},${cy} L${cx + a},${cy} M${cx},${cy - a} L${cx},${cy + a}`}
        stroke="#D4F08C"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </g>
  );
}

function Wordmark() {
  return (
    <g>
      <text
        x="0"
        y="26"
        fontFamily="Inter, 'Segoe UI', system-ui, sans-serif"
        fontWeight="800"
        fontSize="28"
        letterSpacing="-0.02em"
        fill="url(#pq-word-fill)"
      >
        Present
      </text>
      <text
        x="106"
        y="26"
        fontFamily="Inter, 'Segoe UI', system-ui, sans-serif"
        fontWeight="800"
        fontSize="28"
        letterSpacing="-0.02em"
        fill="url(#pq-word-iq)"
      >
        IQ
      </text>
    </g>
  );
}
