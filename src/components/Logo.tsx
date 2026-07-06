import { BRAND } from "@/lib/brand";

/**
 * Wasl mark. Receipt silhouette with a checkmark inside, ties the product name
 * (wasl = receipt / connection) to the governance model (owner approves before
 * anything ships). Pure inline SVG; scales cleanly from 16px to icon size.
 */
export function LogoMark({
  size = 32,
  className,
  title = "Wasl",
}: { size?: number; className?: string; title?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id="wasl-mark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f43f5e" />
          <stop offset="1" stopColor="#be123c" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#wasl-mark-g)" />
      <path
        d="M 128 96 L 384 96 L 384 416 L 350 384 L 316 416 L 282 384 L 248 416 L 214 384 L 180 416 L 146 384 L 128 416 Z"
        fill="#ffffff"
      />
      <rect x="170" y="150" width="172" height="18" rx="9" fill="#f43f5e" opacity=".22" />
      <rect x="170" y="188" width="120" height="14" rx="7" fill="#f43f5e" opacity=".18" />
      <path
        d="M 176 272 L 232 322 L 342 218"
        fill="none"
        stroke="#f43f5e"
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Wordmark. English name with a subtle rose accent on the second letter
 * ("wa[s]l"), and the Arabic name set beneath so the identity reads in both
 * directions the console operates in.
 */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={compact ? 26 : 32} />
      <div className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-tight">
          {BRAND.name.charAt(0)}
          <span className="text-[color:rgb(var(--brand))]">{BRAND.name.charAt(1)}</span>
          {BRAND.name.slice(2)}
        </span>
        {!compact && (
          <span dir="rtl" className="rtl text-[10px] text-[color:rgb(var(--ink-3))]">
            {BRAND.nameAr}
          </span>
        )}
      </div>
    </div>
  );
}
