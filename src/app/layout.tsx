import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrialBanner from "@/components/TrialBanner";
import { CONTACT_EMAIL } from "@/lib/contact";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const TITLE = "Prompt Orchestrator — AI Prompt Writing Assistant";
const DESCRIPTION =
  "Turn rough ideas into perfectly engineered prompts for ChatGPT, Claude, Copilot, and Gemini. Free, multilingual (EN/AR), works offline.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: "%s · Prompt Orchestrator" },
  description: DESCRIPTION,
  applicationName: "Prompt Orchestrator",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Prompt Orchestrator", statusBarStyle: "default" },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  authors: [{ name: "Ahmad Zaian", url: `mailto:${CONTACT_EMAIL}` }],
  keywords: [
    "prompt engineering",
    "AI",
    "ChatGPT",
    "Claude",
    "Copilot",
    "Gemini",
    "Arabic AI",
    "RTL",
    "voice prompt",
    "prompt orchestrator"
  ],
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "Prompt Orchestrator",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "Prompt Orchestrator" }]
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
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-white focus:px-3 focus:py-1.5 focus:rounded focus:shadow"
        >
          Skip to content
        </a>
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
