import { ShieldCheck, Droplets, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const TIPS = [
  { icon: Droplets, en: "Keep away from water & perfume", ar: "أبعدها عن الماء والعطور" },
  { icon: Sparkles, en: "Wipe with a soft dry cloth", ar: "امسحها بقطعة قماش ناعمة" },
  { icon: ShieldCheck, en: "Store in the pouch provided", ar: "احفظها في الكيس المرفق" },
];

/** Care guidance shown on every PDP — reinforces the plated nature honestly. */
export function JewelryCareBadge() {
  const { t, locale } = useI18n();
  return (
    <section className="gold-border">
      <div className="p-5">
        <h3 className="mb-3 font-display text-lg gold-text">{t("pdp.care")}</h3>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li key={tip.en} className="flex items-center gap-3 text-sm text-cream/80">
              <tip.icon size={18} className="text-gold shrink-0" />
              <span>{locale === "ar" ? tip.ar : tip.en}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-cream/50">
          {locale === "ar"
            ? "مطلية بطبقة ذهبية اللون — مجوهرات موضة."
            : "Gold-tone plated — fashion jewelry."}
        </p>
      </div>
    </section>
  );
}
