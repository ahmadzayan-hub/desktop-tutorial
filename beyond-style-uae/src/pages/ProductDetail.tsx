import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { SAMPLE_PRODUCTS, SAMPLE_REVIEWS } from "@/lib/sample-data";
import { cld, cldSrcSet } from "@/lib/cloudinary";
import { formatAED } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/context/CartContext";
import { track } from "@/lib/analytics";
import { JewelryCareBadge } from "@/components/JewelryCareBadge";
import { Reviews } from "@/components/Reviews";
import { StickyAddToCart } from "@/components/StickyAddToCart";
import { JsonLd, productJsonLd } from "@/components/JsonLd";
import { FadeIn } from "@/components/motion";
import type { ProductDTO, ReviewDTO } from "@/types";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { locale, t } = useI18n();
  const { add } = useCart();

  const [product, setProduct] = useState<ProductDTO | null>(
    () => SAMPLE_PRODUCTS.find((p) => p.slug === slug) ?? null,
  );
  const [reviews, setReviews] = useState<ReviewDTO[]>(SAMPLE_REVIEWS);

  useEffect(() => {
    api
      .getProduct(slug)
      .then(({ product, reviews }) => {
        setProduct(product);
        setReviews(reviews);
      })
      .catch(() => {/* keep sample */});
  }, [slug]);

  useEffect(() => {
    if (product) track("view_item", { item_id: product.id, value: Number(product.priceAed) });
  }, [product]);

  if (!product) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-cream/60">Not found.</div>;
  }

  const title = locale === "ar" ? product.titleAr : product.titleEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const price = Number(product.priceAed);
  const cartItem = {
    productId: product.id,
    slug: product.slug,
    titleEn: product.titleEn,
    titleAr: product.titleAr,
    priceAed: price,
    cloudinaryId: product.cloudinaryIds[0],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 md:pb-10">
      <JsonLd
        data={productJsonLd({
          name: product.titleEn,
          description: product.descriptionEn,
          image: cld(product.cloudinaryIds[0], { width: 1200 }),
          price,
          sku: product.id,
          ratingValue: Number(product.ratingAvg),
          reviewCount: product.ratingCount,
        })}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <FadeIn>
          <div className="overflow-hidden rounded-2xl border border-gold/15 bg-white/5">
            <img
              src={cld(product.cloudinaryIds[0], { width: 800, crop: "fill" })}
              srcSet={cldSrcSet(product.cloudinaryIds[0], [480, 800, 1200])}
              sizes="(max-width: 768px) 100vw, 480px"
              alt={title}
              className="aspect-square w-full object-cover"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="font-display text-3xl text-cream">{title}</h1>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="gold-text text-2xl font-semibold">
              {formatAED(price, locale === "ar" ? "ar-AE" : "en-AE")}
            </span>
            {product.compareAtAed && (
              <span className="text-cream/40 line-through">
                {formatAED(Number(product.compareAtAed), locale === "ar" ? "ar-AE" : "en-AE")}
              </span>
            )}
          </div>

          <p className="mt-4 text-cream/75">{description}</p>
          <p className="mt-2 text-sm text-gold/80">{product.material}</p>

          {/* Inline CTA (desktop); sticky bar handles mobile */}
          <button className="gold-cta mt-6 hidden w-full md:block" onClick={() => add(cartItem)}>
            {t("cart.addToCart")}
          </button>

          <div className="mt-6">
            <JewelryCareBadge />
          </div>
        </FadeIn>
      </div>

      <Reviews
        reviews={reviews}
        ratingAvg={Number(product.ratingAvg)}
        ratingCount={product.ratingCount}
      />

      <StickyAddToCart item={cartItem} price={price} />
    </div>
  );
}
