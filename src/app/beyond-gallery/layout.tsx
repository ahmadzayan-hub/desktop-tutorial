import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./brand.css";

const SITE = "https://beyondgallery.ae";

export const metadata: Metadata = {
  title:
    "Beyond Gallery by Beyond Jewellery | Accessories, Gifts, Corporate Gifts and Lifestyle Products in UAE",
  description:
    "Shop curated accessories, personalised gifts, drawing boards, decorative items, corporate gifts and selected UAE supply products from Beyond Gallery by Beyond Jewellery, operated by BEYOND CONNECT GENERAL TRADING L.L.C in Dubai.",
  keywords: [
    "Beyond Jewellery UAE",
    "Beyond Gallery UAE",
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
      "Curated accessories, personalised gifts, drawing boards, decorative items, corporate gifts and selected UAE supply products from Dubai.",
    url: SITE,
    siteName: "Beyond Gallery",
    locale: "en_AE",
  },
  alternates: { canonical: `${SITE}/beyond-gallery` },
  robots: { index: true, follow: true },
};

export default function BeyondGalleryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Fonts: Playfair Display + Cormorant for headings, Inter for body, Noto Kufi Arabic + Alexandria for Arabic */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&family=Alexandria:wght@400;500;600;700&display=swap"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "Beyond Gallery by Beyond Jewellery",
            description:
              "Curated UAE lifestyle and gift brand offering accessories, personalised gifts, drawing boards, decorative items, corporate gifts and selected supply products.",
            url: SITE,
            telephone: "+971-00-000-0000",
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
          }),
        }}
      />
      <div className="bg-beyond-ivory text-beyond-charcoal font-bg-body antialiased">
        {children}
      </div>
    </>
  );
}
