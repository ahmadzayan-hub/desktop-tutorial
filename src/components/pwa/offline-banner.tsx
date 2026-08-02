"use client";

// Global online/offline indicator. Shows a slim bar at the top of the
// viewport whenever the browser reports the network is unreachable, and
// disappears as soon as the connection is restored. Purely presentational
// — actual offline behaviour is handled by the service worker.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WifiOff } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";

export function OfflineBanner() {
  const { locale, dir } = useLocale();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const isAr = locale === "ar";

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          role="status"
          aria-live="polite"
          dir={dir}
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-0 z-50 bg-amber-50 text-amber-900 shadow-sm"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium">
            <WifiOff className="h-3.5 w-3.5" />
            {isAr
              ? "أنت غير متصل بالإنترنت — الميزات المخزّنة محلّياً لا تزال متاحة."
              : "You're offline — locally-cached features still work."}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
