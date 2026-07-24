import { EMIRATES } from "@/lib/brand";
import { formatAed } from "@/lib/format";
import type { Lang } from "@/i18n/I18nContext";
import { computeTotals } from "./totals";
import type { OrderDraft } from "./types";

// Builds the WhatsApp order hand-off message. The customize flow has no backend,
// so a completed design must reach the business somehow — this turns the draft
// into a structured, business-ready order summary the customer sends on WhatsApp
// (the app's stated ordering model). The business then confirms and arranges
// payment, keeping a human in control of money and fulfilment.
const L = {
  en: {
    title: "New Lahza order",
    ref: "Ref",
    pkg: "Package",
    gift: "Gift message",
    to: "Recipient",
    deliver: "Deliver to",
    phone: "Phone",
    area: "Area / Emirate",
    date: "Date",
    subtotal: "Subtotal",
    delivery: "Delivery",
    total: "Total (VAT incl.)",
    payCod: "Payment: I'll confirm and pay on delivery.",
    payLink: "Payment: please send me a payment link.",
    doorNote: "Leave at the door if no answer.",
    photo: "I'll attach my chosen photo in this chat.",
    slots: { morning: "Morning", afternoon: "Afternoon", evening: "Evening" },
  },
  ar: {
    title: "طلب جديد من لحظة",
    ref: "المرجع",
    pkg: "الباقة",
    gift: "رسالة الإهداء",
    to: "المُهدى إليه",
    deliver: "التوصيل باسم",
    phone: "الجوال",
    area: "المنطقة / الإمارة",
    date: "التاريخ",
    subtotal: "المجموع الفرعي",
    delivery: "التوصيل",
    total: "الإجمالي (شامل الضريبة)",
    payCod: "الدفع: أؤكّد وأدفع عند الاستلام.",
    payLink: "الدفع: من فضلك أرسل لي رابط دفع.",
    doorNote: "اتركوا الطلب عند الباب لو مافي رد.",
    photo: "سأرفق الصورة المختارة في هذه المحادثة.",
    slots: { morning: "صباحًا", afternoon: "ظهرًا", evening: "مساءً" },
  },
} as const;

export function buildOrderMessage(
  draft: OrderDraft,
  ref: string,
  lang: Lang,
  mode: "now" | "link",
): string {
  const { pkg, subtotal, deliveryFee, total } = computeTotals(draft);
  const x = L[lang];
  const emirate = EMIRATES.find((e) => e.id === draft.emirate);
  const emLabel = emirate ? (lang === "ar" ? emirate.ar : emirate.en) : draft.emirate;
  const pkgName = pkg ? (lang === "ar" ? pkg.name.ar : pkg.name.en) : "-";

  const lines: (string | null)[] = [
    `🎁 ${x.title}`,
    `${x.ref}: ${ref}`,
    "",
    `${x.pkg}: ${pkgName} · ${formatAed(subtotal, lang)}`,
    draft.recipientName ? `${x.to}: ${draft.recipientName}` : null,
    draft.message ? `${x.gift}: "${draft.message}"` : null,
    "",
    `${x.deliver}: ${draft.deliverName}`,
    `${x.phone}: ${draft.deliverPhone}`,
    `${x.area}: ${[draft.area, emLabel].filter(Boolean).join(", ")}`,
    `${x.date}: ${draft.date} · ${x.slots[draft.slot]}`,
    draft.leaveAtDoor ? x.doorNote : null,
    "",
    `${x.subtotal}: ${formatAed(subtotal, lang)}`,
    `${x.delivery}: ${formatAed(deliveryFee, lang)}`,
    `${x.total}: ${formatAed(total, lang)}`,
    "",
    mode === "link" ? x.payLink : x.payCod,
    `📎 ${x.photo}`,
  ];

  return lines.filter((l) => l !== null).join("\n");
}
