import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beyond Gallery by Beyond Jewellery",
    short_name: "Beyond Gallery",
    description:
      "Curated accessories, personalised gifts, drawing boards, corporate gifts, and selected UAE supply from Beyond Gallery on GiftMajlis. Order on WhatsApp.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FAF8F1",
    theme_color: "#B68A35",
    lang: "en-AE",
    dir: "ltr",
    categories: ["shopping", "lifestyle", "business"],
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    shortcuts: [
      {
        name: "Shop accessories",
        short_name: "Shop",
        description: "Browse curated accessories, gifts and drawing boards.",
        url: "/#collections",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
      {
        name: "Corporate gifts",
        short_name: "Corporate",
        description: "Explore corporate gift packs and request a quote.",
        url: "/#corporate-packs",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
      {
        name: "Delivery info",
        short_name: "Delivery",
        description: "See how your order reaches you.",
        url: "/#delivery",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
    ],
  };
}
