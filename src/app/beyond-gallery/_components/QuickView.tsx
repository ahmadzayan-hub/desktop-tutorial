"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { CloseIcon, HeartIcon, ShieldIcon, WhatsAppIcon } from "./icons";
import ProductTile, { type Variant } from "./ProductTile";

export type QuickViewProduct = {
  name: string;
  nameAr: string;
  benefit: string;
  benefitAr: string;
  price: string;
  variant: Variant;
};

export default function QuickView({
  product,
  onClose,
  lang,
  waHref,
}: {
  product: QuickViewProduct | null;
  onClose: () => void;
  lang: "en" | "ar";
  waHref: string;
}) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-3xl bg-beyond-ivory rounded-t-3xl sm:rounded-3xl overflow-hidden beyond-card-shadow border border-beyond-line max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 end-3 z-10 w-9 h-9 rounded-full bg-white border border-beyond-line flex items-center justify-center text-beyond-charcoal hover:text-beyond-gold"
            >
              <CloseIcon className="w-4 h-4" />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="bg-white">
                <ProductTile variant={product.variant} />
              </div>

              <div className="p-5 sm:p-7">
                <div className="text-[11px] uppercase tracking-[0.22em] text-beyond-gold font-semibold">
                  Beyond Gallery
                </div>
                <h3 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-beyond-charcoal">
                  {lang === "en" ? product.name : product.nameAr}
                </h3>
                <p className="mt-2 text-[14px] text-beyond-charcoal/75 leading-relaxed">
                  {lang === "en" ? product.benefit : product.benefitAr}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="font-display text-2xl font-semibold beyond-gold-gradient">
                    {product.price}
                  </div>
                  <button
                    aria-label="Save to wishlist"
                    className="w-9 h-9 rounded-full border border-beyond-line text-beyond-charcoal/50 hover:text-beyond-gold hover:border-beyond-gold flex items-center justify-center"
                  >
                    <HeartIcon className="w-4 h-4" />
                  </button>
                </div>

                <ul className="mt-5 space-y-2 text-[13px]">
                  {(lang === "en"
                    ? [
                        "Real photos available on WhatsApp before order",
                        "Personalisation in English or Arabic",
                        "AED price confirmed before order completion",
                        "UAE-wide delivery and invoice on request",
                      ]
                    : [
                        "صور حقيقية متاحة عبر واتساب قبل الطلب",
                        "تخصيص بالعربية أو الإنجليزية",
                        "السعر بالدرهم يُؤكَّد قبل إتمام الطلب",
                        "توصيل لكل الإمارات وفاتورة عند الطلب",
                      ]
                  ).map((t) => (
                    <li key={t} className="flex items-start gap-2 text-beyond-charcoal/85">
                      <ShieldIcon className="w-3.5 h-3.5 text-beyond-emerald mt-0.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 grid gap-2">
                  <a
                    href={waHref}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-emerald text-white font-semibold text-[14px] beyond-wa-pulse"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    {lang === "en" ? "Order this on WhatsApp" : "اطلب عبر واتساب"}
                  </a>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-charcoal text-beyond-ivory font-semibold text-[13px]"
                  >
                    {lang === "en" ? "Keep browsing" : "تابع التصفّح"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
