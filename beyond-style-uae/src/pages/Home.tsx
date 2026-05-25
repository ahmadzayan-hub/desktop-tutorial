import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import { ProductCard } from "@/components/ProductCard";
import { FadeIn } from "@/components/motion";
import { JsonLd, organizationJsonLd } from "@/components/JsonLd";
import { useI18n } from "@/lib/i18n";
import type { ProductDTO } from "@/types";

export default function Home() {
  const { locale } = useI18n();
  const [products, setProducts] = useState<ProductDTO[]>(SAMPLE_PRODUCTS);

  useEffect(() => {
    api
      .listProducts()
      .then((rows) => rows.length && setProducts(rows))
      .catch(() => {/* keep sample data */});
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={organizationJsonLd} />

      <FadeIn className="mb-12 text-center">
        <h1 className="font-display text-4xl md:text-5xl">
          <span className="gold-text">
            {locale === "ar" ? "أناقة تتجاوز المألوف" : "Style Beyond the Ordinary"}
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-cream/70">
          {locale === "ar"
            ? "مجوهرات موضة مطلية بطبقة ذهبية اللون — توصيل مجاني للطلبات فوق 200 درهم."
            : "Gold-tone plated fashion jewelry — free delivery on orders over AED 200."}
        </p>
      </FadeIn>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {products.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <ProductCard product={p} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
