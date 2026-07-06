import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { fetchRows, fetchKpis } from "@/lib/data";
import { BRAND, SITE_URL } from "@/lib/brand";

async function getNavBadges() {
  try {
    const [{ kpis }, payments] = await Promise.all([
      fetchKpis(),
      fetchRows("payments", { where: { status: "needs_verification" } }),
    ]);
    return {
      inbox: kpis.hotLeads,
      payments: payments.rows.length,
      disputes: kpis.openDisputes,
      attention: kpis.hotLeads + payments.rows.length + kpis.openDisputes,
    };
  } catch {
    return { inbox: 0, payments: 0, disputes: 0, attention: 0 };
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name}. ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  authors: [{ name: `${BRAND.name} team` }],
  creator: `${BRAND.name} team`,
  publisher: `${BRAND.name}`,
  keywords: [...BRAND.keywords],
  category: "business",
  alternates: {
    canonical: "/",
    languages: {
      "en-AE": "/",
      "ar-AE": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `${BRAND.name}. ${BRAND.tagline}`,
    description: BRAND.description,
    url: SITE_URL,
    locale: "en_AE",
    alternateLocale: ["ar_AE"],
    images: [
      { url: "/icons/logo.svg", width: 512, height: 512, alt: `${BRAND.name} logo` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name}. ${BRAND.tagline}`,
    description: BRAND.description,
    images: ["/icons/logo.svg"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/logo.svg" }],
    shortcut: ["/icons/logo.svg"],
  },
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND.bgColor },
    { media: "(prefers-color-scheme: dark)",  color: "#111118" },
  ],
};

// JSON-LD structured data. Two graphs so AI search (Google AI Overview, Bing
// Copilot, Perplexity, ChatGPT search) can pick a clean answer without having
// to parse the marketing copy.
function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}#org`,
        name: BRAND.name,
        alternateName: BRAND.nameAr,
        url: SITE_URL,
        logo: `${SITE_URL}/icons/logo.svg`,
        description: BRAND.description,
        areaServed: "AE",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}#app`,
        name: BRAND.fullName,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "CommerceOperations",
        operatingSystem: "Web, Android, iOS",
        description: BRAND.description,
        url: SITE_URL,
        image: `${SITE_URL}/icons/logo.svg`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
        featureList: [
          "AI-drafted customer replies with owner approval",
          "Guardrails for price, VAT, stock, delivery, and payment",
          "Order pipeline with kanban and detail views",
          "Payment verification and dispute log",
          "Inventory velocity and reorder suggestions",
          "Bilingual English and Arabic interface",
          "Installable Android and iOS PWA",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is ${BRAND.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: BRAND.description,
            },
          },
          {
            "@type": "Question",
            name: "Does the AI send messages automatically?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Every draft is reviewed by the owner before it is sent. Money, dispatch, and complaint actions are always human-approved.",
            },
          },
          {
            "@type": "Question",
            name: "Is Wasl available on Android?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Wasl is an installable Progressive Web App, so it can be added to any Android or iOS home screen and runs in a standalone window, no app store required.",
            },
          },
          {
            "@type": "Question",
            name: "ما معنى وصل؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "وصل هو لوحة عمليات هادئة للتجّار على السوشيال ميديا. الاسم يعني الإيصال، وصول الطلب، والاتصال بين البائع والعميل.",
            },
          },
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const badges = await getNavBadges();
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <OrganizationJsonLd />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <div className="flex min-h-screen">
          <aside className="hidden w-64 shrink-0 border-r border-[color:rgb(var(--line))] bg-[color:rgb(var(--surface))] md:block">
            <Nav badges={badges} />
          </aside>
          <main id="main" className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
            <div className="md:hidden mb-3">
              <Nav mobile badges={badges} />
            </div>
            <div className="page-enter">{children}</div>
          </main>
        </div>
        <MobileTabBar badges={badges} />
      </body>
    </html>
  );
}

// Bottom tab bar shown on small screens only, so a mobile operator has
// thumb-reach access to the four surfaces that trigger 90% of decisions.
function MobileTabBar({ badges }: { badges: { inbox: number; payments: number; disputes: number; attention: number } }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-[color:rgb(var(--line))] bg-[color:rgb(var(--surface))] px-2 py-1 md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0) + .25rem)" }}
    >
      <TabLink href="/"        label="Home"     glyph="■" badge={badges.attention} />
      <TabLink href="/inbox"   label="Inbox"    glyph="✉" badge={badges.inbox} />
      <TabLink href="/intake"  label="Draft"    glyph="✎" />
      <TabLink href="/orders"  label="Orders"   glyph="▤" />
      <TabLink href="/payments" label="Pay"     glyph="₿" badge={badges.payments} />
    </nav>
  );
}

function TabLink({ href, label, glyph, badge }: { href: string; label: string; glyph: string; badge?: number }) {
  return (
    <a
      href={href}
      className="relative flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] text-[color:rgb(var(--ink-2))] active:bg-[color:rgb(var(--surface-2))]"
    >
      <span className="text-base leading-none">{glyph}</span>
      <span>{label}</span>
      {badge != null && badge > 0 && (
        <span className="absolute right-2 top-1 rounded-full bg-[color:rgb(var(--brand))] px-1 text-[9px] font-semibold text-white">
          {badge}
        </span>
      )}
    </a>
  );
}
