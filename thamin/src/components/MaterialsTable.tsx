'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dictionaries, type Locale } from '@/lib/i18n/dict';

interface Mat {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  unit: string;
  ratePerUnit: number;
  currency: string;
  source: string;
  riskNote: string | null;
  updatedAt: string;
}

export default function MaterialsTable({
  materials,
  locale,
  canEdit,
  rateMaxAgeHours,
}: {
  materials: Mat[];
  locale: Locale;
  canEdit: boolean;
  rateMaxAgeHours: number;
}) {
  const t = dictionaries[locale];
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [rate, setRate] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [newMat, setNewMat] = useState({ name: '', nameAr: '', category: 'OTHER', unit: 'gram', ratePerUnit: '' });

  async function saveRate(m: Mat) {
    setError('');
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...m, ratePerUnit: Number(rate), source: 'manual' }),
    });
    if (!res.ok) {
      setError((await res.json()).error || 'Save failed');
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function addMaterial() {
    setError('');
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...newMat, ratePerUnit: Number(newMat.ratePerUnit) }),
    });
    if (!res.ok) {
      setError((await res.json()).error || 'Save failed');
      return;
    }
    setAdding(false);
    setNewMat({ name: '', nameAr: '', category: 'OTHER', unit: 'gram', ratePerUnit: '' });
    router.refresh();
  }

  const ageHours = (iso: string) => (Date.now() - new Date(iso).getTime()) / 36e5;

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-500">
        {locale === 'ar'
          ? 'الأسعار تُدخل يدوياً حالياً، والربط مع أسعار السوق الحية جاهز للتفعيل مستقبلاً. حدّث الأسعار يومياً.'
          : 'Rates are entered manually today; live market API integration is ready to enable later. Update rates daily.'}
      </p>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-start text-xs uppercase text-neutral-400">
              <th className="p-3 text-start">{t.material}</th>
              <th className="p-3 text-start">{locale === 'ar' ? 'السعر' : 'Rate'}</th>
              <th className="p-3 text-start">{t.source}</th>
              <th className="p-3 text-start">{t.lastUpdated}</th>
              {canEdit && <th className="p-3" />}
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => {
              const stale = ageHours(m.updatedAt) > rateMaxAgeHours;
              return (
                <tr key={m.id} className="border-b border-neutral-100 last:border-0">
                  <td className="p-3">
                    <span className="font-medium">{locale === 'ar' ? m.nameAr : m.name}</span>
                    <span className="block text-xs text-neutral-400">{m.category}</span>
                    {m.riskNote && <span className="block text-xs text-amber-600">⚠ {m.riskNote}</span>}
                  </td>
                  <td className="num p-3 font-semibold">
                    {editing === m.id ? (
                      <span className="flex items-center gap-1">
                        <input className="input w-24 py-1" type="number" min={0} step="any" value={rate} onChange={(e) => setRate(e.target.value)} />
                        <button className="btn-gold px-2 py-1 text-xs" onClick={() => saveRate(m)}>{t.save}</button>
                      </span>
                    ) : (
                      <>{m.ratePerUnit} {m.currency}/{m.unit}</>
                    )}
                  </td>
                  <td className="p-3 text-neutral-500">{m.source}</td>
                  <td className="p-3">
                    <span className={`badge ${stale ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {new Date(m.updatedAt).toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-AE', { dateStyle: 'short', timeStyle: 'short' })}
                      {stale && (locale === 'ar' ? ' | قديم' : ' | stale')}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="p-3">
                      <button
                        className="text-xs font-semibold text-gold-dark"
                        onClick={() => { setEditing(m.id); setRate(String(m.ratePerUnit)); }}
                      >
                        {t.edit}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <div className="card space-y-2">
          {adding ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              <input className="input" placeholder="Name (EN)" value={newMat.name} onChange={(e) => setNewMat({ ...newMat, name: e.target.value })} />
              <input className="input" placeholder="الاسم (AR)" value={newMat.nameAr} onChange={(e) => setNewMat({ ...newMat, nameAr: e.target.value })} />
              <select className="input" value={newMat.category} onChange={(e) => setNewMat({ ...newMat, category: e.target.value })}>
                {['GOLD', 'SILVER', 'STAINLESS', 'PLATING', 'STONE', 'CHAIN', 'CLASP', 'PACKAGING', 'OTHER'].map((c) => <option key={c}>{c}</option>)}
              </select>
              <select className="input" value={newMat.unit} onChange={(e) => setNewMat({ ...newMat, unit: e.target.value })}>
                {['gram', 'piece', 'meter', 'set'].map((u) => <option key={u}>{u}</option>)}
              </select>
              <input className="input num" type="number" min={0} step="any" placeholder="Rate AED" value={newMat.ratePerUnit} onChange={(e) => setNewMat({ ...newMat, ratePerUnit: e.target.value })} />
              <div className="col-span-2 flex gap-2 md:col-span-5">
                <button className="btn-gold flex-1" onClick={addMaterial}>{t.save}</button>
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
