// Number and percentage formatters that respect Gulf-formal conventions:
// Eastern Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) in Arabic contexts and
// Latin digits in English. Percentage displays add the appropriate
// suffix and non-breaking space.

const AR_LOCALE = "ar-AE-u-nu-arab";
const EN_LOCALE = "en-AE";

type Locale = "en" | "ar";

const numFmtCache = new Map<string, Intl.NumberFormat>();

function fmt(locale: Locale, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = (locale === "ar" ? AR_LOCALE : EN_LOCALE) + JSON.stringify(options ?? {});
  const cached = numFmtCache.get(key);
  if (cached) return cached;
  const inst = new Intl.NumberFormat(
    locale === "ar" ? AR_LOCALE : EN_LOCALE,
    options,
  );
  numFmtCache.set(key, inst);
  return inst;
}

/** Locale-aware integer or decimal formatter. */
export function formatNumber(value: number, locale: Locale): string {
  return fmt(locale).format(value);
}

/**
 * Percentage formatter. Pass a 0..1 fraction. `fractionDigits` defaults
 * to 0 (whole percent) which matches Emirates/Dubai government report
 * conventions.
 */
export function formatPercent(
  fraction: number,
  locale: Locale,
  fractionDigits = 0,
): string {
  const clamped = Math.max(0, Math.min(1, fraction));
  return fmt(locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(clamped);
}

/** "N of M" ratio, e.g. quality-gate score. */
export function formatRatio(n: number, m: number, locale: Locale): string {
  return `${formatNumber(n, locale)}/${formatNumber(m, locale)}`;
}
