'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/dict';

// Upload the master Excel workbook (or a CSV with the same headers) to
// create/update catalog products by SKU.
export default function ImportCatalog({ locale }: { locale: Locale }) {
  const ar = locale === 'ar';
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function onFile(file: File) {
    setBusy(true);
    setError('');
    setResult('');
    const base64: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ file: base64, filename: file.name }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Import failed');
      return;
    }
    setResult(
      ar
        ? `تم الاستيراد من ورقة "${data.sheet}": ${data.created} منتج جديد، ${data.updated} تحديث، ${data.skipped} صف متجاهل. المنتجات المحدثة تنتظر الاعتماد.`
        : `Imported from sheet "${data.sheet}": ${data.created} new, ${data.updated} updated, ${data.skipped} skipped. Updated items are pending approval.`
    );
    router.refresh();
  }

  return (
    <div className="card space-y-2">
      <h3 className="font-bold">{ar ? 'استيراد الكتالوج من Excel' : 'Import catalog from Excel'}</h3>
      <p className="text-xs text-neutral-500">
        {ar
          ? 'ارفع ملف قاعدة البيانات الرئيسية (ورقة Product Catalog) أو ملف CSV بنفس الأعمدة. التحديث يتم حسب رمز المنتج SKU.'
          : 'Upload the master database workbook (Product Catalog sheet) or a CSV with the same columns. Items are matched by SKU.'}
      </p>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        className="input"
        disabled={busy}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      {busy && <p className="animate-pulse text-sm text-gold-dark">{ar ? 'جارٍ الاستيراد' : 'Importing'}…</p>}
      {result && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{result}</p>}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
