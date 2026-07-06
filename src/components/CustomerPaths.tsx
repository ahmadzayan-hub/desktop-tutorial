import { Link } from "react-router-dom";
import { Gift, Sparkles, Boxes, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Reveal } from "./Reveal";

/** The three above-the-fold customer paths: Personal · Corporate · Bulk. */
export function CustomerPaths() {
  const { t, isRtl } = useI18n();

  const paths = [
    { key: "personal", to: "/customize", Icon: Gift, accent: "from-gold-400/20 to-gold-500/5" },
    { key: "corporate", to: "/corporate", Icon: Sparkles, accent: "from-coffee-400/15 to-coffee-700/5" },
    { key: "bulk", to: "/corporate#quote", Icon: Boxes, accent: "from-gold-500/15 to-cream-200" },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {paths.map((p, i) => (
        <Reveal key={p.key} delay={i * 90}>
          <Link
            to={p.to}
            className="group flex h-full flex-col rounded-2xl border border-coffee-100/70 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${p.accent}`}>
              <p.Icon className="h-6 w-6 text-gold-600" />
            </span>
            <h3 className="mt-4 font-serif text-xl font-bold text-coffee-900">{t(`paths.${p.key}.title`)}</h3>
            <p className="mt-2 flex-1 text-sm text-coffee-600">{t(`paths.${p.key}.desc`)}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="chip">{t(`paths.${p.key}.price`)}</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-coffee-700 group-hover:text-gold-600">
                {t(`paths.${p.key}.cta`)}
                <ArrowRight className={`h-4 w-4 transition group-hover:translate-x-0.5 ${isRtl ? "rotate-180" : ""}`} />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
