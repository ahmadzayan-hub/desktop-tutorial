import { useI18n } from "@/i18n/I18nContext";

/** Brand emblem — gold cup whose steam curls into a heart. Inline SVG (no
 *  request), so it stays crisp and re-colours cleanly on dark surfaces. */
export function BrandEmblem({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-coffee-700 to-coffee-900 shadow-soft ring-1 ring-gold-500/30 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-[62%] w-[62%]" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 14.4c-1.2-2.4-4.6-2.3-5.4.3-.5 1.7.3 3.2 5.4 6.5 5.1-3.3 5.9-4.8 5.4-6.5-.8-2.6-4.2-2.7-5.4-.3z" fill="#E7C578" />
        <path d="M19 29h20v8.5A10 10 0 0 1 29 47.5 10 10 0 0 1 19 37.5V29z" fill="none" stroke="#D3A85A" strokeWidth="3" />
        <path d="M39 31.5h3.6a5.4 5.4 0 0 1 0 10.8H41" fill="none" stroke="#D3A85A" strokeWidth="3" />
        <path d="M16.5 51.5h29" stroke="#D3A85A" strokeWidth="3" />
      </svg>
    </span>
  );
}

/** Full logo lockup: emblem + wordmark. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <span className="flex items-center gap-2.5">
      <BrandEmblem />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight text-coffee-900 sm:text-lg">
            {t("common.brandName")}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">
            {t("common.brandSub")}
          </span>
        </span>
      )}
    </span>
  );
}
