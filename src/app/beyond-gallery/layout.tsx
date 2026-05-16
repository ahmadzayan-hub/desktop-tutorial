import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./brand.css";

const SITE = "https://beyondgallery.ae";

// ---- Platform identity --------------------------------------------------
// Project / platform name: GiftMajlis
// What it solves: UAE customers and companies waste time hunting for trustworthy
// curated gifts and B2B supply across WhatsApp, Noon, Amazon and Instagram.
// GiftMajlis is the UAE's WhatsApp-first gathering point for curated gifting,
// lifestyle accessories and corporate / institutional sourcing — one majlis,
// one curated catalogue, one tap to order. Beyond Gallery is the flagship
// storefront running on GiftMajlis.
// ------------------------------------------------------------------------

export const metadata: Metadata = {
  title:
    "Beyond Gallery by Beyond Jewellery | Accessories, Gifts, Corporate Gifts and Lifestyle Products in UAE",
  description:
    "Shop curated accessories, personalised gifts, drawing boards, decorative items, corporate gifts and selected UAE supply products from Beyond Gallery by Beyond Jewellery, operated by BEYOND CONNECT GENERAL TRADING L.L.C in Dubai. Powered by GiftMajlis — the UAE's WhatsApp-first gifting and sourcing platform.",
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
    siteName: "Beyond Gallery — on GiftMajlis",
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
                "The UAE's WhatsApp-first gifting and sourcing platform for curated retail and corporate/institutional buyers.",
            },
          }),
        }}
      />

      {/* Analytics placeholders — replace the placeholders below with real IDs
          to enable GA4, Meta Pixel and TikTok Pixel without code changes. */}
      {/*
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX" />
      <script dangerouslySetInnerHTML={{ __html: \`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date()); gtag('config', 'G-XXXXXXX');
      \` }} />

      <script dangerouslySetInnerHTML={{ __html: \`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', 'XXXXXXXXXXXXXX'); fbq('track', 'PageView');
      \` }} />

      <script dangerouslySetInnerHTML={{ __html: \`
        !function (w, d, t) { w.TiktokAnalyticsObject=t; var ttq=w[t]=w[t]||[];
        ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
        ttq._o=ttq._o||{};ttq._o[e]=n||{};n=document.createElement('script');n.type='text/javascript';
        n.async=!0;n.src=i+'?sdkid='+e+'&lib='+t;e=document.getElementsByTagName('script')[0];
        e.parentNode.insertBefore(n,e)}; ttq.load('XXXXXXXXXXXXXX'); ttq.page();
      \` }} />
      */}

      <div className="bg-beyond-ivory text-beyond-charcoal font-bg-body antialiased">
        {children}
      </div>
    </>
  );
}
