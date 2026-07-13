import { useI18n } from "@/i18n/I18nContext";
import type { GalleryItem } from "@/lib/catalog";

/** A gallery tile backed by a bundled product mockup image (never blank). */
export function GalleryTile({ item }: { item: GalleryItem }) {
  const { pick } = useI18n();
  const title = pick(item.title);
  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream-200 shadow-soft">
      <img
        src={item.img}
        alt={title}
        width={800}
        height={1000}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-coffee-900/70 to-transparent p-4">
        <p className="text-sm font-semibold text-cream-50">{title}</p>
      </div>
    </div>
  );
}
