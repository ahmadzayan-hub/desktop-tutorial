interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      role="img"
      aria-label="Tweenz AI"
      className={className}
    >
      <defs>
        <linearGradient id="tz-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="tz-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="tz-glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="512" height="512" rx="108" fill="url(#tz-bg)" />

      {/* Open book base */}
      <path d="M100 222 Q256 210 256 222 L256 388 Q150 376 100 388 Z"
            fill="#ffffff" opacity="0.18" />
      <path d="M412 222 Q256 210 256 222 L256 388 Q362 376 412 388 Z"
            fill="#ffffff" opacity="0.22" />
      <rect x="250" y="214" width="12" height="180" rx="6" fill="#ffffff" opacity="0.35" />

      {/* Page lines — left */}
      <rect x="124" y="258" width="110" height="8" rx="4" fill="#ffffff" opacity="0.45" />
      <rect x="124" y="282" width="90"  height="8" rx="4" fill="#ffffff" opacity="0.35" />
      <rect x="124" y="306" width="100" height="8" rx="4" fill="#ffffff" opacity="0.35" />
      <rect x="124" y="330" width="80"  height="8" rx="4" fill="#ffffff" opacity="0.28" />

      {/* Page lines — right */}
      <rect x="278" y="258" width="110" height="8" rx="4" fill="#ffffff" opacity="0.45" />
      <rect x="278" y="282" width="90"  height="8" rx="4" fill="#ffffff" opacity="0.35" />
      <rect x="278" y="306" width="100" height="8" rx="4" fill="#ffffff" opacity="0.35" />
      <rect x="278" y="330" width="80"  height="8" rx="4" fill="#ffffff" opacity="0.28" />

      {/* AI spark */}
      <g filter="url(#tz-glow)">
        <path d="M256 88 L270 132 L314 146 L270 160 L256 204 L242 160 L198 146 L242 132 Z"
              fill="url(#tz-spark)" />
      </g>

      {/* Accent dots */}
      <circle cx="320" cy="108" r="8" fill="#fde68a" opacity="0.7" />
      <circle cx="192" cy="108" r="6" fill="#fde68a" opacity="0.5" />
    </svg>
  );
}
