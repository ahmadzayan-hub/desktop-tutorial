"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Logo } from "@/components/presentiq/ui/Logo";
import { PQ_CONTACT_EMAIL } from "@/lib/presentiq/config";

/**
 * Slim site footer (v0.4.2).
 *
 * Replaces the previous full-sitemap footer (Product / Solutions / Company /
 * Legal columns + newsletter form) with a single compact band: brand mark,
 * a one-line tagline, the trust pills, social row, and the copyright. Every
 * route is still discoverable through the top nav and the in-product menus,
 * so the long sitemap was redundant and made every page scroll forever.
 */
export function SiteFooter() {
  const { t } = useI18n();
  const trustParts = String(t("foot.trust")).split(" · ").filter(Boolean);

  return (
    <footer className="pq-footer-slim mt-16" role="contentinfo">
      <div className="pq-footer-slim-inner">
        <div className="pq-footer-slim-brand">
          <Link href="/presentiq" aria-label="Pitchora home">
            <Logo variant="horizontal" height={22} />
          </Link>
          <p className="pq-footer-slim-tag">{t("foot.tagline")}</p>
        </div>

        <ul className="pq-footer-slim-trust" aria-label="Trust marks">
          {trustParts.map((label, i) => (
            <li key={i} className="pq-footer-slim-pill">
              <span aria-hidden>{i === 0 ? "🛡" : i === 1 ? "★" : "✓"}</span>
              {label}
            </li>
          ))}
        </ul>

        <div className="pq-footer-slim-meta">
          <div className="pq-footer-slim-social" aria-label="Social links">
            <a href="https://www.linkedin.com/company/tweenz" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="pq-social">in</a>
            <a href="https://x.com/tweenzAI" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="pq-social">×</a>
            <a href={`mailto:${PQ_CONTACT_EMAIL}`} aria-label="Email founder" className="pq-social">@</a>
          </div>
          <div className="pq-footer-slim-copy">{t("foot.copyright")}</div>
        </div>
      </div>
    </footer>
  );
}
