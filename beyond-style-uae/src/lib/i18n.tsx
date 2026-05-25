import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

// Central bilingual dictionary. Arabic renders in Alexandria via the RTL rule.
const DICT: Dict = {
  "nav.shop": { en: "Shop", ar: "تسوّق" },
  "nav.cart": { en: "Cart", ar: "السلة" },
  "cart.empty": { en: "Your cart is empty", ar: "سلتك فارغة" },
  "cart.subtotal": { en: "Subtotal", ar: "المجموع الفرعي" },
  "cart.checkout": { en: "Checkout", ar: "إتمام الطلب" },
  "cart.addToCart": { en: "Add to Cart", ar: "أضف إلى السلة" },
  "ship.unlock": {
    en: "Add {amount} to unlock Free Delivery",
    ar: "أضف {amount} للحصول على توصيل مجاني",
  },
  "ship.unlocked": {
    en: "You've unlocked Free Delivery!",
    ar: "لقد حصلت على توصيل مجاني!",
  },
  "pdp.care": { en: "Jewelry Care", ar: "العناية بالمجوهرات" },
  "pdp.reviews": { en: "Customer Reviews", ar: "آراء العملاء" },
  "pay.cod": { en: "Cash on Delivery", ar: "الدفع عند الاستلام" },
};

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof DICT, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(
    () => (localStorage.getItem("locale") as Locale) || "en",
  );

  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem("locale", locale);
  }, [locale, dir]);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir,
      setLocale,
      t: (key, vars) => {
        let s = DICT[key]?.[locale] ?? String(key);
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
        return s;
      },
    }),
    [locale, dir],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
