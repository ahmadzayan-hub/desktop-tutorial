export type ClassValue = string | number | null | false | undefined;

/** Tiny className combiner (no external deps). */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

/** Format a number as AED currency. */
export function formatAED(amount: number, locale = "en-AE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amount);
}
