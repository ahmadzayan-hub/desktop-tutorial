import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

// Bilingual dictionary. Arabic uses MSA-friendly phrasing with feminine-form
// verbs (shopping audience), Arabic punctuation (، ـ), and no inline English
// words inside Arabic sentences.
const DICT: Dict = {
  "brand.tagline": {
    en: "Elegant fashion accessories and gift-ready pieces in UAE",
    ar: "إكسسوارات وهدايا أنيقة من الإمارات",
  },
  "hero.title": {
    en: "Elegant accessories, made for everyday and gifting",
    ar: "إكسسوارات أنيقة لإطلالتكِ اليومية ولهداياكِ",
  },
  "hero.subtitle": {
    en: "Soft Arabic-inspired designs, quick WhatsApp ordering, delivery across the UAE.",
    ar: "تصاميم بلمسات عربية ناعمة، وطلب سريع عبر واتساب، مع توصيل داخل الإمارات.",
  },
  "hero.cta.shop": { en: "Shop now", ar: "تسوّقي الآن" },
  "hero.cta.whatsapp": { en: "Order on WhatsApp", ar: "اطلبي عبر واتساب" },

  "nav.shop": { en: "Shop", ar: "المتجر" },
  "nav.cart": { en: "Cart", ar: "السلة" },
  "nav.about": { en: "About", ar: "من نحن" },
  "nav.contact": { en: "Contact", ar: "تواصلي معنا" },

  "cart.empty": { en: "Your cart is empty", ar: "سلة المشتريات فارغة" },
  "cart.subtotal": { en: "Subtotal", ar: "المجموع الفرعي" },
  "cart.checkout": { en: "Checkout", ar: "إتمام الطلب" },
  "cart.addToCart": { en: "Add to cart", ar: "أضيفي إلى السلة" },
  "cart.askWhatsApp": { en: "Ask on WhatsApp", ar: "استفسري عبر واتساب" },
  "cart.pairOffer": {
    en: "2 bracelets for AED 129",
    ar: "قطعتان بـ ١٢٩ درهماً",
  },

  "ship.unlock": {
    en: "Add {amount} to unlock free delivery in Dubai",
    ar: "أضيفي ما قيمته {amount} للحصول على توصيل مجاني داخل دبي",
  },
  "ship.unlocked": {
    en: "Free delivery in Dubai unlocked",
    ar: "حصلتِ على توصيل مجاني داخل دبي",
  },
  "ship.note": {
    en: "Free delivery in Dubai for orders above AED 200. Outside Dubai: shipping calculated by area.",
    ar: "التوصيل مجاني داخل دبي للطلبات التي تتجاوز ٢٠٠ درهم، أما خارج دبي فيُحتسب التوصيل حسب المنطقة.",
  },

  "badge.new": { en: "New arrival", ar: "وصل حديثاً" },
  "badge.gift": { en: "Gift ready", ar: "مناسب للإهداء" },
  "badge.uae": { en: "Available in UAE", ar: "متوفّر في الإمارات" },

  "pdp.care": { en: "Care instructions", ar: "العناية بالقطعة" },
  "pdp.care.text": {
    en: "To keep the piece beautiful, avoid direct contact with water and perfume, and store away from humidity.",
    ar: "للحفاظ على القطعة، يُرجى تجنّب ملامستها للماء والعطور مباشرةً، وحفظها بعيداً عن الرطوبة.",
  },
  "pdp.care.tip1": { en: "Avoid water and perfume", ar: "تجنّبي الماء والعطور" },
  "pdp.care.tip2": {
    en: "Wipe with a soft dry cloth",
    ar: "امسحي بقطعة قماش ناعمة وجافّة",
  },
  "pdp.care.tip3": {
    en: "Store in the pouch provided",
    ar: "احفظي القطعة في الكيس المرفق",
  },
  "pdp.care.footnote": {
    en: "Fashion accessory — stainless steel with gold-tone or silver-tone plating.",
    ar: "إكسسوار أزياء — ستانلس ستيل بطلاء ذهبي اللون أو فضي اللون.",
  },
  "pdp.reviews": { en: "Customer reviews", ar: "آراء العميلات" },
  "pdp.reviewsEmpty": {
    en: "No reviews yet — be the first to review.",
    ar: "لا توجد تقييمات بعد — كوني أول من يكتب تقييماً.",
  },

  "pay.cod": { en: "Cash on Delivery", ar: "الدفع عند الاستلام" },
  "pay.card": { en: "Card", ar: "بطاقة بنكية" },
  "pay.note": {
    en: "Prices include VAT where applicable.",
    ar: "الأسعار تشمل ضريبة القيمة المضافة عند الاقتضاء.",
  },

  "footer.company": {
    en: "Beyond Style UAE is operated by BEYOND CONNECT GENERAL TRADING L.L.C",
    ar: "Beyond Style UAE علامة تجارية تابعة لشركة بيوند كونكت للتجارة العامة ذ.م.م",
  },
  "footer.license": {
    en: "Trade License No. 1498624 — Dubai, UAE",
    ar: "رخصة تجارية رقم ١٤٩٨٦٢٤ ـ دبي، الإمارات العربية المتحدة",
  },

  "page.about.title": { en: "About us", ar: "من نحن" },
  "page.shipping.title": { en: "Shipping policy", ar: "سياسة التوصيل" },
  "page.returns.title": { en: "Returns & exchange", ar: "سياسة الاستبدال والاسترجاع" },
  "page.payment.title": { en: "Payment methods", ar: "طرق الدفع" },
  "page.privacy.title": { en: "Privacy policy", ar: "سياسة الخصوصية" },
  "page.terms.title": { en: "Terms & conditions", ar: "الشروط والأحكام" },
  "page.contact.title": { en: "Contact us", ar: "تواصلي معنا" },

  // Home
  "home.bestSellers": { en: "Best sellers", ar: "الأكثر مبيعاً" },
  "home.giftReady": { en: "Gift ready", ar: "مناسب للإهداء" },
  "home.howToOrder": { en: "How to order", ar: "طريقة الطلب" },
  "home.featuredOffer": { en: "Featured offer", ar: "عرض مميز" },
  "home.featuredCopy": {
    en: "One bracelet AED 79, or two bracelets for AED 129.",
    ar: "قطعة واحدة بـ ٧٩ درهماً، أو قطعتان بـ ١٢٩ درهماً.",
  },
  "home.step1": { en: "Pick the design", ar: "اختاري التصميم من الموقع" },
  "home.step2": { en: "Enter your details and area", ar: "أدخلي بياناتكِ ومنطقة التوصيل" },
  "home.step3": { en: "We confirm by WhatsApp", ar: "نؤكّد الطلب عبر واتساب" },
  "home.trust.delivery": { en: "Delivery across UAE", ar: "توصيل داخل الإمارات" },
  "home.trust.deliveryNote": {
    en: "Free in Dubai over AED 200",
    ar: "مجاني داخل دبي فوق ٢٠٠ درهم",
  },
  "home.trust.payment": { en: "Secure payment", ar: "دفع آمن" },
  "home.trust.paymentNote": {
    en: "Card via Stripe or Cash on Delivery",
    ar: "بطاقة عبر Stripe أو الدفع عند الاستلام",
  },
  "home.trust.gift": { en: "Gift packaging", ar: "تغليف هدايا" },
  "home.trust.giftNote": { en: "Available subject to stock", ar: "متوفّر حسب المخزون" },

  // Cart
  "cart.shipping": { en: "Shipping", ar: "التوصيل" },
  "cart.total": { en: "Total", ar: "الإجمالي" },

  // Checkout
  "checkout.fullName": { en: "Full name", ar: "الاسم الكامل" },
  "checkout.mobileLabel": {
    en: "Mobile (+9715XXXXXXXX)",
    ar: "رقم الجوال (+9715XXXXXXXX)",
  },
  "checkout.emirate": { en: "Emirate", ar: "الإمارة" },
  "checkout.address": { en: "Address", ar: "العنوان" },
  "checkout.paymentMethodLegend": { en: "Payment method", ar: "طريقة الدفع" },
  "checkout.codNote": {
    en: "COD orders require WhatsApp confirmation before dispatch.",
    ar: "طلبات الدفع عند الاستلام تتطلّب تأكيداً عبر واتساب قبل الشحن.",
  },
  "checkout.giftWrap": {
    en: "Gift packaging — available subject to stock",
    ar: "تغليف هدية — متاح حسب المخزون",
  },

  // Common WhatsApp greetings
  "wa.greeting": { en: "Hello", ar: "مرحباً" },
  "wa.askProduct": {
    en: "Hi, I'd like to ask about",
    ar: "مرحباً، أود الاستفسار عن",
  },
  "wa.genericAsk": {
    en: "Hi, I'd like to ask",
    ar: "مرحباً، أود الاستفسار",
  },
  "wa.trackOrder": {
    en: "Hi, I'd like to track order:",
    ar: "مرحباً، أود متابعة الطلب رقم:",
  },
  "wa.askAboutProduct": {
    en: "Hi, I'd like to ask about a product",
    ar: "السلام عليكم، أود الاستفسار عن منتج",
  },

  // Thank-you page
  "ty.title": { en: "Thank you for your order!", ar: "شكراً لطلبكِ!" },
  "ty.body": {
    en: "Your order is received. For Cash on Delivery, we'll confirm by WhatsApp before dispatch.",
    ar: "تم استلام طلبكِ. لطلبات الدفع عند الاستلام سنؤكّد عبر واتساب قبل الشحن.",
  },
  "ty.continue": { en: "Continue shopping", ar: "متابعة التسوق" },
  "ty.trackLabel": { en: "Track on WhatsApp", ar: "تتبّعي الطلب عبر واتساب" },

  // Footer section headings
  "footer.information": { en: "Information", ar: "روابط" },
  "footer.contact": { en: "Contact", ar: "تواصل" },
  "footer.location": {
    en: "Dubai, United Arab Emirates",
    ar: "دبي، الإمارات العربية المتحدة",
  },
};

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  /** BCP-47 tag suitable for Intl.NumberFormat / Intl.DateTimeFormat (e.g. "ar-AE"). */
  fmtLocale: "ar-AE" | "en-AE";
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof DICT, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(
    () => (localStorage.getItem("locale") as Locale) || "ar",
  );

  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem("locale", locale);
  }, [locale, dir]);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir,
      fmtLocale: locale === "ar" ? "ar-AE" : "en-AE",
      setLocale,
      t: (key, vars) => {
        let s = DICT[key]?.[locale] ?? String(key);
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
        return s;
      },
    }),
    [locale, dir],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
