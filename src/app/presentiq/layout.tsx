import { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { I18nProvider } from "@/lib/presentiq/i18n/context";
import { ContactBubble } from "@/components/presentiq/ui/ContactBubble";
import { PresentIqShell } from "./_shell";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tweenz.ae";
const PRESENTIQ_URL = `${APP_URL.replace(/\/$/, "")}/presentiq`;
const TITLE = "PresentIQ v0.3 — Boardroom-ready AI presentations";
const DESCRIPTION =
  "PresentIQ by Zaian is an AI Agent Platform for corporate presentation generation: brand-governed, evidence-controlled, editable PPTX exports, and full Arabic-RTL bilingual support — from raw content to boardroom-ready deck in minutes.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: "%s · PresentIQ" },
  description: DESCRIPTION,
  applicationName: "PresentIQ",
  keywords: [
    "PresentIQ",
    "AI presentations",
    "boardroom presentations",
    "corporate slides",
    "PPTX generator",
    "brand governance",
    "evidence-controlled AI",
    "Arabic RTL slides",
    "bilingual presentations",
    "AI agent platform",
    "executive decks",
    "PowerPoint AI",
    "enterprise AI",
    "عروض تقديمية بالذكاء الاصطناعي",
    "PresentIQ شرائح",
  ],
  alternates: {
    canonical: PRESENTIQ_URL,
    languages: { en: PRESENTIQ_URL, ar: PRESENTIQ_URL },
  },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: PRESENTIQ_URL,
    siteName: "PresentIQ",
    locale: "en_US",
    alternateLocale: ["ar_AE"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PresentIQ — Boardroom-ready AI presentations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PresentIQ",
  alternateName: ["PresentIQ AI", "PresentIQ Agent Platform"],
  description: DESCRIPTION,
  url: PRESENTIQ_URL,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Presentation Software",
  operatingSystem: "Any",
  inLanguage: ["en", "ar"],
  isAccessibleForFree: true,
  featureList: [
    "Corporate brand governance",
    "Evidence-controlled content generation",
    "Editable PPTX export",
    "Arabic-English bilingual with RTL",
    "Boardroom storytelling templates",
    "10-dimension corporate quality scoring",
    "Per-slide regeneration",
    "Human review and approval workflow",
  ],
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "29", priceCurrency: "USD" },
    { "@type": "Offer", name: "Business", price: "99", priceCurrency: "USD" },
  ],
  audience: {
    "@type": "Audience",
    audienceType: "Executives, consultants, and corporate teams",
  },
  publisher: {
    "@type": "Organization",
    name: "PresentIQ",
    url: PRESENTIQ_URL,
  },
};

export default function PresentIqLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider initial="en">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div data-pq className="min-h-screen">
        <PresentIqShell>{children}</PresentIqShell>
        <ContactBubble />
      </div>
    </I18nProvider>
  );
}
