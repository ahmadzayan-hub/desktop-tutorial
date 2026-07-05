import type { SupportedLanguage } from './i18n';

const localeMap: Record<SupportedLanguage, string> = {
  en: 'en-AE',
  ar: 'ar-AE',
};

export function formatCurrencyAED(value: number, lang: SupportedLanguage): string {
  return new Intl.NumberFormat(localeMap[lang], {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(
  date: Date | string | number,
  lang: SupportedLanguage,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(localeMap[lang], options).format(d);
}

export function formatPercent(value: number, lang: SupportedLanguage): string {
  return new Intl.NumberFormat(localeMap[lang], {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  reason?: 'tooShort' | 'weak';
} {
  if (password.length < 8) return { valid: false, reason: 'tooShort' };
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, reason: 'weak' };
  }
  return { valid: true };
}
