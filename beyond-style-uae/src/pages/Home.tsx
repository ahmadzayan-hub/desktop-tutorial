import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, ShieldCheck, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import { ProductCard } from "@/components/ProductCard";
import { FadeIn } from "@/components/motion";
import { JsonLd, organizationJsonLd } from "@/components/JsonLd";
import { useI18n } from "@/lib/i18n";
import { AskOnWhatsApp } from "@/components/ui/AskOnWhatsApp";
import { cld } from "@/lib/cloudinary";
import type { ProductDTO } from "@/types";

export default function Home() {
  const { t, locale } = useI18n();
  const [products, setProducts] = useState<ProductDTO[]>(SAMPLE_PRODUCTS);

  useEffect(() => {
    api
      .listProducts()
      .then((rows) => rows.length && setProducts(rows))
      .catch(() => {/* keep sample data */});
  }, []);

  const featured = products[0];
  const restProducts = products.slice(1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={organizationJsonLd} />

      {/* 1. Hero */}
      <FadeIn className="mb-16 text-center">
        <h1 className="font-display text-3xl md:text-5xl">
          <span className="gold-text">{t("hero.title")}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-cream/75">{t("hero.subtitle")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/cart" className="gold-cta">{t("hero.cta.shop")}</Link>
          <AskOnWhatsApp />
        </div>
      </FadeIn>

      {/* 2. Best sellers */}
      <h2 className="section-title">{t("home.bestSellers")}</h2>
      <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-3">
        {products.slice(0, 6).map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <ProductCard product={p} />
          </FadeIn>
        ))}
      </div>

      {/* 3. Masha'Allah pair-offer feature */}
      {featured && (
        <FadeIn>
          <section className="surface-card mb-16 grid items-center gap-6 p-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-gold">
                {t("home.featuredOffer")}
              </p>
              <h2 className="font-display text-2xl text-cream">
                {locale === "ar" ? featured.titleAr : featured.titleEn}
              </h2>
              <p className="mt-2 text-cream/75">{t("home.featuredCopy")}</p>
              <Link to={`/product/${featured.slug}`} className="gold-cta mt-5 inline-block">
                {t("cart.addToCart")}
              </Link>
            </div>
            <img
              src={cld(featured.cloudinaryIds[0], { width: 800, crop: "fill" })}
              alt={featured.titleEn}
              className="aspect-square w-full rounded-xl object-cover"
            />
          </section>
        </FadeIn>
      )}

      {/* 4. Gift-ready */}
      <h2 className="section-title">{t("home.giftReady")}</h2>
      <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-3">
        {restProducts.slice(0, 3).map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <ProductCard product={p} />
          </FadeIn>
        ))}
      </div>

      {/* 5. How to order */}
      <h2 className="section-title">{t("home.howToOrder")}</h2>
      <ol className="mb-16 grid gap-4 md:grid-cols-3">
        {[t("home.step1"), t("home.step2"), t("home.step3")].map((step, i) => (
          <li key={i} className="surface-card p-4 text-sm text-cream/80">
            <span className="gold-text font-display text-2xl">{i + 1}</span>
            <p className="mt-2">{step}</p>
          </li>
        ))}
      </ol>

      {/* 6. Trust */}
      <FadeIn>
        <section className="surface-card grid gap-4 p-6 md:grid-cols-3">
          <TrustItem icon={Truck} label={t("home.trust.delivery")} note={t("home.trust.deliveryNote")} />
          <TrustItem icon={ShieldCheck} label={t("home.trust.payment")} note={t("home.trust.paymentNote")} />
          <TrustItem icon={Gift} label={t("home.trust.gift")} note={t("home.trust.giftNote")} />
        </section>
      </FadeIn>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  label,
  note,
}: {
  icon: typeof Truck;
  label: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 shrink-0 text-gold" size={20} />
      <div>
        <p className="text-cream/90">{label}</p>
        <p className="text-xs text-cream/55">{note}</p>
      </div>
    </div>
  );
}
