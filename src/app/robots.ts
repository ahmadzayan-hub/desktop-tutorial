import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        // Owner console areas are not useful to index; keep them out of search.
        disallow: [
          "/api/",
          "/audit",
          "/settings",
          "/prompts",
          "/integrations",
          "/inbox",
          "/intake",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
