import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mutabasir · Government Executive Intelligence",
    template: "%s · Mutabasir",
  },
  description:
    "Convert unstructured project documents into board-grade bilingual executive dashboards in under 90 seconds.",
  applicationName: "Mutabasir",
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
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
