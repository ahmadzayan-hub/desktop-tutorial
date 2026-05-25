import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { ReviewDTO } from "@/types";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-gold text-gold" : "text-cream/25"}
        />
      ))}
    </div>
  );
}

export function Reviews({
  reviews,
  ratingAvg,
  ratingCount,
}: {
  reviews: ReviewDTO[];
  ratingAvg: number;
  ratingCount: number;
}) {
  const { t } = useI18n();
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-display text-xl gold-text">{t("pdp.reviews")}</h2>
        <Stars value={ratingAvg} />
        <span className="text-sm text-cream/60">
          {ratingAvg.toFixed(1)} ({ratingCount})
        </span>
      </div>
      <ul className="space-y-4">
        {reviews.length === 0 && (
          <li className="text-sm text-cream/50">No reviews yet — be the first.</li>
        )}
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-cream/90">{r.author}</span>
              <Stars value={r.rating} size={13} />
            </div>
            <p className="mt-1 text-sm text-cream/70">{r.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
