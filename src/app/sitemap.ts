import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tweenz.ae";

const PAGES = [
  { path: "/",            priority: 1.0, change: "weekly",  date: "2025-01-01" },
  { path: "/features",    priority: 0.9, change: "monthly", date: "2025-01-01" },
  { path: "/pricing",     priority: 0.9, change: "monthly", date: "2025-01-01" },
  { path: "/how-it-works",priority: 0.8, change: "monthly", date: "2025-01-01" },
  { path: "/for-students",priority: 0.8, change: "monthly", date: "2025-01-01" },
  { path: "/download",    priority: 0.8, change: "monthly", date: "2025-01-01" },
  { path: "/faq",         priority: 0.7, change: "monthly", date: "2025-01-01" },
  { path: "/contact",     priority: 0.6, change: "yearly",  date: "2025-01-01" },
  { path: "/signup",      priority: 0.6, change: "yearly",  date: "2025-01-01" },
  { path: "/login",       priority: 0.5, change: "yearly",  date: "2025-01-01" },
  { path: "/privacy",     priority: 0.4, change: "yearly",  date: "2025-01-01" },
  { path: "/terms",       priority: 0.4, change: "yearly",  date: "2025-01-01" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority, change, date }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(date),
    priority,
    changeFrequency: change as MetadataRoute.Sitemap[number]["changeFrequency"],
    alternates: {
      languages: {
        en: `${BASE}${path}`,
        ar: `${BASE}${path}`,
      },
    },
  }));
}
