import AppShell from '@/components/AppShell';
import { prisma } from '@/lib/db';
import { getDict, getLocale, fmtAed } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const locale = getLocale();
  const t = getDict(locale);
  const ar = locale === 'ar';
  const calcs = await prisma.priceCalculation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { createdBy: { select: { name: true } }, product: { select: { sku: true, name: true } } },
  });

  return (
    <AppShell title={t.history}>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-400">
              <th className="p-3 text-start">{ar ? 'التاريخ' : 'Date'}</th>
              <th className="p-3 text-start">{ar ? 'الوضع' : 'Mode'}</th>
              <th className="p-3 text-end">{t.totalCost}</th>
              <th className="p-3 text-end">{t.finalSellingPrice}</th>
              <th className="p-3 text-end">{t.grossMargin}</th>
              <th className="p-3 text-start">{ar ? 'بواسطة' : 'By'}</th>
            </tr>
          </thead>
          <tbody>
            {calcs.map((c) => {
              let warnings: { severity: string }[] = [];
              try { warnings = JSON.parse(c.warningsJson); } catch { /* tolerate legacy rows */ }
              const hasCritical = warnings.some((w) => w.severity === 'critical');
              return (
                <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                  <td className="num p-3 text-neutral-500">{c.createdAt.toLocaleString('en-AE', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="p-3">
                    {c.mode}
                    {c.channelKey && <span className="block text-xs text-neutral-400">{c.channelKey}</span>}
                    {c.product && <span className="block text-xs text-neutral-400">{c.product.sku}</span>}
                    {c.overrideByAdmin && <span className="badge bg-red-100 text-red-700">override</span>}
                  </td>
                  <td className="num p-3 text-end">{fmtAed(c.totalCost, locale)}</td>
                  <td className="num p-3 text-end font-medium">{fmtAed(c.finalPrice ?? c.recommendedPrice, locale)}</td>
                  <td className={`num p-3 text-end font-semibold ${hasCritical ? 'text-red-600' : c.marginPct < 25 ? 'text-amber-600' : 'text-green-700'}`}>
                    {c.marginPct.toFixed(1)}%
                  </td>
                  <td className="p-3 text-neutral-500">{c.createdBy?.name ?? '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {calcs.length === 0 && (
          <p className="p-6 text-center text-sm text-neutral-400">{ar ? 'لا يوجد سجل بعد.' : 'No history yet.'}</p>
        )}
      </div>
    </AppShell>
  );
}
