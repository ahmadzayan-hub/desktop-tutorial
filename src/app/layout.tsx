import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { fetchRows, fetchKpis } from "@/lib/data";

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
  title: {
    default: "Beyond Style UAE — Order Control Console",
    template: "%s · Beyond Style UAE",
  },
  description: "UAE social-commerce sales operating console — AI drafts, owner approves.",
  applicationName: "Beyond Style UAE",
  authors: [{ name: "Beyond Connect General Trading L.L.C." }],
  keywords: ["Beyond Style UAE", "social commerce", "UAE", "AI sales"],
  openGraph: {
    title: "Beyond Style UAE — Order Control Console",
    description: "AI drafts, owner approves. Track every lead, payment, delivery and review in one place.",
    type: "website",
    locale: "en_AE",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)",  color: "#020617" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const badges = await getNavBadges();
  return (
    <html lang="en" dir="ltr">
      <body>
        <div className="flex h-screen overflow-hidden">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 md:flex md:flex-col overflow-y-auto">
            <Nav badges={badges} />
          </aside>

          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Mobile header */}
            <div className="md:hidden px-4 pt-4 pb-2">
              <Nav mobile badges={badges} />
            </div>

            <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
