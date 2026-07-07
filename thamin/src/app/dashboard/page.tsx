import AppShell from '@/components/AppShell';
import { prisma } from '@/lib/db';
import { getDict, getLocale, fmtAed } from '@/lib/i18n';
import { loadRules } from '@/lib/rules';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const locale = getLocale();
  const t = getDict(locale);
  const ar = locale === 'ar';
  const rules = await loadRules();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    todayQuotes,
    approvedProducts,
    rejectedProducts,
    pendingProducts,
    calcs,
    alerts,
    staleMaterials,
    channelStats,
  ] = await Promise.all([
    prisma.quote.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.product.count({ where: { approvalStatus: 'APPROVED' } }),
    prisma.product.count({ where: { approvalStatus: 'REJECTED' } }),
    prisma.product.count({ where: { approvalStatus: 'PENDING' } }),
    prisma.priceCalculation.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.alert.findMany({ where: { resolved: false }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.material.findMany(),
    prisma.priceCalculation.groupBy({
      by: ['channelKey'],
      _count: { id: true },
      _avg: { marginPct: true },
    }),
  ]);

  const avgMargin = calcs.length ? calcs.reduce((s, c) => s + c.marginPct, 0) / calcs.length : 0;
  const belowTarget = calcs.filter((c) => c.marginPct < rules.targetMarginPct).length;
  const lowest = [...calcs].sort((a, b) => a.marginPct - b.marginPct).slice(0, 5);
  const stale = staleMaterials.filter(
    (m) => (Date.now() - m.updatedAt.getTime()) / 36e5 > rules.rateMaxAgeHours
  );

  const stat = (label: string, value: string | number, tone = '') => (
    <div className="card text-center" key={label}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`num mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );

  return (
    <AppShell title={t.dashboard}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stat(ar ? 'عروض اليوم' : "Today's quotes", todayQuotes)}
        {stat(ar ? 'منتجات معتمدة' : 'Approved products', approvedProducts, 'text-green-600')}
        {stat(ar ? 'بانتظار الاعتماد' : 'Pending approvals', pendingProducts, pendingProducts ? 'text-amber-600' : '')}
        {stat(ar ? 'مرفوضة' : 'Rejected', rejectedProducts, 'text-red-500')}
        {stat(ar ? 'متوسط الهامش' : 'Average margin', `${avgMargin.toFixed(1)}%`, avgMargin < rules.minMarginPct ? 'text-red-600' : 'text-gold-dark')}
        {stat(ar ? 'تسعيرات تحت الهدف' : 'Priced below target', belowTarget, belowTarget ? 'text-amber-600' : '')}
        {stat(ar ? 'أسعار خامات قديمة' : 'Stale material rates', stale.length, stale.length ? 'text-red-600' : 'text-green-600')}
        {stat(ar ? 'إجمالي الحسابات' : 'Total calculations', calcs.length)}
      </div>

      {/* channel performance */}
      <div className="card mt-4 overflow-x-auto">
        <h2 className="mb-2 font-bold">{ar ? 'أداء قنوات البيع' : 'Sales channel performance'}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-400">
              <th className="py-2 text-start">{t.channel}</th>
              <th className="py-2 text-end">{ar ? 'عدد التسعيرات' : 'Calculations'}</th>
              <th className="py-2 text-end">{ar ? 'متوسط الهامش' : 'Avg margin'}</th>
            </tr>
          </thead>
          <tbody>
            {channelStats.map((c) => (
              <tr key={c.channelKey ?? 'none'} className="border-b border-neutral-100 last:border-0">
                <td className="py-2">{c.channelKey ?? (ar ? 'بدون قناة' : 'No channel')}</td>
                <td className="num py-2 text-end">{c._count.id}</td>
                <td className={`num py-2 text-end font-medium ${(c._avg.marginPct ?? 0) < rules.minMarginPct ? 'text-red-600' : ''}`}>
                  {(c._avg.marginPct ?? 0).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* lowest margins — price leakage */}
      <div className="card mt-4">
        <h2 className="mb-2 font-bold">{ar ? 'أدنى هوامش (تسرب الأسعار)' : 'Lowest margins (price leakage)'}</h2>
        {lowest.length === 0 && <p className="text-sm text-neutral-400">-</p>}
        {lowest.map((c) => (
          <div key={c.id} className="flex items-center justify-between border-b border-neutral-100 py-1.5 text-sm last:border-0">
            <span className="text-neutral-500">
              {c.mode} | {c.createdAt.toLocaleDateString('en-AE')}
            </span>
            <span className="num">
              {fmtAed(c.finalPrice ?? c.recommendedPrice, locale)} |{' '}
              <strong className={c.marginPct < rules.minMarginPct ? 'text-red-600' : 'text-amber-600'}>
                {c.marginPct.toFixed(1)}%
              </strong>
            </span>
          </div>
        ))}
      </div>

      {/* alerts */}
      <div className="card mt-4" id="alerts">
        <h2 className="mb-2 font-bold">{t.alerts}</h2>
        {alerts.length === 0 && (
          <p className="text-sm text-neutral-400">{ar ? 'لا توجد تنبيهات 🎉' : 'No open alerts 🎉'}</p>
        )}
        {alerts.map((a) => (
          <div key={a.id} className={`mb-2 rounded-xl p-3 text-sm ${a.severity === 'critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>
            <span className="badge me-2 bg-white/60">{a.type}</span>
            {ar && a.messageAr ? a.messageAr : a.message}
            <span className="num block text-xs opacity-60">{a.createdAt.toLocaleString('en-AE')}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
