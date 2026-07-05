import { Link } from "react-router-dom";
import { cld, cldSrcSet } from "@/lib/cloudinary";
import { formatAED } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { HoverGlow } from "@/components/motion";
import { Badge } from "@/components/ui/Badge";
import { PAIR_OFFERS } from "@/lib/sample-data";
import type { ProductDTO } from "@/types";

/**
 * Product card with no fake star averages. Uses concrete trust chips
 * ("new arrival" + "gift ready") and surfaces the pair-offer chip on the
 * image when eligible.
 */
export function ProductCard({ product }: { product: ProductDTO }) {
  const { locale, t, fmtLocale } = useI18n();
  const title = locale === "ar" ? product.titleAr : product.titleEn;
  const price = Number(product.priceAed);
  const offer = PAIR_OFFERS[product.id];

  return (
    <HoverGlow className="rounded-2xl">
      <Link to={`/product/${product.slug}`} className="surface-card block overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-white/5">
          <img
            src={cld(product.cloudinaryIds[0], { width: 640, crop: "fill" })}
            srcSet={cldSrcSet(product.cloudinaryIds[0])}
            sizes="(max-width: 768px) 50vw, 320px"
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {offer && (
            <span className="absolute start-2 top-2 rounded-full bg-gold-gradient px-2 py-0.5 text-xs font-semibold text-ink">
              {t("cart.pairOffer")}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 font-display text-base text-cream/90">{title}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge>{t("badge.new")}</Badge>
            <Badge>{t("badge.gift")}</Badge>
          </div>
          <p className="mt-2 gold-text font-semibold">{formatAED(price, fmtLocale)}</p>
        </div>
      </Link>
    </HoverGlow>
  );
}
