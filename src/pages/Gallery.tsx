import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { GalleryTile } from "@/components/GalleryTile";
import { GALLERY } from "@/lib/catalog";

const FILTERS = [
  { id: "all", key: "gallery.filterAll" },
  { id: "personal", key: "gallery.filterPersonal" },
  { id: "corporate", key: "gallery.filterCorporate" },
  { id: "events", key: "gallery.filterEvents" },
] as const;

export default function Gallery() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const items = filter === "all" ? GALLERY : GALLERY.filter((g) => g.category === filter);

  return (
    <>
      <Seo title={t("gallery.title")} description={t("gallery.subtitle")} />
      <Section>
        <SectionHeader eyebrow={t("nav.gallery")} title={t("gallery.title")} subtitle={t("gallery.subtitle")} />

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f.id ? "bg-coffee-700 text-cream-50" : "bg-white text-coffee-600 shadow-sm hover:bg-coffee-50"
              }`}
            >
              {t(f.key)}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((g, i) => (
            <Reveal key={g.id} delay={i * 50}>
              <GalleryTile item={g} />
            </Reveal>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-cream-50 p-8 text-center">
          <h3 className="font-serif text-2xl font-bold text-coffee-900">{t("gallery.ctaHeading")}</h3>
          <p className="mt-2 text-coffee-600">{t("gallery.ctaSub")}</p>
          <Link to="/customize" className="btn btn-primary mt-5">{t("hero.ctaPrimary")}</Link>
        </div>
      </Section>
    </>
  );
}
