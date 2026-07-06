import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/components/WhatsAppFab";

/** Trust footer — UAE compliance: company, trade license, contact, policies. */
export function Footer() {
  const { t } = useI18n();

  const links: { to: string; key: Parameters<typeof t>[0] }[] = [
    { to: "/about", key: "page.about.title" },
    { to: "/shipping", key: "page.shipping.title" },
    { to: "/returns", key: "page.returns.title" },
    { to: "/payment-methods", key: "page.payment.title" },
    { to: "/contact", key: "page.contact.title" },
    { to: "/privacy", key: "page.privacy.title" },
    { to: "/terms", key: "page.terms.title" },
  ];

  return (
    <footer className="mt-16 border-t border-gold/15 bg-ink/95 text-cream/70">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-lg gold-text">Beyond Style UAE</p>
          <p className="mt-2 text-sm md:text-base">{t("brand.tagline")}</p>
          <p className="mt-4 text-sm leading-relaxed text-cream/60">
            {t("footer.company")}
            <br />
            {t("footer.license")}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm uppercase tracking-wider text-cream/50">
            {t("footer.information")}
          </p>
          <ul className="space-y-1.5 text-sm md:text-base">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold transition-colors">
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-sm uppercase tracking-wider text-cream/50">
            {t("footer.contact")}
          </p>
          <a
            href={whatsappLink(t("wa.greeting"))}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base hover:text-gold"
          >
            WhatsApp · {WHATSAPP_DISPLAY}
          </a>
          <p className="mt-2 text-sm text-cream/60">{t("footer.location")}</p>
        </div>
      </div>
      <p className="border-t border-white/5 py-4 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} Beyond Style UAE
      </p>
    </footer>
  );
}
