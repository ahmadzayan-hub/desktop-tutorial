"use client";

import { useMemo, useState } from "react";
import HeroArt from "./_components/HeroArt";
import ProductTile, { type Variant } from "./_components/ProductTile";
import {
  ArrowRight,
  BoardIcon,
  BoxIcon,
  BriefcaseIcon,
  CartIcon,
  ChevronDown,
  CloseIcon,
  FileTextIcon,
  GiftIcon,
  Grid2x2,
  HeartIcon,
  HomeDecorIcon,
  InstagramIcon,
  MailIcon,
  MenuIcon,
  PinIcon,
  SearchIcon,
  ShieldIcon,
  SparkleIcon,
  StarSpark,
  TagIcon,
  UploadIcon,
  WhatsAppIcon,
} from "./_components/icons";

// ---------- Brand-wide constants ----------

const WA_NUMBER = "971500000000"; // placeholder — replace with real number
const WA_BASE = `https://wa.me/${WA_NUMBER}`;

const buildWALink = (message: string) =>
  `${WA_BASE}?text=${encodeURIComponent(message)}`;

const NAV_LINKS = [
  { en: "Home", ar: "الرئيسية", href: "#home" },
  { en: "Accessories", ar: "الإكسسوارات", href: "#collections" },
  { en: "Gifts", ar: "الهدايا", href: "#collections" },
  { en: "Drawing Boards", ar: "لوحات الرسم", href: "#collections" },
  { en: "Corporate Gifts", ar: "هدايا الشركات", href: "#corporate" },
  { en: "Supply Desk", ar: "قسم التوريد", href: "#supply" },
  { en: "Marketplace", ar: "المتاجر", href: "#marketplace" },
  { en: "Contact", ar: "تواصل", href: "#contact" },
];

// ---------- Main page ----------

export default function BeyondGalleryLanding() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} lang={isRTL ? "ar" : "en"} className={isRTL ? "font-arabic" : "font-bg-body"}>
      <AnnouncementBar lang={lang} />
      <Header lang={lang} setLang={setLang} />

      <main id="home">
        <Hero lang={lang} />
        <TrustStrip lang={lang} />
        <Collections lang={lang} />
        <FeaturedProducts lang={lang} />
        <GiftFinder lang={lang} />
        <ShopWithConfidence lang={lang} />
        <Marketplace lang={lang} />
        <CorporateOrders lang={lang} />
        <SupplyDesk lang={lang} />
        <AboutBrand lang={lang} />
        <CatalogueCapture lang={lang} />
        <FAQ lang={lang} />
        <Contact lang={lang} />
      </main>

      <Footer lang={lang} />
      <MobileStickyBar lang={lang} />
    </div>
  );
}

// ====================================================================================
// 1. Announcement Bar
// ====================================================================================

function AnnouncementBar({ lang }: { lang: "en" | "ar" }) {
  return (
    <div className="bg-beyond-navy text-beyond-ivory">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-[12px] sm:text-[13px]">
        <SparkleIcon className="w-3.5 h-3.5 text-beyond-gold shrink-0" />
        <span className="text-center">
          {lang === "en"
            ? "New arrivals in accessories, gifts, drawing boards, corporate gifts and selected UAE supply items."
            : "وصلنا جديد الإكسسوارات والهدايا ولوحات الرسم وهدايا الشركات ومستلزمات التوريد المختارة في الإمارات."}
        </span>
        <SparkleIcon className="w-3.5 h-3.5 text-beyond-gold shrink-0" />
      </div>
    </div>
  );
}

// ====================================================================================
// 2. Header
// ====================================================================================

function Header({
  lang,
  setLang,
}: {
  lang: "en" | "ar";
  setLang: (l: "en" | "ar") => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-beyond-ivory/95 backdrop-blur border-b border-beyond-line">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-beyond-navy flex items-center justify-center beyond-card-shadow">
              <span className="font-display font-bold text-beyond-gold text-lg sm:text-xl">B</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-[18px] sm:text-[20px] font-semibold tracking-wide text-beyond-charcoal">
                Beyond <span className="beyond-gold-gradient">Gallery</span>
              </div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-beyond-charcoal/60">
                by Beyond Jewellery
              </div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <a
                key={l.en}
                href={l.href}
                className="text-[14px] text-beyond-charcoal/80 hover:text-beyond-gold transition-colors"
              >
                {lang === "en" ? l.en : l.ar}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Lang toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-full border border-beyond-line text-[12px] font-semibold tracking-wider uppercase text-beyond-charcoal hover:border-beyond-gold hover:text-beyond-gold transition-colors"
              aria-label="Toggle language"
            >
              {lang === "en" ? "العربية" : "English"}
            </button>

            <a
              href={buildWALink(
                "Hello Beyond Gallery, I would like to order on WhatsApp."
              )}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-beyond-emerald text-white text-[13px] font-semibold hover:opacity-95 transition-opacity beyond-focus"
            >
              <WhatsAppIcon className="w-4 h-4" />
              {lang === "en" ? "Order on WhatsApp" : "اطلب عبر واتساب"}
            </a>

            <a
              href="#corporate"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-beyond-charcoal text-beyond-ivory text-[13px] font-semibold hover:bg-beyond-navy transition-colors beyond-focus"
            >
              <BriefcaseIcon className="w-4 h-4 text-beyond-gold" />
              {lang === "en" ? "Corporate Quote" : "عرض سعر"}
            </a>

            <button
              className="lg:hidden p-2 rounded-full border border-beyond-line text-beyond-charcoal"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 end-0 h-full w-[86%] max-w-sm bg-beyond-ivory border-s border-beyond-line p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="font-display text-xl">
                Beyond <span className="beyond-gold-gradient">Gallery</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full border border-beyond-line"
                aria-label="Close menu"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.en}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-3 border-b border-beyond-line text-[15px] text-beyond-charcoal hover:text-beyond-gold"
                >
                  {lang === "en" ? l.en : l.ar}
                </a>
              ))}
            </nav>

            <div className="mt-6 space-y-3">
              <a
                href={buildWALink(
                  "Hello Beyond Gallery, I would like to order on WhatsApp."
                )}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-beyond-emerald text-white font-semibold"
              >
                <WhatsAppIcon className="w-4 h-4" />
                {lang === "en" ? "Order on WhatsApp" : "اطلب عبر واتساب"}
              </a>
              <a
                href="#corporate"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-beyond-charcoal text-beyond-ivory font-semibold"
              >
                <BriefcaseIcon className="w-4 h-4 text-beyond-gold" />
                {lang === "en" ? "Corporate Quote" : "عرض سعر للشركات"}
              </a>
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="w-full py-3 rounded-full border border-beyond-line text-beyond-charcoal text-sm font-semibold"
              >
                {lang === "en" ? "العربية" : "English"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}

// ====================================================================================
// 3. Hero
// ====================================================================================

function Hero({ lang }: { lang: "en" | "ar" }) {
  return (
    <section className="beyond-paper relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="beyond-divider mb-6">
            {lang === "en" ? "Curated in Dubai" : "اختيار من دبي"}
          </div>

          <h1 className="font-display text-[34px] leading-[1.1] sm:text-[44px] lg:text-[56px] font-semibold text-beyond-charcoal">
            {lang === "en" ? (
              <>
                Curated Accessories,
                <br />
                <span className="beyond-gold-gradient">Gifts and Lifestyle</span>
                <br />
                Products from Dubai
              </>
            ) : (
              <>
                إكسسوارات وهدايا
                <br />
                <span className="beyond-gold-gradient">ومنتجات أسلوب حياة</span>
                <br />
                مختارة من دبي
              </>
            )}
          </h1>

          <p className="mt-3 font-arabic text-beyond-emerald text-[18px] sm:text-[20px]">
            تفاصيل صغيرة تصنع فرقاً جميلاً
          </p>

          <p className="mt-5 text-[15px] sm:text-[16px] leading-relaxed text-beyond-charcoal/75 max-w-xl">
            {lang === "en"
              ? "Shop jewellery inspired accessories, personalised gifts, creative drawing boards, decorative items, corporate gifts and selected lifestyle products curated for UAE customers."
              : "تسوقي الإكسسوارات المستوحاة من المجوهرات، والهدايا المخصصة، ولوحات الرسم الإبداعية، والمنتجات الزخرفية، وهدايا الشركات، ومنتجات أسلوب حياة مختارة لعملاء الإمارات."}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a
              href="#collections"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-navy text-beyond-ivory font-semibold text-[14px] hover:opacity-95 beyond-focus"
            >
              <CartIcon className="w-4 h-4 text-beyond-gold" />
              {lang === "en" ? "Shop Lifestyle Collection" : "تسوقي المجموعة"}
            </a>
            <a
              href={buildWALink(
                "Hello Beyond Gallery, I would like to order on WhatsApp."
              )}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-emerald text-white font-semibold text-[14px] hover:opacity-95 beyond-focus"
            >
              <WhatsAppIcon className="w-4 h-4" />
              {lang === "en" ? "Order on WhatsApp" : "اطلب عبر واتساب"}
            </a>
            <a
              href="#corporate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-beyond-gold text-beyond-gold font-semibold text-[14px] hover:bg-beyond-gold hover:text-white beyond-focus transition-colors"
            >
              <BriefcaseIcon className="w-4 h-4" />
              {lang === "en" ? "Request Corporate Quote" : "اطلب عرض سعر"}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-beyond-charcoal/70">
            {(lang === "en"
              ? [
                  "Dubai based business",
                  "UAE delivery",
                  "WhatsApp support",
                  "Retail and bulk orders",
                  "AED pricing",
                ]
              : [
                  "علامة من دبي",
                  "توصيل داخل الإمارات",
                  "دعم عبر واتساب",
                  "تجزئة وجملة",
                  "الأسعار بالدرهم",
                ]
            ).map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-beyond-gold" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative">
            <div className="absolute -inset-6 bg-white/40 rounded-[40px] blur-2xl" />
            <div className="relative bg-white/60 backdrop-blur rounded-[28px] p-4 sm:p-6 beyond-card-shadow border border-white/70">
              <HeroArt />
            </div>
            <div className="absolute -bottom-4 -end-2 bg-white rounded-2xl px-3 py-2 beyond-card-shadow border border-beyond-line flex items-center gap-2 text-[12px]">
              <PinIcon className="w-4 h-4 text-beyond-emerald" />
              <span className="font-semibold text-beyond-charcoal">Dubai, UAE</span>
            </div>
            <div className="absolute -top-3 -start-2 bg-beyond-charcoal text-beyond-ivory rounded-2xl px-3 py-2 text-[12px] font-semibold flex items-center gap-2 beyond-card-shadow">
              <SparkleIcon className="w-4 h-4 text-beyond-gold" />
              {lang === "en" ? "Curated weekly" : "تشكيلة أسبوعية"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ====================================================================================
// 4. Trust Strip
// ====================================================================================

function TrustStrip({ lang }: { lang: "en" | "ar" }) {
  const items = lang === "en"
    ? [
        {
          icon: PinIcon,
          title: "Dubai Based",
          body: "Operated in Dubai under BEYOND CONNECT GENERAL TRADING L.L.C.",
        },
        {
          icon: WhatsAppIcon,
          title: "WhatsApp Support",
          body: "Ask, confirm and order directly.",
        },
        {
          icon: TagIcon,
          title: "AED Pricing",
          body: "Clear UAE pricing before order confirmation.",
        },
        {
          icon: GiftIcon,
          title: "Gift Ready",
          body: "Selected items available with gift style packaging.",
        },
        {
          icon: BriefcaseIcon,
          title: "Corporate Orders",
          body: "Bulk supply and quotation support for companies and events.",
        },
      ]
    : [
        { icon: PinIcon, title: "علامة من دبي", body: "تُدار في دبي ضمن شركة بيوند كونكت للتجارة العامة ذ.م.م." },
        { icon: WhatsAppIcon, title: "دعم واتساب", body: "استفسر وأكد واطلب مباشرة." },
        { icon: TagIcon, title: "أسعار بالدرهم", body: "أسعار واضحة قبل تأكيد الطلب." },
        { icon: GiftIcon, title: "جاهزة للإهداء", body: "منتجات مختارة مع تغليف هدايا أنيق." },
        { icon: BriefcaseIcon, title: "طلبات الشركات", body: "دعم التوريد والعروض للشركات والفعاليات." },
      ];

  return (
    <section className="bg-beyond-white border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-2xl bg-beyond-ivory border border-beyond-line p-4 sm:p-5 flex flex-col gap-2 hover:border-beyond-gold transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-white border border-beyond-line flex items-center justify-center text-beyond-gold">
              <it.icon className="w-4 h-4" />
            </div>
            <div className="font-display text-[15px] font-semibold text-beyond-charcoal">
              {it.title}
            </div>
            <div className="text-[12.5px] text-beyond-charcoal/70 leading-relaxed">
              {it.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ====================================================================================
// 5. Collections
// ====================================================================================

type Collection = {
  key: string;
  title: string;
  titleAr: string;
  icon: (p: any) => JSX.Element;
  items: { en: string[]; ar: string[] };
  copy: { en: string; ar: string };
  cta: { en: string; ar: string };
  href: string;
  accent: string; // bg colour for icon plate
  preview: Variant;
};

const COLLECTIONS: Collection[] = [
  {
    key: "accessories",
    title: "Jewellery Inspired Accessories",
    titleAr: "إكسسوارات مستوحاة من المجوهرات",
    icon: SparkleIcon,
    items: {
      en: [
        "Charm bracelets",
        "Arabic bracelets",
        "Hamsa bracelets",
        "Evil eye bracelets",
        "Necklace sets",
        "Earrings",
        "Rings",
        "Men accessories",
        "Women accessories",
        "Kids accessories",
        "Fashion jewellery sets",
      ],
      ar: [
        "إسوارات تشارم",
        "إسوارات بأحرف عربية",
        "إسوارات الحمسة",
        "إسوارات العين",
        "أطقم القلائد",
        "أقراط",
        "خواتم",
        "إكسسوارات رجالية",
        "إكسسوارات نسائية",
        "إكسسوارات أطفال",
        "أطقم أزياء",
      ],
    },
    copy: {
      en: "Elegant daily accessories selected for style, gifting and personal expression.",
      ar: "إكسسوارات يومية أنيقة مختارة للأناقة والإهداء والتعبير الشخصي.",
    },
    cta: { en: "View Accessories", ar: "تصفحي الإكسسوارات" },
    href: "#featured",
    accent: "from-[#F4E7C2] to-[#F8EFD4]",
    preview: "arabic-bracelet",
  },
  {
    key: "gifts",
    title: "Personalised Gifts",
    titleAr: "هدايا مخصصة",
    icon: GiftIcon,
    items: {
      en: [
        "Name bracelets",
        "Custom message gifts",
        "Gift box sets",
        "Birthday gifts",
        "Family gifts",
        "Appreciation gifts",
        "Personalised accessories",
      ],
      ar: [
        "إسوارات بالأسماء",
        "هدايا برسالة خاصة",
        "أطقم صناديق هدايا",
        "هدايا أعياد ميلاد",
        "هدايا عائلية",
        "هدايا تقدير",
        "إكسسوارات مخصصة",
      ],
    },
    copy: {
      en: "Thoughtful items that can carry a name, message, memory or occasion.",
      ar: "منتجات راقية تحمل اسماً أو رسالة أو ذكرى أو مناسبة.",
    },
    cta: { en: "Create a Gift", ar: "اصنع هدية" },
    href: "#gift-finder",
    accent: "from-[#E8F1EC] to-[#D6E8DD]",
    preview: "gift-box",
  },
  {
    key: "boards",
    title: "Drawing Boards and Creative Items",
    titleAr: "لوحات الرسم والإبداع",
    icon: BoardIcon,
    items: {
      en: [
        "Kids drawing boards",
        "Student boards",
        "Reusable writing boards",
        "Creative gift boards",
        "Planning boards",
        "Educational gift boards",
      ],
      ar: [
        "لوحات رسم للأطفال",
        "لوحات للطلاب",
        "لوحات كتابة قابلة لإعادة الاستخدام",
        "لوحات هدايا إبداعية",
        "لوحات تخطيط",
        "لوحات هدايا تعليمية",
      ],
    },
    copy: {
      en: "Simple creative tools for children, students, artists and daily planning.",
      ar: "أدوات إبداعية بسيطة للأطفال والطلاب والفنانين والتخطيط اليومي.",
    },
    cta: { en: "Explore Boards", ar: "استكشف اللوحات" },
    href: "#featured",
    accent: "from-[#EAF0FB] to-[#DDE5F7]",
    preview: "drawing-board",
  },
  {
    key: "lifestyle",
    title: "Lifestyle and Decorative Items",
    titleAr: "أسلوب حياة وديكور",
    icon: HomeDecorIcon,
    items: {
      en: [
        "Desk decor",
        "Decorative gift boxes",
        "Small home decor",
        "Elegant daily use items",
        "Room accessories",
        "Premium packaging items",
      ],
      ar: [
        "ديكور مكتب",
        "صناديق هدايا زخرفية",
        "ديكور منزلي صغير",
        "منتجات استخدام يومي أنيقة",
        "إكسسوارات غرفة",
        "تغليف فاخر",
      ],
    },
    copy: {
      en: "Small decorative details that add charm to a desk, home, room or gift setup.",
      ar: "تفاصيل زخرفية صغيرة تضيف لمسة جميلة إلى المكتب أو المنزل أو الغرفة أو الهدية.",
    },
    cta: { en: "View Lifestyle Items", ar: "تصفّح المنتجات" },
    href: "#featured",
    accent: "from-[#F1EFE7] to-[#E9E4D2]",
    preview: "desk-decor",
  },
  {
    key: "corporate",
    title: "Corporate and Promotional Gifts",
    titleAr: "هدايا الشركات والترويجية",
    icon: BriefcaseIcon,
    items: {
      en: [
        "A5 hardcover notebooks",
        "Metal pens",
        "Canvas tote bags",
        "Ceramic mugs",
        "VIP gift boxes",
        "Pins",
        "PVC cards",
        "UAE desk flags",
        "Event giveaways",
        "Corporate gift packs",
      ],
      ar: [
        "دفاتر A5 بغلاف فاخر",
        "أقلام معدنية",
        "حقائب قماشية",
        "أكواب سيراميك",
        "صناديق هدايا VIP",
        "بنزات",
        "بطاقات PVC",
        "أعلام مكتب الإمارات",
        "هدايا فعاليات",
        "أطقم هدايا شركات",
      ],
    },
    copy: {
      en: "Branded and bulk gift solutions for companies, events, staff appreciation and business requests.",
      ar: "حلول هدايا بالجملة للشركات والفعاليات وتقدير الموظفين والطلبات التجارية.",
    },
    cta: { en: "Request Bulk Quote", ar: "اطلب عرض جملة" },
    href: "#corporate",
    accent: "from-[#1B216A] to-[#2A2FB6]",
    preview: "notebook",
  },
  {
    key: "supply",
    title: "Beyond Connect Supply Desk",
    titleAr: "قسم التوريد - بيوند كونكت",
    icon: BoxIcon,
    items: {
      en: [
        "Electrical cables",
        "Office supplies",
        "Facility support materials",
        "Industrial materials",
        "Safety products",
        "Specialised rescue equipment",
        "Institutional supply items",
      ],
      ar: [
        "كابلات كهربائية",
        "مستلزمات مكتبية",
        "مواد دعم المنشآت",
        "مواد صناعية",
        "منتجات السلامة",
        "معدات إنقاذ متخصصة",
        "مستلزمات مؤسسية",
      ],
    },
    copy: {
      en: "Selected sourcing and quotation support for business and institutional requirements.",
      ar: "خدمات توريد مختارة ودعم عروض الأسعار للشركات والمؤسسات.",
    },
    cta: { en: "Submit Supply Request", ar: "أرسل طلب توريد" },
    href: "#supply",
    accent: "from-[#0F4A3D] to-[#1F6F5B]",
    preview: "vip-box",
  },
];

function Collections({ lang }: { lang: "en" | "ar" }) {
  return (
    <section id="collections" className="bg-beyond-ivory">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-10 sm:mb-14">
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Collections" : "التصنيفات"}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal">
            {lang === "en" ? "Shop by Collection" : "تسوّق حسب التصنيف"}
          </h2>
          <p className="font-arabic text-beyond-charcoal/70 mt-2 text-[15px]">
            تسوق حسب التصنيف
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {COLLECTIONS.map((c) => {
            const isDark = c.key === "corporate" || c.key === "supply";
            return (
              <a
                key={c.key}
                href={c.href}
                className={`group rounded-3xl overflow-hidden border ${
                  isDark ? "border-transparent" : "border-beyond-line"
                } beyond-card-shadow hover:beyond-card-shadow-hover transition-shadow bg-white`}
              >
                {/* preview */}
                <div className={`relative h-44 bg-gradient-to-br ${c.accent}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32">
                      <ProductTile variant={c.preview} />
                    </div>
                  </div>
                  <div className="absolute top-3 start-3 flex items-center gap-2">
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/15 text-beyond-gold" : "bg-white text-beyond-gold"
                      }`}
                    >
                      <c.icon className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                <div className={`p-5 sm:p-6 ${isDark ? "bg-beyond-navy text-beyond-ivory" : "bg-white"}`}>
                  <h3
                    className={`font-display text-[18px] sm:text-[20px] font-semibold ${
                      isDark ? "text-beyond-ivory" : "text-beyond-charcoal"
                    }`}
                  >
                    {lang === "en" ? c.title : c.titleAr}
                  </h3>
                  <p
                    className={`mt-2 text-[13.5px] leading-relaxed ${
                      isDark ? "text-beyond-ivory/80" : "text-beyond-charcoal/70"
                    }`}
                  >
                    {lang === "en" ? c.copy.en : c.copy.ar}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {(lang === "en" ? c.items.en : c.items.ar).slice(0, 6).map((it) => (
                      <li
                        key={it}
                        className={`text-[11.5px] px-2.5 py-1 rounded-full border ${
                          isDark
                            ? "border-white/15 text-beyond-ivory/80"
                            : "border-beyond-line text-beyond-charcoal/70 bg-beyond-ivory"
                        }`}
                      >
                        {it}
                      </li>
                    ))}
                    {(lang === "en" ? c.items.en : c.items.ar).length > 6 && (
                      <li
                        className={`text-[11.5px] px-2.5 py-1 rounded-full ${
                          isDark ? "text-beyond-gold" : "text-beyond-gold"
                        }`}
                      >
                        +{(lang === "en" ? c.items.en : c.items.ar).length - 6}{" "}
                        {lang === "en" ? "more" : "أكثر"}
                      </li>
                    )}
                  </ul>

                  <div
                    className={`mt-5 inline-flex items-center gap-2 text-[13px] font-semibold ${
                      isDark ? "text-beyond-gold" : "text-beyond-gold"
                    }`}
                  >
                    {lang === "en" ? c.cta.en : c.cta.ar}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:flip-x" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ====================================================================================
// 6. Featured Products
// ====================================================================================

type Product = {
  name: string;
  nameAr: string;
  benefit: string;
  benefitAr: string;
  price: string;
  variant: Variant;
};

const FEATURED: Product[] = [
  { name: "Arabic Charm Bracelet", nameAr: "إسوارة عربية", benefit: "Personalise with Arabic letters or name", benefitAr: "خصصها بأحرف أو اسم عربي", price: "AED 65", variant: "arabic-bracelet" },
  { name: "Personalised Name Bracelet", nameAr: "إسوارة الاسم", benefit: "Custom name in English or Arabic", benefitAr: "اسم مخصص بالعربية أو الإنجليزية", price: "AED 75", variant: "name-bracelet" },
  { name: "Hamsa and Evil Eye Bracelet", nameAr: "إسوارة الحمسة والعين", benefit: "Symbolic everyday wear", benefitAr: "رمزية للارتداء اليومي", price: "AED 55", variant: "hamsa" },
  { name: "Premium Necklace Set", nameAr: "طقم قلائد فاخر", benefit: "Elegant pendant + chain set", benefitAr: "طقم قلادة بسلسلة أنيقة", price: "AED 145", variant: "necklace" },
  { name: "Elegant Gift Box Set", nameAr: "طقم صندوق هدية أنيق", benefit: "Ready to gift packaging", benefitAr: "تغليف جاهز للإهداء", price: "AED 120", variant: "gift-box" },
  { name: "Creative Drawing Board", nameAr: "لوحة رسم إبداعية", benefit: "Reusable, ideal for kids and students", benefitAr: "قابلة لإعادة الاستخدام للأطفال والطلاب", price: "AED 89", variant: "drawing-board" },
  { name: "A5 Branded Notebook", nameAr: "دفتر A5 مع الشعار", benefit: "Hardcover with brand printing option", benefitAr: "غلاف فاخر مع خيار طباعة الشعار", price: "AED 35", variant: "notebook" },
  { name: "Metal Gift Pen", nameAr: "قلم معدني للهدايا", benefit: "Smooth writing, gift-ready", benefitAr: "كتابة سلسة وجاهز للإهداء", price: "AED 25", variant: "pen" },
  { name: "Canvas Gift Tote Bag", nameAr: "حقيبة قماشية", benefit: "Reusable canvas tote with logo option", benefitAr: "حقيبة قابلة لإعادة الاستخدام مع خيار الشعار", price: "AED 30", variant: "tote" },
  { name: "Ceramic Gift Mug", nameAr: "كوب سيراميك", benefit: "Ideal for offices and giveaways", benefitAr: "مناسب للمكاتب والفعاليات", price: "AED 28", variant: "mug" },
  { name: "Corporate VIP Gift Pack", nameAr: "طقم هدايا VIP", benefit: "Curated executive presentation", benefitAr: "تشكيلة تنفيذية مختارة", price: "AED 250", variant: "vip-box" },
  { name: "Lifestyle Desk Decor", nameAr: "ديكور مكتب", benefit: "Charming desk accents", benefitAr: "لمسات أنيقة للمكتب", price: "AED 95", variant: "desk-decor" },
];

function FeaturedProducts({ lang }: { lang: "en" | "ar" }) {
  return (
    <section id="featured" className="bg-beyond-white border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="beyond-divider mb-3">
              {lang === "en" ? "Featured" : "مميز"}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal">
              {lang === "en" ? "Featured Picks" : "اختيارات مميزة"}
            </h2>
            <p className="font-arabic text-beyond-charcoal/70 mt-1 text-[15px]">
              اختيارات مميزة
            </p>
          </div>
          <div className="text-[12px] text-beyond-charcoal/60 max-w-md">
            {lang === "en"
              ? "Prices and availability are confirmed before order completion. Bulk prices depend on quantity, branding, stock and delivery location."
              : "يتم تأكيد الأسعار والتوفر قبل إتمام الطلب. تعتمد أسعار الجملة على الكمية والطباعة والمخزون والتوصيل."}
          </div>
        </div>

        {/* Search + filter row */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-beyond-ivory border border-beyond-line rounded-full px-4 py-2.5">
            <SearchIcon className="w-4 h-4 text-beyond-charcoal/60" />
            <input
              placeholder={lang === "en" ? "Search by product or category…" : "ابحث عن منتج أو تصنيف…"}
              className="bg-transparent outline-none text-[13px] w-full text-beyond-charcoal placeholder:text-beyond-charcoal/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(lang === "en"
              ? ["All", "Accessories", "Gifts", "Boards", "Corporate", "Lifestyle"]
              : ["الكل", "إكسسوارات", "هدايا", "لوحات", "شركات", "أسلوب حياة"]
            ).map((t, i) => (
              <button
                key={i}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] border ${
                  i === 0
                    ? "bg-beyond-charcoal text-beyond-ivory border-beyond-charcoal"
                    : "bg-beyond-ivory border-beyond-line text-beyond-charcoal/80 hover:border-beyond-gold"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {FEATURED.map((p, i) => {
            const message = `Hello Beyond Gallery, I am interested in this product:\nProduct Name: ${p.name}\nQuantity: \nDelivery Emirate: \nCustomisation required: \nPlease confirm price and availability.`;
            return (
              <article
                key={i}
                className="rounded-2xl bg-white border border-beyond-line overflow-hidden beyond-card-shadow hover:beyond-card-shadow-hover transition-shadow group"
              >
                <ProductTile variant={p.variant} />
                <div className="p-3.5 sm:p-4">
                  <h3 className="font-display text-[14.5px] sm:text-[16px] font-semibold text-beyond-charcoal line-clamp-1">
                    {lang === "en" ? p.name : p.nameAr}
                  </h3>
                  <p className="mt-1 text-[12px] text-beyond-charcoal/65 line-clamp-2 min-h-[2.4em]">
                    {lang === "en" ? p.benefit : p.benefitAr}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="text-beyond-gold font-display font-semibold">
                      {p.price}
                    </div>
                    <HeartIcon className="w-4 h-4 text-beyond-charcoal/40 hover:text-beyond-gold cursor-pointer" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <button className="text-[11.5px] font-semibold px-2.5 py-2 rounded-full bg-beyond-charcoal text-beyond-ivory hover:opacity-95">
                      {lang === "en" ? "View Details" : "التفاصيل"}
                    </button>
                    <a
                      href={buildWALink(message)}
                      className="text-[11.5px] font-semibold px-2.5 py-2 rounded-full bg-beyond-emerald text-white hover:opacity-95 inline-flex items-center justify-center gap-1.5"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      {lang === "en" ? "WhatsApp" : "واتساب"}
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ====================================================================================
// 7. Gift Finder
// ====================================================================================

function GiftFinder({ lang }: { lang: "en" | "ar" }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const options = lang === "en"
    ? ["For Her", "For Him", "For Kids", "For Office", "For Events", "Under AED 50", "AED 50 to AED 150", "Premium Gift Sets", "Bulk Corporate Gifts"]
    : ["للنساء", "للرجال", "للأطفال", "للمكتب", "للفعاليات", "أقل من 50 درهم", "من 50 إلى 150 درهم", "أطقم هدايا فاخرة", "هدايا شركات بالجملة"];

  const toggle = (k: string) => setSelected((s) => ({ ...s, [k]: !s[k] }));

  const message = useMemo(() => {
    const chosen = Object.keys(selected).filter((k) => selected[k]);
    return [
      "Hello Beyond Gallery, I need help choosing a gift.",
      "Occasion: ",
      "Budget: ",
      "For: ",
      "Delivery Emirate: ",
      chosen.length ? `Preferences: ${chosen.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [selected]);

  return (
    <section id="gift-finder" className="bg-beyond-ivory">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center">
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Gift Finder" : "اختر هديتك"}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal">
            {lang === "en" ? "Not sure what to buy?" : "محتار في الاختيار؟"}
          </h2>
          <p className="font-arabic text-beyond-charcoal/70 mt-2 text-[15px]">
            خلينا نساعدك تختار الهدية المناسبة
          </p>
        </div>

        <div className="mt-8 bg-white rounded-3xl beyond-card-shadow border border-beyond-line p-5 sm:p-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => toggle(o)}
                className={`px-4 py-2.5 rounded-full text-[13px] font-medium border transition-colors ${
                  selected[o]
                    ? "bg-beyond-charcoal text-beyond-ivory border-beyond-charcoal"
                    : "bg-beyond-ivory text-beyond-charcoal border-beyond-line hover:border-beyond-gold"
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <a
              href={buildWALink(message)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-beyond-emerald text-white font-semibold text-[14px] hover:opacity-95 beyond-focus"
            >
              <WhatsAppIcon className="w-4 h-4" />
              {lang === "en" ? "Help Me Choose on WhatsApp" : "ساعدوني عبر واتساب"}
            </a>
          </div>
          <p className="mt-3 text-center text-[12px] text-beyond-charcoal/60">
            {lang === "en"
              ? "We will pre-fill your message with occasion, budget, recipient and delivery emirate so you can confirm in seconds."
              : "نُجهّز لك رسالة جاهزة فيها المناسبة والميزانية والمستفيد وإمارة التوصيل."}
          </p>
        </div>
      </div>
    </section>
  );
}

// ====================================================================================
// 8. Shop with Confidence
// ====================================================================================

function ShopWithConfidence({ lang }: { lang: "en" | "ar" }) {
  const points = lang === "en"
    ? [
        "Clear product description",
        "Real product photos where possible",
        "Prices shown in AED",
        "Delivery confirmed before order",
        "Invoice available upon request",
        "Return and exchange policy available",
        "No misleading brand or material claims",
        "WhatsApp support before and after order",
      ]
    : [
        "وصف واضح للمنتج",
        "صور حقيقية للمنتجات عند الإمكان",
        "الأسعار بالدرهم",
        "تأكيد التوصيل قبل الطلب",
        "فاتورة عند الطلب",
        "سياسة استرجاع واستبدال متاحة",
        "بدون ادعاءات مضللة عن العلامات أو الخامات",
        "دعم واتساب قبل وبعد الطلب",
      ];

  return (
    <section className="bg-beyond-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Confidence" : "ثقة"}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal">
            {lang === "en" ? "Shop with Confidence" : "تسوّق بثقة"}
          </h2>
          <p className="font-arabic text-beyond-charcoal/70 mt-2 text-[15px]">
            تسوق بثقة
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-beyond-charcoal/75 max-w-xl">
            {lang === "en"
              ? "We keep product information clear before purchase. You can ask for extra photos, product details, delivery options and availability before confirming your order."
              : "نُبقي معلومات المنتج واضحة قبل الشراء. يمكنك طلب صور إضافية، تفاصيل المنتج، خيارات التوصيل والتوفر قبل تأكيد طلبك."}
          </p>

          <a
            href={buildWALink("Hello Beyond Gallery, I would like to ask before I buy.")}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-beyond-charcoal text-beyond-ivory text-[13px] font-semibold hover:bg-beyond-navy beyond-focus"
          >
            <WhatsAppIcon className="w-4 h-4 text-beyond-gold" />
            {lang === "en" ? "Ask Before You Buy" : "اسأل قبل الشراء"}
          </a>
        </div>

        <ul className="grid sm:grid-cols-2 gap-3">
          {points.map((p, i) => (
            <li
              key={i}
              className="flex items-start gap-3 bg-beyond-ivory border border-beyond-line rounded-2xl p-4"
            >
              <span className="w-7 h-7 rounded-full bg-white border border-beyond-line flex items-center justify-center text-beyond-emerald shrink-0">
                <ShieldIcon className="w-4 h-4" />
              </span>
              <span className="text-[13.5px] text-beyond-charcoal/85 leading-snug">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ====================================================================================
// 9. Marketplace
// ====================================================================================

function Marketplace({ lang }: { lang: "en" | "ar" }) {
  return (
    <section id="marketplace" className="bg-beyond-ivory border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-14 sm:py-16">
        <div className="rounded-3xl bg-white border border-beyond-line p-6 sm:p-10 beyond-card-shadow grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="beyond-divider mb-3">
              {lang === "en" ? "Where to Buy" : "أين تشتري"}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-beyond-charcoal">
              {lang === "en"
                ? "Available Through Direct Order and UAE Marketplaces"
                : "متاح عبر الطلب المباشر ومتاجر الإمارات"}
            </h2>
            <p className="mt-3 text-[14.5px] text-beyond-charcoal/75 max-w-xl leading-relaxed">
              {lang === "en"
                ? "Selected products may be available through direct WhatsApp order, Noon UAE, Amazon UAE or approved sales channels depending on listing and stock status."
                : "قد تتوفر منتجات مختارة عبر الطلب المباشر على واتساب أو نون الإمارات أو أمازون الإمارات أو قنوات بيع معتمدة حسب التوفر والمخزون."}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 w-full md:w-auto">
            <a
              href={buildWALink("Hello Beyond Gallery, please share the Noon UAE link for this product.")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-ivory border border-beyond-line text-beyond-charcoal text-[13px] font-semibold hover:border-beyond-gold beyond-focus"
            >
              <TagIcon className="w-4 h-4 text-beyond-gold" />
              {lang === "en" ? "Ask for Noon Link" : "اطلب رابط نون"}
            </a>
            <a
              href={buildWALink("Hello Beyond Gallery, please share the Amazon UAE link for this product.")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-ivory border border-beyond-line text-beyond-charcoal text-[13px] font-semibold hover:border-beyond-gold beyond-focus"
            >
              <TagIcon className="w-4 h-4 text-beyond-gold" />
              {lang === "en" ? "Ask for Amazon UAE Link" : "اطلب رابط أمازون"}
            </a>
            <a
              href={buildWALink("Hello Beyond Gallery, I would like to order directly on WhatsApp.")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-emerald text-white text-[13px] font-semibold hover:opacity-95 beyond-focus"
            >
              <WhatsAppIcon className="w-4 h-4" />
              {lang === "en" ? "Order Direct on WhatsApp" : "اطلب مباشرة عبر واتساب"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ====================================================================================
// 10. Corporate Orders
// ====================================================================================

function CorporateOrders({ lang }: { lang: "en" | "ar" }) {
  const items = lang === "en"
    ? [
        { t: "Branded Notebooks", v: "notebook" as Variant },
        { t: "Gift Pens", v: "pen" as Variant },
        { t: "Mugs and Tote Bags", v: "mug" as Variant },
        { t: "VIP Boxes", v: "vip-box" as Variant },
        { t: "Event Giveaways", v: "gift-box" as Variant },
        { t: "Office and Supply Items", v: "desk-decor" as Variant },
      ]
    : [
        { t: "دفاتر بشعار العميل", v: "notebook" as Variant },
        { t: "أقلام هدايا", v: "pen" as Variant },
        { t: "أكواب وحقائب قماشية", v: "mug" as Variant },
        { t: "صناديق VIP", v: "vip-box" as Variant },
        { t: "هدايا فعاليات", v: "gift-box" as Variant },
        { t: "مستلزمات مكتبية", v: "desk-decor" as Variant },
      ];

  return (
    <section
      id="corporate"
      className="text-beyond-ivory relative overflow-hidden"
      style={{
        background:
          "radial-gradient(900px 500px at 100% 0%, #2A2FB6 0%, #171C8F 60%, #0E1377 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-[0.07]" style={{ background: "radial-gradient(600px 300px at 0% 100%, #B68A35, transparent)" }} />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 text-beyond-gold text-[11px] uppercase tracking-[0.28em] font-semibold mb-4">
              <BriefcaseIcon className="w-4 h-4" />
              {lang === "en" ? "Corporate & Bulk" : "شركات وجملة"}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
              {lang === "en"
                ? "Corporate Gifts and Bulk Supply Requests"
                : "هدايا الشركات وطلبات التوريد بالجملة"}
            </h2>
            <p className="mt-4 text-beyond-ivory/85 text-[15px] leading-relaxed max-w-xl">
              {lang === "en"
                ? "For companies, events, schools, offices and institutional buyers, Beyond Connect can support curated gift requests, branding, packaging, sourcing and delivery coordination across the UAE."
                : "للشركات والفعاليات والمدارس والمكاتب والمؤسسات، تقدّم بيوند كونكت دعم طلبات الهدايا المختارة والطباعة والتغليف والتوريد وتنسيق التوصيل عبر الإمارات."}
            </p>

            <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {items.map((it) => (
                <div
                  key={it.t}
                  className="bg-white/[0.06] border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center hover:border-beyond-gold transition-colors"
                >
                  <div className="w-20 h-20">
                    <ProductTile variant={it.v} />
                  </div>
                  <div className="mt-1 text-[12.5px] font-semibold">{it.t}</div>
                </div>
              ))}
            </div>

            <ul className="mt-7 grid grid-cols-2 gap-2 text-[12.5px] text-beyond-ivory/85">
              {(lang === "en"
                ? ["Custom branding", "Premium packaging", "UAE-wide delivery", "Invoice on request"]
                : ["طباعة مخصصة", "تغليف فاخر", "توصيل لكل الإمارات", "فاتورة عند الطلب"]
              ).map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <StarSpark className="w-3.5 h-3.5 text-beyond-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <CorporateForm lang={lang} />
        </div>
      </div>
    </section>
  );
}

function CorporateForm({ lang }: { lang: "en" | "ar" }) {
  const [submitted, setSubmitted] = useState(false);

  const fields = lang === "en"
    ? {
        title: "Request Formal Quotation",
        subtitle: "Our team will respond with availability, pricing and delivery options.",
        fullName: "Full Name",
        company: "Company Name",
        mobile: "Mobile Number",
        email: "Email",
        category: "Product Category",
        quantity: "Quantity",
        branding: "Branding Required",
        location: "Delivery Location",
        date: "Required Date",
        upload: "Upload BOQ or Reference Image",
        message: "Message",
        submit: "Request Formal Quotation",
        thanks: "Thank you. We will respond shortly with formal pricing.",
      }
    : {
        title: "اطلب عرض سعر رسمي",
        subtitle: "سيرد فريقنا بالتوفر والأسعار وخيارات التوصيل.",
        fullName: "الاسم الكامل",
        company: "اسم الشركة",
        mobile: "رقم الجوال",
        email: "البريد الإلكتروني",
        category: "تصنيف المنتج",
        quantity: "الكمية",
        branding: "هل تحتاج طباعة شعار؟",
        location: "موقع التوصيل",
        date: "التاريخ المطلوب",
        upload: "ارفع جدول الكميات أو صورة مرجعية",
        message: "الرسالة",
        submit: "اطلب عرض سعر رسمي",
        thanks: "شكراً لك. سنرد قريباً بعرض السعر الرسمي.",
      };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="bg-white text-beyond-charcoal rounded-3xl p-5 sm:p-7 beyond-card-shadow"
    >
      <h3 className="font-display text-[22px] sm:text-2xl font-semibold">
        {fields.title}
      </h3>
      <p className="text-[12.5px] text-beyond-charcoal/65 mt-1">{fields.subtitle}</p>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <Input label={fields.fullName} />
        <Input label={fields.company} />
        <Input label={fields.mobile} type="tel" />
        <Input label={fields.email} type="email" />
        <Select
          label={fields.category}
          options={
            lang === "en"
              ? [
                  "Branded Notebooks",
                  "Gift Pens",
                  "Mugs and Tote Bags",
                  "VIP Gift Boxes",
                  "Event Giveaways",
                  "Office Supplies",
                  "Other",
                ]
              : [
                  "دفاتر مطبوعة",
                  "أقلام هدايا",
                  "أكواب وحقائب",
                  "صناديق VIP",
                  "هدايا فعاليات",
                  "مستلزمات مكتبية",
                  "أخرى",
                ]
          }
        />
        <Input label={fields.quantity} type="number" />
        <Select
          label={fields.branding}
          options={lang === "en" ? ["Yes", "No", "To be confirmed"] : ["نعم", "لا", "سيتم التأكيد"]}
        />
        <Input label={fields.location} />
        <Input label={fields.date} type="date" />
        <FileField label={fields.upload} />
      </div>

      <Textarea label={fields.message} />

      <button
        type="submit"
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-charcoal text-beyond-ivory font-semibold text-[14px] hover:bg-beyond-navy beyond-focus"
      >
        <FileTextIcon className="w-4 h-4 text-beyond-gold" />
        {fields.submit}
      </button>

      {submitted && (
        <div className="mt-3 text-[12.5px] text-beyond-emerald font-semibold">
          {fields.thanks}
        </div>
      )}
    </form>
  );
}

function Input({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-[11.5px] uppercase tracking-wider font-semibold text-beyond-charcoal/65">
        {label}
      </span>
      <input
        type={type}
        className="mt-1 w-full rounded-xl border border-beyond-line bg-beyond-ivory px-3.5 py-2.5 text-[14px] outline-none focus:border-beyond-gold beyond-focus"
      />
    </label>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[11.5px] uppercase tracking-wider font-semibold text-beyond-charcoal/65">
        {label}
      </span>
      <div className="relative">
        <select className="mt-1 w-full rounded-xl border border-beyond-line bg-beyond-ivory px-3.5 py-2.5 text-[14px] outline-none focus:border-beyond-gold appearance-none">
          <option value="">—</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute end-3 top-1/2 -translate-y-1/2 text-beyond-charcoal/50 pointer-events-none" />
      </div>
    </label>
  );
}

function Textarea({ label }: { label: string }) {
  return (
    <label className="block mt-3">
      <span className="text-[11.5px] uppercase tracking-wider font-semibold text-beyond-charcoal/65">
        {label}
      </span>
      <textarea
        rows={4}
        className="mt-1 w-full rounded-xl border border-beyond-line bg-beyond-ivory px-3.5 py-2.5 text-[14px] outline-none focus:border-beyond-gold resize-none"
      />
    </label>
  );
}

function FileField({ label }: { label: string }) {
  return (
    <label className="sm:col-span-2 block">
      <span className="text-[11.5px] uppercase tracking-wider font-semibold text-beyond-charcoal/65">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-3 rounded-xl border border-dashed border-beyond-line bg-beyond-ivory px-3.5 py-3 text-[13px] text-beyond-charcoal/65">
        <UploadIcon className="w-4 h-4 text-beyond-gold" />
        <span>Tap to upload PDF or image</span>
        <input type="file" className="hidden" />
      </div>
    </label>
  );
}

// ====================================================================================
// 11. Supply Desk
// ====================================================================================

function SupplyDesk({ lang }: { lang: "en" | "ar" }) {
  const categories = lang === "en"
    ? [
        "Electrical and Cable Materials",
        "Office and Institutional Supplies",
        "Corporate Gift Items",
        "Facility Support Materials",
        "Industrial and Safety Products",
        "Specialised Rescue Equipment",
      ]
    : [
        "كابلات ومواد كهربائية",
        "مستلزمات مكتبية ومؤسسية",
        "هدايا شركات",
        "مواد دعم المنشآت",
        "منتجات صناعية وسلامة",
        "معدات إنقاذ متخصصة",
      ];

  return (
    <section id="supply" className="bg-beyond-grey">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
        <div>
          <div className="beyond-divider mb-3">
            {lang === "en" ? "B2B Sourcing" : "توريد للشركات"}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal">
            {lang === "en" ? "Beyond Connect Supply Desk" : "قسم التوريد - بيوند كونكت"}
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-beyond-charcoal/75 max-w-xl">
            {lang === "en"
              ? "For B2B and institutional requirements, our supply desk supports selected sourcing and quotation requests across general trading categories, subject to supplier confirmation, specifications, stock availability and delivery feasibility."
              : "للاحتياجات المؤسسية وقطاع الأعمال، يدعم قسم التوريد لدينا طلبات توريد وعروض أسعار مختارة ضمن فئات التجارة العامة، وفقاً لتأكيد المورّد، والمواصفات، والتوفر، وإمكانية التوصيل."}
          </p>

          <ul className="mt-6 grid sm:grid-cols-2 gap-2.5">
            {categories.map((c) => (
              <li
                key={c}
                className="flex items-start gap-2.5 bg-white border border-beyond-line rounded-xl p-3.5"
              >
                <BoxIcon className="w-4 h-4 text-beyond-emerald mt-0.5 shrink-0" />
                <span className="text-[13px] text-beyond-charcoal/85">{c}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 text-[12px] text-beyond-charcoal/60">
            {lang === "en"
              ? "Supply items are handled separately from retail shopping. Pricing is provided by formal quotation only."
              : "تُعالج طلبات التوريد بشكل منفصل عن البيع بالتجزئة. تُقدَّم الأسعار عبر عرض رسمي فقط."}
          </div>
        </div>

        <SupplyRFQ lang={lang} />
      </div>
    </section>
  );
}

function SupplyRFQ({ lang }: { lang: "en" | "ar" }) {
  const [submitted, setSubmitted] = useState(false);
  const t = lang === "en"
    ? {
        title: "Submit RFQ",
        sub: "Quotation requests are processed within 1–2 business days.",
        company: "Company / Institution",
        contact: "Contact Person",
        phone: "Mobile",
        email: "Email",
        category: "Supply Category",
        spec: "Specifications / Description",
        qty: "Quantity",
        deliver: "Delivery Emirate",
        when: "Required by",
        boq: "Upload BOQ (optional)",
        cta: "Submit Supply Request",
        thanks: "RFQ received. We will reply with feasibility and pricing.",
      }
    : {
        title: "أرسل طلب عرض سعر",
        sub: "تتم معالجة طلبات الأسعار خلال 1-2 يوم عمل.",
        company: "الشركة / المؤسسة",
        contact: "جهة الاتصال",
        phone: "الجوال",
        email: "البريد الإلكتروني",
        category: "تصنيف التوريد",
        spec: "المواصفات / الوصف",
        qty: "الكمية",
        deliver: "إمارة التوصيل",
        when: "التاريخ المطلوب",
        boq: "ارفع جدول الكميات (اختياري)",
        cta: "أرسل طلب التوريد",
        thanks: "تم استلام طلبك. سنرد بالتفاصيل والأسعار قريباً.",
      };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
      className="bg-white rounded-3xl p-5 sm:p-7 beyond-card-shadow border border-beyond-line"
    >
      <h3 className="font-display text-2xl font-semibold">{t.title}</h3>
      <p className="text-[12.5px] text-beyond-charcoal/65 mt-1">{t.sub}</p>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <Input label={t.company} />
        <Input label={t.contact} />
        <Input label={t.phone} type="tel" />
        <Input label={t.email} type="email" />
        <Select
          label={t.category}
          options={
            lang === "en"
              ? [
                  "Electrical and Cable Materials",
                  "Office and Institutional Supplies",
                  "Corporate Gift Items",
                  "Facility Support Materials",
                  "Industrial and Safety Products",
                  "Specialised Rescue Equipment",
                ]
              : [
                  "كابلات ومواد كهربائية",
                  "مستلزمات مكتبية ومؤسسية",
                  "هدايا شركات",
                  "مواد دعم المنشآت",
                  "منتجات صناعية وسلامة",
                  "معدات إنقاذ متخصصة",
                ]
          }
        />
        <Input label={t.qty} type="number" />
        <Input label={t.deliver} />
        <Input label={t.when} type="date" />
        <FileField label={t.boq} />
      </div>
      <Textarea label={t.spec} />

      <button
        type="submit"
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-emerald text-white font-semibold text-[14px] hover:opacity-95 beyond-focus"
      >
        <FileTextIcon className="w-4 h-4" />
        {t.cta}
      </button>

      {submitted && (
        <div className="mt-3 text-[12.5px] text-beyond-emerald font-semibold">{t.thanks}</div>
      )}
    </form>
  );
}

// ====================================================================================
// 12. About Brand
// ====================================================================================

function AboutBrand({ lang }: { lang: "en" | "ar" }) {
  return (
    <section className="bg-beyond-white">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="beyond-divider mb-3">
          {lang === "en" ? "Our Story" : "قصتنا"}
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-semibold text-beyond-charcoal leading-tight">
          {lang === "en" ? (
            <>Small Details. <span className="beyond-gold-gradient">Better Choices.</span></>
          ) : (
            <>تفاصيل صغيرة. <span className="beyond-gold-gradient">اختيارات أفضل.</span></>
          )}
        </h2>
        <p className="mt-5 text-[15.5px] leading-relaxed text-beyond-charcoal/80 max-w-3xl mx-auto">
          {lang === "en"
            ? "Beyond Gallery by Beyond Jewellery was created to make everyday gifting and lifestyle shopping easier, cleaner and more meaningful. From elegant accessories and personalised gifts to creative boards and corporate gift packs, we curate products that are simple to understand, easy to order and suitable for UAE customers."
            : "أُنشئت بيوند جاليري بواسطة بيوند جويلري لجعل تسوّق الهدايا وأسلوب الحياة اليومي أسهل وأوضح وأكثر قيمة. من الإكسسوارات الأنيقة والهدايا المخصصة إلى لوحات الإبداع وأطقم هدايا الشركات، نختار منتجات سهلة الفهم والطلب ومناسبة لعملاء الإمارات."}
        </p>
        <p className="mt-4 font-arabic text-beyond-emerald text-[18px]">
          تفصيلة صغيرة قد تكون هدية، ذكرى، أو بداية فكرة جميلة.
        </p>
        <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-3 rounded-full bg-beyond-ivory border border-beyond-line text-[12.5px] text-beyond-charcoal/75">
          <PinIcon className="w-4 h-4 text-beyond-gold" />
          {lang === "en"
            ? "Operated by BEYOND CONNECT GENERAL TRADING L.L.C, Dubai, United Arab Emirates."
            : "تُدار بواسطة شركة بيوند كونكت للتجارة العامة ذ.م.م، دبي، الإمارات العربية المتحدة."}
        </div>
      </div>
    </section>
  );
}

// ====================================================================================
// 15. Catalogue lead capture
// ====================================================================================

function CatalogueCapture({ lang }: { lang: "en" | "ar" }) {
  const [submitted, setSubmitted] = useState(false);
  const cats = lang === "en"
    ? [
        "Jewellery Accessories",
        "Personalised Gifts",
        "Drawing Boards",
        "Corporate Gifts",
        "Office Supplies",
        "Electrical and Cable Supply",
        "Industrial Supply",
        "Other",
      ]
    : [
        "إكسسوارات",
        "هدايا مخصصة",
        "لوحات رسم",
        "هدايا شركات",
        "مستلزمات مكتبية",
        "كابلات وكهرباء",
        "توريد صناعي",
        "أخرى",
      ];

  return (
    <section className="bg-beyond-ivory border-y border-beyond-line">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20 grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
        <div>
          <div className="beyond-divider mb-3">{lang === "en" ? "Catalogue" : "الكتالوج"}</div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal">
            {lang === "en" ? "Get the Latest Product Catalogue" : "احصل على أحدث كتالوج"}
          </h2>
          <p className="mt-3 text-[15px] text-beyond-charcoal/75 max-w-md leading-relaxed">
            {lang === "en"
              ? "Receive our latest accessories, gifts, drawing boards, corporate gifts and selected supply items directly on WhatsApp."
              : "استلم على واتساب أحدث الإكسسوارات والهدايا ولوحات الرسم وهدايا الشركات ومستلزمات التوريد المختارة."}
          </p>
          <ul className="mt-5 space-y-2 text-[13px] text-beyond-charcoal/75">
            {[
              lang === "en" ? "Sent as a single PDF on WhatsApp" : "يُرسل كملف PDF واحد عبر واتساب",
              lang === "en" ? "Retail and bulk versions available" : "نسخة تجزئة وأخرى للجملة",
              lang === "en" ? "Updated with seasonal collections" : "مُحدّث بالمجموعات الموسمية",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <StarSpark className="w-3.5 h-3.5 text-beyond-gold" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          className="bg-white rounded-3xl border border-beyond-line p-5 sm:p-7 beyond-card-shadow"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label={lang === "en" ? "Name" : "الاسم"} />
            <Input label={lang === "en" ? "Mobile Number" : "رقم الجوال"} type="tel" />
            <Select
              label={lang === "en" ? "Emirate" : "الإمارة"}
              options={
                lang === "en"
                  ? ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"]
                  : ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين"]
              }
            />
            <Select label={lang === "en" ? "Interested Category" : "التصنيف المطلوب"} options={cats} />
            <Select
              label={lang === "en" ? "Retail or Bulk Order" : "تجزئة أم جملة"}
              options={lang === "en" ? ["Retail", "Bulk"] : ["تجزئة", "جملة"]}
            />
          </div>
          <button
            type="submit"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-charcoal text-beyond-ivory font-semibold text-[14px] hover:bg-beyond-navy beyond-focus"
          >
            <WhatsAppIcon className="w-4 h-4 text-beyond-gold" />
            {lang === "en" ? "Send Me the Catalogue" : "أرسلوا لي الكتالوج"}
          </button>
          {submitted && (
            <div className="mt-3 text-[12.5px] text-beyond-emerald font-semibold">
              {lang === "en"
                ? "Thanks! We will WhatsApp you the latest catalogue shortly."
                : "شكراً! سنرسل لك الكتالوج عبر واتساب قريباً."}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

// ====================================================================================
// 16. FAQ
// ====================================================================================

const FAQ_DATA = {
  en: [
    {
      q: "Do you deliver across the UAE?",
      a: "Yes. We deliver to all seven Emirates. Delivery options, time and fees are confirmed before order completion.",
    },
    {
      q: "Can I order through WhatsApp?",
      a: "Yes. WhatsApp is our primary order channel. You can ask, confirm, and pay through trusted UAE payment methods after confirmation.",
    },
    {
      q: "Can I request extra product photos?",
      a: "Absolutely. Before you order, we can share additional photos or a short product video upon request.",
    },
    {
      q: "Are all items available on Noon or Amazon?",
      a: "Selected items are listed on UAE marketplaces. Availability varies. Ask us for the latest listing link.",
    },
    {
      q: "Can I request personalised items?",
      a: "Yes. We support names, messages and Arabic or English text on selected accessories and gifts. Customised items need extra preparation time.",
    },
    {
      q: "Do you support corporate gifts?",
      a: "Yes. We support branded notebooks, pens, mugs, totes, VIP boxes and curated gift packs for companies and events.",
    },
    {
      q: "Can I request bulk pricing?",
      a: "Yes. Bulk pricing is offered through formal quotation and depends on quantity, branding, stock and delivery location.",
    },
    {
      q: "Can I get an invoice?",
      a: "Yes. Tax invoices are available upon request for retail and corporate orders.",
    },
    {
      q: "What is the return and exchange policy?",
      a: "Eligible items can be returned or exchanged subject to our return policy. Personalised items are non-returnable unless damaged.",
    },
    {
      q: "Are prices fixed?",
      a: "Retail prices are shown in AED. Bulk and supply prices are confirmed only via formal quotation.",
    },
  ],
  ar: [
    { q: "هل تقومون بالتوصيل داخل الإمارات؟", a: "نعم، نوصّل إلى جميع الإمارات السبع. تُؤكَّد خيارات التوصيل ووقته ورسومه قبل إتمام الطلب." },
    { q: "هل يمكن الطلب عبر واتساب؟", a: "نعم، واتساب هو قناتنا الرئيسية. يمكنك السؤال والتأكيد والدفع عبر وسائل دفع موثوقة في الإمارات بعد التأكيد." },
    { q: "هل يمكن طلب صور إضافية للمنتج؟", a: "بالتأكيد. يمكننا مشاركة صور إضافية أو فيديو قصير قبل الطلب." },
    { q: "هل كل المنتجات متاحة على نون وأمازون؟", a: "بعض المنتجات مدرجة على المتاجر الإماراتية. التوفر يختلف، اطلب منا أحدث الروابط." },
    { q: "هل يمكن طلب منتجات مخصصة؟", a: "نعم، ندعم الأسماء والرسائل والكتابة العربية والإنجليزية على إكسسوارات وهدايا مختارة. التخصيص يحتاج وقتاً إضافياً." },
    { q: "هل تدعمون هدايا الشركات؟", a: "نعم، ندعم الدفاتر والأقلام والأكواب والحقائب وصناديق VIP وأطقم الهدايا للشركات والفعاليات." },
    { q: "هل يمكنني طلب أسعار جملة؟", a: "نعم، تُقدَّم أسعار الجملة عبر عرض رسمي وتعتمد على الكمية والطباعة والمخزون وموقع التوصيل." },
    { q: "هل يمكن الحصول على فاتورة؟", a: "نعم، الفواتير الضريبية متاحة عند الطلب للتجزئة والشركات." },
    { q: "ما سياسة الاسترجاع والاستبدال؟", a: "تخضع المنتجات المؤهلة لسياسة الإرجاع. المنتجات المخصصة غير قابلة للإرجاع إلا في حال تلفها." },
    { q: "هل الأسعار ثابتة؟", a: "أسعار التجزئة تُعرض بالدرهم. أسعار الجملة والتوريد تُؤكَّد عبر عرض رسمي فقط." },
  ],
};

function FAQ({ lang }: { lang: "en" | "ar" }) {
  const [open, setOpen] = useState<number | null>(0);
  const data = FAQ_DATA[lang];
  return (
    <section className="bg-beyond-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-8">
          <div className="beyond-divider mb-3">FAQ</div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal">
            {lang === "en" ? "Frequently Asked Questions" : "أسئلة شائعة"}
          </h2>
        </div>

        <div className="space-y-2.5">
          {data.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border ${isOpen ? "border-beyond-gold bg-beyond-ivory" : "border-beyond-line bg-white"} transition-colors`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 text-start p-4 sm:p-5"
                >
                  <span className="font-display text-[15px] sm:text-[16.5px] font-semibold text-beyond-charcoal">
                    {item.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-beyond-gold transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-[14px] text-beyond-charcoal/80 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ====================================================================================
// 17. Contact
// ====================================================================================

function Contact({ lang }: { lang: "en" | "ar" }) {
  return (
    <section id="contact" className="bg-beyond-ivory border-t border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-10">
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Get in Touch" : "تواصل معنا"}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal">
            {lang === "en" ? "Contact and Order" : "التواصل والطلب"}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[
            {
              icon: WhatsAppIcon,
              title: lang === "en" ? "WhatsApp" : "واتساب",
              body: lang === "en" ? "Fastest way to order and ask." : "أسرع طريقة للسؤال والطلب.",
              cta: lang === "en" ? "Chat on WhatsApp" : "تواصل عبر واتساب",
              href: WA_BASE,
              accent: "bg-beyond-emerald text-white",
            },
            {
              icon: MailIcon,
              title: "Email",
              body: "hello@beyondgallery.ae",
              cta: lang === "en" ? "Send Email" : "أرسل بريداً",
              href: "mailto:hello@beyondgallery.ae",
              accent: "bg-beyond-charcoal text-beyond-ivory",
            },
            {
              icon: InstagramIcon,
              title: "Instagram",
              body: "@beyondgallery.ae",
              cta: lang === "en" ? "Follow on Instagram" : "تابعنا على إنستغرام",
              href: "https://instagram.com/",
              accent: "bg-beyond-navy text-beyond-ivory",
            },
            {
              icon: TagIcon,
              title: "Noon UAE",
              body: lang === "en" ? "Selected listings — ask for link." : "منتجات مختارة - اطلب الرابط.",
              cta: lang === "en" ? "Open Noon Store" : "افتح متجر نون",
              href: "#",
              accent: "bg-white text-beyond-charcoal border border-beyond-line",
            },
            {
              icon: TagIcon,
              title: "Amazon UAE",
              body: lang === "en" ? "Selected listings — ask for link." : "منتجات مختارة - اطلب الرابط.",
              cta: lang === "en" ? "Open Amazon Store" : "افتح متجر أمازون",
              href: "#",
              accent: "bg-white text-beyond-charcoal border border-beyond-line",
            },
            {
              icon: PinIcon,
              title: "Dubai, UAE",
              body:
                lang === "en"
                  ? "Operated by BEYOND CONNECT GENERAL TRADING L.L.C — Trade License No. 1498624."
                  : "تُدار بواسطة شركة بيوند كونكت للتجارة العامة ذ.م.م - رخصة رقم 1498624.",
              cta: lang === "en" ? "About the Business" : "عن الشركة",
              href: "#",
              accent: "bg-beyond-ivory text-beyond-charcoal border border-beyond-line",
            },
          ].map((c, i) => (
            <a
              key={i}
              href={c.href}
              className="rounded-3xl bg-white border border-beyond-line p-5 beyond-card-shadow hover:beyond-card-shadow-hover transition-shadow"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${c.accent}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <div className="mt-3 font-display text-[17px] font-semibold text-beyond-charcoal">
                {c.title}
              </div>
              <div className="mt-1 text-[13px] text-beyond-charcoal/70 leading-snug">{c.body}</div>
              <div className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-beyond-gold">
                {c.cta}
                <ArrowRight className="w-4 h-4 rtl:flip-x" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ====================================================================================
// 18. Footer
// ====================================================================================

function Footer({ lang }: { lang: "en" | "ar" }) {
  const links = lang === "en"
    ? [
        "Privacy Policy",
        "Terms and Conditions",
        "Return and Exchange Policy",
        "Shipping Policy",
        "Corporate Orders",
        "Supply Desk",
        "Contact",
      ]
    : [
        "سياسة الخصوصية",
        "الشروط والأحكام",
        "سياسة الاسترجاع والاستبدال",
        "سياسة الشحن",
        "طلبات الشركات",
        "قسم التوريد",
        "تواصل",
      ];

  return (
    <footer className="bg-beyond-charcoal text-beyond-ivory">
      <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <div className="font-display text-2xl">
            Beyond <span className="beyond-gold-gradient">Gallery</span>
          </div>
          <div className="text-[12px] uppercase tracking-[0.22em] text-beyond-ivory/60 mt-1">
            by Beyond Jewellery
          </div>
          <p className="mt-4 text-[13px] text-beyond-ivory/75 leading-relaxed max-w-sm">
            {lang === "en"
              ? "Operated by BEYOND CONNECT GENERAL TRADING L.L.C, Dubai, United Arab Emirates. Trade License No. 1498624 — General Trading."
              : "تُدار بواسطة شركة بيوند كونكت للتجارة العامة ذ.م.م، دبي، الإمارات. رخصة تجارية رقم 1498624 - تجارة عامة."}
          </p>
        </div>

        <div>
          <div className="text-[12px] uppercase tracking-[0.22em] text-beyond-gold mb-3">
            {lang === "en" ? "Quick Links" : "روابط سريعة"}
          </div>
          <ul className="grid grid-cols-2 gap-2 text-[13.5px]">
            {links.map((l) => (
              <li key={l}>
                <a href="#" className="text-beyond-ivory/80 hover:text-beyond-gold">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[12px] uppercase tracking-[0.22em] text-beyond-gold mb-3">
            {lang === "en" ? "Stay Connected" : "ابقَ على تواصل"}
          </div>
          <a
            href={WA_BASE}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-beyond-emerald text-white text-[13px] font-semibold"
          >
            <WhatsAppIcon className="w-4 h-4" />
            {lang === "en" ? "WhatsApp Us" : "تواصل عبر واتساب"}
          </a>
          <div className="mt-4 flex items-center gap-2">
            <a href="#" className="w-9 h-9 rounded-full border border-beyond-ivory/20 flex items-center justify-center hover:border-beyond-gold">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="mailto:hello@beyondgallery.ae" className="w-9 h-9 rounded-full border border-beyond-ivory/20 flex items-center justify-center hover:border-beyond-gold">
              <MailIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-beyond-ivory/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11.5px] text-beyond-ivory/60">
          <span>
            © {new Date().getFullYear()} Beyond Gallery by Beyond Jewellery — Dubai, UAE.
          </span>
          <span>
            {lang === "en"
              ? "Prices in AED. Availability confirmed before order."
              : "الأسعار بالدرهم. التوفر يتأكد قبل الطلب."}
          </span>
        </div>
      </div>
    </footer>
  );
}

// ====================================================================================
// Mobile Sticky Bar
// ====================================================================================

function MobileStickyBar({ lang }: { lang: "en" | "ar" }) {
  const items = [
    {
      icon: CartIcon,
      label: lang === "en" ? "Shop" : "تسوّق",
      href: "#collections",
    },
    {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      href: WA_BASE,
      highlight: true,
    },
    {
      icon: Grid2x2,
      label: lang === "en" ? "Categories" : "التصنيفات",
      href: "#collections",
    },
    {
      icon: FileTextIcon,
      label: lang === "en" ? "Quote" : "عرض سعر",
      href: "#corporate",
    },
  ];
  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-40 rounded-3xl bg-beyond-charcoal text-beyond-ivory beyond-card-shadow border border-white/5">
      <div className="grid grid-cols-4">
        {items.map((it, i) => (
          <a
            key={i}
            href={it.href}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
              it.highlight ? "text-beyond-gold" : "text-beyond-ivory/85"
            }`}
          >
            <it.icon className="w-5 h-5" />
            <span className="font-semibold">{it.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
