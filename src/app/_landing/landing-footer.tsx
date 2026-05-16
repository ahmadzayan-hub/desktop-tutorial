"use client";

import { Wordmark } from "@/components/branding/wordmark";
import { useLocale } from "@/lib/i18n/locale-provider";

export function LandingFooter() {
  const { t, dir } = useLocale();
  return (
    <footer className="border-t border-slate-200 bg-white" dir={dir}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Wordmark size="sm" />
        <p className="text-xs text-slate-500">{t.footer.built}</p>
        <p className="text-xs text-slate-400">mutabasir.ae</p>
      </div>
    </footer>
  );
}
