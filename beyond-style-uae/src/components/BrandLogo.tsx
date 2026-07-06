/**
 * Beyond Style brand mark — a faceted gem (a jewel for a jewellery brand)
 * rendered inline as SVG so it stays crisp at any size and inherits the gold
 * gradient. Used in the header and footer; the same silhouette ships as the
 * favicon and PWA icon.
 */
export function BrandGem({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Beyond Style"
    >
      <defs>
        <linearGradient id="bsGem" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A6864B" />
          <stop offset="0.45" stopColor="#C9A96E" />
          <stop offset="1" stopColor="#E4CFA1" />
        </linearGradient>
      </defs>
      <path d="M12 8 H20 L26 14 L16 26 L6 14 Z" fill="url(#bsGem)" />
      <path
        d="M6 14 H26 M12 8 L16 14 L20 8 M16 14 V26"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="1.1"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

/** Full lockup: gem + wordmark. `compact` drops the "UAE" sub-label. */
export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <BrandGem size={26} />
      <span className="font-display text-xl leading-none tracking-wide">
        <span className="gold-text">Beyond Style</span>
        {!compact && <span className="ms-1 align-middle text-sm text-cream/70">UAE</span>}
      </span>
    </span>
  );
}
