import { Droplets, Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const TIPS: { icon: LucideIcon; key: "pdp.care.tip1" | "pdp.care.tip2" | "pdp.care.tip3" }[] = [
  { icon: Droplets, key: "pdp.care.tip1" },
  { icon: Sparkles, key: "pdp.care.tip2" },
  { icon: ShieldCheck, key: "pdp.care.tip3" },
];

/** Honest, accessory-appropriate care guidance — no over-claims. */
export function JewelryCareBadge() {
  const { t } = useI18n();
  return (
    <section className="gold-border">
      <div className="p-5">
        <h3 className="mb-3 font-display text-lg gold-text">{t("pdp.care")}</h3>
        <p className="mb-3 text-sm text-cream/80">{t("pdp.care.text")}</p>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li key={tip.key} className="flex items-center gap-3 text-sm text-cream/80">
              <tip.icon size={18} className="text-gold shrink-0" />
              <span>{t(tip.key)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-cream/50">{t("pdp.care.footnote")}</p>
      </div>
    </section>
  );
}
