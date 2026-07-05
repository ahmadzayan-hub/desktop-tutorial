// Editorial product tile artwork. Renders a soft, premium vignette on a paper
// background with a layered circular plate, hover sheen, and optional ribbons.
// Kept self-contained (no external image hosts) so the page ships fast and
// works fully offline / behind proxies.

import { useId } from "react";

type Variant =
  | "arabic-bracelet"
  | "name-bracelet"
  | "hamsa"
  | "necklace"
  | "gift-box"
  | "drawing-board"
  | "notebook"
  | "pen"
  | "tote"
  | "mug"
  | "vip-box"
  | "desk-decor";

type Ribbon = "bestseller" | "new" | "limited" | "custom" | null;

const palette = {
  ivory: "#FAF8F1",
  paper: "#F6F1E1",
  gold: "#B68A35",
  goldSoft: "#E2C079",
  emerald: "#1F6F5B",
  navy: "#171C8F",
  charcoal: "#1F2933",
  grey: "#F3F5F8",
  line: "#E7E2D3",
};

const ribbonCopy: Record<
  Exclude<Ribbon, null>,
  { en: string; ar: string; tone: "gold" | "emerald" | "navy" | "charcoal" }
> = {
  bestseller: { en: "Bestseller", ar: "الأكثر مبيعاً", tone: "gold" },
  new: { en: "New in", ar: "جديد", tone: "emerald" },
  limited: { en: "Limited", ar: "محدود", tone: "navy" },
  custom: { en: "Made to order", ar: "تحت الطلب", tone: "charcoal" },
};

export default function ProductTile({
  variant,
  ribbon = null,
  lang = "en",
}: {
  variant: Variant;
  ribbon?: Ribbon;
  lang?: "en" | "ar";
}) {
  // React.useId produces the same stable ID on the server and the client,
  // so hydration never mismatches and gradient IDs never collide across tiles.
  const rid = useId().replace(/[:]/g, "");
  const uid = `${variant}-${rid}`;
  return (
    <div className="beyond-tile relative w-full aspect-[4/5] overflow-hidden">
      {/* Layered paper + soft light background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, #F8F3E4 55%, #EEE6CC 100%)",
        }}
      />
      <div className="absolute inset-0 beyond-grain-soft pointer-events-none" />

      <svg
        viewBox="0 0 200 250"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.goldSoft} />
            <stop offset=".5" stopColor={palette.gold} />
            <stop offset="1" stopColor="#8B6722" />
          </linearGradient>
          <radialGradient id={`plate-${uid}`} cx=".5" cy=".38" r=".7">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset=".55" stopColor="#FFFDF6" />
            <stop offset="1" stopColor="#F1E9CE" />
          </radialGradient>
          <radialGradient id={`glow-${uid}`} cx=".5" cy=".35" r=".65">
            <stop offset="0" stopColor="#FFE9B8" stopOpacity=".55" />
            <stop offset="1" stopColor="#FFE9B8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`satin-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".45" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Halo glow */}
        <circle cx="100" cy="105" r="96" fill={`url(#glow-${uid})`} />

        {/* Plate with double ring for premium feel */}
        <circle
          cx="100"
          cy="118"
          r="82"
          fill={`url(#plate-${uid})`}
          stroke={palette.line}
          strokeWidth="0.8"
        />
        <circle
          cx="100"
          cy="118"
          r="74"
          fill="none"
          stroke={palette.gold}
          strokeOpacity=".18"
          strokeWidth="0.5"
        />

        {/* Soft ground shadow beneath product */}
        <ellipse cx="100" cy="205" rx="72" ry="7" fill="#000" opacity=".08" />
        <ellipse cx="100" cy="207" rx="52" ry="3" fill="#000" opacity=".05" />

        {renderArt(variant, palette, uid)}
      </svg>

      {/* Hover sheen: a diagonal light band that sweeps across the plate */}
      <span aria-hidden className="beyond-tile-sheen pointer-events-none" />

      {/* Brand chip */}
      <span className="absolute top-3 start-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-[#B68A35] bg-white/85 backdrop-blur px-2 py-1 rounded-full border border-[#E7E2D3]">
        Beyond
      </span>

      {/* Optional ribbon (top-end) */}
      {ribbon && (
        <span
          className={`absolute top-3 end-3 text-[10px] font-semibold px-2 py-1 rounded-full border shadow-sm ${
            ribbonCopy[ribbon].tone === "gold"
              ? "bg-beyond-gold text-white border-beyond-gold"
              : ribbonCopy[ribbon].tone === "emerald"
              ? "bg-beyond-emerald text-white border-beyond-emerald"
              : ribbonCopy[ribbon].tone === "navy"
              ? "bg-beyond-navy text-white border-beyond-navy"
              : "bg-beyond-charcoal text-beyond-ivory border-beyond-charcoal"
          } ${lang === "ar" ? "font-arabic" : ""}`}
        >
          {lang === "en" ? ribbonCopy[ribbon].en : ribbonCopy[ribbon].ar}
        </span>
      )}
    </div>
  );
}

function renderArt(v: Variant, p: typeof palette, uid: string) {
  const g = `url(#g-${uid})`;
  const satin = `url(#satin-${uid})`;
  switch (v) {
    case "arabic-bracelet":
      return (
        <g transform="translate(40 108)">
          <ellipse cx="60" cy="20" rx="60" ry="14" fill="none" stroke={g} strokeWidth="3" />
          <ellipse cx="60" cy="20" rx="54" ry="10" fill="none" stroke={g} strokeOpacity=".35" strokeWidth="1.2" />
          {[18, 50, 82].map((x, i) => (
            <g key={i} transform={`translate(${x} 30)`}>
              <circle r="9" fill={g} />
              <circle r="9" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
              <text y="3" textAnchor="middle" fontSize="9" fill={p.ivory} fontFamily="Noto Kufi Arabic, serif">
                {["أ", "ب", "ج"][i]}
              </text>
            </g>
          ))}
        </g>
      );
    case "name-bracelet":
      return (
        <g transform="translate(30 118)">
          <ellipse cx="70" cy="14" rx="70" ry="12" fill="none" stroke={g} strokeWidth="3" />
          <ellipse cx="70" cy="14" rx="62" ry="8" fill="none" stroke={g} strokeOpacity=".3" strokeWidth="1" />
          <rect x="30" y="4" width="80" height="22" rx="7" fill={g} />
          <rect x="32" y="6" width="76" height="4" rx="2" fill="#fff" opacity=".22" />
          <text x="70" y="21" textAnchor="middle" fontSize="12" fill={p.ivory} fontFamily="Fraunces, Georgia, serif" letterSpacing="2">
            NOOR
          </text>
        </g>
      );
    case "hamsa":
      return (
        <g transform="translate(70 66)">
          <path
            d="M30 6 q-7 0 -7 11 v9 q-9 -2 -11 5 q-2 9 9 13 q2 11 13 15 q13 7 24 0 q11 -4 13 -15 q11 -4 9 -13 q-2 -7 -11 -5 v-9 q0 -11 -7 -11 q-7 0 -7 11 v7 q-5 -2 -9 -2 q-4 0 -9 2 v-7 q0 -11 -7 -11Z"
            fill={g}
          />
          <path
            d="M30 6 q-7 0 -7 11 v9 q-9 -2 -11 5 q-2 9 9 13 q2 11 13 15 q13 7 24 0 q11 -4 13 -15 q11 -4 9 -13 q-2 -7 -11 -5 v-9 q0 -11 -7 -11 q-7 0 -7 11 v7 q-5 -2 -9 -2 q-4 0 -9 2 v-7 q0 -11 -7 -11Z"
            fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="1"
          />
          <circle cx="34" cy="38" r="6.5" fill={p.emerald} />
          <circle cx="34" cy="38" r="2.5" fill={p.ivory} />
          <circle cx="34" cy="38" r="1" fill={p.charcoal} />
        </g>
      );
    case "necklace":
      return (
        <g transform="translate(40 76)">
          <path d="M10 10 C 50 -20 110 -20 150 10" fill="none" stroke={g} strokeWidth="2.6" />
          <path d="M10 10 C 50 -20 110 -20 150 10" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1" />
          <g transform="translate(80 32)">
            <path d="M0 -12 L12 0 L0 18 L-12 0Z" fill={g} />
            <path d="M0 -12 L12 0 L0 18 L-12 0Z" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".8" />
            <circle r="3.5" fill={p.ivory} />
            <circle r="1.3" fill={p.gold} />
          </g>
          <circle cx="10" cy="10" r="3" fill={g} />
          <circle cx="150" cy="10" r="3" fill={g} />
        </g>
      );
    case "gift-box":
      return (
        <g transform="translate(50 78)">
          <rect width="100" height="80" rx="8" fill={p.emerald} />
          <rect width="100" height="80" rx="8" fill={satin} opacity=".15" />
          <rect x="46" width="8" height="80" fill={g} />
          <rect y="36" width="100" height="8" fill={g} />
          <path d="M50 -4 q-14 -14 -22 -2 q-1 14 22 8 q23 6 22 -8 q-8 -12 -22 2Z" fill={g} />
          <path d="M50 -4 q-14 -14 -22 -2 q-1 14 22 8 q23 6 22 -8 q-8 -12 -22 2Z" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth=".8" />
        </g>
      );
    case "drawing-board":
      return (
        <g transform="translate(40 78)">
          <rect width="120" height="90" rx="8" fill={p.grey} stroke={p.line} />
          <rect x="8" y="8" width="104" height="64" rx="4" fill={p.ivory} />
          <rect x="8" y="8" width="104" height="10" rx="4" fill="#fff" opacity=".6" />
          <path d="M20 56 Q40 30 60 46 T100 34" fill="none" stroke={p.emerald} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M20 60 Q42 50 58 56 T100 50" fill="none" stroke={g} strokeWidth="1.8" strokeLinecap="round" strokeOpacity=".7" />
          <rect x="40" y="78" width="40" height="6" rx="3" fill={p.navy} />
          <circle cx="112" cy="78" r="4" fill={g} />
        </g>
      );
    case "notebook":
      return (
        <g transform="translate(56 68)">
          <rect width="90" height="118" rx="8" fill={p.navy} />
          <rect width="90" height="118" rx="8" fill={satin} opacity=".18" />
          <rect x="6" y="10" width="78" height="98" rx="3" fill="none" stroke={p.ivory} strokeOpacity=".4" />
          <text x="14" y="36" fill={p.ivory} fontSize="10" fontFamily="Fraunces, Georgia, serif" letterSpacing="2">BEYOND</text>
          <text x="14" y="50" fill={p.gold} fontSize="7" fontFamily="Fraunces, Georgia, serif" letterSpacing="3">GALLERY</text>
          <rect x="14" y="62" width="50" height="2" rx="1" fill={p.gold} />
          <rect x="14" y="80" width="34" height="1.4" rx="1" fill={p.ivory} opacity=".3" />
          <rect x="14" y="88" width="42" height="1.4" rx="1" fill={p.ivory} opacity=".3" />
          <rect x="14" y="96" width="28" height="1.4" rx="1" fill={p.ivory} opacity=".3" />
        </g>
      );
    case "pen":
      return (
        <g transform="translate(36 112) rotate(-10)">
          <rect width="130" height="14" rx="7" fill={g} />
          <rect width="130" height="4" rx="2" fill="#fff" opacity=".28" />
          <rect width="22" height="14" rx="7" fill={p.charcoal} />
          <rect x="2" y="2" width="18" height="4" rx="2" fill="#fff" opacity=".18" />
          <circle cx="130" cy="7" r="4" fill={p.charcoal} />
          <rect x="36" y="3" width="24" height="2" fill="#000" opacity=".18" />
          <rect x="66" y="3" width="10" height="2" fill="#000" opacity=".12" />
        </g>
      );
    case "tote":
      return (
        <g transform="translate(60 58)">
          <path d="M0 30 L80 30 L74 130 L6 130 Z" fill="#EFE8D2" stroke={p.line} />
          <path d="M0 30 L80 30 L74 130 L6 130 Z" fill={satin} opacity=".28" />
          <path d="M16 30 q24 -28 48 0" fill="none" stroke={p.charcoal} strokeWidth="3" />
          <rect x="22" y="66" width="36" height="22" rx="4" fill={p.navy} />
          <text x="40" y="80" textAnchor="middle" fontSize="8" fill={p.gold} fontFamily="Fraunces, Georgia, serif" letterSpacing="2">BEYOND</text>
          <text x="40" y="90" textAnchor="middle" fontSize="5.5" fill={p.ivory} fontFamily="Inter, sans-serif" letterSpacing="3">GALLERY</text>
        </g>
      );
    case "mug":
      return (
        <g transform="translate(52 78)">
          <rect width="72" height="82" rx="8" fill={p.ivory} stroke={p.line} />
          <rect width="72" height="16" rx="8" fill="#fff" opacity=".7" />
          <path d="M72 18 q22 6 22 26 t-22 22" fill="none" stroke={p.line} strokeWidth="6" strokeLinecap="round" />
          <rect x="10" y="30" width="52" height="2" fill={p.gold} />
          <text x="36" y="52" textAnchor="middle" fontSize="11" fill={p.navy} fontFamily="Fraunces, Georgia, serif" letterSpacing="2">BG</text>
          <text x="36" y="66" textAnchor="middle" fontSize="5.5" fill={p.gold} fontFamily="Inter, sans-serif" letterSpacing="3">GALLERY</text>
        </g>
      );
    case "vip-box":
      return (
        <g transform="translate(40 78)">
          <rect width="120" height="82" rx="8" fill={p.charcoal} />
          <rect width="120" height="82" rx="8" fill={satin} opacity=".14" />
          <rect y="6" width="120" height="6" fill={g} />
          <rect y="72" width="120" height="2" fill={g} />
          <text x="60" y="42" textAnchor="middle" fontSize="14" fill={p.gold} fontFamily="Fraunces, Georgia, serif" letterSpacing="4">VIP</text>
          <text x="60" y="58" textAnchor="middle" fontSize="7" fill={p.ivory} fontFamily="Inter, sans-serif" letterSpacing="2">BEYOND GALLERY</text>
        </g>
      );
    case "desk-decor":
      return (
        <g transform="translate(40 90)">
          <rect width="120" height="14" rx="4" fill={p.charcoal} />
          <rect y="1" width="120" height="4" rx="2" fill="#fff" opacity=".14" />
          <g transform="translate(20 -10)">
            <rect width="30" height="40" rx="4" fill={g} />
            <rect y="1" width="30" height="4" rx="2" fill="#fff" opacity=".3" />
          </g>
          <g transform="translate(60 -30)">
            <rect width="22" height="60" rx="4" fill={p.emerald} />
            <rect y="1" width="22" height="4" rx="2" fill="#fff" opacity=".28" />
          </g>
          <g transform="translate(92 -18)">
            <rect width="22" height="48" rx="4" fill={p.navy} />
            <rect y="1" width="22" height="4" rx="2" fill="#fff" opacity=".28" />
          </g>
        </g>
      );
  }
}

export type { Variant, Ribbon };
