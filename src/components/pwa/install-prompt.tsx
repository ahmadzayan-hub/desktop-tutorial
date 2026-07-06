"use client";

// Registers the service worker and surfaces a friendly install banner
// when the browser fires `beforeinstallprompt` (Android Chrome, Edge).
// Suppresses itself for one week after dismissal.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Smartphone, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const SNOOZE_KEY = "mutabasir.pwa.snooze";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function InstallPrompt() {
  const { locale, dir } = useLocale();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      // Register on idle so it never competes with initial paint.
      const register = () =>
        navigator.serviceWorker.register("/sw.js").catch(() => {
          /* silent */
        });
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void) => void;
      };
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(register);
      } else {
        window.setTimeout(register, 1500);
      }
    }

    const snoozed = Number(localStorage.getItem(SNOOZE_KEY) ?? "0");
    if (Date.now() < snoozed) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function accept() {
    if (!event) return;
    await event.prompt();
    await event.userChoice.catch(() => null);
    setEvent(null);
    setVisible(false);
  }
  function dismiss() {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + WEEK));
    setVisible(false);
    setEvent(null);
  }

  const isAr = locale === "ar";

  return (
    <AnimatePresence>
      {visible && event && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          dir={dir}
          className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-brand-navy/10 bg-white p-4 shadow-lg sm:bottom-6"
          role="dialog"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-navy text-white">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-navy">
                {isAr ? "ثبّت مُتَبَصِّر على جهازك" : "Install Mutabasir"}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                {isAr
                  ? "اعمل بلا اتصال، وافتح لوحاتك من الشاشة الرئيسية مباشرة."
                  : "Work offline and open your dashboards straight from the home screen."}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={accept}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-navy px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-brand-navy/90"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isAr ? "تثبيت" : "Install"}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-brand-navy"
                >
                  {isAr ? "لاحقاً" : "Not now"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-navy"
              aria-label={isAr ? "إغلاق" : "Close"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
