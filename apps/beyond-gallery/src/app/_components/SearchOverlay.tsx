"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS, type Product } from "../../data/products";
import { JOURNAL, type JournalPost } from "../../data/journal";
import { CloseIcon, SearchIcon, WhatsAppIcon } from "./icons";
import ProductTile from "./ProductTile";

const WA_BASE = "https://wa.me/971551556991";

// Simple case-insensitive substring match against the fields we index.
function scoreProduct(p: Product, q: string): number {
  const hay = `${p.name} ${p.nameAr} ${p.benefit} ${p.benefitAr} ${p.category} ${p.longDescriptionEn ?? ""} ${p.longDescriptionAr ?? ""}`.toLowerCase();
  return hay.includes(q) ? 1 : 0;
}
function scorePost(p: JournalPost, q: string): number {
  const hay = `${p.titleEn} ${p.titleAr} ${p.excerptEn} ${p.excerptAr} ${p.category} ${p.categoryAr}`.toLowerCase();
  return hay.includes(q) ? 1 : 0;
}

export default function SearchOverlay({
  open,
  onClose,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  lang: "en" | "ar";
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while overlay is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const query = q.trim().toLowerCase();
  const { productHits, postHits } = useMemo(() => {
    if (!query) return { productHits: [] as Product[], postHits: [] as JournalPost[] };
    return {
      productHits: PRODUCTS.filter((p) => scoreProduct(p, query)).slice(0, 8),
      postHits: JOURNAL.filter((p) => scorePost(p, query)).slice(0, 4),
    };
  }, [query]);

  const nothing = query && productHits.length === 0 && postHits.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-6 sm:pt-14"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={lang === "en" ? "Search Beyond Gallery" : "بحث في بيوند جاليري"}
        >
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-[min(720px,92vw)] max-h-[85vh] overflow-hidden rounded-3xl bg-beyond-ivory border border-beyond-line beyond-shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-beyond-line">
              <SearchIcon className="w-5 h-5 text-beyond-gold shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "Search products, guides and categories"
                    : "ابحث في المنتجات والمقالات والفئات"
                }
                className={`flex-1 bg-transparent border-none outline-none text-[15px] placeholder:text-beyond-charcoal/40 ${lang === "ar" ? "font-arabic" : ""}`}
                aria-label={lang === "en" ? "Search" : "بحث"}
              />
              <button
                onClick={onClose}
                aria-label={lang === "en" ? "Close search" : "إغلاق البحث"}
                className="text-beyond-charcoal/50 hover:text-beyond-charcoal"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!query && (
                <div className={`p-6 text-center text-beyond-charcoal/60 text-[13px] ${lang === "ar" ? "font-arabic" : ""}`}>
                  {lang === "en"
                    ? "Try: bracelet, corporate, delivery, VIP, or bridal."
                    : "جرّب: إسوارة، شركات، توصيل، VIP، أو زفاف."}
                </div>
              )}

              {productHits.length > 0 && (
                <div className="p-4 sm:p-5">
                  <div className={`text-[11px] font-semibold uppercase tracking-wider text-beyond-gold mb-2 ${lang === "ar" ? "font-arabic tracking-normal" : ""}`}>
                    {lang === "en" ? "Products" : "منتجات"}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {productHits.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={onClose}
                        className="beyond-lift rounded-2xl overflow-hidden border border-beyond-line bg-white beyond-shadow hover:beyond-shadow-lg"
                      >
                        <ProductTile variant={p.variant} ribbon={p.ribbon} lang={lang} />
                        <div className="p-2.5">
                          <div className={`text-[12.5px] font-semibold text-beyond-charcoal line-clamp-1 ${lang === "ar" ? "font-arabic" : ""}`}>
                            {lang === "en" ? p.name : p.nameAr}
                          </div>
                          <div className="text-[11px] text-beyond-gold font-semibold mt-0.5">{p.price}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {postHits.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-beyond-line">
                  <div className={`text-[11px] font-semibold uppercase tracking-wider text-beyond-gold mb-2 ${lang === "ar" ? "font-arabic tracking-normal" : ""}`}>
                    {lang === "en" ? "Journal" : "من المجلة"}
                  </div>
                  <div className="grid gap-2">
                    {postHits.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/journal/${p.slug}`}
                        onClick={onClose}
                        className="beyond-lift rounded-2xl border border-beyond-line bg-white beyond-shadow hover:beyond-shadow-lg p-3 flex items-start gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-beyond-gold/15 flex items-center justify-center text-beyond-gold font-display font-bold text-sm shrink-0">
                          {p.category.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-[13.5px] font-semibold text-beyond-charcoal line-clamp-1 ${lang === "ar" ? "font-arabic-display" : ""}`}>
                            {lang === "en" ? p.titleEn : p.titleAr}
                          </div>
                          <div className={`text-[12px] text-beyond-charcoal/65 line-clamp-2 mt-0.5 ${lang === "ar" ? "font-arabic" : ""}`}>
                            {lang === "en" ? p.excerptEn : p.excerptAr}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {nothing && (
                <div className={`p-8 text-center ${lang === "ar" ? "font-arabic" : ""}`}>
                  <div className="text-[14px] text-beyond-charcoal/70">
                    {lang === "en"
                      ? `No results for "${q}". Ask us on WhatsApp and we will find it.`
                      : `لا توجد نتائج للبحث عن "${q}". اسألنا عبر واتساب وسنجدها لك.`}
                  </div>
                  <a
                    href={`${WA_BASE}?text=${encodeURIComponent(`Hello Beyond Gallery, I am looking for: ${q}`)}`}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-beyond-emerald text-white text-[12.5px] font-semibold"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    {lang === "en" ? "Ask on WhatsApp" : "اسأل عبر واتساب"}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
