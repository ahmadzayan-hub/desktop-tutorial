import type { Lang } from "@/i18n/I18nContext";
import { BRAND } from "./brand";

/** Locale-aware AED currency formatting (VAT-inclusive prices shown to users). */
export function formatAed(amount: number, lang: Lang = "en"): string {
  const locale = lang === "ar" ? "ar-AE" : "en-AE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatNumber(n: number, lang: Lang = "en"): string {
  return new Intl.NumberFormat(lang === "ar" ? "ar-AE" : "en-AE").format(n);
}

export function formatDate(iso: string, lang: Lang = "en"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-AE" : "en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Break a VAT-inclusive total into net + VAT lines for invoice wording. */
export function vatBreakdown(inclusiveTotal: number) {
  const net = inclusiveTotal / (1 + BRAND.vatRate);
  const vat = inclusiveTotal - net;
  return {
    net: Math.round(net * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(inclusiveTotal * 100) / 100,
  };
}
