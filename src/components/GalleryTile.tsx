import { Coffee } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import type { GalleryItem } from "@/lib/catalog";

/** A single gallery tile — decorative CSS gradient stands in for photography
 *  (keeps the page weightless & CLS-free; swap for real <img> + width/height). */
export function GalleryTile({ item }: { item: GalleryItem }) {
  const { pick } = useI18n();
  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
        style={{
          background: `linear-gradient(150deg, hsl(${item.hue} 45% 88%), hsl(${item.hue + 12} 40% 72%))`,
        }}
      />
      <div className="absolute inset-0 grid place-items-center opacity-40">
        <Coffee className="h-14 w-14 text-coffee-700" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-coffee-900/70 to-transparent p-4">
        <p className="text-sm font-semibold text-cream-50">{pick(item.title)}</p>
      </div>
    </div>
  );
}
