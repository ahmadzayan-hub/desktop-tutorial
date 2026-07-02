import { Link } from "react-router-dom";
import { Upload, Eye, Wand2, Truck, FileText, ClipboardCheck, PenTool, PartyPopper } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

const PERSONAL = [
  { key: "s1", Icon: Upload },
  { key: "s2", Icon: Eye },
  { key: "s3", Icon: Wand2 },
  { key: "s4", Icon: Truck },
];
const CORPORATE = [
  { key: "c1", Icon: FileText },
  { key: "c2", Icon: ClipboardCheck },
  { key: "c3", Icon: PenTool },
  { key: "c4", Icon: PartyPopper },
];

function Steps({ steps }: { steps: { key: string; Icon: typeof Upload }[] }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <Reveal key={s.key} delay={i * 80}>
          <div className="relative h-full rounded-2xl border border-coffee-100/70 bg-white p-6 shadow-soft">
            <span className="absolute end-5 top-4 font-serif text-4xl font-bold text-cream-200">{i + 1}</span>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-500/10">
              <s.Icon className="h-6 w-6 text-gold-600" />
            </span>
            <h3 className="mt-4 font-serif text-lg font-bold text-coffee-900">{t(`howItWorks.steps.${s.key}.title`)}</h3>
            <p className="mt-2 text-sm text-coffee-600">{t(`howItWorks.steps.${s.key}.desc`)}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default function HowItWorks() {
  const { t } = useI18n();
  return (
    <>
      <Seo title={t("howItWorks.title")} description={t("howItWorks.subtitle")} />
      <Section>
        <SectionHeader eyebrow={t("nav.howItWorks")} title={t("howItWorks.title")} subtitle={t("howItWorks.subtitle")} />
        <h3 className="mt-12 font-serif text-xl font-bold text-coffee-900">{t("howItWorks.personalHeading")}</h3>
        <div className="mt-6"><Steps steps={PERSONAL} /></div>
        <h3 className="mt-14 font-serif text-xl font-bold text-coffee-900">{t("howItWorks.corporateHeading")}</h3>
        <div className="mt-6"><Steps steps={CORPORATE} /></div>

        <div className="mt-14 flex flex-col items-center justify-center gap-3 rounded-3xl bg-coffee-700 p-8 text-center text-cream-50 sm:flex-row sm:justify-between sm:text-start">
          <p className="font-serif text-xl font-bold">{t("home.finalCtaHeading")}</p>
          <div className="flex gap-3">
            <Link to="/customize" className="btn btn-gold">{t("hero.ctaPrimary")}</Link>
            <Link to="/corporate" className="btn btn-outline !border-cream-100/40 !text-cream-50">{t("nav.corporate")}</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
