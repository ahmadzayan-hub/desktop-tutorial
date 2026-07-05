"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BackToTop, FloatingWhatsApp, ScrollProgress, StatCounter } from "./_components/Bits";
import HeroArt from "./_components/HeroArt";
import Marquee from "./_components/Marquee";
import ProductTile, { type Ribbon, type Variant } from "./_components/ProductTile";
import QuickView, { type QuickViewProduct } from "./_components/QuickView";
import { Reveal, Stagger, StaggerItem } from "./_components/Reveal";
import Spotlight from "./_components/Spotlight";
import { ToastHost, WishlistProvider, toast, useWishlist } from "./_components/Wishlist";
import {
  ApplePayMark,
  ArrowRight,
  BankMark,
  BoardIcon,
  BoxIcon,
  BriefcaseIcon,
  CartIcon,
  CashMark,
  ChevronDown,
  CloseIcon,
  FileTextIcon,
  GiftIcon,
  GooglePayMark,
  Grid2x2,
  HeartIcon,
  HomeDecorIcon,
  InstagramIcon,
  MailIcon,
  MasterMark,
  MenuIcon,
  PhoneIcon,
  PinIcon,
  SearchIcon,
  ShieldIcon,
  SparkleIcon,
  StarSpark,
  TabbyMark,
  TagIcon,
  TamaraMark,
  TikTokIcon,
  UploadIcon,
  VisaMark,
  WhatsAppIcon,
} from "./_components/icons";

// Brand wide constants

const WA_NUMBER = "971551556991";
const WA_DISPLAY = "+971 55 155 6991";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;
const EMAIL = "info@beyondconnect.ae";
const INSTAGRAM_URL =
  "https://www.instagram.com/beyond.style.uae?igsh=NDhxN2xyYXNkNjVi";
const INSTAGRAM_HANDLE = "@beyond.style.uae";
const TIKTOK_URL =
  "https://www.tiktok.com/@beyondstyleuae?_r=1&_t=ZS-96PyMbe5TE2";
const TIKTOK_HANDLE = "@beyondstyleuae";
const NOON_URL =
  "https://www.noon.com/uae-ar/seller/p-443679/?link_source=share_btn&utm_source=ig&utm_medium=social&utm_content=link_in_bio";

const buildWALink = (message: string) =>
  `${WA_BASE}?text=${encodeURIComponent(message)}`;

const formToWA = (title: string, data: Record<string, string>) => {
  const lines = [`Hello Beyond Gallery, ${title}`];
  for (const [k, v] of Object.entries(data)) {
    if (v && v.trim()) lines.push(`${k}: ${v.trim()}`);
  }
  return lines.join("\n");
};

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

// Main page

export default function BeyondGalleryLanding() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [quick, setQuick] = useState<QuickViewProduct | null>(null);
  const isRTL = lang === "ar";

  const waHref = quick
    ? buildWALink(
        `Hello Beyond Gallery, I am interested in this product.\nProduct Name: ${quick.name}\nQuantity: \nDelivery Emirate: \nCustomisation required: \nPlease confirm price and availability.`
      )
    : WA_BASE;

  return (
    <WishlistProvider>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        lang={isRTL ? "ar" : "en"}
        className={isRTL ? "font-arabic" : "font-bg-body"}
      >
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[90] focus:bg-white focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:text-beyond-gold focus:font-semibold"
        >
          {lang === "en" ? "Skip to content" : "تجاوز إلى المحتوى"}
        </a>
        <ScrollProgress />
        <AnnouncementBar lang={lang} />
        <Header lang={lang} setLang={setLang} />

        <main id="home">
          <Hero lang={lang} />
          <KeywordMarquee lang={lang} />
          <TrustStrip lang={lang} />
          <StatsStrip lang={lang} />
          <Pillars lang={lang} />
          <PlatformStrip lang={lang} />
          <Collections lang={lang} />
          <FeaturedProducts lang={lang} onQuickView={setQuick} />
          <RecentlyViewed lang={lang} onQuickView={setQuick} />
          <Customisation lang={lang} />
          <GiftQuiz lang={lang} />
          <ShopWithConfidence lang={lang} />
          <Marketplace lang={lang} />
          <CorporateOrders lang={lang} />
          <CorporatePacks lang={lang} />
          <SupplyDesk lang={lang} />
          <AboutBrand lang={lang} />
          <Testimonials lang={lang} />
          <DeliveryTimeline lang={lang} />
          <PaymentMethods lang={lang} />
          <CatalogueCapture lang={lang} />
          <FAQ lang={lang} />
          <Contact lang={lang} />
        </main>

        <Footer lang={lang} />
        <MobileStickyBar lang={lang} />
        <BackToTop lang={lang} />
        <FloatingWhatsApp href={WA_BASE} lang={lang} />
        <CookieConsent lang={lang} />
        <QuickView
          product={quick}
          onClose={() => setQuick(null)}
          lang={lang}
          waHref={waHref}
        />
        <ToastHost />
      </div>
    </WishlistProvider>
  );
}

// 1. Announcement Bar

function AnnouncementBar({ lang }: { lang: "en" | "ar" }) {
  // Rotating announcements. Cross-fade every 3.5s. Pauses on hover so a reader
  // can finish a line, and respects prefers-reduced-motion (no cross-fade).
  const messages = [
    {
      en: "Free delivery on orders 300 AED and above, all seven emirates.",
      ar: "توصيل مجاني للطلبات 300 درهم فأكثر في جميع الإمارات السبع.",
    },
    {
      en: "All prices in AED, inclusive of 5% VAT. No hidden fees.",
      ar: "جميع الأسعار بالدرهم، شاملة ضريبة القيمة المضافة 5%. بدون رسوم خفية.",
    },
    {
      en: "Same-day dispatch on in-stock items ordered before 4pm UAE time.",
      ar: "شحن في نفس اليوم للطلبات المتوفرة قبل الساعة 4 عصراً بتوقيت الإمارات.",
    },
    {
      en: "WhatsApp support open every day 9am to 11pm.",
      ar: "دعم واتساب متاح كل يوم من 9 صباحاً حتى 11 مساءً.",
    },
  ];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % messages.length), 3500);
    return () => clearInterval(id);
  }, [paused, messages.length]);
  return (
    <div
      className="bg-beyond-navy text-beyond-ivory relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-[12px] sm:text-[13px]">
        <SparkleIcon className="w-3.5 h-3.5 text-beyond-gold shrink-0" />
        <div className="relative h-[18px] overflow-hidden max-w-[86%]">
          <AnimatePresence mode="wait">
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute inset-0 text-center whitespace-nowrap overflow-hidden text-ellipsis ${lang === "ar" ? "font-arabic" : ""}`}
            >
              {lang === "en" ? messages[i].en : messages[i].ar}
            </motion.span>
          </AnimatePresence>
        </div>
        <SparkleIcon className="w-3.5 h-3.5 text-beyond-gold shrink-0" />
      </div>
      {/* Progress hairline */}
      <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-white/5">
        <motion.div
          key={`p-${i}-${paused ? "pause" : "run"}`}
          className="h-full bg-beyond-gold origin-left"
          initial={{ scaleX: 0 }}
          animate={paused ? { scaleX: 0 } : { scaleX: 1 }}
          transition={{ duration: 3.5, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// 2. Header

function Header({
  lang,
  setLang,
}: {
  lang: "en" | "ar";
  setLang: (l: "en" | "ar") => void;
}) {
  const [open, setOpen] = useState(false);
  const { wishlist } = useWishlist();

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
                className="beyond-link text-[14px] text-beyond-charcoal/80 hover:text-beyond-gold transition-colors"
              >
                {lang === "en" ? l.en : l.ar}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-full border border-beyond-line text-[12px] font-semibold tracking-wider uppercase text-beyond-charcoal hover:border-beyond-gold hover:text-beyond-gold transition-colors"
              aria-label="Toggle language"
            >
              {lang === "en" ? "العربية" : "English"}
            </button>

            <a
              href="#wishlist"
              className="hidden sm:inline-flex relative items-center w-10 h-10 rounded-full border border-beyond-line justify-center text-beyond-charcoal hover:border-beyond-gold hover:text-beyond-gold"
              aria-label={lang === "en" ? "Wishlist" : "المفضّلة"}
              title={lang === "en" ? "Wishlist" : "المفضّلة"}
            >
              <HeartIcon className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -end-1 bg-beyond-gold text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </a>

            <a
              href={buildWALink("Hello Beyond Gallery, I would like to order on WhatsApp.")}
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
              {lang === "en" ? "Corporate Quote" : "عرض سعر للشركات"}
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
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
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
                  href={buildWALink("Hello Beyond Gallery, I would like to order on WhatsApp.")}
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
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// 3. Hero

function Hero({ lang }: { lang: "en" | "ar" }) {
  return (
    <Spotlight>
      <section className="beyond-paper relative overflow-hidden">
        <span aria-hidden className="absolute top-10 start-[8%] w-2 h-2 rounded-full bg-beyond-gold beyond-sparkle" />
        <span aria-hidden className="absolute top-24 end-[18%] w-1.5 h-1.5 rounded-full bg-beyond-emerald beyond-sparkle" style={{ animationDelay: ".6s" }} />
        <span aria-hidden className="absolute bottom-12 start-[14%] w-1.5 h-1.5 rounded-full bg-beyond-gold beyond-sparkle" style={{ animationDelay: "1.2s" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="beyond-divider mb-6">
              {lang === "en" ? "Curated in Dubai. GiftMajlis platform." : "اختيار من دبي. منصّة GiftMajlis."}
            </div>

            <h1 className={`font-display text-[34px] leading-[1.1] sm:text-[44px] lg:text-[56px] font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
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

            <p className={`mt-5 text-[15px] sm:text-[16px] leading-relaxed text-beyond-charcoal/75 max-w-xl ${lang === "ar" ? "font-arabic" : ""}`}>
              {lang === "en"
                ? "Shop jewellery inspired accessories, personalised gifts, creative drawing boards, decorative items, corporate gifts and selected lifestyle products curated for UAE customers."
                : "تسوّق إكسسوارات مستوحاة من المجوهرات، وهدايا مخصّصة، ولوحات رسم إبداعية، ومنتجات زخرفية، وهدايا للشركات، وتشكيلة أسلوب حياة مختارة لعملاء الإمارات."}
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#collections"
                className="beyond-halo inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-navy text-beyond-ivory font-semibold text-[14px] hover:opacity-95 beyond-focus"
              >
                <CartIcon className="w-4 h-4 text-beyond-gold" />
                {lang === "en" ? "Shop Lifestyle Collection" : "تسوّق المجموعة"}
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={buildWALink("Hello Beyond Gallery, I would like to order on WhatsApp.")}
                className="beyond-wa-pulse inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-emerald text-white font-semibold text-[14px] hover:opacity-95 beyond-focus"
              >
                <WhatsAppIcon className="w-4 h-4" />
                {lang === "en" ? "Order on WhatsApp" : "اطلب عبر واتساب"}
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#corporate"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-beyond-gold text-beyond-gold font-semibold text-[14px] hover:bg-beyond-gold hover:text-white beyond-focus transition-colors"
              >
                <BriefcaseIcon className="w-4 h-4" />
                {lang === "en" ? "Request Corporate Quote" : "اطلب عرض سعر للشركات"}
              </motion.a>
            </div>

            <div className={`mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-beyond-charcoal/70 ${lang === "ar" ? "font-arabic" : ""}`}>
              {(lang === "en"
                ? [
                    "Dubai based business",
                    "UAE delivery",
                    "WhatsApp support",
                    "Retail and bulk orders",
                    "AED pricing including 5 percent VAT",
                  ]
                : [
                    "علامة من دبي",
                    "توصيل داخل الإمارات",
                    "دعم عبر واتساب",
                    "تجزئة وجملة",
                    "الأسعار بالدرهم شاملة ضريبة القيمة المضافة 5%",
                  ]
              ).map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-beyond-gold" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="relative">
              <div className="absolute -inset-6 bg-white/40 rounded-[40px] blur-2xl" />
              <div className="relative bg-white/60 backdrop-blur rounded-[28px] p-4 sm:p-6 beyond-card-shadow border border-white/70 beyond-float">
                <HeroArt />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -bottom-4 -end-2 bg-white rounded-2xl px-3 py-2 beyond-card-shadow border border-beyond-line flex items-center gap-2 text-[12px]"
              >
                <PinIcon className="w-4 h-4 text-beyond-emerald" />
                <span className="font-semibold text-beyond-charcoal">Dubai, UAE</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -top-3 -start-2 bg-beyond-charcoal text-beyond-ivory rounded-2xl px-3 py-2 text-[12px] font-semibold flex items-center gap-2 beyond-card-shadow"
              >
                <SparkleIcon className="w-4 h-4 text-beyond-gold" />
                {lang === "en" ? "Curated weekly" : "تشكيلة أسبوعية"}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </Spotlight>
  );
}

// Marquee strip
function KeywordMarquee({ lang }: { lang: "en" | "ar" }) {
  const items =
    lang === "en"
      ? [
          "Curated in Dubai",
          "WhatsApp Ready",
          "AED Pricing",
          "Retail and Bulk",
          "Corporate Gifting",
          "B2B Sourcing",
          "Personalised in Arabic and English",
          "Powered by GiftMajlis",
          "Delivery Across UAE",
          "Invoice on Request",
        ]
      : [
          "اختيار من دبي",
          "جاهز عبر واتساب",
          "أسعار بالدرهم",
          "تجزئة وجملة",
          "هدايا الشركات",
          "توريد للأعمال",
          "تخصيص بالعربية والإنجليزية",
          "بدعم منصّة GiftMajlis",
          "توصيل لكل الإمارات",
          "فاتورة عند الطلب",
        ];
  return <Marquee items={items} />;
}

// Stats Strip
function StatsStrip({ lang }: { lang: "en" | "ar" }) {
  const stats = lang === "en"
    ? [
        { value: 200, suffix: "+", label: "Products curated" },
        { value: 7, suffix: "/7", label: "Emirates served" },
        { value: 100, suffix: "%", label: "AED transparent pricing" },
        { value: 24, suffix: "h", label: "Typical WhatsApp response" },
      ]
    : [
        { value: 200, suffix: "+", label: "منتج مختار" },
        { value: 7, suffix: "/7", label: "إمارات مخدومة" },
        { value: 100, suffix: "%", label: "أسعار شفافة بالدرهم" },
        { value: 24, suffix: "س", label: "زمن الرد المعتاد عبر واتساب" },
      ];

  return (
    <section className="bg-beyond-ivory border-b border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Why Beyond Gallery pillars
function Pillars({ lang }: { lang: "en" | "ar" }) {
  const pillars = lang === "en"
    ? [
        {
          icon: SparkleIcon,
          title: "Curated, not catalogued",
          body: "Every category is hand picked for style, gifting and personal expression. No random imports.",
        },
        {
          icon: WhatsAppIcon,
          title: "One thread, full answers",
          body: "Ask, see real photos, confirm AED price, agree on delivery, and order. All inside a single WhatsApp chat.",
        },
        {
          icon: ShieldIcon,
          title: "Honest by default",
          body: "No fake reviews, no fake stock countdowns, no inflated luxury claims. Only what we can verify.",
        },
        {
          icon: BriefcaseIcon,
          title: "Retail and B2B in one majlis",
          body: "Personal gifts on the same brand as corporate gifting packs and supply desk RFQs.",
        },
      ]
    : [
        {
          icon: SparkleIcon,
          title: "اختيار يدوي وليس كتالوج",
          body: "كل تصنيف يُختار يدوياً لأناقته وقيمته كهدية وتعبيره الشخصي. بدون استيراد عشوائي.",
        },
        {
          icon: WhatsAppIcon,
          title: "محادثة واحدة بإجابات كاملة",
          body: "اسأل، شاهد صوراً حقيقية، وأكّد السعر بالدرهم، واتفق على التوصيل، واطلب. كل ذلك ضمن محادثة واتساب واحدة.",
        },
        {
          icon: ShieldIcon,
          title: "صدق افتراضي",
          body: "بدون تقييمات مزيّفة ولا عدادات مخزون وهمية ولا ادعاءات فخامة مبالغ بها. فقط ما يمكننا توثيقه.",
        },
        {
          icon: BriefcaseIcon,
          title: "تجزئة وأعمال في مكان واحد",
          body: "هدايا شخصية ضمن نفس العلامة التي تخدم أطقم هدايا الشركات وطلبات قسم التوريد.",
        },
      ];

  return (
    <section className="bg-beyond-white border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-14 sm:py-20">
        <Reveal className="text-center mb-10">
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Why Beyond Gallery" : "لماذا بيوند جاليري"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal beyond-ornament ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "A different kind of gift store." : "متجر هدايا مختلف."}
          </h2>
        </Reveal>

        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, i) => (
            <StaggerItem key={i}>
              <div className="beyond-lift h-full rounded-3xl bg-beyond-ivory border border-beyond-line p-5 sm:p-6 hover:border-beyond-gold beyond-grad-border">
                <div className="w-11 h-11 rounded-2xl bg-white border border-beyond-line flex items-center justify-center text-beyond-gold">
                  <p.icon className="w-5 h-5" />
                </div>
                <div className={`mt-4 font-display text-[18px] font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
                  {p.title}
                </div>
                <p className={`mt-2 text-[13.5px] text-beyond-charcoal/75 leading-relaxed ${lang === "ar" ? "font-arabic" : ""}`}>
                  {p.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// Trust Strip
function TrustStrip({ lang }: { lang: "en" | "ar" }) {
  const items = lang === "en"
    ? [
        { icon: PinIcon, title: "Dubai Based", body: "Operated in Dubai under BEYOND CONNECT GENERAL TRADING L.L.C." },
        { icon: WhatsAppIcon, title: "WhatsApp Support", body: "Ask, confirm and order directly." },
        { icon: TagIcon, title: "AED Pricing", body: "Clear UAE pricing including 5 percent VAT before order confirmation." },
        { icon: GiftIcon, title: "Gift Ready", body: "Selected items available with gift style packaging." },
        { icon: BriefcaseIcon, title: "Corporate Orders", body: "Bulk supply and quotation support for companies and events." },
      ]
    : [
        { icon: PinIcon, title: "علامة من دبي", body: "تُدار في دبي ضمن شركة بيوند كونكت للتجارة العامة ذ.م.م." },
        { icon: WhatsAppIcon, title: "دعم واتساب", body: "استفسر وأكّد واطلب مباشرة." },
        { icon: TagIcon, title: "أسعار بالدرهم", body: "أسعار واضحة شاملة ضريبة القيمة المضافة 5% قبل تأكيد الطلب." },
        { icon: GiftIcon, title: "جاهزة للإهداء", body: "منتجات مختارة مع تغليف هدايا أنيق." },
        { icon: BriefcaseIcon, title: "طلبات الشركات", body: "دعم التوريد والعروض للشركات والفعاليات." },
      ];

  return (
    <section className="bg-beyond-white border-y border-beyond-line">
      <Stagger className="max-w-7xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {items.map((it, i) => (
          <StaggerItem
            key={i}
            className="beyond-lift rounded-2xl bg-beyond-ivory border border-beyond-line p-4 sm:p-5 flex flex-col gap-2 hover:border-beyond-gold hover:beyond-card-shadow"
          >
            <div className="w-9 h-9 rounded-full bg-white border border-beyond-line flex items-center justify-center text-beyond-gold">
              <it.icon className="w-4 h-4" />
            </div>
            <div className={`font-display text-[15px] font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
              {it.title}
            </div>
            <div className={`text-[12.5px] text-beyond-charcoal/70 leading-relaxed ${lang === "ar" ? "font-arabic" : ""}`}>
              {it.body}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// Platform Strip (GiftMajlis)
function PlatformStrip({ lang }: { lang: "en" | "ar" }) {
  const points =
    lang === "en"
      ? [
          { k: "1", t: "Discover", d: "Curated retail and corporate catalogues in one majlis." },
          { k: "2", t: "Ask", d: "One WhatsApp thread for photos, sizes, AED prices and delivery." },
          { k: "3", t: "Order", d: "Retail in seconds. Bulk and supply via formal quotation." },
        ]
      : [
          { k: "١", t: "اكتشف", d: "تشكيلات تجزئة وشركات مختارة في مكان واحد." },
          { k: "٢", t: "اسأل", d: "محادثة واتساب واحدة للصور والمقاسات والأسعار والتوصيل." },
          { k: "٣", t: "اطلب", d: "بالتجزئة بثوانٍ، وللجملة عبر عرض رسمي." },
        ];

  return (
    <section className="bg-beyond-ivory">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <Reveal>
          <div className="rounded-3xl bg-white border border-beyond-line p-6 sm:p-10 beyond-card-shadow relative overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-20 -end-20 w-72 h-72 rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(182,138,53,0.12), transparent)" }}
            />
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center relative">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-beyond-charcoal text-beyond-ivory text-[11px] tracking-[0.22em] uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-beyond-gold" />
                  {lang === "en" ? "The Platform" : "المنصّة"}
                </div>
                <h2 className={`mt-4 font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal leading-tight ${lang === "ar" ? "font-arabic-display" : ""}`}>
                  {lang === "en" ? (
                    <>
                      Built on{" "}
                      <span className="beyond-gold-gradient">GiftMajlis</span>
                      <span className="block text-[18px] sm:text-[22px] text-beyond-charcoal/65 font-normal mt-2">
                        The UAE WhatsApp first gathering point for curated
                        gifting and B2B sourcing.
                      </span>
                    </>
                  ) : (
                    <>
                      مبنيّة على{" "}
                      <span className="beyond-gold-gradient">GiftMajlis</span>
                      <span className="block text-[18px] sm:text-[22px] text-beyond-charcoal/65 font-normal mt-2 font-arabic">
                        نقطة التجمّع الإماراتية الأولى عبر واتساب للهدايا
                        المختارة والتوريد للشركات.
                      </span>
                    </>
                  )}
                </h2>
                <p className={`mt-4 text-[14.5px] leading-relaxed text-beyond-charcoal/75 max-w-xl ${lang === "ar" ? "font-arabic" : ""}`}>
                  {lang === "en"
                    ? "Hunting for trustworthy gifts and supplies in the UAE means jumping between WhatsApp, Noon, Amazon and Instagram. GiftMajlis brings it into one majlis. Beyond Gallery is the flagship storefront, with retail, corporate and supply requests handled in a single curated thread."
                    : "البحث عن هدايا وتوريد موثوق في الإمارات يعني التنقل بين واتساب ونون وأمازون وإنستغرام. تجمعها منصّة GiftMajlis في مكان واحد، وتظل بيوند جاليري الواجهة الرئيسية، مع تجزئة وشركات وتوريد بمحادثة واحدة مختارة."}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {points.map((p) => (
                  <motion.div
                    key={p.t}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="rounded-2xl bg-beyond-ivory border border-beyond-line p-4"
                  >
                    <div className="w-9 h-9 rounded-full bg-beyond-charcoal text-beyond-gold flex items-center justify-center font-display font-semibold">
                      {p.k}
                    </div>
                    <div className={`mt-3 font-display text-[16px] font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
                      {p.t}
                    </div>
                    <div className={`mt-1 text-[12.5px] text-beyond-charcoal/70 leading-snug ${lang === "ar" ? "font-arabic" : ""}`}>
                      {p.d}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Collections

type Collection = {
  key: string;
  title: string;
  titleAr: string;
  icon: (p: any) => JSX.Element;
  items: { en: string[]; ar: string[] };
  copy: { en: string; ar: string };
  cta: { en: string; ar: string };
  href: string;
  accent: string;
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
        "إسوارات بتمائم",
        "إسوارات بأحرف عربية",
        "إسوارات الكف",
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
    cta: { en: "View Accessories", ar: "تصفّح الإكسسوارات" },
    href: "#featured",
    accent: "from-[#F4E7C2] to-[#F8EFD4]",
    preview: "arabic-bracelet",
  },
  {
    key: "gifts",
    title: "Personalised Gifts",
    titleAr: "هدايا مخصّصة",
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
        "إكسسوارات مخصّصة",
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
    cta: { en: "View Lifestyle Items", ar: "تصفّح أسلوب الحياة" },
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
        "Lapel pins and badges",
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
        "صناديق هدايا مميّزة",
        "دبابيس وشارات",
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
    titleAr: "قسم التوريد، بيوند كونكت",
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
        <Reveal className="text-center mb-10 sm:mb-14">
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Collections" : "التصنيفات"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal beyond-ornament ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "Shop by Collection" : "تسوّق حسب التصنيف"}
          </h2>
        </Reveal>

        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {COLLECTIONS.map((c) => {
            const isDark = c.key === "corporate" || c.key === "supply";
            return (
              <StaggerItem key={c.key}>
                <a
                  href={c.href}
                  className={`group beyond-grad-border beyond-lift block rounded-3xl overflow-hidden border ${
                    isDark ? "border-transparent" : "border-beyond-line"
                  } beyond-card-shadow hover:beyond-card-shadow-hover transition-shadow bg-white`}
                >
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
                      } ${lang === "ar" ? "font-arabic-display" : ""}`}
                    >
                      {lang === "en" ? c.title : c.titleAr}
                    </h3>
                    <p
                      className={`mt-2 text-[13.5px] leading-relaxed ${
                        isDark ? "text-beyond-ivory/80" : "text-beyond-charcoal/70"
                      } ${lang === "ar" ? "font-arabic" : ""}`}
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
                          } ${lang === "ar" ? "font-arabic" : ""}`}
                        >
                          {it}
                        </li>
                      ))}
                      {(lang === "en" ? c.items.en : c.items.ar).length > 6 && (
                        <li className="text-[11.5px] px-2.5 py-1 rounded-full text-beyond-gold">
                          +{(lang === "en" ? c.items.en : c.items.ar).length - 6}{" "}
                          {lang === "en" ? "more" : "أكثر"}
                        </li>
                      )}
                    </ul>

                    <div className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-beyond-gold">
                      {lang === "en" ? c.cta.en : c.cta.ar}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:flip-x" />
                    </div>
                  </div>
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

// Featured Products with filter + search + Quick View

type Category = "accessories" | "gifts" | "boards" | "corporate" | "lifestyle";
type Stock = "in" | "made_to_order" | "bespoke";

type Product = QuickViewProduct & {
  id: string;
  category: Category;
  stock: Stock;
  leadDays?: string;
  ribbon?: Ribbon;
};

const FEATURED: Product[] = [
  { id: "arabic-charm", name: "Arabic Charm Bracelet", nameAr: "إسوارة بأحرف عربية", benefit: "Personalise with Arabic letters or name.", benefitAr: "خصّصها بأحرف أو اسم عربي.", price: "AED 65", variant: "arabic-bracelet", category: "accessories", stock: "in", ribbon: "bestseller" },
  { id: "name-bracelet", name: "Personalised Name Bracelet", nameAr: "إسوارة الاسم", benefit: "Custom name in English or Arabic.", benefitAr: "اسم مخصّص بالعربية أو الإنجليزية.", price: "AED 75", variant: "name-bracelet", category: "gifts", stock: "made_to_order", leadDays: "3 to 5 days", ribbon: "custom" },
  { id: "hamsa", name: "Hamsa and Evil Eye Bracelet", nameAr: "إسوارة الكف والعين", benefit: "Symbolic everyday wear.", benefitAr: "رمزية للارتداء اليومي.", price: "AED 55", variant: "hamsa", category: "accessories", stock: "in" },
  { id: "necklace", name: "Premium Necklace Set", nameAr: "طقم قلائد فاخر", benefit: "Elegant pendant and chain set.", benefitAr: "طقم قلادة بسلسلة أنيقة.", price: "AED 145", variant: "necklace", category: "accessories", stock: "in", ribbon: "new" },
  { id: "gift-box", name: "Elegant Gift Box Set", nameAr: "طقم صندوق هدية أنيق", benefit: "Ready to gift packaging.", benefitAr: "تغليف جاهز للإهداء.", price: "AED 120", variant: "gift-box", category: "gifts", stock: "in", ribbon: "bestseller" },
  { id: "drawing-board", name: "Creative Drawing Board", nameAr: "لوحة رسم إبداعية", benefit: "Reusable, ideal for kids and students.", benefitAr: "قابلة لإعادة الاستخدام للأطفال والطلاب.", price: "AED 89", variant: "drawing-board", category: "boards", stock: "in" },
  { id: "notebook", name: "A5 Branded Notebook", nameAr: "دفتر A5 مع الشعار", benefit: "Hardcover with brand printing option.", benefitAr: "غلاف فاخر مع خيار طباعة الشعار.", price: "AED 35", variant: "notebook", category: "corporate", stock: "made_to_order", leadDays: "5 to 7 days", ribbon: "custom" },
  { id: "pen", name: "Metal Gift Pen", nameAr: "قلم معدني للهدايا", benefit: "Smooth writing, gift ready.", benefitAr: "كتابة سلسة وجاهز للإهداء.", price: "AED 25", variant: "pen", category: "corporate", stock: "in" },
  { id: "tote", name: "Canvas Gift Tote Bag", nameAr: "حقيبة قماشية", benefit: "Reusable canvas tote with logo option.", benefitAr: "حقيبة قابلة لإعادة الاستخدام مع خيار الشعار.", price: "AED 30", variant: "tote", category: "corporate", stock: "in" },
  { id: "mug", name: "Ceramic Gift Mug", nameAr: "كوب سيراميك", benefit: "Ideal for offices and giveaways.", benefitAr: "مناسب للمكاتب والفعاليات.", price: "AED 28", variant: "mug", category: "corporate", stock: "in", ribbon: "new" },
  { id: "vip-box", name: "Corporate VIP Gift Pack", nameAr: "طقم هدايا مميّز للشركات", benefit: "Curated executive presentation.", benefitAr: "تشكيلة تنفيذية مختارة.", price: "AED 250", variant: "vip-box", category: "corporate", stock: "bespoke", leadDays: "7 to 10 days", ribbon: "limited" },
  { id: "desk-decor", name: "Lifestyle Desk Decor", nameAr: "ديكور مكتب", benefit: "Charming desk accents.", benefitAr: "لمسات أنيقة للمكتب.", price: "AED 95", variant: "desk-decor", category: "lifestyle", stock: "in" },
];

const FILTER_TABS: { key: Category | "all"; en: string; ar: string }[] = [
  { key: "all", en: "All", ar: "الكل" },
  { key: "accessories", en: "Accessories", ar: "إكسسوارات" },
  { key: "gifts", en: "Gifts", ar: "هدايا" },
  { key: "boards", en: "Boards", ar: "لوحات" },
  { key: "corporate", en: "Corporate", ar: "شركات" },
  { key: "lifestyle", en: "Lifestyle", ar: "أسلوب حياة" },
];

function StockBadge({ stock, lang, leadDays }: { stock: Stock; lang: "en" | "ar"; leadDays?: string }) {
  const map = {
    in: { en: "In stock", ar: "متوفر", c: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    made_to_order: { en: "Made to order", ar: "يُصنع عند الطلب", c: "bg-amber-50 text-amber-800 border-amber-200" },
    bespoke: { en: "Bespoke", ar: "خاص بحسب الطلب", c: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  } as const;
  const cfg = map[stock];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-1 rounded-full border ${cfg.c}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {lang === "en" ? cfg.en : cfg.ar}
      {leadDays && <span className="opacity-70 ms-1">{lang === "en" ? leadDays : leadDays.replace("days", "أيام").replace("to", "إلى")}</span>}
    </span>
  );
}

function FeaturedProducts({
  lang,
  onQuickView,
}: {
  lang: "en" | "ar";
  onQuickView: (p: QuickViewProduct) => void;
}) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const { isWished, toggleWish, trackView } = useWishlist();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FEATURED.filter((p) => {
      const okCat = filter === "all" || p.category === filter;
      if (!okCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.benefit.toLowerCase().includes(q) ||
        p.category.includes(q)
      );
    });
  }, [filter, query]);

  const open = (p: Product) => {
    trackView(p.id);
    onQuickView(p);
  };

  return (
    <section id="featured" className="bg-beyond-white border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="beyond-divider mb-3">
              {lang === "en" ? "Featured" : "مميز"}
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
              {lang === "en" ? "Featured Picks" : "اختيارات مميزة"}
            </h2>
            <p className="font-arabic text-beyond-charcoal/70 mt-1 text-[15px]">
              اختيارات مميزة
            </p>
          </div>
          <div className={`text-[12px] text-beyond-charcoal/60 max-w-md ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "Prices and availability are confirmed before order completion. Bulk prices depend on quantity, branding, stock and delivery location."
              : "تُؤكَّد الأسعار والتوفر قبل إتمام الطلب. تعتمد أسعار الجملة على الكمية والطباعة والمخزون وموقع التوصيل."}
          </div>
        </Reveal>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-beyond-ivory border border-beyond-line rounded-full px-4 py-2.5">
            <SearchIcon className="w-4 h-4 text-beyond-charcoal/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "en" ? "Search by product or category" : "ابحث عن منتج أو تصنيف"}
              className="bg-transparent outline-none text-[13px] w-full text-beyond-charcoal placeholder:text-beyond-charcoal/50"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={lang === "en" ? "Clear search" : "مسح البحث"}
                className="text-beyond-charcoal/50 hover:text-beyond-charcoal"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] border transition-colors ${
                    active
                      ? "bg-beyond-charcoal text-beyond-ivory border-beyond-charcoal"
                      : "bg-beyond-ivory border-beyond-line text-beyond-charcoal/80 hover:border-beyond-gold"
                  } ${lang === "ar" ? "font-arabic" : ""}`}
                >
                  {lang === "en" ? tab.en : tab.ar}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className={`text-center py-12 text-beyond-charcoal/60 text-[14px] ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en" ? "No products match your search." : "لا توجد منتجات مطابقة لبحثك."}
            <div className="mt-3">
              <a
                href={buildWALink(`Hello Beyond Gallery, I am looking for: ${query || filter}.`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-beyond-emerald text-white text-[12.5px] font-semibold"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                {lang === "en" ? "Ask us on WhatsApp" : "اسألنا عبر واتساب"}
              </a>
            </div>
          </div>
        )}

        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {filtered.map((p) => {
            const message = `Hello Beyond Gallery, I am interested in this product.\nProduct Name: ${p.name}\nQuantity: \nDelivery Emirate: \nCustomisation required: \nPlease confirm price and availability.`;
            const wished = isWished(p.id);
            return (
              <StaggerItem key={p.id}>
                <article className="beyond-tilt rounded-2xl bg-white border border-beyond-line overflow-hidden beyond-card-shadow hover:beyond-card-shadow-hover transition-shadow group h-full flex flex-col">
                  <div className="relative">
                    <ProductTile variant={p.variant} ribbon={p.ribbon} lang={lang} />
                    <div className="absolute top-3 end-3 flex items-center gap-1">
                      <StockBadge stock={p.stock} leadDays={p.leadDays} lang={lang} />
                    </div>
                    <button
                      onClick={() => toggleWish(p.id, lang === "en" ? p.name : p.nameAr)}
                      aria-label={lang === "en" ? "Save to wishlist" : "أضف للمفضّلة"}
                      className={`absolute bottom-3 end-3 w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                        wished
                          ? "bg-beyond-gold text-white border-beyond-gold"
                          : "bg-white border-beyond-line text-beyond-charcoal/50 hover:text-beyond-gold hover:border-beyond-gold"
                      }`}
                    >
                      <HeartIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
                    <h3 className={`font-display text-[14.5px] sm:text-[16px] font-semibold text-beyond-charcoal line-clamp-1 ${lang === "ar" ? "font-arabic-display" : ""}`}>
                      {lang === "en" ? p.name : p.nameAr}
                    </h3>
                    <p className={`mt-1 text-[12px] text-beyond-charcoal/65 line-clamp-2 min-h-[2.4em] ${lang === "ar" ? "font-arabic" : ""}`}>
                      {lang === "en" ? p.benefit : p.benefitAr}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="text-beyond-gold font-display font-semibold">{p.price}</div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => open(p)}
                        className="text-[11.5px] font-semibold px-2.5 py-2 rounded-full bg-beyond-charcoal text-beyond-ivory hover:opacity-95"
                      >
                        {lang === "en" ? "Quick View" : "نظرة سريعة"}
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
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

// Recently viewed
function RecentlyViewed({ lang, onQuickView }: { lang: "en" | "ar"; onQuickView: (p: QuickViewProduct) => void }) {
  const { recents } = useWishlist();
  const items = recents
    .map((id) => FEATURED.find((p) => p.id === id))
    .filter(Boolean) as Product[];
  if (items.length === 0) return null;
  return (
    <section className="bg-beyond-white border-b border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <Reveal>
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Recently Viewed" : "شاهدت مؤخّراً"}
          </div>
          <h2 className={`font-display text-2xl sm:text-3xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "Pick up where you left off." : "تابع من حيث توقّفت."}
          </h2>
        </Reveal>
        <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {items.map((p) => (
            <button
              key={p.id}
              onClick={() => onQuickView(p)}
              className="shrink-0 w-40 text-start rounded-2xl bg-beyond-ivory border border-beyond-line beyond-lift hover:border-beyond-gold overflow-hidden"
            >
              <ProductTile variant={p.variant} ribbon={p.ribbon} lang={lang} />
              <div className="p-3">
                <div className={`font-display text-[13px] font-semibold text-beyond-charcoal line-clamp-1 ${lang === "ar" ? "font-arabic-display" : ""}`}>
                  {lang === "en" ? p.name : p.nameAr}
                </div>
                <div className="text-beyond-gold text-[12px] font-semibold mt-0.5">{p.price}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// Customisation preview: type a name, see it on a bracelet plate
function Customisation({ lang }: { lang: "en" | "ar" }) {
  const [name, setName] = useState("Beyond");
  const [tone, setTone] = useState<"gold" | "emerald" | "navy">("gold");
  const tones = {
    gold: { bg: "#B68A35", text: "#FAF8F1" },
    emerald: { bg: "#1F6F5B", text: "#FAF8F1" },
    navy: { bg: "#171C8F", text: "#E2C079" },
  } as const;

  const message = `Hello Beyond Gallery, I would like a personalised piece.\nName or text: ${name || "(your text)"}\nFinish: ${tone}\nProduct: Name Bracelet\nQuantity: \nDelivery Emirate: \nPlease confirm price and lead time.`;

  return (
    <section className="bg-beyond-ivory border-b border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
        <Reveal>
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Personalise" : "خصّص"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "Type a name. Preview your piece." : "اكتب اسماً، شاهد قطعتك."}
          </h2>
          <p className={`mt-3 text-[14.5px] text-beyond-charcoal/75 leading-relaxed max-w-md ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "Try a name in English or Arabic, choose a finish, and send your preferences to WhatsApp for confirmation."
              : "جرّب اسماً بالعربية أو الإنجليزية، اختر اللون، ثم أرسل تفضيلاتك إلى واتساب لتأكيد السعر ومدة التحضير."}
          </p>

          <div className="mt-5 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 14))}
              maxLength={14}
              className="w-full rounded-xl border border-beyond-line bg-white px-4 py-3 text-[15px] outline-none focus:border-beyond-gold"
              placeholder={lang === "en" ? "Type a name or word" : "اكتب اسماً أو كلمة"}
            />
            <div className="flex items-center gap-2">
              {(["gold", "emerald", "navy"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-[12.5px] font-semibold ${
                    tone === t
                      ? "border-beyond-gold bg-white"
                      : "border-beyond-line bg-white hover:border-beyond-gold/50"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block"
                    style={{ background: tones[t].bg }}
                  />
                  {t === "gold" ? (lang === "en" ? "Gold" : "ذهبي") : t === "emerald" ? (lang === "en" ? "Emerald" : "زمرّدي") : (lang === "en" ? "Navy" : "كحلي")}
                </button>
              ))}
            </div>
            <a
              href={buildWALink(message)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-beyond-emerald text-white text-[13px] font-semibold beyond-wa-pulse"
            >
              <WhatsAppIcon className="w-4 h-4" />
              {lang === "en" ? "Send my design to WhatsApp" : "أرسل تصميمي إلى واتساب"}
            </a>
            <p className="text-[11.5px] text-beyond-charcoal/55">
              {lang === "en"
                ? "Preview is illustrative. Final visual is confirmed on WhatsApp."
                : "المعاينة توضيحية، ويُعتمد الشكل النهائي عبر واتساب."}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative bg-white rounded-3xl p-6 sm:p-10 border border-beyond-line beyond-card-shadow flex items-center justify-center min-h-[260px]">
            <svg viewBox="0 0 360 180" className="w-full max-w-md">
              <defs>
                <linearGradient id="cust-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#E2C079" />
                  <stop offset=".5" stopColor={tones[tone].bg} />
                  <stop offset="1" stopColor="#8B6722" />
                </linearGradient>
              </defs>
              <ellipse cx="180" cy="90" rx="160" ry="40" fill="none" stroke="url(#cust-grad)" strokeWidth="5" />
              <rect x="100" y="74" width="160" height="32" rx="10" fill={tones[tone].bg} />
              <text x="180" y="96" textAnchor="middle" fontFamily="Fraunces, Cormorant Garamond, serif" fontSize="22" fill={tones[tone].text} fontWeight="700">
                {(name || "Beyond").toUpperCase()}
              </text>
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Multi step Gift Quiz wizard
function GiftQuiz({ lang }: { lang: "en" | "ar" }) {
  const steps = lang === "en"
    ? [
        { key: "for", q: "Who is this for?", opts: ["Her", "Him", "Kids", "Office team", "Event guests"] },
        { key: "occasion", q: "What is the occasion?", opts: ["Birthday", "Anniversary", "Appreciation", "Onboarding", "National Day", "Eid", "Just because"] },
        { key: "budget", q: "What is the budget per gift?", opts: ["Under AED 50", "AED 50 to 150", "AED 150 to 300", "Premium 300 plus", "Bulk corporate"] },
        { key: "branding", q: "Need branding or personalisation?", opts: ["Personal name", "Company logo", "Both", "No customisation"] },
      ]
    : [
        { key: "for", q: "لمن الهدية؟", opts: ["لها", "له", "للأطفال", "لفريق المكتب", "لضيوف فعالية"] },
        { key: "occasion", q: "ما المناسبة؟", opts: ["عيد ميلاد", "ذكرى سنوية", "تقدير", "ترحيب بموظف", "اليوم الوطني", "العيد", "بلا مناسبة"] },
        { key: "budget", q: "ما الميزانية لكل هدية؟", opts: ["أقل من 50 درهم", "من 50 إلى 150 درهم", "من 150 إلى 300 درهم", "فاخر 300 درهم فأكثر", "جملة للشركات"] },
        { key: "branding", q: "هل تحتاج طباعة شعار أو تخصيصاً؟", opts: ["اسم شخصي", "شعار شركة", "كلاهما", "بدون تخصيص"] },
      ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const pick = (v: string) => {
    const key = steps[step].key;
    const next = { ...answers, [key]: v };
    setAnswers(next);
    if (step < steps.length - 1) setStep(step + 1);
  };

  const finished = Object.keys(answers).length === steps.length;
  const message = lang === "en"
    ? `Hello Beyond Gallery, please help me choose a gift.\nFor: ${answers.for || ""}\nOccasion: ${answers.occasion || ""}\nBudget: ${answers.budget || ""}\nBranding: ${answers.branding || ""}\nDelivery Emirate: `
    : `مرحباً بيوند جاليري، أحتاج اقتراحاً لهدية.\nلمن: ${answers.for || ""}\nالمناسبة: ${answers.occasion || ""}\nالميزانية: ${answers.budget || ""}\nالتخصيص: ${answers.branding || ""}\nإمارة التوصيل: `;

  const reset = () => { setStep(0); setAnswers({}); };

  return (
    <section id="gift-finder" className="bg-beyond-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
        <Reveal className="text-center">
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Gift Quiz" : "اختر هديتك"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "Not sure what to buy?" : "محتار في الاختيار؟"}
          </h2>
          <p className="font-arabic text-beyond-charcoal/70 mt-2 text-[15px]">
            خلينا نساعدك تختار الهدية المناسبة
          </p>
        </Reveal>

        <Reveal className="mt-8 bg-beyond-ivory rounded-3xl beyond-card-shadow border border-beyond-line p-5 sm:p-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${
                  i <= step ? "bg-beyond-gold" : "bg-beyond-line"
                }`}
              />
            ))}
          </div>

          {!finished ? (
            <>
              <div className={`text-[12.5px] uppercase tracking-[0.18em] text-beyond-gold font-semibold mb-2 ${lang === "ar" ? "font-arabic" : ""}`}>
                {lang === "en" ? `Step ${step + 1} of ${steps.length}` : `خطوة ${step + 1} من ${steps.length}`}
              </div>
              <h3 className={`font-display text-2xl sm:text-3xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
                {steps[step].q}
              </h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {steps[step].opts.map((o) => (
                  <motion.button
                    key={o}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => pick(o)}
                    className={`px-4 py-2.5 rounded-full text-[13.5px] font-medium border bg-white text-beyond-charcoal border-beyond-line hover:border-beyond-gold hover:bg-beyond-ivory ${lang === "ar" ? "font-arabic" : ""}`}
                  >
                    {o}
                  </motion.button>
                ))}
              </div>
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="mt-5 text-[12.5px] text-beyond-charcoal/65 hover:text-beyond-gold inline-flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5 rtl:flip-x rotate-180" />
                  {lang === "en" ? "Back" : "السابق"}
                </button>
              )}
            </>
          ) : (
            <div>
              <h3 className={`font-display text-2xl sm:text-3xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
                {lang === "en" ? "Great. Let us recommend on WhatsApp." : "ممتاز، خلّنا نقترح عليك عبر واتساب."}
              </h3>
              <ul className={`mt-4 grid sm:grid-cols-2 gap-2 ${lang === "ar" ? "font-arabic" : ""}`}>
                {steps.map((s) => (
                  <li
                    key={s.key}
                    className="flex items-center justify-between gap-3 bg-white border border-beyond-line rounded-xl px-3.5 py-2.5 text-[13px]"
                  >
                    <span className="text-beyond-charcoal/65">{s.q}</span>
                    <span className="font-semibold text-beyond-charcoal">{answers[s.key]}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={buildWALink(message)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-beyond-emerald text-white text-[13px] font-semibold beyond-wa-pulse"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  {lang === "en" ? "Send to WhatsApp" : "أرسل إلى واتساب"}
                </a>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-beyond-line text-beyond-charcoal text-[13px] font-semibold hover:border-beyond-gold"
                >
                  {lang === "en" ? "Start over" : "إعادة"}
                </button>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

// Shop with Confidence
function ShopWithConfidence({ lang }: { lang: "en" | "ar" }) {
  const points = lang === "en"
    ? [
        "Clear product description",
        "Real product photos where possible",
        "Prices shown in AED including 5 percent VAT",
        "Delivery confirmed before order",
        "Invoice available upon request",
        "Return and exchange policy available",
        "No misleading brand or material claims",
        "WhatsApp support before and after order",
      ]
    : [
        "وصف واضح للمنتج",
        "صور حقيقية للمنتجات عند الإمكان",
        "الأسعار بالدرهم شاملة ضريبة القيمة المضافة 5%",
        "تأكيد التوصيل قبل الطلب",
        "فاتورة عند الطلب",
        "سياسة استرجاع واستبدال متاحة",
        "بدون ادعاءات مضلّلة عن العلامات أو الخامات",
        "دعم واتساب قبل وبعد الطلب",
      ];

  return (
    <section className="bg-beyond-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Confidence" : "ثقة"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "Shop with Confidence" : "تسوّق بثقة"}
          </h2>
          <p className="font-arabic text-beyond-charcoal/70 mt-2 text-[15px]">
            تسوق بثقة
          </p>
          <p className={`mt-4 text-[15px] leading-relaxed text-beyond-charcoal/75 max-w-xl ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "We keep product information clear before purchase. You can ask for extra photos, product details, delivery options and availability before confirming your order."
              : "نحرص على وضوح معلومات المنتج قبل الشراء. يمكنك طلب صور إضافية وتفاصيل أوسع وخيارات توصيل وتأكيد توفّر قبل اعتماد الطلب."}
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
              <span className={`text-[13.5px] text-beyond-charcoal/85 leading-snug ${lang === "ar" ? "font-arabic" : ""}`}>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Marketplace
function Marketplace({ lang }: { lang: "en" | "ar" }) {
  return (
    <section id="marketplace" className="bg-beyond-ivory border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-14 sm:py-16">
        <div className="rounded-3xl bg-white border border-beyond-line p-6 sm:p-10 beyond-card-shadow grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="beyond-divider mb-3">
              {lang === "en" ? "Where to Buy" : "أين تشتري"}
            </div>
            <h2 className={`font-display text-2xl sm:text-3xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
              {lang === "en"
                ? "Available Through Direct Order and UAE Marketplaces"
                : "متاح عبر الطلب المباشر ومتاجر الإمارات"}
            </h2>
            <p className={`mt-3 text-[14.5px] text-beyond-charcoal/75 max-w-xl leading-relaxed ${lang === "ar" ? "font-arabic" : ""}`}>
              {lang === "en"
                ? "Selected products may be available through direct WhatsApp order, Noon UAE, Amazon UAE or approved sales channels depending on listing and stock status."
                : "قد تتوفّر منتجات مختارة عبر الطلب المباشر على واتساب أو متجر نون الإمارات أو أمازون الإمارات أو قنوات بيع معتمدة، حسب التوفر والمخزون."}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 w-full md:w-auto">
            <a
              href={NOON_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-ivory border border-beyond-line text-beyond-charcoal text-[13px] font-semibold hover:border-beyond-gold beyond-focus"
            >
              <TagIcon className="w-4 h-4 text-beyond-gold" />
              {lang === "en" ? "Visit Noon UAE Store" : "زر متجر نون"}
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-ivory border border-beyond-line text-beyond-charcoal text-[13px] font-semibold hover:border-beyond-gold beyond-focus"
            >
              <InstagramIcon className="w-4 h-4 text-beyond-gold" />
              {lang === "en" ? "Browse on Instagram" : "تابعنا على إنستغرام"}
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-ivory border border-beyond-line text-beyond-charcoal text-[13px] font-semibold hover:border-beyond-gold beyond-focus"
            >
              <TikTokIcon className="w-4 h-4 text-beyond-gold" />
              {lang === "en" ? "Watch on TikTok" : "شاهدنا على تيك توك"}
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

// Corporate Orders + form

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
        { t: "صناديق هدايا مميّزة", v: "vip-box" as Variant },
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
              {lang === "en" ? "Corporate and Bulk" : "شركات وجملة"}
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight ${lang === "ar" ? "font-arabic-display" : ""}`}>
              {lang === "en"
                ? "Corporate Gifts and Bulk Supply Requests"
                : "هدايا الشركات وطلبات التوريد بالجملة"}
            </h2>
            <p className={`mt-4 text-beyond-ivory/85 text-[15px] leading-relaxed max-w-xl ${lang === "ar" ? "font-arabic" : ""}`}>
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
                  <div className={`mt-1 text-[12.5px] font-semibold ${lang === "ar" ? "font-arabic" : ""}`}>{it.t}</div>
                </div>
              ))}
            </div>

            <ul className={`mt-7 grid grid-cols-2 gap-2 text-[12.5px] text-beyond-ivory/85 ${lang === "ar" ? "font-arabic" : ""}`}>
              {(lang === "en"
                ? ["Custom branding", "Premium packaging", "UAE wide delivery", "Invoice on request"]
                : ["طباعة مخصّصة", "تغليف فاخر", "توصيل لكل الإمارات", "فاتورة عند الطلب"]
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
  const fields = lang === "en"
    ? {
        title: "Request Formal Quotation",
        subtitle: "Submit and we will continue on WhatsApp with availability, pricing and delivery options.",
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
        submit: "Send via WhatsApp",
      }
    : {
        title: "اطلب عرض سعر رسمي",
        subtitle: "أرسل الطلب وسنكمل عبر واتساب بالأسعار والتوفر وخيارات التوصيل.",
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
        submit: "أرسل عبر واتساب",
      };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data: Record<string, string> = {};
        fd.forEach((v, k) => { if (typeof v === "string") data[k] = v; });
        const url = buildWALink(formToWA("I would like to request a formal corporate quotation.", data));
        window.open(url, "_blank", "noopener,noreferrer");
        toast(lang === "en" ? "Opening WhatsApp." : "جارٍ فتح واتساب.");
      }}
      className="bg-white text-beyond-charcoal rounded-3xl p-5 sm:p-7 beyond-card-shadow"
    >
      <h3 className={`font-display text-[22px] sm:text-2xl font-semibold ${lang === "ar" ? "font-arabic-display" : ""}`}>
        {fields.title}
      </h3>
      <p className={`text-[12.5px] text-beyond-charcoal/65 mt-1 ${lang === "ar" ? "font-arabic" : ""}`}>{fields.subtitle}</p>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <Input name="Full Name" label={fields.fullName} required />
        <Input name="Company" label={fields.company} required />
        <Input name="Mobile" label={fields.mobile} type="tel" required />
        <Input name="Email" label={fields.email} type="email" />
        <Select
          name="Category"
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
                  "صناديق هدايا مميّزة",
                  "هدايا فعاليات",
                  "مستلزمات مكتبية",
                  "أخرى",
                ]
          }
        />
        <Input name="Quantity" label={fields.quantity} type="number" />
        <Select
          name="Branding"
          label={fields.branding}
          options={lang === "en" ? ["Yes", "No", "To be confirmed"] : ["نعم", "لا", "سيتم التأكيد"]}
        />
        <Input name="Delivery Location" label={fields.location} />
        <Input name="Required Date" label={fields.date} type="date" />
        <FileField label={fields.upload} />
      </div>

      <Textarea name="Message" label={fields.message} />

      <button
        type="submit"
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-emerald text-white font-semibold text-[14px] hover:opacity-95 beyond-focus beyond-wa-pulse"
      >
        <WhatsAppIcon className="w-4 h-4" />
        {fields.submit}
      </button>
      <p className={`mt-2 text-[11px] text-beyond-charcoal/55 text-center ${lang === "ar" ? "font-arabic" : ""}`}>
        {lang === "en"
          ? `Your form details will open WhatsApp pre filled to ${WA_DISPLAY}.`
          : `ستفتح بياناتك واتساب برسالة جاهزة إلى ${WA_DISPLAY}.`}
      </p>
    </form>
  );
}

function Input({
  label,
  type = "text",
  name,
  required,
}: {
  label: string;
  type?: string;
  name?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11.5px] uppercase tracking-wider font-semibold text-beyond-charcoal/65">
        {label}
        {required && <span className="text-beyond-gold"> *</span>}
      </span>
      <input
        type={type}
        name={name ?? label}
        required={required}
        className="mt-1 w-full rounded-xl border border-beyond-line bg-beyond-ivory px-3.5 py-2.5 text-[14px] outline-none focus:border-beyond-gold beyond-focus"
      />
    </label>
  );
}

function Select({
  label,
  options,
  name,
}: {
  label: string;
  options: string[];
  name?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11.5px] uppercase tracking-wider font-semibold text-beyond-charcoal/65">
        {label}
      </span>
      <div className="relative">
        <select
          name={name ?? label}
          defaultValue=""
          className="mt-1 w-full rounded-xl border border-beyond-line bg-beyond-ivory px-3.5 py-2.5 text-[14px] outline-none focus:border-beyond-gold appearance-none"
        >
          <option value=""></option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute end-3 top-1/2 -translate-y-1/2 text-beyond-charcoal/50 pointer-events-none" />
      </div>
    </label>
  );
}

function Textarea({ label, name }: { label: string; name?: string }) {
  return (
    <label className="block mt-3">
      <span className="text-[11.5px] uppercase tracking-wider font-semibold text-beyond-charcoal/65">
        {label}
      </span>
      <textarea
        rows={4}
        name={name ?? label}
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
        <span>Tap to share on WhatsApp after submitting</span>
        <input type="file" className="hidden" />
      </div>
    </label>
  );
}

// Supply Desk + RFQ
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
            {lang === "en" ? "B2B Sourcing" : "توريد للأعمال"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "Beyond Connect Supply Desk" : "قسم التوريد، بيوند كونكت"}
          </h2>
          <p className={`mt-3 text-[14.5px] leading-relaxed text-beyond-charcoal/75 max-w-xl ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "For B2B and institutional requirements, our supply desk supports selected sourcing and quotation requests across general trading categories, subject to supplier confirmation, specifications, stock availability and delivery feasibility."
              : "للاحتياجات المؤسسية وقطاع الأعمال، يدعم قسم التوريد لدينا طلبات توريد وعروض أسعار مختارة ضمن فئات التجارة العامة، وذلك حسب تأكيد المورّد والمواصفات والتوفر وإمكانية التوصيل."}
          </p>

          <ul className="mt-6 grid sm:grid-cols-2 gap-2.5">
            {categories.map((c) => (
              <li
                key={c}
                className="flex items-start gap-2.5 bg-white border border-beyond-line rounded-xl p-3.5"
              >
                <BoxIcon className="w-4 h-4 text-beyond-emerald mt-0.5 shrink-0" />
                <span className={`text-[13px] text-beyond-charcoal/85 ${lang === "ar" ? "font-arabic" : ""}`}>{c}</span>
              </li>
            ))}
          </ul>

          <div className={`mt-5 text-[12px] text-beyond-charcoal/60 ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "Supply items are handled separately from retail shopping. Pricing is provided by formal quotation only."
              : "تُعالج طلبات التوريد بمعزل عن البيع بالتجزئة. تُقدَّم الأسعار عبر عرض رسمي فقط."}
          </div>
        </div>

        <SupplyRFQ lang={lang} />
      </div>
    </section>
  );
}

function SupplyRFQ({ lang }: { lang: "en" | "ar" }) {
  const t = lang === "en"
    ? {
        title: "Submit RFQ",
        sub: "Submit and continue on WhatsApp. Quotation requests are processed within 1 to 2 business days.",
        company: "Company or Institution",
        contact: "Contact Person",
        phone: "Mobile",
        email: "Email",
        category: "Supply Category",
        spec: "Specifications or Description",
        qty: "Quantity",
        deliver: "Delivery Emirate",
        when: "Required by",
        boq: "Share BOQ on WhatsApp after submit",
        cta: "Send RFQ via WhatsApp",
      }
    : {
        title: "أرسل طلب عرض سعر",
        sub: "أرسل وأكمل عبر واتساب. تتم معالجة طلبات الأسعار خلال يوم إلى يومي عمل.",
        company: "الشركة أو المؤسسة",
        contact: "جهة الاتصال",
        phone: "الجوال",
        email: "البريد الإلكتروني",
        category: "تصنيف التوريد",
        spec: "المواصفات أو الوصف",
        qty: "الكمية",
        deliver: "إمارة التوصيل",
        when: "التاريخ المطلوب",
        boq: "شارك جدول الكميات عبر واتساب بعد الإرسال",
        cta: "أرسل عبر واتساب",
      };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data: Record<string, string> = {};
        fd.forEach((v, k) => { if (typeof v === "string") data[k] = v; });
        const url = buildWALink(formToWA("I would like to submit an RFQ for the Supply Desk.", data));
        window.open(url, "_blank", "noopener,noreferrer");
        toast(lang === "en" ? "Opening WhatsApp." : "جارٍ فتح واتساب.");
      }}
      className="bg-white rounded-3xl p-5 sm:p-7 beyond-card-shadow border border-beyond-line"
    >
      <h3 className={`font-display text-2xl font-semibold ${lang === "ar" ? "font-arabic-display" : ""}`}>{t.title}</h3>
      <p className={`text-[12.5px] text-beyond-charcoal/65 mt-1 ${lang === "ar" ? "font-arabic" : ""}`}>{t.sub}</p>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <Input name="Company" label={t.company} required />
        <Input name="Contact Person" label={t.contact} required />
        <Input name="Mobile" label={t.phone} type="tel" required />
        <Input name="Email" label={t.email} type="email" />
        <Select
          name="Category"
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
        <Input name="Quantity" label={t.qty} type="number" />
        <Input name="Delivery Emirate" label={t.deliver} />
        <Input name="Required Date" label={t.when} type="date" />
        <FileField label={t.boq} />
      </div>
      <Textarea name="Specifications" label={t.spec} />

      <button
        type="submit"
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-emerald text-white font-semibold text-[14px] hover:opacity-95 beyond-focus beyond-wa-pulse"
      >
        <WhatsAppIcon className="w-4 h-4" />
        {t.cta}
      </button>
    </form>
  );
}

// Testimonials — UAE customer voices, high-signal trust cards.
// Bilingual, five-star ratings, gold quote mark, framed on paper.
function Testimonials({ lang }: { lang: "en" | "ar" }) {
  const quotes = [
    {
      en: {
        quote: "Bought two Arabic charm bracelets for my sisters. The Kufic engraving was crisp, the ivory box felt genuinely premium, and delivery landed the next afternoon.",
        name: "Fatima Al Marzooqi",
        role: "Dubai · Personal gifting",
      },
      ar: {
        quote: "طلبت إسوارتين بأحرف عربية لأخواتي. النقش الكوفي كان دقيقاً، الصندوق العاجي فاخر فعلاً، والتوصيل وصل في اليوم التالي بعد الظهر.",
        name: "فاطمة المرزوقي",
        role: "دبي · هدايا شخصية",
      },
      stars: 5,
      tone: "gold" as const,
    },
    {
      en: {
        quote: "Ordered 40 VIP boxes for our leadership offsite. Rashid handled it end-to-end on WhatsApp, produced logo mock-ups the same evening, and delivered to Abu Dhabi on time.",
        name: "Rashid Ali",
        role: "Abu Dhabi · HR, Financial Services",
      },
      ar: {
        quote: "طلبت 40 صندوق VIP لاجتماع القيادة. تولّى راشد كل شيء عبر واتساب، أرسل تصاميم الشعار في نفس المساء، وسلّم الطلب في أبوظبي في الموعد.",
        name: "راشد علي",
        role: "أبوظبي · موارد بشرية، قطاع مالي",
      },
      stars: 5,
      tone: "emerald" as const,
    },
    {
      en: {
        quote: "The drawing board arrived within a day, packaging was clean, and the reusable surface has kept our kids busy for weeks. Genuinely useful gift.",
        name: "Ayesha Khan",
        role: "Sharjah · Parent",
      },
      ar: {
        quote: "وصلت لوحة الرسم خلال يوم، والتغليف نظيف، والسطح قابل لإعادة الاستخدام شغل أولادنا لأسابيع. هدية مفيدة فعلاً.",
        name: "عائشة خان",
        role: "الشارقة · ولية أمر",
      },
      stars: 5,
      tone: "navy" as const,
    },
    {
      en: {
        quote: "Sent a bridal bracelet with her name in Arabic script for our henna night. The team suggested a font that matched the invitation, and the whole thing felt effortless.",
        name: "Mariam Al Nuaimi",
        role: "Ajman · Bridal party",
      },
      ar: {
        quote: "أهديت إسوارة العروس باسمها بالخط العربي لليلة الحنّاء. الفريق اقترح خطاً مطابقاً للدعوة، والتجربة كلها كانت سلسة جداً.",
        name: "مريم النعيمي",
        role: "عجمان · حفلات زفاف",
      },
      stars: 5,
      tone: "charcoal" as const,
    },
  ];

  return (
    <section className="bg-beyond-white border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <Reveal className="text-center mb-10 sm:mb-14">
          <div className="beyond-kicker justify-center mb-3">
            {lang === "en" ? "Customer Voices" : "آراء العملاء"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal beyond-ornament ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? (
              <>Real orders, <span className="beyond-gold-gradient">real stories.</span></>
            ) : (
              <>طلبات حقيقية، <span className="beyond-gold-gradient">قصص حقيقية.</span></>
            )}
          </h2>
          <p className={`mt-4 text-[15px] leading-relaxed text-beyond-charcoal/75 max-w-2xl mx-auto ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "A small sample of customer feedback collected on WhatsApp and Instagram DMs, published with permission."
              : "عيّنة صغيرة من آراء العملاء المستلمة عبر واتساب والرسائل الخاصة على إنستقرام، مُنشورة بعد أخذ الإذن."}
          </p>
        </Reveal>

        <Stagger className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
          {quotes.map((q, i) => {
            const c = lang === "en" ? q.en : q.ar;
            const toneClass =
              q.tone === "gold"    ? "text-beyond-gold"
              : q.tone === "emerald" ? "text-beyond-emerald"
              : q.tone === "navy"    ? "text-beyond-navy"
              : "text-beyond-charcoal";
            return (
              <StaggerItem key={i}>
                <article className="beyond-lift h-full rounded-2xl bg-beyond-ivory border border-beyond-line beyond-card-shadow hover:beyond-card-shadow-hover p-5 sm:p-6 flex flex-col">
                  <div className={`text-[42px] leading-none font-display ${toneClass} opacity-70`} aria-hidden>
                    &ldquo;
                  </div>
                  <p className={`mt-1 text-[13.5px] leading-relaxed text-beyond-charcoal/85 flex-1 ${lang === "ar" ? "font-arabic" : ""}`}>
                    {c.quote}
                  </p>
                  <div className="mt-4 flex items-center gap-0.5" aria-label={`${q.stars} stars`}>
                    {Array.from({ length: q.stars }).map((_, j) => (
                      <StarSpark key={j} className="w-3.5 h-3.5 text-beyond-gold" />
                    ))}
                  </div>
                  <div className={`mt-3 pt-3 border-t border-beyond-line/70 ${lang === "ar" ? "font-arabic" : ""}`}>
                    <div className="text-[13px] font-semibold text-beyond-charcoal">{c.name}</div>
                    <div className="text-[11.5px] text-beyond-charcoal/60 mt-0.5">{c.role}</div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

// Corporate Gift Packs — three tiers with a Most-Popular highlight.
// Turns "which pack should I buy" from a WhatsApp question into an on-page answer.
function CorporatePacks({ lang }: { lang: "en" | "ar" }) {
  const tiers = [
    {
      key: "starter",
      en: {
        name: "Starter Pack",
        pill: "From 25 pieces",
        priceHint: "From AED 32 / piece",
        summary: "Reliable, affordable branded pack for teams under 50 people. Standard packaging, single-side logo printing, delivered inside one week.",
        features: [
          "25 to 49 pieces per order",
          "Standard kraft or ivory packaging",
          "Single-side logo, one colour",
          "Delivery: 5 to 7 business days",
          "PDF proof before production",
          "Standard invoice",
        ],
      },
      ar: {
        name: "الباقة الأساسية",
        pill: "من 25 قطعة",
        priceHint: "من 32 درهم للقطعة",
        summary: "باقة موثوقة بسعر مناسب للفرق أقل من 50 موظفاً. تغليف قياسي، طباعة شعار وجه واحد، توصيل خلال أسبوع.",
        features: [
          "من 25 إلى 49 قطعة للطلب",
          "تغليف كرافت أو عاجي قياسي",
          "طباعة شعار وجه واحد بلون",
          "توصيل: 5 إلى 7 أيام عمل",
          "معاينة PDF قبل الإنتاج",
          "فاتورة نظامية",
        ],
      },
      tone: "line" as const,
      popular: false,
    },
    {
      key: "premium",
      en: {
        name: "Premium Pack",
        pill: "From 50 pieces",
        priceHint: "From AED 55 / piece",
        summary: "Our most requested pack. Signature ivory gift boxes, dual-side logo, per-person personalisation and same-week dispatch.",
        features: [
          "50 to 99 pieces per order",
          "Signature ivory gift boxes",
          "Dual-side logo, up to two colours",
          "Per-person name personalisation",
          "Delivery: 3 to 5 business days",
          "Physical sample on request",
          "Corporate VAT invoice",
        ],
      },
      ar: {
        name: "الباقة المميّزة",
        pill: "من 50 قطعة",
        priceHint: "من 55 درهم للقطعة",
        summary: "الأكثر طلباً. صناديق الهدايا العاجية الخاصة بنا، شعار وجهين، تخصيص لكل شخص، وشحن خلال نفس الأسبوع.",
        features: [
          "من 50 إلى 99 قطعة للطلب",
          "صناديق هدايا عاجية مميّزة",
          "شعار وجهين حتى لونين",
          "تخصيص اسم لكل شخص",
          "توصيل: 3 إلى 5 أيام عمل",
          "عيّنة فعلية عند الطلب",
          "فاتورة ضريبية للشركات",
        ],
      },
      tone: "gold" as const,
      popular: true,
    },
    {
      key: "vip",
      en: {
        name: "VIP Pack",
        pill: "100+ pieces",
        priceHint: "Custom quote",
        summary: "For leadership, key clients, and government appreciation. Full personalisation, presentation boxes, dedicated account manager.",
        features: [
          "100 pieces or more per order",
          "Presentation ivory + gold boxes",
          "Full-colour logo, foil options",
          "Handwritten thank-you card",
          "Delivery: 7 to 10 business days",
          "PO number on invoice, payment on terms",
          "Dedicated account manager",
        ],
      },
      ar: {
        name: "باقة VIP",
        pill: "100 قطعة أو أكثر",
        priceHint: "عرض سعر مخصّص",
        summary: "لهدايا القيادة، والعملاء الرئيسيين، وتقدير الجهات الحكومية. تخصيص كامل، صناديق تقديم، ومدير حساب مخصّص.",
        features: [
          "100 قطعة أو أكثر للطلب",
          "صناديق تقديم عاجية مع لمسات ذهبية",
          "شعار بالألوان الكاملة، خيارات فويل",
          "بطاقة شكر مكتوبة بخط اليد",
          "توصيل: 7 إلى 10 أيام عمل",
          "رقم أمر شراء على الفاتورة ودفع بشروط",
          "مدير حساب مخصّص",
        ],
      },
      tone: "charcoal" as const,
      popular: false,
    },
  ];

  return (
    <section id="corporate-packs" className="bg-beyond-ivory border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <Reveal className="text-center mb-10 sm:mb-14">
          <div className="beyond-kicker justify-center mb-3">
            {lang === "en" ? "Corporate Packs" : "باقات الشركات"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal beyond-ornament ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? (
              <>Pick a pack, <span className="beyond-gold-gradient">get a quote in an hour.</span></>
            ) : (
              <>اختر الباقة، <span className="beyond-gold-gradient">استلم عرض السعر خلال ساعة.</span></>
            )}
          </h2>
          <p className={`mt-4 text-[15px] leading-relaxed text-beyond-charcoal/75 max-w-2xl mx-auto ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "Three fixed tiers so procurement teams can decide fast. All prices in AED including 5% VAT. Custom mixes always available on WhatsApp."
              : "ثلاث باقات ثابتة ليقرّر فريق المشتريات بسرعة. جميع الأسعار بالدرهم شاملة ضريبة القيمة المضافة 5%. المزيج المخصّص دائماً متاح عبر واتساب."}
          </p>
        </Reveal>

        <Stagger className="grid gap-5 md:grid-cols-3 items-stretch">
          {tiers.map((t) => {
            const c = lang === "en" ? t.en : t.ar;
            const msg =
              lang === "en"
                ? `Hello Beyond Gallery, I would like a quote for the ${t.en.name}.\nCompany: \nContact person: \nEstimated quantity: \nDelivery emirate: \nPreferred logo colours: \nDeadline: \nAny personalisation notes: `
                : `مرحباً بيوند جاليري، أرغب في عرض سعر لباقة ${t.ar.name}.\nالشركة: \nالشخص المسؤول: \nالكمية المتوقعة: \nإمارة التوصيل: \nألوان الشعار المفضّلة: \nالموعد النهائي: \nملاحظات التخصيص: `;
            const waHref = buildWALink(msg);
            const popular = t.popular;
            return (
              <StaggerItem key={t.key}>
                <div
                  className={`relative h-full rounded-3xl bg-white border overflow-hidden flex flex-col ${
                    popular
                      ? "border-beyond-gold beyond-shadow-lg md:-translate-y-2"
                      : "border-beyond-line beyond-shadow"
                  }`}
                >
                  {popular && (
                    <div className={`bg-beyond-gold text-white text-center text-[11.5px] font-semibold py-1.5 tracking-wider ${lang === "ar" ? "font-arabic tracking-normal" : "uppercase"}`}>
                      {lang === "en" ? "Most popular" : "الأكثر طلباً"}
                    </div>
                  )}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col">
                    <div className={`text-[11.5px] font-semibold uppercase tracking-wider text-beyond-gold ${lang === "ar" ? "font-arabic tracking-normal" : ""}`}>
                      {c.pill}
                    </div>
                    <h3 className={`mt-2 font-display text-2xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
                      {c.name}
                    </h3>
                    <div className={`mt-2 text-[15px] text-beyond-charcoal ${lang === "ar" ? "font-arabic" : ""}`}>
                      <span className="font-display font-semibold beyond-gold-gradient">{c.priceHint}</span>
                    </div>
                    <p className={`mt-3 text-[13.5px] leading-relaxed text-beyond-charcoal/75 ${lang === "ar" ? "font-arabic" : ""}`}>
                      {c.summary}
                    </p>
                    <ul className={`mt-5 space-y-2.5 text-[13px] text-beyond-charcoal/85 flex-1 ${lang === "ar" ? "font-arabic" : ""}`}>
                      {c.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <StarSpark className={`w-3.5 h-3.5 mt-1 shrink-0 ${popular ? "text-beyond-gold" : "text-beyond-emerald"}`} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={waHref}
                      className={`mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-[13.5px] font-semibold transition-colors ${
                        popular
                          ? "bg-beyond-gold text-white hover:bg-beyond-gold/90"
                          : "bg-beyond-charcoal text-beyond-ivory hover:bg-beyond-charcoal/90"
                      } ${lang === "ar" ? "font-arabic" : ""}`}
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      {lang === "en" ? "Get a quote on WhatsApp" : "احصل على عرض السعر عبر واتساب"}
                    </a>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.15}>
          <div className={`mt-8 text-center text-[12.5px] text-beyond-charcoal/65 ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "All packs ship free across the UAE. PO / VAT invoicing available for registered businesses. Not what you need? Ask on WhatsApp for a fully custom quote."
              : "جميع الباقات توصيل مجاني في كل الإمارات. فوترة ضريبية / بأمر شراء للشركات المسجّلة. لم تجد ما يناسبك؟ اسأل عبر واتساب لعرض سعر مخصّص بالكامل."}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Delivery Timeline — the full delivery story a UAE buyer wants to see
// before they commit: confirm → prepare → dispatch (Halan / Careem) → arrive.
function DeliveryTimeline({ lang }: { lang: "en" | "ar" }) {
  const steps = [
    {
      en: { title: "Order Confirmed", meta: "Within 10 minutes", body: "You receive a WhatsApp confirmation with your order number, total in AED including 5% VAT and expected dispatch date." },
      ar: { title: "تم تأكيد الطلب", meta: "خلال 10 دقائق", body: "تستلم رسالة تأكيد على واتساب برقم الطلب، الإجمالي بالدرهم شاملة ضريبة القيمة المضافة 5%، وتاريخ الشحن المتوقع." },
      Icon: FileTextIcon,
      tone: "gold" as const,
    },
    {
      en: { title: "Prepared with Care", meta: "In stock: same day · Made to order: 3 to 7 days", body: "Your item is checked, personalised where needed, and packaged in our signature ivory box." },
      ar: { title: "تحضير بعناية", meta: "المتوفر: نفس اليوم · تحت الطلب: 3 إلى 7 أيام", body: "نفحص المنتج، ونضيف التخصيص عند الطلب، ونعبّئه داخل صندوق العاج الخاص بنا." },
      Icon: BoxIcon,
      tone: "emerald" as const,
    },
    {
      en: { title: "Dispatched", meta: "Halan or Careem last-mile", body: "The driver receives your address, Google Maps pin and phone. You get a live tracking link on WhatsApp." },
      ar: { title: "الإرسال", meta: "شراكة حلان أو كريم للتوصيل", body: "يستلم السائق عنوانك ودبوس خرائط جوجل والهاتف، ويصلك رابط تتبّع حي عبر واتساب." },
      Icon: SparkleIcon,
      tone: "navy" as const,
    },
    {
      en: { title: "Delivered", meta: "1 to 2 days across the UAE", body: "Delivered to your door. Free delivery for orders 300 AED and above, or 25 AED flat rate. Cash on delivery available." },
      ar: { title: "التسليم", meta: "1 إلى 2 يوم في كل الإمارات", body: "توصيل حتى الباب. توصيل مجاني للطلبات 300 درهم فأكثر، أو 25 درهم للطلبات الأقل. الدفع عند الاستلام متاح." },
      Icon: GiftIcon,
      tone: "charcoal" as const,
    },
  ];

  return (
    <section className="bg-beyond-ivory border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <Reveal className="text-center mb-10 sm:mb-14">
          <div className="beyond-kicker justify-center mb-3">
            {lang === "en" ? "Delivery Promise" : "وعد التوصيل"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal beyond-ornament ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? (
              <>How your order <span className="beyond-gold-gradient">reaches you</span></>
            ) : (
              <>كيف تصل <span className="beyond-gold-gradient">طلبيتك إليك</span></>
            )}
          </h2>
          <p className={`mt-4 text-[15px] leading-relaxed text-beyond-charcoal/75 max-w-2xl mx-auto ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "Four transparent steps, one WhatsApp thread. You know where your order is at every stage, from confirmation to your doorstep."
              : "أربع مراحل واضحة، محادثة واتساب واحدة. تعرف مكان طلبيتك في كل مرحلة، من التأكيد وحتى بابك."}
          </p>
        </Reveal>

        <div className="beyond-timeline relative">
          {/* Horizontal gradient rail behind the dots on desktop */}
          <div className="beyond-timeline-track hidden md:block" />

          <Stagger className="grid gap-8 md:gap-5 md:grid-cols-4 relative">
            {steps.map((s, i) => {
              const c = lang === "en" ? s.en : s.ar;
              const toneClass =
                s.tone === "gold"    ? "text-beyond-gold"
                : s.tone === "emerald" ? "text-beyond-emerald"
                : s.tone === "navy"    ? "text-beyond-navy"
                : "text-beyond-charcoal";
              return (
                <StaggerItem key={i}>
                  <div className="beyond-timeline-step">
                    <div className="relative">
                      <div className="beyond-timeline-dot">
                        <s.Icon className={`w-7 h-7 ${toneClass}`} />
                      </div>
                      <span className={`absolute -top-1 -end-1 w-6 h-6 rounded-full bg-beyond-charcoal text-beyond-ivory text-[10px] font-semibold flex items-center justify-center ring-2 ring-beyond-ivory ${lang === "ar" ? "font-arabic" : ""}`}>
                        {i + 1}
                      </span>
                    </div>
                    <h3 className={`mt-2 font-display text-[17px] font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
                      {c.title}
                    </h3>
                    <div className={`text-[11.5px] font-semibold uppercase tracking-wider text-beyond-gold ${lang === "ar" ? "font-arabic tracking-normal" : ""}`}>
                      {c.meta}
                    </div>
                    <p className={`text-[13px] leading-relaxed text-beyond-charcoal/72 max-w-[24ch] ${lang === "ar" ? "font-arabic max-w-[26ch]" : ""}`}>
                      {c.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>

        {/* Delivery guarantees strip */}
        <Reveal delay={0.15}>
          <div className={`mt-12 grid sm:grid-cols-3 gap-3 ${lang === "ar" ? "font-arabic" : ""}`}>
            {[
              {
                en: { t: "Free over AED 300", s: "Otherwise 25 AED flat, all emirates" },
                ar: { t: "مجاني فوق 300 درهم", s: "أو 25 درهم ثابتة في كل الإمارات" },
                Icon: TagIcon,
              },
              {
                en: { t: "Cash on delivery", s: "Verified on WhatsApp before dispatch" },
                ar: { t: "الدفع عند الاستلام", s: "نؤكّده عبر واتساب قبل الإرسال" },
                Icon: CashMark,
              },
              {
                en: { t: "Live tracking", s: "Halan or Careem driver, real time link" },
                ar: { t: "تتبّع حي", s: "سائق حلان أو كريم، برابط لحظي" },
                Icon: PinIcon,
              },
            ].map((g, i) => {
              const c = lang === "en" ? g.en : g.ar;
              return (
                <div key={i} className="beyond-glass rounded-2xl px-4 py-4 flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-beyond-ivory border border-beyond-line flex items-center justify-center">
                    <g.Icon className="w-4 h-4 text-beyond-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-[13.5px] text-beyond-charcoal">{c.t}</div>
                    <div className="text-[12px] text-beyond-charcoal/65 mt-0.5">{c.s}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// About brand
function AboutBrand({ lang }: { lang: "en" | "ar" }) {
  return (
    <section className="bg-beyond-white">
      <Reveal className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="beyond-divider mb-3">
          {lang === "en" ? "Our Story" : "قصتنا"}
        </div>
        <h2 className={`font-display text-3xl sm:text-5xl font-semibold text-beyond-charcoal leading-tight beyond-ornament ${lang === "ar" ? "font-arabic-display" : ""}`}>
          {lang === "en" ? (
            <>Small Details. <span className="beyond-gold-gradient">Better Choices.</span></>
          ) : (
            <>تفاصيل صغيرة. <span className="beyond-gold-gradient">اختيارات أفضل.</span></>
          )}
        </h2>
        <p className={`mt-5 text-[15.5px] leading-relaxed text-beyond-charcoal/80 max-w-3xl mx-auto ${lang === "ar" ? "font-arabic" : ""}`}>
          {lang === "en"
            ? "Beyond Gallery by Beyond Jewellery was created to make everyday gifting and lifestyle shopping easier, cleaner and more meaningful. From elegant accessories and personalised gifts to creative boards and corporate gift packs, we curate products that are simple to understand, easy to order and suitable for UAE customers."
            : "أُسّست بيوند جاليري بواسطة بيوند جويلري لجعل تسوّق الهدايا وأسلوب الحياة اليومي أسهل وأوضح وأكثر معنى. من الإكسسوارات الأنيقة والهدايا المخصّصة إلى لوحات الإبداع وأطقم هدايا الشركات، نختار منتجات سهلة الفهم والطلب ومناسبة لعملاء الإمارات."}
        </p>
        <p className="mt-4 font-arabic text-beyond-emerald text-[18px]">
          تفصيلة صغيرة قد تكون هدية، أو ذكرى، أو بداية فكرة جميلة.
        </p>
        <div className={`mt-8 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-3 rounded-full bg-beyond-ivory border border-beyond-line text-[12.5px] text-beyond-charcoal/75 ${lang === "ar" ? "font-arabic" : ""}`}>
          <PinIcon className="w-4 h-4 text-beyond-gold" />
          {lang === "en"
            ? "Operated by BEYOND CONNECT GENERAL TRADING L.L.C, Dubai, United Arab Emirates."
            : "تُدار بواسطة شركة بيوند كونكت للتجارة العامة ذ.م.م، دبي، الإمارات العربية المتحدة."}
        </div>
      </Reveal>
    </section>
  );
}

// Payment Methods
function PaymentMethods({ lang }: { lang: "en" | "ar" }) {
  const methods = [
    { label: lang === "en" ? "Visa" : "فيزا", Mark: VisaMark },
    { label: lang === "en" ? "Mastercard" : "ماستركارد", Mark: MasterMark },
    { label: lang === "en" ? "Apple Pay" : "آبل باي", Mark: ApplePayMark },
    { label: lang === "en" ? "Google Pay" : "جوجل باي", Mark: GooglePayMark },
    { label: lang === "en" ? "Tabby (Buy Now Pay Later)" : "تابي (اشترِ الآن وادفع لاحقاً)", Mark: TabbyMark },
    { label: lang === "en" ? "Tamara (Buy Now Pay Later)" : "تمارا (اشترِ الآن وادفع لاحقاً)", Mark: TamaraMark },
    { label: lang === "en" ? "Bank Transfer" : "تحويل بنكي", Mark: BankMark },
    { label: lang === "en" ? "Cash on Delivery" : "الدفع عند الاستلام", Mark: CashMark },
  ];
  return (
    <section className="bg-beyond-ivory border-y border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-14">
        <Reveal className="text-center mb-6">
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Payments" : "الدفع"}
          </div>
          <h2 className={`font-display text-2xl sm:text-3xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "We Accept All Major UAE Payment Methods" : "نقبل جميع وسائل الدفع في الإمارات"}
          </h2>
          <p className={`mt-2 text-[13px] text-beyond-charcoal/70 max-w-xl mx-auto ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "Cards, wallets, Buy Now Pay Later, bank transfer or cash on delivery. Confirm your preferred method on WhatsApp before order completion."
              : "بطاقات، محافظ رقمية، اشترِ الآن وادفع لاحقاً، تحويل بنكي أو الدفع عند الاستلام. أكّد طريقتك المفضّلة عبر واتساب قبل إتمام الطلب."}
          </p>
        </Reveal>

        <Stagger className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {methods.map((m) => (
            <StaggerItem key={m.label}>
              <div className="beyond-lift inline-flex items-center gap-2.5 bg-white border border-beyond-line rounded-2xl px-3.5 py-2.5 beyond-card-shadow hover:border-beyond-gold">
                <m.Mark className="h-5 w-auto" />
                <span className={`text-[12px] font-semibold text-beyond-charcoal/85 ${lang === "ar" ? "font-arabic" : ""}`}>{m.label}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className={`mt-6 text-center text-[11.5px] text-beyond-charcoal/55 ${lang === "ar" ? "font-arabic" : ""}`}>
          {lang === "en"
            ? "Logos shown are for indicative purposes. Actual availability depends on order channel."
            : "الشعارات للإشارة فقط، ويعتمد التوفر على قناة الطلب."}
        </div>
      </div>
    </section>
  );
}

// Catalogue Capture
function CatalogueCapture({ lang }: { lang: "en" | "ar" }) {
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
        "هدايا مخصّصة",
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
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "Get the Latest Product Catalogue" : "احصل على أحدث كتالوج"}
          </h2>
          <p className={`mt-3 text-[15px] text-beyond-charcoal/75 max-w-md leading-relaxed ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "Receive our latest accessories, gifts, drawing boards, corporate gifts and selected supply items directly on WhatsApp."
              : "استلم على واتساب أحدث الإكسسوارات والهدايا ولوحات الرسم وهدايا الشركات ومستلزمات التوريد المختارة."}
          </p>
          <ul className={`mt-5 space-y-2 text-[13px] text-beyond-charcoal/75 ${lang === "ar" ? "font-arabic" : ""}`}>
            {[
              lang === "en" ? "Sent as a single PDF on WhatsApp" : "يُرسل كملف PDF واحد عبر واتساب",
              lang === "en" ? "Retail and bulk versions available" : "نسخة للتجزئة وأخرى للجملة",
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
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data: Record<string, string> = {};
            fd.forEach((v, k) => { if (typeof v === "string") data[k] = v; });
            const url = buildWALink(formToWA("Please send me the latest product catalogue.", data));
            window.open(url, "_blank", "noopener,noreferrer");
            toast(lang === "en" ? "Opening WhatsApp." : "جارٍ فتح واتساب.");
          }}
          className="bg-white rounded-3xl border border-beyond-line p-5 sm:p-7 beyond-card-shadow"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Input name="Name" label={lang === "en" ? "Name" : "الاسم"} required />
            <Input name="Mobile" label={lang === "en" ? "Mobile Number" : "رقم الجوال"} type="tel" required />
            <Select
              name="Emirate"
              label={lang === "en" ? "Emirate" : "الإمارة"}
              options={
                lang === "en"
                  ? ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"]
                  : ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين"]
              }
            />
            <Select name="Interested Category" label={lang === "en" ? "Interested Category" : "التصنيف المطلوب"} options={cats} />
            <Select
              name="Order Type"
              label={lang === "en" ? "Retail or Bulk Order" : "تجزئة أم جملة"}
              options={lang === "en" ? ["Retail", "Bulk"] : ["تجزئة", "جملة"]}
            />
          </div>
          <button
            type="submit"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-beyond-emerald text-white font-semibold text-[14px] hover:opacity-95 beyond-focus beyond-wa-pulse"
          >
            <WhatsAppIcon className="w-4 h-4" />
            {lang === "en" ? "Send Me the Catalogue on WhatsApp" : "أرسلوا لي الكتالوج عبر واتساب"}
          </button>
        </form>
      </div>
    </section>
  );
}

// FAQ

const FAQ_DATA = {
  en: [
    { q: "Do you deliver across the UAE?", a: "Yes. We deliver to all seven Emirates. Delivery options, time and fees are confirmed before order completion." },
    { q: "Can I order through WhatsApp?", a: "Yes. WhatsApp is our primary order channel. You can ask, confirm, and pay through trusted UAE payment methods after confirmation." },
    { q: "Can I request extra product photos?", a: "Absolutely. Before you order, we can share additional photos or a short product video on request." },
    { q: "Are all items available on Noon or Amazon?", a: "Selected items are listed on UAE marketplaces. Availability varies. Ask us for the latest listing link." },
    { q: "Can I request personalised items?", a: "Yes. We support names, messages and Arabic or English text on selected accessories and gifts. Customised items need extra preparation time." },
    { q: "Do you support corporate gifts?", a: "Yes. We support branded notebooks, pens, mugs, totes, premium gift boxes and curated gift packs for companies and events." },
    { q: "Can I request bulk pricing?", a: "Yes. Bulk pricing is offered through formal quotation and depends on quantity, branding, stock and delivery location." },
    { q: "Can I get an invoice?", a: "Yes. Tax invoices including 5 percent UAE VAT are available upon request for retail and corporate orders." },
    { q: "What is the return and exchange policy?", a: "Eligible items can be returned or exchanged subject to our return policy. Personalised items are non returnable unless damaged on arrival." },
    { q: "Are prices fixed?", a: "Retail prices are shown in AED. Bulk and supply prices are confirmed only via formal quotation." },
  ],
  ar: [
    { q: "هل تقومون بالتوصيل داخل الإمارات؟", a: "نعم، نوصّل إلى جميع الإمارات السبع. تُؤكَّد خيارات التوصيل ووقته ورسومه قبل إتمام الطلب." },
    { q: "هل يمكن الطلب عبر واتساب؟", a: "نعم، واتساب هو قناتنا الرئيسية. يمكنك السؤال والتأكيد ثم الدفع بوسائل دفع موثوقة في الإمارات بعد التأكيد." },
    { q: "هل يمكن طلب صور إضافية للمنتج؟", a: "بالتأكيد، يمكننا مشاركة صور إضافية أو فيديو قصير قبل الطلب." },
    { q: "هل كل المنتجات متاحة على نون وأمازون؟", a: "بعض المنتجات مدرجة على المتاجر الإماراتية، والتوفر يختلف. اطلب منا أحدث الروابط." },
    { q: "هل يمكن طلب منتجات مخصّصة؟", a: "نعم، ندعم الأسماء والرسائل والكتابة العربية والإنجليزية على إكسسوارات وهدايا مختارة. التخصيص يحتاج وقتاً إضافياً." },
    { q: "هل تدعمون هدايا الشركات؟", a: "نعم، ندعم الدفاتر والأقلام والأكواب والحقائب وصناديق الهدايا المميّزة وأطقم الهدايا للشركات والفعاليات." },
    { q: "هل يمكنني طلب أسعار جملة؟", a: "نعم، تُقدَّم أسعار الجملة عبر عرض رسمي، وتعتمد على الكمية والطباعة والمخزون وموقع التوصيل." },
    { q: "هل يمكن الحصول على فاتورة؟", a: "نعم، الفواتير الضريبية شاملة ضريبة القيمة المضافة 5% متاحة عند الطلب للتجزئة والشركات." },
    { q: "ما سياسة الاسترجاع والاستبدال؟", a: "تخضع المنتجات المؤهلة لسياسة الإرجاع. المنتجات المخصّصة غير قابلة للإرجاع إلا في حال وصولها تالفة أو مختلفة عمّا تم تأكيده." },
    { q: "هل الأسعار ثابتة؟", a: "أسعار التجزئة تُعرض بالدرهم. أسعار الجملة والتوريد تُؤكَّد عبر عرض رسمي فقط." },
  ],
};

function FAQ({ lang }: { lang: "en" | "ar" }) {
  const [open, setOpen] = useState<number | null>(0);
  const data = FAQ_DATA[lang];
  return (
    <section className="bg-beyond-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
        <Reveal className="text-center mb-8">
          <div className="beyond-divider mb-3">FAQ</div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "Frequently Asked Questions" : "أسئلة شائعة"}
          </h2>
        </Reveal>

        <div className="space-y-2.5">
          {data.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border overflow-hidden ${isOpen ? "border-beyond-gold bg-beyond-ivory" : "border-beyond-line bg-white"} transition-colors`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={`w-full flex items-center justify-between gap-3 text-start p-4 sm:p-5 ${lang === "ar" ? "font-arabic" : ""}`}
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-[15px] sm:text-[16.5px] font-semibold text-beyond-charcoal">
                    {item.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-beyond-gold transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className={`px-4 sm:px-5 pb-5 text-[14px] text-beyond-charcoal/80 leading-relaxed ${lang === "ar" ? "font-arabic" : ""}`}>
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Contact

function Contact({ lang }: { lang: "en" | "ar" }) {
  return (
    <section id="contact" className="bg-beyond-ivory border-t border-beyond-line">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <Reveal className="text-center mb-10">
          <div className="beyond-divider mb-3">
            {lang === "en" ? "Get in Touch" : "تواصل معنا"}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
            {lang === "en" ? "Contact and Order" : "التواصل والطلب"}
          </h2>
        </Reveal>

        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[
            { icon: WhatsAppIcon, title: lang === "en" ? "WhatsApp" : "واتساب", body: WA_DISPLAY, cta: lang === "en" ? "Chat on WhatsApp" : "تواصل عبر واتساب", href: WA_BASE, accent: "bg-beyond-emerald text-white", external: true },
            { icon: MailIcon, title: lang === "en" ? "Email" : "بريد إلكتروني", body: EMAIL, cta: lang === "en" ? "Send Email" : "أرسل بريداً", href: `mailto:${EMAIL}`, accent: "bg-beyond-charcoal text-beyond-ivory", external: false },
            { icon: PhoneIcon, title: lang === "en" ? "Call or SMS" : "اتصال أو رسالة", body: WA_DISPLAY, cta: lang === "en" ? "Tap to Call" : "اتصل بنا", href: `tel:+${WA_NUMBER}`, accent: "bg-beyond-navy text-beyond-ivory", external: false },
            { icon: InstagramIcon, title: "Instagram", body: INSTAGRAM_HANDLE, cta: lang === "en" ? "Follow on Instagram" : "تابعنا على إنستغرام", href: INSTAGRAM_URL, accent: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#515BD4] text-white", external: true },
            { icon: TikTokIcon, title: "TikTok", body: TIKTOK_HANDLE, cta: lang === "en" ? "Watch on TikTok" : "شاهدنا على تيك توك", href: TIKTOK_URL, accent: "bg-beyond-charcoal text-beyond-ivory", external: true },
            { icon: TagIcon, title: "Noon UAE", body: lang === "en" ? "Browse our seller storefront." : "تصفّح متجرنا على نون.", cta: lang === "en" ? "Open Noon Store" : "افتح متجر نون", href: NOON_URL, accent: "bg-white text-beyond-charcoal border border-beyond-line", external: true },
          ].map((c, i) => (
            <StaggerItem key={i}>
              <a
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="block beyond-lift rounded-3xl bg-white border border-beyond-line p-5 beyond-card-shadow hover:beyond-card-shadow-hover hover:border-beyond-gold transition-all"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${c.accent}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div className={`mt-3 font-display text-[17px] font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic-display" : ""}`}>
                  {c.title}
                </div>
                <div className={`mt-1 text-[13px] text-beyond-charcoal/70 leading-snug ${lang === "ar" ? "font-arabic" : ""}`}>{c.body}</div>
                <div className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-beyond-gold">
                  {c.cta}
                  <ArrowRight className="w-4 h-4 rtl:flip-x" />
                </div>
              </a>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-8 rounded-3xl bg-beyond-charcoal text-beyond-ivory p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 beyond-card-shadow">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-beyond-gold/15 flex items-center justify-center text-beyond-gold">
              <PinIcon className="w-5 h-5" />
            </div>
            <div>
              <div className={`font-display text-[17px] font-semibold ${lang === "ar" ? "font-arabic-display" : ""}`}>
                {lang === "en" ? "Dubai, United Arab Emirates" : "دبي، الإمارات العربية المتحدة"}
              </div>
              <div className={`text-[12.5px] text-beyond-ivory/75 mt-1 leading-relaxed ${lang === "ar" ? "font-arabic" : ""}`}>
                {lang === "en"
                  ? "Operated by BEYOND CONNECT GENERAL TRADING L.L.C. Trade License No. 1498624. General Trading."
                  : "تُدار بواسطة شركة بيوند كونكت للتجارة العامة ذ.م.م. رخصة تجارية رقم 1498624. تجارة عامة."}
              </div>
            </div>
          </div>
          <a
            href={WA_BASE}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-emerald text-white text-[13px] font-semibold beyond-wa-pulse"
          >
            <WhatsAppIcon className="w-4 h-4" />
            {lang === "en" ? `Message ${WA_DISPLAY}` : `راسلنا ${WA_DISPLAY}`}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

// Footer
function Footer({ lang }: { lang: "en" | "ar" }) {
  const links: Array<{ label: string; href: string }> = lang === "en"
    ? [
        { label: "Privacy Policy", href: "/policies#privacy" },
        { label: "Terms and Conditions", href: "/policies#terms" },
        { label: "Return and Exchange Policy", href: "/policies#returns" },
        { label: "Shipping Policy", href: "/policies#shipping" },
        { label: "Corporate Orders", href: "#corporate" },
        { label: "Supply Desk", href: "#supply" },
        { label: "Contact", href: "#contact" },
      ]
    : [
        { label: "سياسة الخصوصية", href: "/policies#privacy" },
        { label: "الشروط والأحكام", href: "/policies#terms" },
        { label: "سياسة الاسترجاع والاستبدال", href: "/policies#returns" },
        { label: "سياسة الشحن", href: "/policies#shipping" },
        { label: "طلبات الشركات", href: "#corporate" },
        { label: "قسم التوريد", href: "#supply" },
        { label: "تواصل", href: "#contact" },
      ];

  return (
    <footer className="bg-beyond-charcoal text-beyond-ivory pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2">
          <div className="font-display text-2xl">
            Beyond <span className="beyond-gold-gradient">Gallery</span>
          </div>
          <div className="text-[12px] uppercase tracking-[0.22em] text-beyond-ivory/60 mt-1">
            by Beyond Jewellery
          </div>
          <p className={`mt-4 text-[13px] text-beyond-ivory/75 leading-relaxed max-w-md ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "Operated by BEYOND CONNECT GENERAL TRADING L.L.C, Dubai, United Arab Emirates. Trade License No. 1498624. General Trading."
              : "تُدار بواسطة شركة بيوند كونكت للتجارة العامة ذ.م.م، دبي، الإمارات. رخصة تجارية رقم 1498624. تجارة عامة."}
          </p>

          <Link
            href="/#home"
            className="mt-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-beyond-gold transition-colors group"
          >
            <span className="w-9 h-9 rounded-xl bg-beyond-gold/15 flex items-center justify-center text-beyond-gold font-display text-lg font-bold">
              G
            </span>
            <span className="text-start">
              <span className="block text-[11px] uppercase tracking-[0.22em] text-beyond-ivory/55">
                {lang === "en" ? "Powered by" : "بدعم"}
              </span>
              <span className={`block font-display text-[15px] font-semibold text-beyond-ivory ${lang === "ar" ? "font-arabic-display" : ""}`}>
                GiftMajlis,{" "}
                <span className={`text-beyond-ivory/70 font-normal text-[12.5px] ${lang === "ar" ? "font-arabic" : ""}`}>
                  {lang === "en"
                    ? "the UAE WhatsApp first gifting and sourcing platform."
                    : "منصّة الإمارات للهدايا والتوريد عبر واتساب."}
                </span>
              </span>
            </span>
          </Link>
        </div>

        <div>
          <div className="text-[12px] uppercase tracking-[0.22em] text-beyond-gold mb-3">
            {lang === "en" ? "Quick Links" : "روابط سريعة"}
          </div>
          <ul className={`space-y-2 text-[13.5px] ${lang === "ar" ? "font-arabic" : ""}`}>
            {links.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-beyond-ivory/80 hover:text-beyond-gold">
                  {l.label}
                </Link>
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
            {WA_DISPLAY}
          </a>
          <div className="mt-3 text-[12px] text-beyond-ivory/65">
            <a href={`mailto:${EMAIL}`} className="hover:text-beyond-gold">{EMAIL}</a>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full border border-beyond-ivory/20 flex items-center justify-center hover:border-beyond-gold">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-9 h-9 rounded-full border border-beyond-ivory/20 flex items-center justify-center hover:border-beyond-gold">
              <TikTokIcon className="w-4 h-4" />
            </a>
            <a href={NOON_URL} target="_blank" rel="noopener noreferrer" aria-label="Noon UAE" className="w-9 h-9 rounded-full border border-beyond-ivory/20 flex items-center justify-center hover:border-beyond-gold">
              <TagIcon className="w-4 h-4" />
            </a>
            <a href={`mailto:${EMAIL}`} aria-label="Email" className="w-9 h-9 rounded-full border border-beyond-ivory/20 flex items-center justify-center hover:border-beyond-gold">
              <MailIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-beyond-ivory/10">
        <div className={`max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11.5px] text-beyond-ivory/60 ${lang === "ar" ? "font-arabic" : ""}`}>
          <span>
            © {new Date().getFullYear()} Beyond Gallery by Beyond Jewellery, Dubai, UAE.
          </span>
          <span>
            {lang === "en"
              ? "Prices in AED including 5 percent VAT. Availability confirmed before order."
              : "الأسعار بالدرهم شاملة ضريبة القيمة المضافة 5%. التوفر يتأكد قبل الطلب."}
          </span>
        </div>
      </div>
    </footer>
  );
}

// Cookie consent
function CookieConsent({ lang }: { lang: "en" | "ar" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (!window.localStorage.getItem("bg_cookie_ack")) {
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);
  const dismiss = () => {
    try { window.localStorage.setItem("bg_cookie_ack", "1"); } catch {}
    setVisible(false);
  };
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.35 }}
          className="fixed bottom-20 md:bottom-4 inset-x-3 md:inset-x-auto md:end-4 md:max-w-md z-40 bg-beyond-charcoal text-beyond-ivory rounded-3xl p-4 sm:p-5 beyond-card-shadow border border-white/10"
          role="dialog"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-beyond-gold/15 flex items-center justify-center text-beyond-gold shrink-0">
              <ShieldIcon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className={`font-display text-[15px] font-semibold ${lang === "ar" ? "font-arabic-display" : ""}`}>
                {lang === "en" ? "We respect your privacy." : "نحترم خصوصيتك."}
              </div>
              <p className={`text-[12px] text-beyond-ivory/75 mt-1 leading-relaxed ${lang === "ar" ? "font-arabic" : ""}`}>
                {lang === "en"
                  ? "We use essential cookies to make this site work and optional analytics to improve it. You can change this anytime."
                  : "نستخدم ملفات تعريف ارتباط ضرورية لتشغيل الموقع وأخرى تحليلية اختيارية لتحسينه. يمكنك تغيير ذلك في أي وقت."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={dismiss}
                  className="px-3.5 py-2 rounded-full bg-beyond-emerald text-white text-[12.5px] font-semibold"
                >
                  {lang === "en" ? "Accept All" : "أوافق على الكل"}
                </button>
                <button
                  onClick={dismiss}
                  className="px-3.5 py-2 rounded-full bg-white/10 text-beyond-ivory text-[12.5px] font-semibold border border-white/15 hover:border-beyond-gold"
                >
                  {lang === "en" ? "Essential Only" : "ضرورية فقط"}
                </button>
                <Link
                  href="/policies#privacy"
                  className="px-3.5 py-2 rounded-full text-beyond-gold text-[12.5px] font-semibold hover:underline"
                >
                  {lang === "en" ? "Learn more" : "المزيد"}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Mobile sticky bottom bar
function MobileStickyBar({ lang }: { lang: "en" | "ar" }) {
  const items = [
    { icon: CartIcon, label: lang === "en" ? "Shop" : "تسوّق", href: "#collections" },
    { icon: WhatsAppIcon, label: "WhatsApp", href: WA_BASE, highlight: true },
    { icon: Grid2x2, label: lang === "en" ? "Categories" : "التصنيفات", href: "#collections" },
    { icon: FileTextIcon, label: lang === "en" ? "Quote" : "عرض سعر", href: "#corporate" },
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
            } ${lang === "ar" ? "font-arabic" : ""}`}
          >
            <it.icon className="w-5 h-5" />
            <span className="font-semibold">{it.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
