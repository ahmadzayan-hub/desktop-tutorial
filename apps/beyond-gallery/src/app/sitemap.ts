import type { MetadataRoute } from "next";
import { PRODUCTS } from "../data/products";
import { JOURNAL } from "../data/journal";

const SITE = "https://beyondgallery.ae";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/policies`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/cart`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/wishlist`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${SITE}/product/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const journalRoutes: MetadataRoute.Sitemap = JOURNAL.map((j) => ({
    url: `${SITE}/journal/${j.slug}`,
    lastModified: new Date(j.publishedAt),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...journalRoutes];
}
