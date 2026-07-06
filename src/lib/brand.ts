// Brand constants · single source of truth for the product name, taglines,
// and the small pieces the shell chrome, metadata, manifest and JSON-LD share.

export const BRAND = {
  name: "Wasl",
  nameAr: "وصل",
  fullName: "Wasl Commerce Console",
  fullNameAr: "وصل. لوحة إدارة التجارة",
  tagline: "Order clarity for social commerce.",
  taglineAr: "وضوح الطلب من أول رسالة حتى استلام العميل.",
  description:
    "Wasl is the calm operating console for social sellers in the Gulf. Every customer reply is drafted by AI, verified by the owner, and shipped only after payment, VAT and delivery checks pass.",
  descriptionAr:
    "وصل هو لوحة العمليات الهادئة للتجّار على السوشيال ميديا في الخليج. الذكاء الاصطناعي يكتب الرد؛ صاحب المتجر يوافق؛ ولا يخرج الشحن حتى تكتمل شروط الدفع والضريبة والتوصيل.",
  domain: "wasl.app",
  keywords: [
    "Wasl", "وصل", "social commerce console",
    "UAE order management", "AI drafted replies",
    "owner approval workflow", "WhatsApp sales",
    "Instagram DM commerce", "AED payments",
  ],
  themeColor: "#f43f5e",
  brandColor: "#f43f5e",
  bgColor: "#fafafb",
} as const;

// Public site URL. Falls back to the production domain so metadata and
// sitemap don't emit relative paths in dev logs.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  `https://${BRAND.domain}`;
