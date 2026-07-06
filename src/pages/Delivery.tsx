import { Truck, Clock } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { Section, SectionHeader } from "@/components/Section";
import { EMIRATES } from "@/lib/brand";
import { DELIVERY_FEES } from "@/lib/catalog";
import { formatAed } from "@/lib/format";

export default function Delivery() {
  const { t, lang, pick, raw } = useI18n();
  const policy = raw<string[]>("deliveryPage.policy");

  return (
    <>
      <Seo title={t("deliveryPage.title")} description={t("deliveryPage.subtitle")} />
      <Section>
        <SectionHeader eyebrow={t("nav.delivery")} title={t("deliveryPage.title")} subtitle={t("deliveryPage.subtitle")} />

        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-coffee-100/70 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-xs font-semibold uppercase tracking-wide text-coffee-500">
              <tr>
                <th className="px-5 py-3 text-start">{t("deliveryPage.tableEmirate")}</th>
                <th className="px-5 py-3 text-start">{t("deliveryPage.tableSpeed")}</th>
                <th className="px-5 py-3 text-start">{t("deliveryPage.tableFee")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {EMIRATES.map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-3 font-medium text-coffee-900">{pick({ en: e.en, ar: e.ar })}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-coffee-600">
                      {e.sameDay ? <Truck className="h-4 w-4 text-gold-600" /> : <Clock className="h-4 w-4 text-coffee-400" />}
                      {e.sameDay ? t("deliveryPage.sameDay") : t("deliveryPage.nextDay")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-coffee-700">{formatAed(DELIVERY_FEES[e.id], lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-cream-50 p-6">
          <h3 className="font-serif text-xl font-bold text-coffee-900">{t("deliveryPage.policyHeading")}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-coffee-600">
            {(Array.isArray(policy) ? policy : []).map((p: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
