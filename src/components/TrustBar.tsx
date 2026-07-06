import { Star, Truck, ShieldCheck, MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export function TrustBar() {
  const { t } = useI18n();
  const items = [
    { Icon: Star, key: "trust.reviews" },
    { Icon: Truck, key: "trust.delivery" },
    { Icon: ShieldCheck, key: "trust.secure" },
    { Icon: MessageCircle, key: "trust.whatsapp" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ Icon, key }) => (
        <div
          key={key}
          className="flex items-center gap-2.5 rounded-xl border border-coffee-100/70 bg-white/70 px-3 py-3 text-xs font-medium text-coffee-700 shadow-sm"
        >
          <Icon className="h-5 w-5 shrink-0 text-gold-600" />
          <span>{t(key)}</span>
        </div>
      ))}
    </div>
  );
}

export function StatStrip() {
  const { t } = useI18n();
  const stats = [1, 2, 3, 4].map((n) => ({
    value: t(`trust.stat${n}Value`),
    label: t(`trust.stat${n}Label`),
  }));
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="font-serif text-3xl font-bold text-gold-500 sm:text-4xl">{s.value}</div>
          <div className="mt-1 text-xs font-medium text-coffee-600">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
