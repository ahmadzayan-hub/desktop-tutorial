/**
 * Central brand + seller-identity + compliance configuration.
 * Single source of truth so legal pages, footer and invoices stay consistent.
 * Values marked TODO should be confirmed against the live trade licence / TRN
 * before going to production (see UAE compliance report).
 */
export const BRAND = {
  name: "Beyond Coffee Moments",
  tagline: "Gifting & Event Platform",

  // ---- Seller identity (UAE E-Commerce Law disclosure) -------------------
  legalName: "Beyond Connect General Trading L.L.C",
  licenseAuthority: "Dubai Department of Economy & Tourism (DET)",
  licenseNumber: "TODO-XXXXXX", // confirm & display before launch
  trn: "TODO-15-DIGIT-TRN", // 15-digit VAT TRN
  address: "Dubai, United Arab Emirates",
  vatRate: 0.05, // 5% standard-rated

  // ---- Contact -----------------------------------------------------------
  email: "hello@beyondcoffeemoments.ae",
  supportEmail: "care@beyondcoffeemoments.ae",
  phone: "+971 4 000 0000",
  whatsapp: "971500000000", // digits only, international format for wa.me
  instagram: "beyondcoffeemoments",

  // ---- Data / privacy ----------------------------------------------------
  photoRetentionDays: 30, // uploaded source images auto-deleted after this
} as const;

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
