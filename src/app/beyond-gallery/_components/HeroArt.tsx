// Inline illustrated "premium product arrangement" — no external images.
// Renders a soft ivory composition with jewellery-inspired pieces, gift box,
// drawing board, corporate item, and elegant packaging.

export default function HeroArt() {
  return (
    <svg
      viewBox="0 0 640 560"
      role="img"
      aria-label="Beyond Gallery curated product arrangement"
      className="w-full h-auto select-none"
    >
      <defs>
        <linearGradient id="bgPlate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F1EAD2" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E2C079" />
          <stop offset=".55" stopColor="#B68A35" />
          <stop offset="1" stopColor="#8B6722" />
        </linearGradient>
        <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2FB6" />
          <stop offset="1" stopColor="#171C8F" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2F8A72" />
          <stop offset="1" stopColor="#1F6F5B" />
        </linearGradient>
        <radialGradient id="boxLight" cx=".3" cy=".25" r=".9">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".5" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* soft round backdrop */}
      <circle cx="320" cy="280" r="260" fill="url(#bgPlate)" />
      <circle cx="320" cy="280" r="260" fill="none" stroke="#E7E2D3" strokeWidth="1.2" />

      {/* soft drop shadows */}
      <ellipse cx="320" cy="500" rx="220" ry="14" fill="#000" opacity=".06" filter="url(#soft)" />

      {/* Drawing board — back left */}
      <g transform="translate(70 150) rotate(-6)">
        <rect width="220" height="160" rx="14" fill="#FFFFFF" stroke="#E7E2D3" />
        <rect x="10" y="10" width="200" height="120" rx="8" fill="#F3F5F8" />
        <path d="M30 110 Q60 70 95 95 T160 80" fill="none" stroke="#1F6F5B" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M40 60 L60 60 M75 60 L120 60" stroke="#B68A35" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="14" y="140" width="80" height="10" rx="5" fill="#171C8F" opacity=".8" />
      </g>

      {/* Gift box — back right with ribbon */}
      <g transform="translate(360 130) rotate(6)">
        <rect width="190" height="150" rx="10" fill="url(#emeraldGrad)" />
        <rect width="190" height="150" rx="10" fill="url(#boxLight)" />
        <rect x="86" width="18" height="150" fill="url(#goldGrad)" />
        <rect y="68" width="190" height="14" fill="url(#goldGrad)" />
        {/* bow */}
        <path d="M95 -6 q-24 -22 -38 -2 q-2 22 38 14 q40 8 38 -14 q-14 -20 -38 2Z" fill="url(#goldGrad)" />
        <circle cx="95" cy="6" r="6" fill="#FAF8F1" stroke="url(#goldGrad)" />
      </g>

      {/* Necklace draped — center top */}
      <g transform="translate(180 60)">
        <path d="M0 30 C 60 -30 220 -30 280 30" fill="none" stroke="url(#goldGrad)" strokeWidth="2.4" />
        <path d="M0 30 C 60 -30 220 -30 280 30" fill="none" stroke="#000" strokeOpacity=".05" strokeWidth="2.4" strokeDasharray="2 2" />
        {/* pendant */}
        <g transform="translate(140 60)">
          <circle r="14" fill="url(#goldGrad)" />
          <circle r="6" fill="#FAF8F1" />
        </g>
        {/* clasp */}
        <circle cx="0" cy="30" r="4" fill="url(#goldGrad)" />
        <circle cx="280" cy="30" r="4" fill="url(#goldGrad)" />
      </g>

      {/* Charm bracelet — center, looped */}
      <g transform="translate(220 320)">
        <ellipse cx="100" cy="40" rx="120" ry="34" fill="none" stroke="url(#goldGrad)" strokeWidth="3" />
        {/* charms */}
        <g transform="translate(40 56)">
          <circle r="9" fill="url(#goldGrad)" />
          <path d="M-3 0 L0 3 L4 -3" stroke="#FAF8F1" strokeWidth="1.6" fill="none" />
        </g>
        <g transform="translate(100 64)">
          <path d="M0 -10 L10 0 L0 10 L-10 0Z" fill="url(#goldGrad)" />
          <circle r="3" fill="#FAF8F1" />
        </g>
        <g transform="translate(160 56)">
          <rect x="-8" y="-8" width="16" height="16" rx="3" fill="url(#emeraldGrad)" />
          <text x="0" y="3" textAnchor="middle" fontSize="9" fill="#FAF8F1" fontFamily="serif">B</text>
        </g>
      </g>

      {/* Small ring */}
      <g transform="translate(96 380)">
        <circle r="28" fill="none" stroke="url(#goldGrad)" strokeWidth="6" />
        <circle cx="0" cy="-28" r="6" fill="url(#goldGrad)" />
        <circle cx="0" cy="-28" r="2.5" fill="#FAF8F1" />
      </g>

      {/* Corporate notebook + pen — lower right */}
      <g transform="translate(380 360) rotate(-4)">
        <rect width="170" height="120" rx="10" fill="url(#navyGrad)" />
        <rect x="10" y="14" width="150" height="92" rx="6" fill="none" stroke="#FAF8F1" strokeOpacity=".35" />
        <text x="20" y="38" fill="#FAF8F1" fontSize="13" fontFamily="serif" letterSpacing="2">BEYOND</text>
        <text x="20" y="58" fill="#B68A35" fontSize="10" fontFamily="serif" letterSpacing="3">GALLERY</text>
        <rect x="20" y="74" width="80" height="3" rx="1.5" fill="#B68A35" opacity=".8" />
        {/* pen */}
        <g transform="translate(86 96) rotate(20)">
          <rect width="120" height="10" rx="5" fill="url(#goldGrad)" />
          <rect x="0" width="20" height="10" rx="5" fill="#1F2933" />
          <circle cx="120" cy="5" r="3" fill="#1F2933" />
        </g>
      </g>

      {/* Hamsa charm — lower left accent */}
      <g transform="translate(40 250)">
        <path d="M30 6 q-6 0 -6 10 v8 q-8 -2 -10 4 q-2 8 8 12 q2 10 12 14 q12 6 22 0 q10 -4 12 -14 q10 -4 8 -12 q-2 -6 -10 -4 v-8 q0 -10 -6 -10 q-6 0 -6 10 v6 q-4 -2 -8 -2 q-4 0 -8 2 v-6 q0 -10 -6 -10Z" fill="url(#goldGrad)" />
        <circle cx="34" cy="32" r="4" fill="#1F6F5B" />
        <circle cx="34" cy="32" r="1.6" fill="#FAF8F1" />
      </g>

      {/* sparkles */}
      <g fill="#B68A35" opacity=".85">
        <path d="M540 100 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
        <path d="M100 110 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
        <path d="M570 460 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
      </g>

      {/* base shelf line */}
      <path d="M70 470 L570 470" stroke="#E7E2D3" />
    </svg>
  );
}
