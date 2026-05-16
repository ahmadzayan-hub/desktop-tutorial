"use client";

import { AnimatePresence, motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, WhatsAppIcon } from "./icons";

// ---------- Scroll progress bar (top of page) ----------

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="fixed top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#E2C079] via-[#B68A35] to-[#1F6F5B] z-[60]"
    />
  );
}

// ---------- Back to top button ----------

export function BackToTop({ lang }: { lang: "en" | "ar" }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={lang === "en" ? "Back to top" : "العودة للأعلى"}
          className="fixed bottom-24 md:bottom-6 end-3 md:end-6 z-40 w-11 h-11 rounded-full bg-beyond-charcoal text-beyond-gold border border-white/10 beyond-card-shadow flex items-center justify-center hover:bg-beyond-navy"
        >
          <ArrowRight className="w-4 h-4 -rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ---------- Floating WhatsApp bubble (desktop) ----------

export function FloatingWhatsApp({
  href,
  lang,
}: {
  href: string;
  lang: "en" | "ar";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="hidden md:block fixed bottom-6 start-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="mb-3 w-72 rounded-2xl bg-white border border-beyond-line beyond-card-shadow p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-beyond-emerald text-white flex items-center justify-center">
                <WhatsAppIcon className="w-4 h-4" />
              </span>
              <div className="font-display text-[15px] font-semibold text-beyond-charcoal">
                {lang === "en" ? "Chat with us" : "تواصل معنا"}
              </div>
            </div>
            <p className="text-[12.5px] text-beyond-charcoal/70 leading-snug">
              {lang === "en"
                ? "Ask about products, prices in AED, customisation, delivery or bulk orders."
                : "اسأل عن المنتجات والأسعار بالدرهم والتخصيص والتوصيل والجملة."}
            </p>
            <div className="mt-3 grid gap-2">
              {(lang === "en"
                ? ["Ask Before You Buy", "Check Availability", "Request Bulk Price"]
                : ["استفسر قبل الشراء", "تحقق من التوفر", "اطلب سعر جملة"]
              ).map((label) => (
                <a
                  key={label}
                  href={`${href}?text=${encodeURIComponent(`Hello Beyond Gallery, ${label}.`)}`}
                  className="text-[12.5px] font-semibold text-beyond-emerald bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl text-start"
                >
                  → {label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((s) => !s)}
        aria-label="Open WhatsApp"
        className="w-14 h-14 rounded-full bg-beyond-emerald text-white flex items-center justify-center beyond-card-shadow beyond-wa-pulse"
      >
        <WhatsAppIcon className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

// ---------- Animated stat counter ----------

function useCountUp(target: number, duration = 1400) {
  const v = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      v.set(eased * target);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, v]);
  return display;
}

export function StatCounter({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const [start, setStart] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { setStart(true); io.disconnect(); }
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-3xl sm:text-4xl font-semibold beyond-gold-gradient">
        {start ? <Animated v={value} /> : 0}
        {suffix}
      </div>
      <div className="mt-1 text-[12.5px] text-beyond-charcoal/70">{label}</div>
    </div>
  );
}

function Animated({ v }: { v: number }) {
  const display = useCountUp(v);
  return <>{display}</>;
}
