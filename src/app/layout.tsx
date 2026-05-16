import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mutabasir.ae";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Mutabasir · The Director's Lens",
    template: "%s · Mutabasir",
  },
  description:
    "From paperwork to board insight in 90 seconds. Mutabasir converts UAE government project documents into bilingual executive dashboards powered by the Basira engine.",
  applicationName: "Mutabasir",
  keywords: [
    "Mutabasir",
    "Basira",
    "UAE government",
    "executive dashboard",
    "RTA",
    "project management",
    "PMO",
    "bilingual",
    "Arabic dashboard",
  ],
  authors: [{ name: "Eng. Ahmed Zaian" }],
  openGraph: {
    type: "website",
    title: "Mutabasir · The Director's Lens",
    description: "From paperwork to board insight in 90 seconds.",
    siteName: "Mutabasir",
    locale: "en_AE",
    alternateLocale: ["ar_AE"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mutabasir · The Director's Lens",
    description: "From paperwork to board insight in 90 seconds.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#171C8F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
