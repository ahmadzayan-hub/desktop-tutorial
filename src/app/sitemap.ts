import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

const NOW = new Date().toISOString();

/**
 * Public, indexable routes. Owner-console pages (inbox, intake, audit,
 * settings, integrations, prompts) are gated in robots.ts and stay off
 * the map so search doesn't waste crawl budget on login-walled surfaces.
 */
const PUBLIC_ROUTES: Array<{ path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/",          priority: 1.0, changeFreq: "daily"   },
  { path: "/login",     priority: 0.9, changeFreq: "monthly" },
  { path: "/orders",    priority: 0.7, changeFreq: "weekly"  },
  { path: "/payments",  priority: 0.7, changeFreq: "weekly"  },
  { path: "/customers", priority: 0.6, changeFreq: "weekly"  },
  { path: "/couriers",  priority: 0.5, changeFreq: "weekly"  },
  { path: "/inventory", priority: 0.5, changeFreq: "weekly"  },
  { path: "/offers",    priority: 0.5, changeFreq: "weekly"  },
  { path: "/suppliers", priority: 0.4, changeFreq: "weekly"  },
  { path: "/reports",   priority: 0.6, changeFreq: "daily"   },
  { path: "/reviews",   priority: 0.4, changeFreq: "weekly"  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map(({ path, priority, changeFreq }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: NOW,
    changeFrequency: changeFreq,
    priority,
  }));
}
