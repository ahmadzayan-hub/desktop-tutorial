"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

interface Props {
  className?: string;
}

/**
 * Wordmark for the platform brand.
 *
 * - English: "Prompt ZAI@n" — the @ replaces the 'a' in "Zaian", giving the
 *   mark a distinctive tech feel. Rendered in two weights for emphasis.
 * - Arabic: "موجة زيان" (Mawjat Zayan / "Zayan's wave").
 *
 * The component picks the right form based on the active locale, but always
 * renders the *other* form as a small subtitle so both audiences recognise
 * the platform.
 */
export default function Wordmark({ className }: Props) {
  const { locale } = useI18n();
  const en = (
    <>
      <span className="font-semibold tracking-tight">Prompt&nbsp;</span>
      <span className="font-bold tracking-tight">
        ZAI<span className="text-brand-600">@</span>n
      </span>
    </>
  );
  const ar = <span className="font-semibold tracking-tight">موجة زيان</span>;

  return (
    <span className={"flex flex-col leading-tight min-w-0 " + (className ?? "")}>
      <span className="text-base sm:text-lg truncate">
        {locale === "ar" ? ar : en}
      </span>
      <span className="text-[10px] text-slate-500 font-normal truncate" aria-hidden="true">
        {locale === "ar" ? "Prompt ZAI@n" : "موجة زيان"}
      </span>
    </span>
  );
}
