import { useI18n } from "@/i18n/I18nContext";

/** Logo lockup: coffee-cup glyph + wordmark. Inline SVG → no image request. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-coffee-700 shadow-soft">
        <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
          <path d="M18 26h22v10a11 11 0 0 1-11 11 11 11 0 0 1-11-11V26Z" fill="none" stroke="#C9A563" strokeWidth="3" strokeLinejoin="round" />
          <path d="M40 29h4a5 5 0 0 1 0 10h-4" fill="none" stroke="#C9A563" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 14c-1.5 2 1.5 4 0 6M31 14c-1.5 2 1.5 4 0 6" fill="none" stroke="#B08A45" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-base font-bold tracking-tight text-coffee-900 sm:text-lg">
            {t("common.brandName")}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-600">
            {t("common.brandSub")}
          </span>
        </span>
      )}
    </span>
  );
}
