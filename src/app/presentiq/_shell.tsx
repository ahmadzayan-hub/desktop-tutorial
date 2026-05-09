"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { LangToggle } from "@/components/presentiq/ui/LangToggle";

export function PresentIqShell({ children }: { children: ReactNode }) {
  const { t, dir, lang } = useI18n();

  const NAV: { href: string; key: any }[] = [
    { href: "/presentiq/dashboard",  key: "nav.dashboard" },
    { href: "/presentiq/projects",   key: "nav.projects" },
    { href: "/presentiq/templates",  key: "nav.templates" },
    { href: "/presentiq/brand-kits", key: "nav.brandkits" },
    { href: "/presentiq/changelog",  key: "nav.changelog" },
    { href: "/presentiq/contact",    key: "nav.contact" },
  ];

  return (
    <div dir={dir} lang={lang} style={{ minHeight: "100vh" }}>
      <header
        className="sticky top-0 z-30"
        style={{
          background: "rgba(244,251,250,0.86)",
          backdropFilter: "blur(14px) saturate(1.4)",
          borderBottom: "1px solid rgba(11,110,105,0.14)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/presentiq" className="flex items-center gap-2 shrink-0" aria-label="PresentIQ home">
              <span
                className="grid place-items-center h-8 w-8 rounded-xl text-xs font-bold"
                style={{ background: "var(--pq-grad-pine)", color: "var(--pq-spearmint)" }}
              >
                PQ
              </span>
              <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--pq-text)" }}>
                {t("brand.name")}
              </span>
              <span className="pq-pill ms-2 hidden sm:inline-flex">v0.2 · {t("common.demo")}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                  style={{ color: "var(--pq-text-soft)" }}
                >
                  {t(n.key)}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LangToggle />
            <Link href="/presentiq/projects/new" className="pq-btn pq-btn-primary">
              <span aria-hidden>＋</span> {t("nav.new")}
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-6 py-10">
        {children}
      </main>

      <footer className="mx-auto max-w-7xl px-6 py-10 text-center text-xs" style={{ color: "var(--pq-text-mute)" }}>
        {t("foot.line")}
        <a
          href="mailto:Ahmad.zaian@outlook.com"
          style={{ color: "var(--pq-teal)", textDecoration: "underline" }}
        >
          Ahmad.zaian@outlook.com
        </a>
      </footer>
    </div>
  );
}
