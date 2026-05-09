"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { LangToggle } from "@/components/presentiq/ui/LangToggle";
import { PromoBanner } from "@/components/presentiq/ui/PromoBanner";
import { SiteFooter } from "@/components/presentiq/ui/SiteFooter";

export function PresentIqShell({ children }: { children: ReactNode }) {
  const { t, dir, lang } = useI18n();
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV: { href: string; key: any }[] = [
    { href: "/presentiq/dashboard",  key: "nav.dashboard" },
    { href: "/presentiq/projects",   key: "nav.projects" },
    { href: "/presentiq/templates",  key: "nav.templates" },
    { href: "/presentiq/brand-kits", key: "nav.brandkits" },
    { href: "/presentiq/changelog",  key: "nav.changelog" },
    { href: "/presentiq/contact",    key: "nav.contact" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div dir={dir} lang={lang} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PromoBanner />

      <header
        className="sticky top-0 z-30"
        style={{
          background: "rgba(250,248,238,0.92)",
          backdropFilter: "blur(16px) saturate(1.4)",
          borderBottom: "1px solid rgba(66,87,34,0.18)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/presentiq" className="flex items-center gap-2.5 shrink-0" aria-label="PresentIQ home">
              <span
                className="grid place-items-center h-9 w-9 rounded-xl text-xs font-bold"
                style={{ background: "var(--pq-grad-pine)", color: "var(--pq-cream)" }}
              >
                PQ
              </span>
              <span className="text-base font-semibold tracking-tight" style={{ color: "var(--pq-text)" }}>
                {t("brand.name")}
              </span>
              <span className="pq-pill ms-2 hidden md:inline-flex">v0.2 · {t("common.demo")}</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
              {NAV.map((n) => {
                const active = isActive(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className="pq-nav-link"
                    data-active={active ? "true" : "false"}
                  >
                    {t(n.key)}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LangToggle />
            <Link href="/presentiq/projects/new" className="pq-btn pq-btn-primary hidden sm:inline-flex">
              <span aria-hidden>＋</span> {t("nav.new")}
            </Link>
            <button
              type="button"
              className="lg:hidden pq-btn pq-btn-ghost"
              style={{ padding: "0.45rem 0.65rem" }}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav
            className="lg:hidden border-t"
            style={{ borderColor: "rgba(66,87,34,0.16)", background: "rgba(250,248,238,0.96)" }}
            aria-label="Mobile primary"
          >
            <div className="mx-auto max-w-7xl px-4 py-2 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className="pq-nav-link"
                  data-active={isActive(n.href) ? "true" : "false"}
                  style={{ padding: "0.65rem 0.85rem" }}
                >
                  {t(n.key)}
                </Link>
              ))}
              <Link
                href="/presentiq/projects/new"
                onClick={() => setMobileOpen(false)}
                className="pq-btn pq-btn-primary mt-2 justify-center"
              >
                <span aria-hidden>＋</span> {t("nav.new")}
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex-1 w-full">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
