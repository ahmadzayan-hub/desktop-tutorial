"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

interface Props {
  className?: string;
}

export default function Wordmark({ className }: Props) {
  const { locale } = useI18n();

  const en = (
    <span className="font-bold tracking-tight">
      <span className="text-brand-600 dark:text-brand-300">Tweenz</span>
      <span className="text-slate-700 dark:text-slate-200 font-semibold"> AI</span>
    </span>
  );

  const ar = (
    <span className="font-semibold tracking-tight">
      Tweenz AI
    </span>
  );

  return (
    <span className={"flex flex-col leading-tight min-w-0 " + (className ?? "")}>
      <span className="text-base sm:text-lg truncate">
        {locale === "ar" ? ar : en}
      </span>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate" aria-hidden="true">
        {locale === "ar" ? "منصة التعلم الذكي" : "Smart Learning Platform"}
      </span>
    </span>
  );
}
