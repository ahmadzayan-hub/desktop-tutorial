import type { MetadataRoute } from "next";

// This is the internal operator console: keep it out of every crawler's
// index. The public storefront (beyond-style-uae/) has its own robots policy.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
