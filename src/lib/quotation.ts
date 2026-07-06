import { type EventPackage } from "./catalog";
import { BRAND } from "./brand";

export interface QuoteLine {
  description: { en: string; ar: string };
  qty: number;
  unit: number; // AED, excl VAT
}

export interface Quotation {
  ref: string;
  pkg: EventPackage;
  lines: QuoteLine[];
  subtotal: number;
  vat: number;
  total: number;
}

const EXTRA_CUP_RATE = 12; // AED per extra printed cup beyond the package allowance

/** Build a B2B quotation (VAT-exclusive line items + 5% VAT). */
export function buildQuotation(ref: string, pkg: EventPackage, guests: number): Quotation {
  const lines: QuoteLine[] = [
    {
      description: { en: `${pkg.name.en} — event coffee station`, ar: `${pkg.name.ar} — ركن قهوة للفعاليات` },
      qty: 1,
      unit: pkg.price,
    },
  ];

  const extraCups = Math.max(0, guests - pkg.cups);
  if (extraCups > 0) {
    lines.push({
      description: { en: "Additional personalised cups", ar: "أكواب مخصّصة إضافية" },
      qty: extraCups,
      unit: EXTRA_CUP_RATE,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unit, 0);
  const vat = Math.round(subtotal * BRAND.vatRate * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;
  return { ref, pkg, lines, subtotal, vat, total };
}
