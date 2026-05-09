import Link from "next/link";
import { ReactNode } from "react";

export const metadata = {
  title: "PresentIQ — Boardroom-ready presentations in minutes",
  description:
    "AI Agent Platform for corporate presentation generation: brand-compliant, evidence-controlled, editable PPTX, Arabic RTL.",
};

const NAV = [
  { href: "/presentiq/dashboard", label: "Dashboard" },
  { href: "/presentiq/projects", label: "Projects" },
  { href: "/presentiq/brand-kits", label: "Brand Kits" },
  { href: "/presentiq/admin", label: "Admin" },
  { href: "/presentiq/billing", label: "Billing" },
];

export default function PresentIqLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/presentiq/dashboard" className="flex items-center gap-2">
              <span className="grid place-items-center h-7 w-7 rounded-lg bg-zinc-900 text-white text-xs font-bold">PQ</span>
              <span className="text-sm font-semibold tracking-tight">PresentIQ</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/presentiq/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white text-sm font-medium px-4 py-2 hover:bg-zinc-800"
            >
              New presentation
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
