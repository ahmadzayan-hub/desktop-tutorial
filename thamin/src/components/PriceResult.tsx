'use client';

import Link from 'next/link';
import { useState } from 'react';
import { dictionaries, type Locale } from '@/lib/i18n/dict';
import type { PricingResult } from '@/lib/pricing/types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-AE', { maximumFractionDigits: 2 }).format(n);

export default function PriceResult({
  result,
  locale,
  productName,
}: {
  result: PricingResult;
  locale: Locale;
  productName?: string;
}) {
  const t = dictionaries[locale];
  const [showTrace, setShowTrace] = useState(false);
  const ar = locale === 'ar';

  const big = [
    { label: t.roundedPrice, value: result.roundedPrice, hero: true },
    { label: t.recommendedPrice, value: result.recommendedSellingPrice },
    { label: t.minimumSafePrice, value: result.minimumSafePrice },
    { label: t.netProfit, value: result.netProfitAed },
  ];
  const refs = [
    { label: t.totalCost, value: result.totalCost },
    { label: t.breakEven, value: result.breakEvenPrice },
    { label: t.wholesalePrice, value: result.wholesalePrice },
    { label: t.premiumPrice, value: result.premiumRetailPrice },
    { label: t.bundle2, value: result.bundle2Price },
    { label: t.bundle3, value: result.bundle3Price },
    { label: t.vatAmount, value: result.vatAmount },
    { label: t.grossMargin, value: result.grossMarginPct, suffix: '%' },
  ];

  return (
    <div className="space-y-4">
      {result.blocked && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700">
          ⛔ {t.blockedBelowCost}
        </div>
      )}
      {result.warnings.map((w) => (
        <div
          key={w.code}
          className={`rounded-xl p-3 text-sm font-medium ${
            w.severity === 'critical'
              ? 'bg-red-50 text-red-700'
              : w.severity === 'warning'
                ? 'bg-amber-50 text-amber-800'
                : 'bg-blue-50 text-blue-700'
          }`}
        >
          {w.severity === 'critical' ? '🔴' : w.severity === 'warning' ? '🟠' : 'ℹ️'}{' '}
          {ar ? w.messageAr : w.message}
        </div>
      ))}
      {result.missingData.length > 0 && (
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <strong>{t.missingData}:</strong> {result.missingData.join(', ')}
        </div>
      )}

      {/* hero price cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {big.map((b) => (
          <div
            key={b.label}
            className={`card text-center ${b.hero ? 'border-2 border-gold bg-ink text-white' : ''}`}
          >
            <p className={`text-xs ${b.hero ? 'text-gold' : 'text-neutral-500'}`}>{b.label}</p>
            <p className={`num mt-1 text-2xl font-bold ${b.hero ? 'text-gold' : ''}`}>
              {fmt(b.value)} <span className="text-sm font-normal">AED</span>
            </p>
          </div>
        ))}
      </div>

      {/* reference prices */}
      <div className="card grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-4">
        {refs.map((x) => (
          <div key={x.label} className="flex items-baseline justify-between gap-2">
            <span className="text-neutral-500">{x.label}</span>
            <span className="num font-semibold">
              {fmt(x.value)}
              {x.suffix ?? ''}
            </span>
          </div>
        ))}
      </div>

      {/* cost breakdown */}
      <div className="card overflow-x-auto">
        <h3 className="mb-2 font-bold">{t.costBreakdown}</h3>
        <table className="w-full text-sm">
          <tbody>
            {result.costLines.map((l) => (
              <tr key={l.key} className="border-b border-neutral-100 last:border-0">
                <td className="py-1.5">{ar ? l.labelAr : l.label}</td>
                <td className="num py-1.5 text-end font-medium">{fmt(l.amount)} AED</td>
              </tr>
            ))}
            <tr className="border-t border-neutral-200">
              <td className="py-1.5">{ar ? 'رسوم الدفع / العمولة' : 'Payment fee / commission'}</td>
              <td className="num py-1.5 text-end font-medium">{fmt(result.paymentFeeAmount)} AED</td>
            </tr>
            <tr className="font-bold">
              <td className="py-1.5">{t.totalCost}</td>
              <td className="num py-1.5 text-end">{fmt(result.totalCost)} AED</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* assumptions & formula trace */}
      {result.assumptions.length > 0 && (
        <div className="card text-sm">
          <h3 className="mb-1 font-bold">{t.assumptions}</h3>
          <ul className="list-inside list-disc text-neutral-600">
            {result.assumptions.map((a) => (
              <li key={a} className="num">{a}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="card text-sm">
        <button className="font-bold text-gold-dark" onClick={() => setShowTrace(!showTrace)}>
          {showTrace ? '▾' : '▸'} {t.formulaTrace}
        </button>
        {showTrace && (
          <ol className="mt-2 list-inside list-decimal space-y-1 text-neutral-600" dir="ltr">
            {result.formulaTrace.map((s, i) => (
              <li key={i} className="num">{s}</li>
            ))}
          </ol>
        )}
      </div>

      {!result.blocked && (
        <Link
          href={`/quotes/new?price=${result.roundedPrice}&name=${encodeURIComponent(productName ?? '')}`}
          className="btn-outline w-full"
        >
          {t.createCustomerQuote} →
        </Link>
      )}
    </div>
  );
}
