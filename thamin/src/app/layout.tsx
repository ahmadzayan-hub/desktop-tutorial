import type { Metadata, Viewport } from 'next';
import { getLocale, dir } from '@/lib/i18n';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thamin.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Thamin ثمين | Smart Pricing for Beyond Style UAE',
    template: '%s | Thamin ثمين',
  },
  description:
    'Thamin is the smart pricing platform for Beyond Style UAE: transparent cost formulas, margin protection, photo-based estimation, customer quotations in Arabic and English, and a full pricing audit trail.',
  keywords: [
    'pricing calculator', 'jewelry pricing', 'accessories pricing', 'UAE',
    'تسعير', 'حاسبة التسعير', 'اكسسوارات', 'الإمارات', 'هامش الربح',
    'Beyond Style UAE', 'Thamin', 'ثمين',
  ],
  applicationName: 'Thamin',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  appleWebApp: { capable: true, title: 'Thamin', statusBarStyle: 'black' },
  alternates: { canonical: '/', languages: { en: '/', ar: '/' } },
  openGraph: {
    type: 'website',
    siteName: 'Thamin ثمين',
    title: 'Thamin ثمين | Smart Pricing for Beyond Style UAE',
    description:
      'Transparent pricing formulas, margin protection and bilingual customer quotations for UAE accessories business.',
    url: SITE_URL,
    locale: 'en_AE',
    alternateLocale: 'ar_AE',
  },
  twitter: {
    card: 'summary',
    title: 'Thamin ثمين | Smart Pricing for Beyond Style UAE',
    description: 'Transparent pricing formulas and margin protection for UAE accessories business.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  category: 'business',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Thamin ثمين',
  alternateName: 'Thamin Smart Pricing Platform',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android (PWA)',
  inLanguage: ['ar', 'en'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
  publisher: {
    '@type': 'Organization',
    name: 'Beyond Style UAE',
    areaServed: 'AE',
  },
  description:
    'Smart pricing platform for jewelry and fashion accessories in the UAE: cost formulas, margin protection, photo estimation and bilingual customer quotations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale} dir={dir(locale)}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`,
          }}
        />
      </body>
    </html>
  );
}
