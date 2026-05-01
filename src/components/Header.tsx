"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Header() {
  const { t, locale, setLocale } = useI18n();
  const otherLocale = locale === "en" ? "ar" : "en";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        <a href="/" className="flex items-center gap-2 font-semibold tracking-tight min-w-0">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 shadow-md shadow-brand-600/40 flex-shrink-0" />
          <span className="truncate">{t("app.name")}</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <a href="/workspace" className="btn-ghost">{t("nav.workspace")}</a>
          <a href="/templates" className="btn-ghost">{t("nav.templates")}</a>
          <a href="/history" className="btn-ghost">{t("nav.history")}</a>
          <a href="/login" className="btn-ghost">{t("nav.signin")}</a>
          <button
            onClick={() => setLocale(otherLocale)}
            className="btn-ghost border border-slate-200 text-xs"
            aria-label="Toggle language"
          >
            {t("lang.toggle")}
          </button>
        </nav>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={() => setLocale(otherLocale)}
            className="btn-ghost border border-slate-200 text-xs px-2 py-1"
            aria-label="Toggle language"
          >
            {t("lang.toggle")}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn-ghost px-2 py-1"
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="md:hidden border-t border-slate-200 bg-white/95">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            <a href="/workspace" className="btn-ghost justify-start">{t("nav.workspace")}</a>
            <a href="/templates" className="btn-ghost justify-start">{t("nav.templates")}</a>
            <a href="/history" className="btn-ghost justify-start">{t("nav.history")}</a>
            <a href="/login" className="btn-ghost justify-start">{t("nav.signin")}</a>
          </div>
        </nav>
      )}
    </header>
  );
}
