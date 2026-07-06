import { useEffect } from "react";

const SITE = "Beyond Style UAE";
const ORIGIN = "https://beyondstyle.ae";

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export interface SeoInput {
  title: string;
  description?: string;
  /** Path only, e.g. "/product/mashallah-bracelet-black". */
  path?: string;
  image?: string;
}

/**
 * Sets the document title and the crawler-facing meta/canonical tags for the
 * current view. A single-page app changes routes without a full reload, so we
 * keep title, description, canonical and Open Graph in sync on navigation for
 * search engines and social/answer-engine link previews.
 */
export function useSeo({ title, description, path, image }: SeoInput) {
  useEffect(() => {
    const fullTitle = title.includes(SITE) ? title : `${title} | ${SITE}`;
    document.title = fullTitle;

    const url = ORIGIN + (path ?? window.location.pathname);
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertCanonical(url);

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
      upsertMeta('meta[property="og:description"]', "property", "og:description", description);
      upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    }
    if (image) {
      const abs = image.startsWith("http") ? image : ORIGIN + image;
      upsertMeta('meta[property="og:image"]', "property", "og:image", abs);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", abs);
    }
  }, [title, description, path, image]);
}
