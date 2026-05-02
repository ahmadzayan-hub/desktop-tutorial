import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,           lastModified: now, priority: 1 },
    { url: `${BASE}/workspace`,  lastModified: now, priority: 0.9 },
    { url: `${BASE}/templates`,  lastModified: now, priority: 0.8 },
    { url: `${BASE}/history`,    lastModified: now, priority: 0.5 },
    { url: `${BASE}/login`,      lastModified: now, priority: 0.3 }
  ];
}
