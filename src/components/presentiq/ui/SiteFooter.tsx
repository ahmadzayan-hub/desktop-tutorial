"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Logo } from "@/components/presentiq/ui/Logo";

type Col = { titleKey: any; links: { key: any; href: string }[] };

const COLUMNS: Col[] = [
  {
    titleKey: "foot.col.product",
    links: [
      { key: "foot.link.dashboard",  href: "/presentiq/dashboard" },
      { key: "foot.link.templates",  href: "/presentiq/templates" },
      { key: "foot.link.brandkits",  href: "/presentiq/brand-kits" },
      { key: "foot.link.changelog",  href: "/presentiq/changelog" },
    ],
  },
  {
    titleKey: "foot.col.solutions",
    links: [
      { key: "foot.link.executives", href: "/presentiq#executives" },
      { key: "foot.link.consulting", href: "/presentiq#consulting" },
      { key: "foot.link.government", href: "/presentiq#government" },
      { key: "foot.link.bilingual",  href: "/presentiq#bilingual" },
    ],
  },
  {
    titleKey: "foot.col.company",
    links: [
      { key: "foot.link.about",      href: "/presentiq#about" },
      { key: "foot.link.contact",    href: "/presentiq/contact" },
      { key: "foot.link.security",   href: "/presentiq#security" },
      { key: "foot.link.status",     href: "/presentiq#status" },
    ],
  },
  {
    titleKey: "foot.col.legal",
    links: [
      { key: "foot.link.privacy",    href: "/privacy" },
      { key: "foot.link.terms",      href: "/terms" },
      { key: "foot.link.cookies",    href: "/privacy#cookies" },
      { key: "foot.link.dpa",        href: "/privacy#dpa" },
    ],
  },
];

export function SiteFooter() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <footer className="pq-footer mt-20" role="contentinfo">
      {/* Top band: tagline, newsletter, trust marks */}
      <div className="pq-footer-top">
        <div className="pq-footer-grid">
          <div className="pq-footer-brand">
            <Logo variant="horizontal" height={28} byline />
            <p className="text-sm mt-4 max-w-sm" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.55 }}>
              {t("foot.tagline")}
            </p>
            <ul className="mt-5 space-y-1.5 text-xs" style={{ color: "var(--pq-text-secondary)" }}>
              <li className="flex items-center gap-2">
                <span aria-hidden>🛡️</span> {t("foot.trust").split(" · ")[0]}
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden>🇦🇪</span> {t("foot.trust").split(" · ")[1]}
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden>♿</span> {t("foot.trust").split(" · ")[2]}
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav key={String(col.titleKey)} aria-label={t(col.titleKey)}>
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--pq-text-muted)" }}>
                {t(col.titleKey)}
              </h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={String(l.key)}>
                    <Link
                      href={l.href}
                      className="text-sm hover:underline underline-offset-4"
                      style={{ color: "var(--pq-text-secondary)" }}
                    >
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Newsletter */}
        <div className="pq-footer-newsletter mt-12">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--pq-text-main)" }}>
              {t("foot.newsletter.title")}
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--pq-text-secondary)" }}>
              {t("foot.newsletter.lede")}
            </p>
          </div>
          <form onSubmit={onSubmit} className="pq-footer-form">
            <label htmlFor="pq-newsletter-email" className="sr-only">
              Email
            </label>
            <input
              id="pq-newsletter-email"
              type="email"
              required
              autoComplete="email"
              placeholder={t("foot.newsletter.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pq-footer-input"
            />
            <button type="submit" className="pq-btn pq-btn-primary">
              {t("foot.newsletter.cta")} <span className="pq-flip" aria-hidden>→</span>
            </button>
          </form>
          {submitted && (
            <div className="text-xs mt-2" style={{ color: "var(--pq-primary)" }}>
              ✓ Thanks — we'll send the next briefing your way.
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pq-footer-bottom">
        <div className="text-xs" style={{ color: "var(--pq-text-muted)" }}>
          {t("foot.copyright")}
        </div>
        <div className="flex items-center gap-3" aria-label="Social links">
          <a
            href="https://www.linkedin.com/company/tweenz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="pq-social"
          >
            in
          </a>
          <a
            href="https://x.com/tweenzAI"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="pq-social"
          >
            ×
          </a>
          <a
            href="mailto:Ahmad.zaian@outlook.com"
            aria-label="Email Ahmad"
            className="pq-social"
          >
            @
          </a>
        </div>
        <div className="text-xs" style={{ color: "var(--pq-text-muted)" }}>
          {t("foot.line")}
          <a
            href="mailto:Ahmad.zaian@outlook.com"
            style={{ color: "var(--pq-primary)", textDecoration: "underline" }}
          >
            Ahmad.zaian@outlook.com
          </a>
        </div>
      </div>
    </footer>
  );
}
