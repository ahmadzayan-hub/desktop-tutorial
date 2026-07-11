import { BRAND } from "./brand";

/**
 * Build a click-to-WhatsApp link (opens a free customer-initiated window).
 * Prefilled, context-aware messages improve corporate lead quality.
 */
export function waLink(message?: string): string {
  const base = `https://wa.me/${BRAND.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const WA_MESSAGES = {
  corporate: {
    en: "Hello Lahza I'd like to discuss a corporate appreciation campaign / event coffee station.",
    ar: "مرحباً Lahza أرغب في مناقشة حملة تقدير للموظفين / ركن قهوة تفاعلي لمناسبتنا.",
  },
  support: {
    en: "Hello I have a question about a personalised coffee gift order.",
    ar: "مرحباً لدي استفسار بخصوص طلب هدية قهوة مخصّصة.",
  },
} as const;
