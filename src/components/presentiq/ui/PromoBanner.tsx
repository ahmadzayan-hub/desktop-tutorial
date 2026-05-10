"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";

const STORAGE_KEY = "pq-banner-dismissed-v1";
const ROTATE_MS = 5500;

export function PromoBanner() {
  const { t, dir } = useI18n();
  // Start visible — SSR & first paint match. After mount we honour the
  // user's dismiss preference from localStorage.
  const [dismissed, setDismissed] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
    } catch { /* private mode etc — keep visible */ }
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const id = setInterval(() => setIdx((n) => (n + 1) % 3), ROTATE_MS);
    return () => clearInterval(id);
  }, [dismissed]);

  if (dismissed) return null;

  const messages = [t("banner.0"), t("banner.1"), t("banner.2")];

  return (
    <div className="pq-promo-banner" role="region" aria-label="Announcement" dir={dir}>
      <div className="pq-promo-banner-inner">
        <span className="pq-promo-dot" aria-hidden />
        <div className="pq-promo-track" key={idx}>
          {messages[idx]}
        </div>
        <Link href="/presentiq/projects/new" className="pq-promo-cta">
          {t("banner.cta")} <span className="pq-flip" aria-hidden>→</span>
        </Link>
        <div className="pq-promo-pips" aria-hidden>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              className={`pq-promo-pip ${i === idx ? "is-active" : ""}`}
              onClick={() => setIdx(i)}
              aria-label={`Show announcement ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={t("banner.close")}
          onClick={() => {
            setDismissed(true);
            try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
          }}
          className="pq-promo-close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
