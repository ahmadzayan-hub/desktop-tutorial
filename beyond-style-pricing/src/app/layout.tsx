import type { Metadata, Viewport } from 'next';
import { getLocale, dir } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beyond Style UAE — Smart Pricing Brain',
  description:
    'Bilingual jewelry pricing platform: transparent cost formulas, margin protection, AI photo estimation and customer quotations.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' },
  appleWebApp: { capable: true, title: 'Beyond Style Pricing', statusBarStyle: 'black' },
};

export const viewport: Viewport = {
  themeColor: '#C5A059',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale} dir={dir(locale)}>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`,
          }}
        />
      </body>
    </html>
  );
}
