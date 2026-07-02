import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nContext";

/** Minimal per-route SEO: title + meta description, locale-aware. */
export function Seo({ title, description }: { title: string; description?: string }) {
  const { lang } = useI18n();
  useEffect(() => {
    const full = `${title} · Beyond Coffee Moments`;
    document.title = full;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [title, description, lang]);
  return null;
}
