'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dictionaries, type Locale } from '@/lib/i18n/dict';

interface SupplierRow {
  id: string;
  name: string;
  country: string | null;
  contact: string | null;
  materialsSupplied: string | null;
  moq: string | null;
  deliveryCost: number | null;
  leadTimeDays: number | null;
  currency: string;
  qualityNotes: string | null;
  reliabilityScore: number | null;
  quotes: { id: string; description: string; amount: number; currency: string; quotedAt: string }[];
}

export default function SuppliersView({
  suppliers,
  locale,
  canEdit,
}: {
  suppliers: SupplierRow[];
  locale: Locale;
  canEdit: boolean;
}) {
  const t = dictionaries[locale];
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', country: '', contact: '', materialsSupplied: '', moq: '',
    deliveryCost: '', leadTimeDays: '', currency: 'AED', qualityNotes: '', reliabilityScore: '4',
  });

  async function save() {
    setError('');
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...form,
        deliveryCost: form.deliveryCost ? Number(form.deliveryCost) : undefined,
        leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : undefined,
        reliabilityScore: form.reliabilityScore ? Number(form.reliabilityScore) : undefined,
      }),
    });
    if (!res.ok) {
      setError((await res.json()).error || 'Save failed');
      return;
    }
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {suppliers.map((s) => (
        <div key={s.id} className="card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-sm text-neutral-500">
                {s.country} | {s.contact}
              </p>
            </div>
            {s.reliabilityScore && (
              <span className="badge bg-gold/15 text-gold-dark">{'★'.repeat(s.reliabilityScore)}</span>
            )}
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-4">
            {s.materialsSupplied && <div><dt className="text-xs text-neutral-400">{t.material}</dt><dd>{s.materialsSupplied}</dd></div>}
            {s.moq && <div><dt className="text-xs text-neutral-400">MOQ</dt><dd>{s.moq}</dd></div>}
            {s.leadTimeDays != null && <div><dt className="text-xs text-neutral-400">{locale === 'ar' ? 'مدة التوريد' : 'Lead time'}</dt><dd className="num">{s.leadTimeDays} {locale === 'ar' ? 'يوم' : 'days'}</dd></div>}
            {s.deliveryCost != null && <div><dt className="text-xs text-neutral-400">{t.deliveryCost}</dt><dd className="num">{s.deliveryCost} {s.currency}</dd></div>}
          </dl>
          {s.qualityNotes && <p className="mt-2 text-xs text-amber-700">⚠ {s.qualityNotes}</p>}
          {s.quotes.length > 0 && (
            <div className="mt-2 rounded-xl bg-luxe p-2 text-xs">
              <p className="mb-1 font-semibold text-neutral-500">{locale === 'ar' ? 'آخر العروض' : 'Recent quotes'}</p>
              {s.quotes.map((q) => (
                <p key={q.id} className="num">
                  {q.description}: {q.amount} {q.currency} | {new Date(q.quotedAt).toLocaleDateString('en-AE')}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}

      {canEdit && (
        <div className="card space-y-2">
          {adding ? (
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder={locale === 'ar' ? 'اسم المورد' : 'Supplier name'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder={locale === 'ar' ? 'الدولة' : 'Country'} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              <input className="input" placeholder={locale === 'ar' ? 'التواصل' : 'Contact'} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <input className="input" placeholder={locale === 'ar' ? 'الخامات الموردة' : 'Materials supplied'} value={form.materialsSupplied} onChange={(e) => setForm({ ...form, materialsSupplied: e.target.value })} />
              <input className="input" placeholder="MOQ" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} />
              <input className="input num" type="number" min={0} placeholder={`${locale === 'ar' ? 'تكلفة الشحن' : 'Delivery cost'} (AED)`} value={form.deliveryCost} onChange={(e) => setForm({ ...form, deliveryCost: e.target.value })} />
              <input className="input num" type="number" min={0} placeholder={locale === 'ar' ? 'مدة التوريد (أيام)' : 'Lead time (days)'} value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} />
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {['AED', 'USD', 'EUR', 'CNY', 'TRY'].map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className="input col-span-2" placeholder={locale === 'ar' ? 'ملاحظات الجودة' : 'Quality notes'} value={form.qualityNotes} onChange={(e) => setForm({ ...form, qualityNotes: e.target.value })} />
              <div className="col-span-2 flex gap-2">
                <button className="btn-gold flex-1" onClick={save} disabled={!form.name}>{t.save}</button>
                <button className="btn-outline flex-1" onClick={() => setAdding(false)}>{t.cancel}</button>
              </div>
            </div>
          ) : (
            <button className="btn-outline w-full" onClick={() => setAdding(true)}>+ {t.add}</button>
          )}
        </div>
      )}
    </div>
  );
}
