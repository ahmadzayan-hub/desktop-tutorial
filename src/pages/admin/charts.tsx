import { useI18n } from "@/i18n/I18nContext";

/** Dependency-free bar chart for the 14-day revenue trend. */
export function RevenueBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Revenue trend">
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end">
          <div
            className="w-full rounded-t bg-gradient-to-t from-gold-500 to-gold-400 transition-all"
            style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
            title={`AED ${v.toLocaleString()}`}
          />
        </div>
      ))}
    </div>
  );
}

/** Horizontal funnel bars. */
export function Funnel({ data }: { data: { stage: { en: string; ar: string }; value: number }[] }) {
  const { pick } = useI18n();
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-coffee-600">{pick(d.stage)}</span>
            <span className="font-semibold text-coffee-900">{d.value.toLocaleString()}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-coffee-700 to-coffee-400"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Small labelled distribution (payment / production / delivery status). */
export function StatusBars({ items }: { items: { label: string; value: number; tone: string }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3 text-sm">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${it.tone}`} />
          <span className="flex-1 text-coffee-600">{it.label}</span>
          <span className="font-semibold text-coffee-900">{it.value}</span>
          <span className="w-10 text-end text-xs text-coffee-400">{Math.round((it.value / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}
