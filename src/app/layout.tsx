import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Beyond Style UAE — Order Control Console",
  description: "Human-approved UAE social-commerce sales operating console.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          {/* Sidebar — collapses on mobile via responsive width */}
          <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white md:block">
            <Nav />
          </aside>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
