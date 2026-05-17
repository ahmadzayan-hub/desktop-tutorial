"use client";

import Link from "next/link";
import { Mail, ShieldCheck, Star, Check } from "lucide-react";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Logo } from "@/components/presentiq/ui/Logo";
import { PQ_CONTACT_EMAIL } from "@/lib/presentiq/config";

// Brand-glyph SVGs — lucide-react 1.x dropped per-vendor brand icons.
const LinkedInGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 11.01-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
  </svg>
);
const XGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2H21.5l-7.477 8.547L23 22h-6.91l-5.41-7.07L4.5 22H1.244l8-9.14L1 2h7.09l4.89 6.46L18.244 2zm-1.215 18.04h1.807L7.06 3.86H5.13l11.9 16.18z"/>
  </svg>
);

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
          {trustParts.map((label, i) => {
            const Icon = i === 0 ? ShieldCheck : i === 1 ? Star : Check;
            return (
              <li key={i} className="pq-footer-slim-pill">
                <Icon aria-hidden size={14} strokeWidth={2.2} />
                {label}
              </li>
            );
          })}
        </ul>

        <div className="pq-footer-slim-meta">
          <div className="pq-footer-slim-social" aria-label="Social links">
            <a href="https://www.linkedin.com/company/tweenz" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="pq-social"><LinkedInGlyph /></a>
            <a href="https://x.com/tweenzAI" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)" className="pq-social"><XGlyph /></a>
            <a href={`mailto:${PQ_CONTACT_EMAIL}`} aria-label="Email founder" className="pq-social"><Mail size={15} strokeWidth={2} /></a>
          </div>
          <div className="pq-footer-slim-copy">{t("foot.copyright")}</div>
        </div>
      </div>
    </footer>
  );
}
