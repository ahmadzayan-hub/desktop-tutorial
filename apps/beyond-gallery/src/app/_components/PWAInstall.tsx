"use client";

import { useEffect, useState } from "react";

// Browser-shipped install prompt event (Chromium only).
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Registers the service worker on mount and, on Chromium/Android, listens for
// the beforeinstallprompt event so we can render a native "Install app"
// button when the browser is ready. On iOS Safari we render a small hint
// instead (that platform requires manual Add to Home Screen).
export default function PWAInstall({ lang }: { lang: "en" | "ar" }) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register the service worker (no-op if unsupported).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => null);
    }

    const ua = navigator.userAgent || "";
    setIsIos(/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window));

    // Suppress if already installed (running standalone).
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    // Restore prior dismissal (24h cooldown).
    const dismissedAt = Number(localStorage.getItem("bg_pwa_dismissed") || 0);
    if (dismissedAt && Date.now() - dismissedAt < 24 * 60 * 60 * 1000) {
      setDismissed(true);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "dismissed") {
      localStorage.setItem("bg_pwa_dismissed", String(Date.now()));
      setDismissed(true);
    }
    setPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem("bg_pwa_dismissed", String(Date.now()));
    setDismissed(true);
  };

  if (installed || dismissed) return null;

  // Chromium/Android: full install prompt.
  if (prompt) {
    return (
      <div
        role="dialog"
        aria-live="polite"
        className="fixed z-40 left-3 right-3 bottom-24 md:bottom-6 md:left-auto md:right-6 md:max-w-sm rounded-2xl beyond-glass p-4 flex items-start gap-3"
      >
        <div className="shrink-0 w-11 h-11 rounded-xl bg-beyond-gold/15 flex items-center justify-center text-beyond-gold font-display font-bold text-lg">
          BG
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[13.5px] font-semibold text-beyond-charcoal ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en" ? "Install Beyond Gallery" : "ثبّت تطبيق بيوند جاليري"}
          </div>
          <div className={`text-[12px] text-beyond-charcoal/65 mt-0.5 ${lang === "ar" ? "font-arabic" : ""}`}>
            {lang === "en"
              ? "Faster, works offline, one tap to WhatsApp. Add it to your home screen."
              : "أسرع، يعمل بدون إنترنت، واتساب بلمسة واحدة. أضفه إلى شاشتك الرئيسية."}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={install}
              className={`px-3.5 py-1.5 rounded-full bg-beyond-gold text-white text-[12.5px] font-semibold hover:opacity-95 ${lang === "ar" ? "font-arabic" : ""}`}
            >
              {lang === "en" ? "Install" : "تثبيت"}
            </button>
            <button
              onClick={dismiss}
              className={`px-3 py-1.5 rounded-full border border-beyond-line text-beyond-charcoal/70 text-[12px] hover:bg-beyond-ivory ${lang === "ar" ? "font-arabic" : ""}`}
            >
              {lang === "en" ? "Not now" : "لاحقاً"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS Safari: instruction hint.
  if (isIos) {
    return (
      <div className="fixed z-40 left-3 right-3 bottom-24 md:bottom-6 md:left-auto md:right-6 md:max-w-sm rounded-2xl beyond-glass p-3.5">
        <div className={`flex items-start gap-3 ${lang === "ar" ? "font-arabic" : ""}`}>
          <div className="shrink-0 w-10 h-10 rounded-xl bg-beyond-gold/15 flex items-center justify-center text-beyond-gold font-display font-bold">
            BG
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] text-beyond-charcoal/85 leading-relaxed">
              {lang === "en"
                ? "To install on iPhone, tap the Share button then choose Add to Home Screen."
                : "للتثبيت على iPhone، اضغط زر المشاركة ثم اختر إضافة إلى الشاشة الرئيسية."}
            </div>
            <button
              onClick={dismiss}
              className="mt-2 text-[11.5px] font-semibold text-beyond-charcoal/60 hover:text-beyond-charcoal"
            >
              {lang === "en" ? "Dismiss" : "إغلاق"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
