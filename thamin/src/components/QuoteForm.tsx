'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dictionaries, type Locale } from '@/lib/i18n/dict';

interface Item {
  name: string;
  nameAr: string;
  qty: string;
  unitPrice: string;
}

export default function QuoteForm({
  locale,
  channels,
  defaults,
}: {
  locale: Locale;
  channels: { key: string; name: string }[];
  defaults: { deliveryStandard: number; deliveryRemote: number };
}) {
  const t = dictionaries[locale];
  const router = useRouter();
  const params = useSearchParams();
  const [items, setItems] = useState<Item[]>([
    { name: params.get('name') || '', nameAr: '', qty: '1', unitPrice: params.get('price') || '' },
  ]);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    channelKey: 'whatsapp',
    language: locale,
    vatMode: 'EXCLUSIVE',
    deliveryCost: String(defaults.deliveryStandard),
    deliveryDays: '1-3',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const setItem = (i: number, k: keyof Item, v: string) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));

  async function submit() {
    setBusy(true);
    setError('');
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...form,
        deliveryCost: Number(form.deliveryCost || 0),
        items: items
          .filter((i) => i.name && i.unitPrice)
          .map((i) => ({ name: i.name, nameAr: i.nameAr || undefined, qty: Number(i.qty || 1), unitPrice: Number(i.unitPrice) })),
      }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    router.push(`/q/${data.quote.publicToken}`);
  }

  return (
    <div className="space-y-4">
      <div className="card grid grid-cols-2 gap-3">
        <div>
          <label className="label">{t.customerName}</label>
          <input className="input" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        </div>
        <div>
          <label className="label">{t.customerPhone}</label>
          <input className="input num" dir="ltr" placeholder="+971…" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
        </div>
        <div>
          <label className="label">{t.channel}</label>
          <select className="input" value={form.channelKey} onChange={(e) => setForm({ ...form, channelKey: e.target.value })}>
            {channels.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{locale === 'ar' ? 'لغة العرض' : 'Quote language'}</label>
          <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value as Locale })}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
        <div>
          <label className="label">{t.deliveryCost} (AED)</label>
          <input className="input num" type="number" min={0} value={form.deliveryCost} onChange={(e) => setForm({ ...form, deliveryCost: e.target.value })} />
        </div>
        <div>
          <label className="label">{locale === 'ar' ? 'مدة التوصيل (أيام)' : 'Delivery timeline (days)'}</label>
          <input className="input num" value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="label">{t.vatMode}</label>
          <select className="input" value={form.vatMode} onChange={(e) => setForm({ ...form, vatMode: e.target.value })}>
            <option value="EXCLUSIVE">{t.vatExclusive}</option>
            <option value="INCLUSIVE">{t.vatInclusive}</option>
            <option value="NONE">{t.vatNone}</option>
          </select>
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="font-bold">{locale === 'ar' ? 'المنتجات' : 'Items'}</h3>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 border-b border-neutral-100 pb-3 last:border-0 md:grid-cols-4">
            <input className="input" placeholder={locale === 'ar' ? 'اسم المنتج (EN)' : 'Item name (EN)'} value={it.name} onChange={(e) => setItem(i, 'name', e.target.value)} />
            <input className="input" placeholder="اسم المنتج (AR)" value={it.nameAr} onChange={(e) => setItem(i, 'nameAr', e.target.value)} />
            <input className="input num" type="number" min={1} placeholder={t.quantity} value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} />
            <input className="input num" type="number" min={0} placeholder="AED" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', e.target.value)} />
          </div>
        ))}
        <button className="btn-outline w-full py-2 text-sm" onClick={() => setItems([...items, { name: '', nameAr: '', qty: '1', unitPrice: '' }])}>
          + {t.add}
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="btn-gold w-full text-lg" onClick={submit} disabled={busy || !items.some((i) => i.name && i.unitPrice)}>
        {busy ? '…' : t.createCustomerQuote}
      </button>
    </div>
  );
}
