'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dictionaries, type Locale } from '@/lib/i18n/dict';

export default function SettingsForm({ locale, rules }: { locale: Locale; rules: any }) {
  const t = dictionaries[locale];
  const router = useRouter();
  const ar = locale === 'ar';
  const [form, setForm] = useState({
    vatRatePct: rules?.vatRatePct ?? 5,
    vatModeDefault: rules?.vatModeDefault ?? 'EXCLUSIVE',
    deliveryStandard: rules?.deliveryStandard ?? 25,
    deliveryRemote: rules?.deliveryRemote ?? 50,
    packagingDefault: rules?.packagingDefault ?? 10,
    marketingDefault: rules?.marketingDefault ?? 5,
    operationsDefault: rules?.operationsDefault ?? 50,
    paymentFeeDefaultPct: rules?.paymentFeeDefaultPct ?? 2.5,
    codFee: rules?.codFee ?? 10,
    targetMarginPct: rules?.targetMarginPct ?? 40,
    minMarginPct: rules?.minMarginPct ?? 25,
    rateMaxAgeHours: rules?.rateMaxAgeHours ?? 24,
    quoteValidityHours: rules?.quoteValidityHours ?? 24,
    roundingLadder: rules?.roundingLadder ?? '[79,89,99,119,129,149,179,199,249,299,399,499]',
    bundle2DiscountPct: rules?.bundle2DiscountPct ?? 10,
    bundle3DiscountPct: rules?.bundle3DiscountPct ?? 15,
    wholesaleMarginPct: rules?.wholesaleMarginPct ?? 25,
    premiumUpliftPct: rules?.premiumUpliftPct ?? 15,
    approvalThresholdAed: rules?.approvalThresholdAed ?? 5000,
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fields: { k: keyof typeof form; label: string }[] = [
    { k: 'vatRatePct', label: ar ? 'نسبة الضريبة ٪' : 'VAT rate %' },
    { k: 'deliveryStandard', label: ar ? 'توصيل عادي (درهم)' : 'Standard delivery (AED)' },
    { k: 'deliveryRemote', label: ar ? 'توصيل منطقة بعيدة (درهم)' : 'Remote delivery (AED)' },
    { k: 'packagingDefault', label: ar ? 'تكلفة التغليف الافتراضية' : 'Default packaging cost' },
    { k: 'marketingDefault', label: ar ? 'تكلفة التسويق الافتراضية' : 'Default marketing cost' },
    { k: 'operationsDefault', label: ar ? 'تكلفة التشغيل الافتراضية' : 'Default operations cost' },
    { k: 'paymentFeeDefaultPct', label: ar ? 'رسوم الدفع الافتراضية ٪' : 'Default payment fee %' },
    { k: 'codFee', label: ar ? 'رسوم الدفع عند الاستلام' : 'COD fee (AED)' },
    { k: 'targetMarginPct', label: ar ? 'هامش الربح المستهدف ٪' : 'Default target margin %' },
    { k: 'minMarginPct', label: ar ? 'الحد الأدنى للهامش ٪' : 'Minimum margin %' },
    { k: 'rateMaxAgeHours', label: ar ? 'أقصى عمر لسعر الخامة (ساعة)' : 'Max rate age (hours)' },
    { k: 'quoteValidityHours', label: ar ? 'صلاحية العرض (ساعة)' : 'Quote validity (hours)' },
    { k: 'bundle2DiscountPct', label: ar ? 'خصم قطعتين ٪' : 'Buy-2 discount %' },
    { k: 'bundle3DiscountPct', label: ar ? 'خصم ٣ قطع ٪' : 'Buy-3 discount %' },
    { k: 'wholesaleMarginPct', label: ar ? 'هامش الجملة ٪' : 'Wholesale margin %' },
    { k: 'premiumUpliftPct', label: ar ? 'زيادة السعر المميز ٪' : 'Premium uplift %' },
    { k: 'approvalThresholdAed', label: ar ? 'حد الاعتماد (درهم)' : 'Approval threshold (AED)' },
  ];

  async function save() {
    setMsg('');
    setError('');
    let ladder: number[];
    try {
      ladder = JSON.parse(String(form.roundingLadder));
      if (!Array.isArray(ladder)) throw new Error();
    } catch {
      setError(ar ? 'سلم التقريب يجب أن يكون قائمة أرقام مثل [79,99,149]' : 'Rounding ladder must be a JSON number array like [79,99,149]');
      return;
    }
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...Object.fromEntries(fields.map(({ k }) => [k, Number(form[k])])),
        vatModeDefault: form.vatModeDefault,
        roundingLadder: ladder,
      }),
    });
    if (!res.ok) {
      setError((await res.json()).error || 'Save failed');
      return;
    }
    setMsg(ar ? 'تم الحفظ ✓' : 'Saved ✓');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card grid grid-cols-2 gap-3 md:grid-cols-3">
        {fields.map(({ k, label }) => (
          <div key={k}>
            <label className="label">{label}</label>
            <input
              className="input num"
              type="number"
              min={0}
              step="any"
              value={String(form[k])}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </div>
        ))}
        <div>
          <label className="label">{ar ? 'وضع الضريبة الافتراضي' : 'Default VAT mode'}</label>
          <select className="input" value={form.vatModeDefault} onChange={(e) => setForm({ ...form, vatModeDefault: e.target.value })}>
            <option value="EXCLUSIVE">{t.vatExclusive}</option>
            <option value="INCLUSIVE">{t.vatInclusive}</option>
            <option value="NONE">{t.vatNone}</option>
          </select>
        </div>
        <div className="col-span-2 md:col-span-3">
          <label className="label">{ar ? 'سلم التقريب النفسي (درهم)' : 'Psychological rounding ladder (AED)'}</label>
          <input className="input num" dir="ltr" value={String(form.roundingLadder)} onChange={(e) => setForm({ ...form, roundingLadder: e.target.value })} />
        </div>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {msg && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{msg}</p>}
      <button className="btn-gold w-full" onClick={save}>{t.save}</button>
    </div>
  );
}
