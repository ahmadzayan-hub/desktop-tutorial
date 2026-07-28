'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dictionaries, type Locale } from '@/lib/i18n/dict';

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  nameAr: string | null;
  category: string;
  material: string | null;
  purity: string | null;
  weightGrams: number | null;
  supplierName: string | null;
  supplierQuote: number | null;
  targetMarginPct: number;
  vatMode: string;
  finalPrice: number | null;
  approvedPrice: number | null;
  approvalStatus: string;
  createdByName: string | null;
  approvedByName: string | null;
  updatedAt: string;
  costTotal: number | null;
}

const statusBadge: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-neutral-100 text-neutral-600',
};

export default function ProductsView({
  products,
  locale,
  canApprove,
  internalView,
}: {
  products: ProductRow[];
  locale: Locale;
  canApprove: boolean;
  internalView: boolean;
}) {
  const t = dictionaries[locale];
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const ar = locale === 'ar';

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter && p.approvalStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.nameAr ?? '').includes(query.trim())
      );
    });
  }, [products, query, statusFilter]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products) c[p.approvalStatus] = (c[p.approvalStatus] ?? 0) + 1;
    return c;
  }, [products]);

  async function act(id: string, action: 'APPROVE' | 'REJECT' | 'SUBMIT', approvedPrice?: number | null) {
    setBusy(id);
    setError('');
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, id, approvedPrice }),
    });
    setBusy(null);
    if (!res.ok) {
      setError((await res.json()).error || 'Action failed');
      return;
    }
    router.refresh();
  }

  function exportCsv() {
    const headers = ['SKU', 'Name', 'Category', 'Material', 'Purity', 'Weight(g)', 'Supplier', 'SupplierQuote', 'TargetMargin%', 'VAT', 'FinalPrice', 'ApprovedPrice', 'Status'];
    const rows = products.map((p) => [
      p.sku, p.name, p.category, p.material ?? '', p.purity ?? '', p.weightGrams ?? '',
      p.supplierName ?? '', p.supplierQuote ?? '', p.targetMarginPct, p.vatMode,
      p.finalPrice ?? '', p.approvedPrice ?? '', p.approvalStatus,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'thamin-costing.csv';
    a.click();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input flex-1"
          type="search"
          placeholder={ar ? 'ابحث بالاسم أو رمز المنتج' : 'Search by name or SKU'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn-outline px-3 py-2 text-sm" onClick={exportCsv}>
          ⬇ {t.export} CSV
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(['', 'APPROVED', 'PENDING', 'DRAFT', 'REJECTED'] as const).map((st) => (
          <button
            key={st || 'all'}
            onClick={() => setStatusFilter(st)}
            className={`badge ${statusFilter === st ? 'bg-ink text-gold' : 'bg-white text-neutral-600 shadow-card'}`}
          >
            {st === ''
              ? `${ar ? 'الكل' : 'All'} (${products.length})`
              : `${st === 'APPROVED' ? t.approved : st === 'PENDING' ? t.pending : st === 'DRAFT' ? t.draft : t.rejected} (${statusCounts[st] ?? 0})`}
          </button>
        ))}
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {visible.length === 0 && (
        <p className="card text-center text-sm text-neutral-400">
          {ar ? 'لا توجد منتجات مطابقة.' : 'No matching products.'}
        </p>
      )}

      {visible.map((p) => (
        <div key={p.id} className="card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold">{locale === 'ar' && p.nameAr ? p.nameAr : p.name}</h3>
              <p className="text-xs text-neutral-400">
                {p.sku} | {p.category} {p.material ? `| ${p.material}` : ''} {p.purity ? `| ${p.purity}` : ''}
                {p.weightGrams ? ` | ${p.weightGrams}g` : ''}
              </p>
            </div>
            <span className={`badge ${statusBadge[p.approvalStatus] ?? ''}`}>
              {p.approvalStatus === 'APPROVED' ? t.approved : p.approvalStatus === 'PENDING' ? t.pending : p.approvalStatus === 'REJECTED' ? t.rejected : t.draft}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-4">
            {internalView && p.supplierQuote != null && (
              <div><span className="text-xs text-neutral-400">{t.supplierCost}</span><p className="num font-medium">{p.supplierQuote} AED</p></div>
            )}
            {internalView && (
              <div><span className="text-xs text-neutral-400">{t.targetMargin}</span><p className="num font-medium">{p.targetMarginPct}%</p></div>
            )}
            {p.approvedPrice != null && (
              <div><span className="text-xs text-neutral-400">{t.approvePrice}</span><p className="num font-bold text-gold-dark">{p.approvedPrice} AED</p></div>
            )}
            {p.supplierName && (
              <div><span className="text-xs text-neutral-400">{t.suppliers}</span><p className="font-medium">{p.supplierName}</p></div>
            )}
            {internalView && p.costTotal != null && (p.approvedPrice ?? p.finalPrice) != null && (() => {
              const price = (p.approvedPrice ?? p.finalPrice) as number;
              const profit = Math.round((price - p.costTotal!) * 100) / 100;
              const marginPct = price > 0 ? Math.round((profit / price) * 100) : 0;
              return (
                <div>
                  <span className="text-xs text-neutral-400">{t.expectedProfit}</span>
                  <p className={`num font-bold ${marginPct < 25 ? 'text-red-600' : 'text-green-700'}`}>
                    {profit} AED ({marginPct}%)
                  </p>
                </div>
              );
            })()}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/calculator?product=${encodeURIComponent(p.sku)}`} className="btn-gold px-3 py-1.5 text-xs">
              {t.calculatePrice}
            </Link>
            {p.approvalStatus === 'DRAFT' && (
              <button className="btn-outline px-3 py-1.5 text-xs" disabled={busy === p.id} onClick={() => act(p.id, 'SUBMIT')}>
                {locale === 'ar' ? 'إرسال للاعتماد' : 'Submit for approval'}
              </button>
            )}
            {canApprove && p.approvalStatus === 'PENDING' && (
              <>
                <button className="btn-gold px-3 py-1.5 text-xs" disabled={busy === p.id} onClick={() => act(p.id, 'APPROVE', p.finalPrice)}>
                  ✓ {t.approve}
                </button>
                <button className="btn-outline px-3 py-1.5 text-xs !border-red-300 !text-red-600" disabled={busy === p.id} onClick={() => act(p.id, 'REJECT')}>
                  ✗ {t.reject}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
