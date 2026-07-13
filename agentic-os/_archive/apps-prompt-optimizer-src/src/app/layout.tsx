import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://promptoptimizer.ai";
const TITLE = "Prompt Optimizer — AI Prompt Engineering Platform";
const DESCRIPTION =
  "Optimize, refine, and compare AI prompts with real-time quality scoring, multi-model support, voice input, and a powerful template library. Build better prompts faster.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: "%s · Prompt Optimizer" },
  description: DESCRIPTION,
  applicationName: "Prompt Optimizer",
  appleWebApp: { capable: true, title: "Prompt Optimizer", statusBarStyle: "default" },
  icons: { icon: "/icon.svg" },
  authors: [{ name: "Prompt Optimizer", url: APP_URL }],
  keywords: [
    "prompt engineering", "AI prompts", "ChatGPT prompts", "Claude prompts",
    "prompt optimization", "LLM tools", "AI writing", "prompt templates",
    "multi-model AI", "voice to prompt", "prompt quality score"
  ],
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "Prompt Optimizer",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Prompt Optimizer" }]
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"]
  },
  robots: { index: true, follow: true },
  alternates: { canonical: APP_URL },
};

export const viewport: Viewport = {
  themeColor: "#4f56f5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='po_theme',v=localStorage.getItem(k);var d=v==='dark'||((v===null||v==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:text-brand-700 focus:font-medium"
        >
          Skip to content
        </a>
        <I18nProvider>
          {children}
        </I18nProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}`
          }}
        />
      </body>
    </html>
  );
}
