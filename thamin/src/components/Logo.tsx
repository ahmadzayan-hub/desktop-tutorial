// Thamin brand mark: a faceted gem drawn in a single gold stroke,
// with a balance beam across the crown to signal fair pricing.
export function LogoMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="#000000" />
      {/* balance beam */}
      <path d="M14 20h36" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="14" cy="20" r="2.4" fill="#C5A059" />
      <circle cx="50" cy="20" r="2.4" fill="#C5A059" />
      {/* faceted gem */}
      <path
        d="M22 26h20l6 8-16 20L16 34l6-8z"
        stroke="#C5A059"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M16 34h32M22 26l10 8 10-8M32 34v20" stroke="#C5A059" strokeWidth="1.4" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

export function LogoLockup({ ar, compact = false }: { ar: boolean; compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={compact ? 34 : 44} />
      <span className="leading-tight">
        <span className={`block font-bold text-gold ${compact ? 'text-sm' : 'text-lg'}`}>
          {ar ? 'ثمين' : 'Thamin'}
        </span>
        <span className={`block text-white/70 ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {ar ? 'التسعير الذكي | بيوند ستايل الإمارات' : 'Smart Pricing | Beyond Style UAE'}
        </span>
      </span>
    </span>
  );
}
