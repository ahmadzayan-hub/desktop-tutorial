import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./brand.css";

const SITE = "https://beyondgallery.ae";

// Platform identity:
// Project / platform name: GiftMajlis.
// Problem solved: UAE buyers waste time hunting for trustworthy curated
// gifts and B2B supply across WhatsApp, Noon, Amazon and Instagram.
// GiftMajlis is the UAE WhatsApp first gathering room for curated gifting,
// lifestyle accessories and corporate or institutional sourcing.
// Beyond Gallery is the flagship storefront running on GiftMajlis.

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  applicationName: "Beyond Gallery",
  title: {
    default:
      "Beyond Gallery by Beyond Jewellery | Accessories, Gifts, Corporate Gifts and Lifestyle Products in UAE",
    template: "%s | Beyond Gallery",
  },
  description:
    "Shop curated accessories, personalised gifts, drawing boards, decorative items, corporate gifts and selected UAE supply products from Beyond Gallery by Beyond Jewellery, operated by BEYOND CONNECT GENERAL TRADING L.L.C in Dubai. Powered by GiftMajlis, the UAE WhatsApp first gifting and sourcing platform.",
  keywords: [
    "Beyond Jewellery UAE",
    "Beyond Gallery UAE",
    "GiftMajlis",
    "GiftMajlis UAE",
    "WhatsApp gift store UAE",
    "fashion accessories UAE",
    "personalised bracelet UAE",
    "Arabic bracelet UAE",
    "Hamsa bracelet UAE",
    "evil eye bracelet UAE",
    "gift items UAE",
    "corporate gifts Dubai",
    "drawing board UAE",
    "promotional gifts UAE",
    "office supplies Dubai",
    "general trading company Dubai",
    "Beyond Connect General Trading",
    "هدايا الإمارات",
    "إكسسوارات دبي",
    "هدايا شركات دبي",
    "توصيل هدايا واتساب",
  ],
  authors: [{ name: "BEYOND CONNECT GENERAL TRADING L.L.C", url: SITE }],
  creator: "Beyond Gallery",
  publisher: "BEYOND CONNECT GENERAL TRADING L.L.C",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    title:
      "Beyond Gallery by Beyond Jewellery | Accessories, Gifts and Lifestyle in UAE",
    description:
      "Curated accessories, personalised gifts, drawing boards, decorative items, corporate gifts and selected UAE supply products from Dubai. Powered by GiftMajlis.",
    url: SITE,
    siteName: "Beyond Gallery on GiftMajlis",
    locale: "en_AE",
    alternateLocale: ["ar_AE"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beyond Gallery by Beyond Jewellery",
    description:
      "Curated UAE storefront on GiftMajlis for accessories, personalised gifts, corporate gifts and supply.",
  },
  alternates: {
    canonical: SITE,
    languages: {
      "en-AE": SITE,
      "ar-AE": `${SITE}?lang=ar`,
      "x-default": SITE,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F1" },
    { media: "(prefers-color-scheme: dark)", color: "#1F2933" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

// FAQ data used by both the schema (server-rendered) and the on-page FAQ
// component. Keeping the source of truth in the layout means Google's
// FAQPage rich result matches what the user sees on the page.
const FAQ_ITEMS = [
  {
    q: "How do I order from Beyond Gallery in the UAE?",
    a: "Send a WhatsApp message to +971 55 155 6991 with the product you want, your emirate, and any personalisation notes. We reply within 10 minutes during operating hours (9am to 11pm daily) with a confirmation, total in AED including 5% VAT, and expected dispatch date.",
  },
  {
    q: "How long does delivery take across the UAE?",
    a: "In-stock items reach any of the seven emirates within 1 to 2 business days via Halan or Careem. Made to order items take 3 to 7 business days. You receive a live tracking link on WhatsApp after dispatch.",
  },
  {
    q: "Is delivery free?",
    a: "Delivery is free on orders 300 AED and above. Otherwise a 25 AED flat delivery fee is added, applied uniformly across all seven emirates.",
  },
  {
    q: "Do you accept cash on delivery?",
    a: "Yes. Cash on delivery is available across the UAE. We verify the delivery address and phone number on WhatsApp before dispatch to avoid failed drops.",
  },
  {
    q: "Do you offer corporate gift packs?",
    a: "Yes. We have three fixed corporate tiers: Starter (from 25 pieces, AED 32 per piece), Premium (from 50 pieces, AED 55 per piece, most requested) and VIP (100+ pieces, custom quote, PO invoicing, dedicated account manager). Custom mixes always available on WhatsApp.",
  },
  {
    q: "Can I return an item?",
    a: "You have 7 days to return a stock item in its original condition and packaging for a full refund. Personalised items are non-returnable unless faulty. See our Return and Exchange Policy at /policies for the full terms.",
  },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,400..700,0..100,0..1&family=Inter:wght@400;500;600;700&family=Alexandria:wght@400;500;600;700&family=Tajawal:wght@400;500;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap"
        />
        <link rel="alternate" hrefLang="en-AE" href={SITE} />
        <link rel="alternate" hrefLang="ar-AE" href={`${SITE}?lang=ar`} />
        <link rel="alternate" hrefLang="x-default" href={SITE} />

        {/* Store JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Beyond Gallery by Beyond Jewellery",
              alternateName: ["بيوند جاليري", "Beyond Gallery UAE"],
              description:
                "Curated UAE lifestyle and gift brand offering accessories, personalised gifts, drawing boards, decorative items, corporate gifts and selected supply products. Operated on the GiftMajlis platform.",
              url: SITE,
              logo: `${SITE}/icon`,
              image: `${SITE}/opengraph-image`,
              telephone: "+971551556991",
              email: "info@beyondconnect.ae",
              priceRange: "AED",
              sameAs: [
                "https://www.instagram.com/beyond.style.uae",
                "https://www.tiktok.com/@beyondstyleuae",
                "https://www.noon.com/uae-ar/seller/p-443679/",
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Dubai",
                addressCountry: "AE",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                opens: "09:00",
                closes: "23:00",
              },
              parentOrganization: {
                "@type": "Organization",
                name: "BEYOND CONNECT GENERAL TRADING L.L.C",
                identifier: "Trade License No. 1498624",
              },
              areaServed: {
                "@type": "Country",
                name: "United Arab Emirates",
              },
              currenciesAccepted: "AED",
              paymentAccepted:
                "Visa, Mastercard, Apple Pay, Google Pay, Tabby, Tamara, Bank Transfer, Cash on Delivery",
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Beyond Gallery Categories",
                itemListElement: [
                  { "@type": "OfferCatalog", name: "Accessories" },
                  { "@type": "OfferCatalog", name: "Personalised Gifts" },
                  { "@type": "OfferCatalog", name: "Drawing Boards" },
                  { "@type": "OfferCatalog", name: "Lifestyle Decor" },
                  { "@type": "OfferCatalog", name: "Corporate Gifts" },
                  { "@type": "OfferCatalog", name: "B2B Supply" },
                ],
              },
              potentialAction: {
                "@type": "OrderAction",
                target: "https://wa.me/971551556991",
                name: "Order on WhatsApp",
              },
              isPartOf: {
                "@type": "OnlinePlatform",
                name: "GiftMajlis",
                description:
                  "The UAE WhatsApp first gifting and sourcing platform for curated retail and corporate or institutional buyers.",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                bestRating: "5",
                ratingCount: "312",
              },
            }),
          }}
        />

        {/* FAQPage JSON-LD — matches the on-page FAQ so Google's rich result
            is truthful, and AI answer engines (Perplexity, Gemini, ChatGPT
            search) get clean structured facts. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ_ITEMS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.a,
                },
              })),
            }),
          }}
        />

        {/* BreadcrumbList JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE },
                { "@type": "ListItem", position: 2, name: "Policies", item: `${SITE}/policies` },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-beyond-ivory text-beyond-charcoal font-bg-body antialiased">
        {children}
      </body>
    </html>
  );
}
