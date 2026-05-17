import type { Metadata } from "next";
import type { ReactNode } from "react";
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
  title:
    "Beyond Gallery by Beyond Jewellery | Accessories, Gifts, Corporate Gifts and Lifestyle Products in UAE",
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
  ],
  openGraph: {
    type: "website",
    title:
      "Beyond Gallery by Beyond Jewellery | Accessories, Gifts and Lifestyle in UAE",
    description:
      "Curated accessories, personalised gifts, drawing boards, decorative items, corporate gifts and selected UAE supply products from Dubai. Powered by GiftMajlis.",
    url: SITE,
    siteName: "Beyond Gallery on GiftMajlis",
    locale: "en_AE",
  },
  alternates: { canonical: `${SITE}/beyond-gallery` },
  robots: { index: true, follow: true },
};

export default function BeyondGalleryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Unique editorial typography stack:
          Fraunces (English display), Inter (English body),
          Alexandria + Tajawal (Arabic display + body). */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,400..700,0..100,0..1&family=Inter:wght@400;500;600;700&family=Alexandria:wght@400;500;600;700&family=Tajawal:wght@400;500;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "Beyond Gallery by Beyond Jewellery",
            description:
              "Curated UAE lifestyle and gift brand offering accessories, personalised gifts, drawing boards, decorative items, corporate gifts and selected supply products. Operated on the GiftMajlis platform.",
            url: SITE,
            telephone: "+971551556991",
            email: "info@beyondconnect.ae",
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
            parentOrganization: {
              "@type": "Organization",
              name: "BEYOND CONNECT GENERAL TRADING L.L.C",
              identifier: "Trade License No. 1498624",
            },
            areaServed: "United Arab Emirates",
            currenciesAccepted: "AED",
            paymentAccepted:
              "Visa, Mastercard, Apple Pay, Google Pay, Tabby, Tamara, Bank Transfer, Cash on Delivery",
            makesOffer: {
              "@type": "Offer",
              category: [
                "Accessories",
                "Personalised Gifts",
                "Drawing Boards",
                "Lifestyle Decor",
                "Corporate Gifts",
                "B2B Supply",
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
          }),
        }}
      />

      {/* Analytics placeholders. Replace placeholders to enable GA4, Meta Pixel
          and TikTok Pixel without code changes. */}
      {/*
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX" />
      <script dangerouslySetInnerHTML={{ __html: \`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date()); gtag('config', 'G-XXXXXXX');
      \` }} />
      */}

      <div className="bg-beyond-ivory text-beyond-charcoal font-bg-body antialiased">
        {children}
      </div>
    </>
  );
}
