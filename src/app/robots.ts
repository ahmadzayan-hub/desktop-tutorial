import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mutabasir.ae";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/projects", "/new", "/settings"] }],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
