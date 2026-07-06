// Beyond Gallery brand identity.
//
// LogoMark — the icon-only monogram: interlocked B + G forming a stylised
// gift-box outline in gold on a paper background, framed by two hair-thin
// gold rings and topped with a small leaf ornament. Works at any size
// from favicon (16 px) to hero (144 px).
//
// Logo — LogoMark + wordmark (BEYOND GALLERY, Fraunces stack). Two sizes
// so the header can shrink cleanly on small screens.

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, { mark: string; title: string; sub: string; gap: string }> = {
  sm: { mark: "w-8 h-8",    title: "text-[15px]",   sub: "text-[9px]",  gap: "gap-2" },
  md: { mark: "w-11 h-11",  title: "text-[19px]",   sub: "text-[10px]", gap: "gap-3" },
  lg: { mark: "w-14 h-14",  title: "text-[24px]",   sub: "text-[11px]", gap: "gap-3" },
  xl: { mark: "w-24 h-24",  title: "text-[36px]",   sub: "text-[13px]", gap: "gap-5" },
};

export function LogoMark({
  className = "",
  invert = false,
  title = "Beyond Gallery monogram",
}: {
  className?: string;
  invert?: boolean;
  title?: string;
}) {
  // The mark is theme-tolerant. On dark backgrounds pass invert to swap the
  // plate from ivory to charcoal so the rings and monogram keep contrast.
  const plate = invert ? "#1F2933" : "#FAF8F1";
  const plateEdge = invert ? "#2B333D" : "#EFE7CB";
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="bg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E2C079" />
          <stop offset=".5" stopColor="#B68A35" />
          <stop offset="1" stopColor="#8B6722" />
        </linearGradient>
        <linearGradient id="bg-plate" x1=".5" y1="0" x2=".5" y2="1">
          <stop offset="0" stopColor={plate} />
          <stop offset="1" stopColor={plateEdge} />
        </linearGradient>
      </defs>

      {/* Plate + double ring */}
      <circle cx="32" cy="32" r="30" fill="url(#bg-plate)" stroke="url(#bg-gold)" strokeWidth="1.4" />
      <circle cx="32" cy="32" r="26.5" fill="none" stroke="url(#bg-gold)" strokeOpacity=".35" strokeWidth=".7" />

      {/* Top ornament: small leaf ornament */}
      <g transform="translate(32 8)">
        <path d="M0 0 q-3 -3 -6 -3 q3 0 3 -3 q0 3 3 3 q-3 0 -3 3z" fill="url(#bg-gold)" opacity=".75" transform="scale(-1 1)" />
        <path d="M0 0 q-3 -3 -6 -3 q3 0 3 -3 q0 3 3 3 q-3 0 -3 3z" fill="url(#bg-gold)" opacity=".75" />
      </g>
      <g transform="translate(32 56)">
        <path d="M0 0 q-3 3 -6 3 q3 0 3 3 q0 -3 3 -3 q-3 0 -3 -3z" fill="url(#bg-gold)" opacity=".55" transform="scale(-1 1)" />
        <path d="M0 0 q-3 3 -6 3 q3 0 3 3 q0 -3 3 -3 q-3 0 -3 -3z" fill="url(#bg-gold)" opacity=".55" />
      </g>

      {/* Interlocked B + G monogram.
          B: two stacked bowls on a vertical spine on the left.
          G: an open circle with a horizontal bar, shifted right,
          overlapping the B's right edge. */}
      <g stroke="url(#bg-gold)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* B — spine */}
        <path d="M20 20 L20 44" />
        {/* B — upper bowl */}
        <path d="M20 20 L28 20 Q34 20 34 25.5 Q34 31 28 31 L20 31" />
        {/* B — lower bowl */}
        <path d="M20 31 L28.5 31 Q35 31 35 37.5 Q35 44 28 44 L20 44" />

        {/* G — arc */}
        <path d="M45 27 Q45 20 39 20 Q31 20 31 32 Q31 44 39 44 Q45 44 45 37 L45 33 L40 33" />
      </g>

      {/* Small gold droplet dot in the middle of the monogram for balance */}
      <circle cx="37.5" cy="32" r="1.4" fill="url(#bg-gold)" opacity=".8" />
    </svg>
  );
}

export default function Logo({
  size = "md",
  lang = "en",
  invert = false,
  showSub = true,
  className = "",
}: {
  size?: Size;
  lang?: "en" | "ar";
  invert?: boolean;
  showSub?: boolean;
  className?: string;
}) {
  const s = sizes[size];
  const titleColor = invert ? "text-beyond-ivory" : "text-beyond-charcoal";
  const subColor = invert ? "text-beyond-ivory/60" : "text-beyond-charcoal/60";
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark className={s.mark} invert={invert} />
      <span className="leading-tight">
        <span className={`block font-display font-semibold tracking-wide ${s.title} ${titleColor} ${lang === "ar" ? "font-arabic-display" : ""}`}>
          {lang === "en" ? (
            <>Beyond <span className="beyond-gold-gradient">Gallery</span></>
          ) : (
            <>بيوند <span className="beyond-gold-gradient">جاليري</span></>
          )}
        </span>
        {showSub && (
          <span className={`block ${s.sub} uppercase tracking-[0.22em] ${subColor} ${lang === "ar" ? "font-arabic tracking-widest normal-case" : ""}`}>
            {lang === "en" ? "by Beyond Jewellery" : "من بيوند جويلري"}
          </span>
        )}
      </span>
    </span>
  );
}
