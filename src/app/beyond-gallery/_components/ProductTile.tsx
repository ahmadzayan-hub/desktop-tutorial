// Tiny inline product illustrations for each tile — keeps the page self-contained
// and avoids placeholder image hosts. Each tile renders a soft, premium vignette.

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

export default function ProductTile({ variant }: { variant: Variant }) {
  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden">
      {/* soft background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, #F6F1E1 80%)",
        }}
      />
      <svg
        viewBox="0 0 200 250"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`g-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.goldSoft} />
            <stop offset=".5" stopColor={palette.gold} />
            <stop offset="1" stopColor="#8B6722" />
          </linearGradient>
        </defs>

        {/* a circular plate behind product */}
        <circle cx="100" cy="120" r="78" fill="#FFFFFF" stroke={palette.line} />
        <ellipse cx="100" cy="200" rx="68" ry="6" fill="#000" opacity=".05" />

        {renderArt(variant, palette)}
      </svg>
      <span className="absolute top-3 start-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-[#B68A35] bg-white/85 backdrop-blur px-2 py-1 rounded-full border border-[#E7E2D3]">
        Beyond
      </span>
    </div>
  );
}

function renderArt(v: Variant, p: typeof palette) {
  switch (v) {
    case "arabic-bracelet":
      return (
        <g transform="translate(40 110)">
          <ellipse cx="60" cy="20" rx="60" ry="14" fill="none" stroke={`url(#g-${v})`} strokeWidth="3" />
          {[18, 50, 82].map((x, i) => (
            <g key={i} transform={`translate(${x} 30)`}>
              <circle r="8" fill={`url(#g-${v})`} />
              <text y="3" textAnchor="middle" fontSize="9" fill={p.ivory} fontFamily="Noto Kufi Arabic, serif">
                {["أ", "ب", "ج"][i]}
              </text>
            </g>
          ))}
        </g>
      );
    case "name-bracelet":
      return (
        <g transform="translate(30 120)">
          <ellipse cx="70" cy="14" rx="70" ry="12" fill="none" stroke={`url(#g-${v})`} strokeWidth="3" />
          <rect x="30" y="6" width="80" height="20" rx="6" fill={`url(#g-${v})`} />
          <text x="70" y="20" textAnchor="middle" fontSize="11" fill={p.ivory} fontFamily="Playfair Display, serif">
            NOOR
          </text>
        </g>
      );
    case "hamsa":
      return (
        <g transform="translate(70 70)">
          <path
            d="M30 6 q-7 0 -7 11 v9 q-9 -2 -11 5 q-2 9 9 13 q2 11 13 15 q13 7 24 0 q11 -4 13 -15 q11 -4 9 -13 q-2 -7 -11 -5 v-9 q0 -11 -7 -11 q-7 0 -7 11 v7 q-5 -2 -9 -2 q-4 0 -9 2 v-7 q0 -11 -7 -11Z"
            fill={`url(#g-${v})`}
          />
          <circle cx="34" cy="36" r="5" fill={p.emerald} />
          <circle cx="34" cy="36" r="2" fill={p.ivory} />
        </g>
      );
    case "necklace":
      return (
        <g transform="translate(40 80)">
          <path d="M10 10 C 50 -20 110 -20 150 10" fill="none" stroke={`url(#g-${v})`} strokeWidth="2.4" />
          <g transform="translate(80 30)">
            <path d="M0 -10 L10 0 L0 14 L-10 0Z" fill={`url(#g-${v})`} />
            <circle r="3" fill={p.ivory} />
          </g>
          <circle cx="10" cy="10" r="3" fill={`url(#g-${v})`} />
          <circle cx="150" cy="10" r="3" fill={`url(#g-${v})`} />
        </g>
      );
    case "gift-box":
      return (
        <g transform="translate(50 80)">
          <rect width="100" height="80" rx="6" fill={p.emerald} />
          <rect x="46" width="8" height="80" fill={`url(#g-${v})`} />
          <rect y="36" width="100" height="8" fill={`url(#g-${v})`} />
          <path d="M50 -4 q-14 -14 -22 -2 q-1 14 22 8 q23 6 22 -8 q-8 -12 -22 2Z" fill={`url(#g-${v})`} />
        </g>
      );
    case "drawing-board":
      return (
        <g transform="translate(40 80)">
          <rect width="120" height="90" rx="8" fill={p.grey} stroke={p.line} />
          <rect x="8" y="8" width="104" height="64" rx="4" fill={p.ivory} />
          <path d="M20 56 Q40 32 60 48 T100 36" fill="none" stroke={p.emerald} strokeWidth="2.4" strokeLinecap="round" />
          <rect x="40" y="78" width="40" height="6" rx="3" fill={p.navy} />
        </g>
      );
    case "notebook":
      return (
        <g transform="translate(56 70)">
          <rect width="90" height="115" rx="6" fill={p.navy} />
          <rect x="6" y="10" width="78" height="95" rx="3" fill="none" stroke={p.ivory} strokeOpacity=".4" />
          <text x="14" y="34" fill={p.ivory} fontSize="9" fontFamily="Playfair Display, serif" letterSpacing="2">BEYOND</text>
          <text x="14" y="48" fill={p.gold} fontSize="7" fontFamily="Playfair Display, serif" letterSpacing="3">GALLERY</text>
          <rect x="14" y="60" width="50" height="2" rx="1" fill={p.gold} />
        </g>
      );
    case "pen":
      return (
        <g transform="translate(36 110) rotate(-10)">
          <rect width="130" height="14" rx="7" fill={`url(#g-${v})`} />
          <rect width="22" height="14" rx="7" fill={p.charcoal} />
          <circle cx="130" cy="7" r="4" fill={p.charcoal} />
          <rect x="36" y="3" width="24" height="2" fill="#000" opacity=".15" />
        </g>
      );
    case "tote":
      return (
        <g transform="translate(60 60)">
          <path d="M0 30 L80 30 L74 130 L6 130 Z" fill="#EFE8D2" stroke={p.line} />
          <path d="M16 30 q24 -28 48 0" fill="none" stroke={p.charcoal} strokeWidth="3" />
          <rect x="22" y="64" width="36" height="20" rx="3" fill={p.navy} />
          <text x="40" y="78" textAnchor="middle" fontSize="8" fill={p.gold} fontFamily="Playfair Display, serif">BEYOND</text>
        </g>
      );
    case "mug":
      return (
        <g transform="translate(54 80)">
          <rect width="70" height="80" rx="6" fill={p.ivory} stroke={p.line} />
          <path d="M70 16 q22 6 22 26 t-22 22" fill="none" stroke={p.line} strokeWidth="6" strokeLinecap="round" />
          <rect x="10" y="30" width="50" height="2" fill={p.gold} />
          <text x="35" y="50" textAnchor="middle" fontSize="10" fill={p.navy} fontFamily="Playfair Display, serif">BG</text>
        </g>
      );
    case "vip-box":
      return (
        <g transform="translate(40 80)">
          <rect width="120" height="80" rx="6" fill={p.charcoal} />
          <rect y="4" width="120" height="6" fill={`url(#g-${v})`} />
          <text x="60" y="40" textAnchor="middle" fontSize="11" fill={p.gold} fontFamily="Playfair Display, serif" letterSpacing="3">VIP</text>
          <text x="60" y="56" textAnchor="middle" fontSize="7" fill={p.ivory} fontFamily="Inter, sans-serif" letterSpacing="2">BEYOND GALLERY</text>
        </g>
      );
    case "desk-decor":
      return (
        <g transform="translate(40 90)">
          <rect width="120" height="14" rx="4" fill={p.charcoal} />
          <g transform="translate(20 -10)">
            <rect width="30" height="40" rx="3" fill={`url(#g-${v})`} />
          </g>
          <g transform="translate(60 -28)">
            <rect width="22" height="58" rx="3" fill={p.emerald} />
          </g>
          <g transform="translate(92 -18)">
            <rect width="22" height="48" rx="3" fill={p.navy} />
          </g>
        </g>
      );
  }
}

export type { Variant };
