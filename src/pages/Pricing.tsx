import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { Section, SectionHeader } from "@/components/Section";
import { GIFT_PACKAGES, EVENT_PACKAGES, BULK_TIERS } from "@/lib/catalog";
import { formatAed } from "@/lib/format";

export default function Pricing() {
  const { t, lang, pick } = useI18n();

  const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: GIFT_PACKAGES.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `${p.name.en} · personalised coffee gift`,
        brand: "Beyond Coffee Moments",
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "AED",
          availability: "https://schema.org/InStock",
          areaServed: "AE",
        },
      },
    })),
  };

  return (
    <>
      <Seo title={t("pricing.title")} description={t("pricing.subtitle")} jsonLd={pricingJsonLd} />
      <Section>
        <SectionHeader eyebrow={t("nav.pricing")} title={t("pricing.title")} subtitle={t("pricing.subtitle")} />

        {/* Gift packages */}
        <h3 className="mt-12 font-serif text-2xl font-bold text-coffee-900">{t("pricing.giftsHeading")}</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {GIFT_PACKAGES.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-soft ${
                p.tag ? "border-gold-500 ring-1 ring-gold-500/30" : "border-coffee-100/70"
              }`}
            >
              {p.tag && (
                <span className="absolute -top-3 start-6 inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-white">
                  <Star className="h-3 w-3 fill-current" /> {t("customize.package.popular")}
                </span>
              )}
              <h4 className="font-serif text-xl font-bold text-coffee-900">{pick(p.name)}</h4>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-gold-500">{formatAed(p.price, lang)}</span>
                <span className="text-xs text-coffee-400">{t("common.vatIncluded")}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-coffee-600">
                {p.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    {pick(inc)}
                  </li>
                ))}
              </ul>
              <Link to="/customize" className="btn btn-primary mt-6 w-full justify-center">{t("pricing.cta")}</Link>
            </div>
          ))}
        </div>

        {/* Event day-rates */}
        <h3 className="mt-16 font-serif text-2xl font-bold text-coffee-900">{t("pricing.eventsHeading")}</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {EVENT_PACKAGES.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border bg-white p-6 shadow-soft ${
                p.tag ? "border-coffee-700 ring-1 ring-coffee-700/20" : "border-coffee-100/70"
              }`}
            >
              <h4 className="font-serif text-xl font-bold text-coffee-900">{pick(p.name)}</h4>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-coffee-700">{formatAed(p.price, lang)}</span>
                <span className="text-xs text-coffee-400">{t("corporate.perEvent")} · +VAT</span>
              </div>
              <p className="mt-1 text-sm text-gold-600">{p.cups} {t("corporate.cupsIncluded")}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-coffee-600">
                {p.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    {pick(inc)}
                  </li>
                ))}
              </ul>
              <Link to="/corporate#quote" className="btn btn-outline mt-6 w-full justify-center">{t("paths.bulk.cta")}</Link>
            </div>
          ))}
        </div>

        {/* Bulk tiers */}
        <h3 className="mt-16 font-serif text-2xl font-bold text-coffee-900">{t("pricing.bulkHeading")}</h3>
        <p className="mt-2 max-w-2xl text-sm text-coffee-600">{t("pricing.bulkSub")}</p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-coffee-100/70 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-start text-xs font-semibold uppercase tracking-wide text-coffee-500">
              <tr>
                <th className="px-5 py-3 text-start">{t("pricing.tierQty")}</th>
                <th className="px-5 py-3 text-start">{t("pricing.tierPrice")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {BULK_TIERS.map((tier) => (
                <tr key={tier.min}>
                  <td className="px-5 py-3 font-medium text-coffee-900">
                    {tier.max ? `${tier.min}-${tier.max}` : `${tier.min}+`}
                  </td>
                  <td className="px-5 py-3 text-coffee-700">{formatAed(tier.price, lang)} <span className="text-xs text-coffee-400">+VAT</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-coffee-500">{t("pricing.tierNote")}</p>

        <p className="mt-10 rounded-xl bg-cream-50 p-4 text-xs text-coffee-500">{t("pricing.vatNote")}</p>
      </Section>
    </>
  );
}
