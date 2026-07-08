'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/dict';

export default function RefreshRatesButton({ locale }: { locale: Locale }) {
  const ar = locale === 'ar';
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    setBusy(true);
    setMsg('');
    setError('');
    const res = await fetch('/api/materials/refresh', { method: 'POST' });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || data.error || 'Refresh failed');
      return;
    }
    const gold = (data.spot.goldUsdPerOunce as number).toFixed(0);
    const silver = (data.spot.silverUsdPerOunce as number).toFixed(2);
    setMsg(
      ar
        ? `تم التحديث: ${data.updated.length} خامة (الذهب ${gold} دولار/أونصة، الفضة ${silver} دولار/أونصة). ${data.skippedManual.length} خامة يدوية لم تُمس.`
        : `Updated ${data.updated.length} materials (gold ${gold} USD/oz, silver ${silver} USD/oz). ${data.skippedManual.length} manual materials untouched.`
    );
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button className="btn-outline w-full py-2 text-sm md:w-auto" onClick={refresh} disabled={busy}>
        {busy ? '…' : ar ? 'تحديث أسعار الذهب والفضة الحية' : 'Refresh live gold and silver rates'}
      </button>
      {msg && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{msg}</p>}
      {error && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}
    </div>
  );
}
