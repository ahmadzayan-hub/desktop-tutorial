import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { Section, SectionHeader } from "@/components/Section";

export default function Faq() {
  const { t, raw } = useI18n();
  const items = raw<{ q: string; a: string }[]>("faq.items") ?? [];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <Seo title={t("faq.title")} description={t("faq.subtitle")} />
      <Section>
        <SectionHeader eyebrow={t("nav.faq")} title={t("faq.title")} subtitle={t("faq.subtitle")} />

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-coffee-100/70 bg-white shadow-soft">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
                >
                  <span className="font-semibold text-coffee-900">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gold-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-coffee-600">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
