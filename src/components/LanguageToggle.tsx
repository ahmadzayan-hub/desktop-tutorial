import { useI18n } from "@/i18n/I18nContext";

/** Segmented EN / العربية toggle. Switches document dir instantly. */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={`inline-flex items-center rounded-full border border-coffee-100 bg-white p-0.5 text-xs font-semibold shadow-sm ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-3 py-1.5 transition ${
          lang === "en" ? "bg-coffee-700 text-cream-50" : "text-coffee-600 hover:bg-coffee-50"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        aria-pressed={lang === "ar"}
        className={`rounded-full px-3 py-1.5 font-arabic transition ${
          lang === "ar" ? "bg-coffee-700 text-cream-50" : "text-coffee-600 hover:bg-coffee-50"
        }`}
      >
        العربية
      </button>
    </div>
  );
}
