import { Link } from "react-router-dom";
import { cld, cldSrcSet } from "@/lib/cloudinary";
import { formatAED } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { HoverGlow } from "@/components/motion";
import { Stars } from "@/components/Reviews";
import type { ProductDTO } from "@/types";

export function ProductCard({ product }: { product: ProductDTO }) {
  const { locale } = useI18n();
  const title = locale === "ar" ? product.titleAr : product.titleEn;
  const price = Number(product.priceAed);

  return (
    <HoverGlow className="rounded-2xl">
      <Link
        to={`/product/${product.slug}`}
        className="block overflow-hidden rounded-2xl border border-gold/15 bg-ink"
      >
        <div className="aspect-square overflow-hidden bg-white/5">
          <img
            src={cld(product.cloudinaryIds[0], { width: 640, crop: "fill" })}
            srcSet={cldSrcSet(product.cloudinaryIds[0])}
            sizes="(max-width: 768px) 50vw, 320px"
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 font-display text-base text-cream/90">{title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Stars value={Number(product.ratingAvg)} size={13} />
            <span className="text-xs text-cream/50">({product.ratingCount})</span>
          </div>
          <p className="mt-2 gold-text font-semibold">
            {formatAED(price, locale === "ar" ? "ar-AE" : "en-AE")}
          </p>
        </div>
      </Link>
    </HoverGlow>
  );
}
