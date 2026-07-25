/**
 * Central brand + seller-identity + compliance configuration.
 * Single source of truth so legal pages, footer and invoices stay consistent.
 * Values marked TODO should be confirmed against the live trade licence / TRN
 * before going to production (see UAE compliance report).
 */
export const BRAND = {
  name: "Lahza",
  tagline: "Gifting & Event Platform",

  // ---- Seller identity (UAE E-Commerce Law disclosure) -------------------
  legalName: "Beyond Connect General Trading L.L.C",
  licenseAuthority: "Dubai Department of Economy & Tourism (DET)",
  licenseNumber: "TODO-XXXXXX", // confirm & display before launch
  trn: "TODO-15-DIGIT-TRN", // 15-digit VAT TRN
  address: "Dubai, United Arab Emirates",
  vatRate: 0.05, // 5% standard-rated

  // ---- Contact -----------------------------------------------------------
  email: "hello@lahza.ae",
  supportEmail: "care@lahza.ae",
  phone: "+971 4 000 0000",
  whatsapp: "971500000000", // digits only, international format for wa.me
  instagram: "lahzacoffee",

  // ---- Data / privacy ----------------------------------------------------
  photoRetentionDays: 30, // uploaded source images auto-deleted after this
} as const;

/**
 * A seller-identity value counts as "set" only when it holds a real value and
 * not an unset `TODO` placeholder. The storefront must never show customers an
 * unconfigured trade licence or TRN — that is both a trust failure and a UAE
 * e-commerce/VAT disclosure failure. Until the owner fills the real values in
 * BRAND, the disclosure lines omit them instead of printing "TODO-…".
 */
export function sellerValueSet(v: string): boolean {
  return v.length > 0 && !v.startsWith("TODO");
}

/** Licence + TRN disclosure, omitting any value not configured yet. Empty when
 *  neither is set, so callers can skip rendering the line entirely. */
export function registrationLine(licenceLabel: string, trnLabel: string): string {
  const parts: string[] = [];
  if (sellerValueSet(BRAND.licenseNumber)) parts.push(`${licenceLabel}: ${BRAND.licenseNumber}`);
  if (sellerValueSet(BRAND.trn)) parts.push(`${trnLabel}: ${BRAND.trn}`);
  return parts.join(" · ");
}

export const EMIRATES = [
  { id: "dubai", en: "Dubai", ar: "دبي", sameDay: true },
  { id: "abudhabi", en: "Abu Dhabi", ar: "أبوظبي", sameDay: false },
  { id: "sharjah", en: "Sharjah", ar: "الشارقة", sameDay: false },
  { id: "ajman", en: "Ajman", ar: "عجمان", sameDay: false },
  { id: "rak", en: "Ras Al Khaimah", ar: "رأس الخيمة", sameDay: false },
  { id: "fujairah", en: "Fujairah", ar: "الفجيرة", sameDay: false },
  { id: "uaq", en: "Umm Al Quwain", ar: "أم القيوين", sameDay: false },
] as const;

export type EmirateId = (typeof EMIRATES)[number]["id"];
