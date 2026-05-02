import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrialBanner from "@/components/TrialBanner";
import { CONTACT_EMAIL } from "@/lib/contact";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const TITLE = "ZAIan Studio — AI Prompt Engineering · زيان ستوديو";
const DESCRIPTION =
  "Free from the UAE 🇦🇪 to the world. Engineer prompts of every kind — code, writing, research, video, audio, software, websites, reports, images — for ChatGPT, Claude, Copilot, and Gemini. Multilingual (EN/AR), voice + file uploads, works offline.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: "%s · ZAIan Studio" },
  description: DESCRIPTION,
  applicationName: "ZAIan Studio",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "ZAIan Studio", statusBarStyle: "default" },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  authors: [{ name: "Ahmad Zaian", url: `mailto:${CONTACT_EMAIL}` }],
  keywords: [
    "ZAIan Studio",
    "زيان ستوديو",
    "prompt engineering",
    "AI prompts",
    "ChatGPT",
    "Claude",
    "Copilot",
    "Gemini",
    "Arabic AI",
    "RTL",
    "voice prompt",
    "image prompt",
    "video prompt",
    "audio prompt",
    "software prompt",
    "research prompt",
    "UAE",
    "Emirates",
    "free AI tool"
  ],
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "ZAIan Studio",
    locale: "en_US",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "ZAIan Studio · زيان ستوديو" }]
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/icon.svg"]
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Apply theme before first paint to avoid a flash. Reads the same
            localStorage key + system preference that ThemeToggle uses. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='po_theme_v1',v=localStorage.getItem(k);var d=v==='dark'||((v===null||v==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-white focus:px-3 focus:py-1.5 focus:rounded focus:shadow"
        >
          Skip to content
        </a>
        {/* JSON-LD: WebApplication schema for richer search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "ZAIan Studio",
              alternateName: ["زيان ستوديو", "Prompts ZAIan"],
              description: DESCRIPTION,
              url: APP_URL,
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Any",
              isAccessibleForFree: true,
              countryOfOrigin: { "@type": "Country", name: "United Arab Emirates" },
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              author: { "@type": "Person", name: "Ahmad Zaian", email: CONTACT_EMAIL },
              inLanguage: ["en", "ar"]
            })
          }}
        />
        <I18nProvider>
          <div className="min-h-screen flex flex-col">
            <TrialBanner />
            <Header />
            <main id="main" className="flex-1">{children}</main>
            <Footer />
          </div>
        </I18nProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{})); }`
          }}
        />
      </body>
    </html>
  );
}
