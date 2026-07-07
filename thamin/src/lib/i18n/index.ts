import { cookies } from 'next/headers';
import { dictionaries, type Dict, type Locale } from './dict';

export type { Dict, Locale };
export const LOCALE_COOKIE = 'bsp_locale';

export function getLocale(): Locale {
  const v = cookies().get(LOCALE_COOKIE)?.value;
  return v === 'ar' ? 'ar' : 'en';
}

export function getDict(locale?: Locale): Dict {
  return dictionaries[locale ?? getLocale()];
}

export function dir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** Format an AED amount consistently for both locales (Latin digits, AED suffix). */
export function fmtAed(n: number, locale: Locale = 'en'): string {
  const num = new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
  return locale === 'ar' ? `${num} د.إ` : `AED ${num}`;
}
