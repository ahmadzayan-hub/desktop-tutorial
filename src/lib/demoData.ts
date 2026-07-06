// Deterministic demo data for the operations console. Swap for Supabase/API.
type L = { en: string; ar: string };

export type PaymentStatus = "paid" | "awaiting" | "link_sent" | "cod";
export type ProductionStatus = "queued" | "printing" | "packing" | "ready";
export type DeliveryStatus = "scheduled" | "out" | "delivered";
export type ApprovalStatus = "pending" | "approved";

export interface DemoOrder {
  ref: string;
  customer: string;
  item: L;
  total: number;
  emirate: L;
  payment: PaymentStatus;
  production: ProductionStatus;
  delivery: DeliveryStatus;
  approval: ApprovalStatus;
  ageHours: number;
}

export const DEMO_ORDERS: DemoOrder[] = [
  { ref: "BCM-2026-1042", customer: "Aisha Al Marri", item: { en: "The Keepsake", ar: "التذكار" }, total: 149, emirate: { en: "Dubai", ar: "دبي" }, payment: "paid", production: "packing", delivery: "scheduled", approval: "approved", ageHours: 2 },
  { ref: "BCM-2026-1041", customer: "Omar Haddad", item: { en: "The Signature", ar: "التوقيع" }, total: 229, emirate: { en: "Abu Dhabi", ar: "أبوظبي" }, payment: "paid", production: "printing", delivery: "scheduled", approval: "pending", ageHours: 5 },
  { ref: "BCM-2026-1040", customer: "Latifa S.", item: { en: "The Moment", ar: "اللحظة" }, total: 89, emirate: { en: "Sharjah", ar: "الشارقة" }, payment: "link_sent", production: "queued", delivery: "scheduled", approval: "pending", ageHours: 7 },
  { ref: "BCM-2026-1039", customer: "James P.", item: { en: "The Keepsake", ar: "التذكار" }, total: 149, emirate: { en: "Dubai", ar: "دبي" }, payment: "paid", production: "ready", delivery: "out", approval: "approved", ageHours: 22 },
  { ref: "BCM-2026-1038", customer: "Mariam K.", item: { en: "The Signature", ar: "التوقيع" }, total: 229, emirate: { en: "Ajman", ar: "عجمان" }, payment: "cod", production: "packing", delivery: "scheduled", approval: "approved", ageHours: 26 },
  { ref: "BCM-2026-1037", customer: "Noura A.", item: { en: "The Moment", ar: "اللحظة" }, total: 89, emirate: { en: "Dubai", ar: "دبي" }, payment: "paid", production: "ready", delivery: "delivered", approval: "approved", ageHours: 30 },
  { ref: "BCM-2026-1036", customer: "Yousef R.", item: { en: "The Keepsake", ar: "التذكار" }, total: 149, emirate: { en: "RAK", ar: "رأس الخيمة" }, payment: "awaiting", production: "queued", delivery: "scheduled", approval: "pending", ageHours: 34 },
  { ref: "BCM-2026-1035", customer: "Hessa M.", item: { en: "The Signature", ar: "التوقيع" }, total: 229, emirate: { en: "Dubai", ar: "دبي" }, payment: "paid", production: "ready", delivery: "delivered", approval: "approved", ageHours: 48 },
];

export interface DemoLead {
  name: string;
  channel: L;
  interest: L;
  temp: "hot" | "warm" | "cold";
  ageHours: number;
}

export const DEMO_LEADS: DemoLead[] = [
  { name: "Sara (Instagram)", channel: { en: "Instagram", ar: "إنستغرام" }, interest: { en: "Anniversary gift box", ar: "علبة هدية ذكرى" }, temp: "hot", ageHours: 1 },
  { name: "Mall of Emirates HR", channel: { en: "WhatsApp", ar: "واتساب" }, interest: { en: "Staff appreciation 120 pax", ar: "تقدير موظفين ١٢٠" }, temp: "hot", ageHours: 3 },
  { name: "Ahmed (Web)", channel: { en: "Website", ar: "الموقع" }, interest: { en: "Wedding coffee station", ar: "ركن قهوة عرس" }, temp: "warm", ageHours: 9 },
  { name: "Reem (TikTok)", channel: { en: "TikTok", ar: "تيك توك" }, interest: { en: "Graduation gift", ar: "هدية تخرّج" }, temp: "warm", ageHours: 14 },
  { name: "Fatima (Referral)", channel: { en: "Referral", ar: "توصية" }, interest: { en: "Newborn keepsake", ar: "تذكار مولود" }, temp: "cold", ageHours: 40 },
];

export interface DemoCorpInquiry {
  company: string;
  event: L;
  guests: number;
  value: number;
  status: L;
  ageHours: number;
}

export const DEMO_CORP: DemoCorpInquiry[] = [
  { company: "Emirates NBD", event: { en: "Staff appreciation", ar: "تقدير موظفين" }, guests: 300, value: 14400, status: { en: "Quote sent", ar: "أُرسل العرض" }, ageHours: 6 },
  { company: "Majid Al Futtaim", event: { en: "Brand activation", ar: "تفعيل علامة" }, guests: 250, value: 7500, status: { en: "Negotiating", ar: "قيد التفاوض" }, ageHours: 20 },
  { company: "PwC Middle East", event: { en: "Conference", ar: "مؤتمر" }, guests: 400, value: 7500, status: { en: "New", ar: "جديد" }, ageHours: 2 },
  { company: "Chalhoub Group", event: { en: "Product launch", ar: "إطلاق منتج" }, guests: 180, value: 4200, status: { en: "Confirmed", ar: "مؤكّد" }, ageHours: 52 },
];

export interface DemoInventory {
  item: L;
  stock: number;
  reorder: number;
}

export const DEMO_INVENTORY: DemoInventory[] = [
  { item: { en: "Printable cups (12oz)", ar: "أكواب قابلة للطباعة" }, stock: 1240, reorder: 500 },
  { item: { en: "Keepsake gift boxes", ar: "علب هدايا تذكارية" }, stock: 86, reorder: 100 },
  { item: { en: "Custom sleeves", ar: "أغلفة مخصّصة" }, stock: 640, reorder: 300 },
  { item: { en: "Edible-print sheets", ar: "أوراق طباعة صالحة للأكل" }, stock: 45, reorder: 60 },
  { item: { en: "Speciality beans (kg)", ar: "بن مختصّ (كغ)" }, stock: 120, reorder: 40 },
];

/** 14-day revenue series (AED, deterministic) for the trend chart. */
export const REVENUE_SERIES: number[] = [
  1180, 940, 1520, 1760, 1330, 2210, 2680, 1490, 1720, 2050, 1980, 2440, 2900, 3120,
];

/** Conversion funnel counts. */
export const FUNNEL = [
  { stage: { en: "Visitors", ar: "الزوّار" }, value: 4200 },
  { stage: { en: "Started design", ar: "بدؤوا التصميم" }, value: 1180 },
  { stage: { en: "Reached checkout", ar: "وصلوا للدفع" }, value: 520 },
  { stage: { en: "Paid orders", ar: "طلبات مدفوعة" }, value: 312 },
];
