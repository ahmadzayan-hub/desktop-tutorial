"use client";

import { useT } from "@/lib/i18n/I18nProvider";

export default function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500">
        {t("footer.note")}
      </div>
    </footer>
  );
}
