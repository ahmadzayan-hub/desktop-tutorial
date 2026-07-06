import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { BRAND } from "@/lib/brand";

type LegalKind = "privacy" | "terms" | "refund";

interface LegalSection {
  h: string;
  b: string;
}

/** Shared renderer for Privacy / Terms / Refund — content lives in i18n so it
 *  stays bilingual and in sync. */
function LegalPage({ kind }: { kind: LegalKind }) {
  const { t, raw } = useI18n();
  const title = t(`legal.${kind}.title`);
  const intro = t(`legal.${kind}.intro`);
  const sections = raw<LegalSection[]>(`legal.${kind}.sections`) ?? [];

  return (
    <>
      <Seo title={title} description={intro} />
      <div className="container-max max-w-3xl py-14">
        <p className="eyebrow">{t("footer.legalHeading")}</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-coffee-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-xs text-coffee-400">
          {t("legal.lastUpdated")}: {new Date().toLocaleDateString()} · {BRAND.legalName}
        </p>

        <div className="prose-legal mt-6">
          <p className="text-coffee-700">{intro}</p>
          {sections.map((s, i) => (
            <section key={i}>
              <h2>{s.h}</h2>
              <p>{s.b}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

export function Privacy() {
  return <LegalPage kind="privacy" />;
}
export function Terms() {
  return <LegalPage kind="terms" />;
}
export function Refund() {
  return <LegalPage kind="refund" />;
}
