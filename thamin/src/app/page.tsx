import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { getDict, getLocale } from '@/lib/i18n';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const locale = getLocale();
  const t = getDict(locale);
  const ar = locale === 'ar';
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [pendingApprovals, openAlerts, todayCalcs, activeProducts] = await Promise.all([
    prisma.product.count({ where: { approvalStatus: 'PENDING' } }),
    prisma.alert.count({ where: { resolved: false } }),
    prisma.priceCalculation.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.product.count({ where: { approvalStatus: 'APPROVED' } }),
  ]);

  const actions = [
    { href: '/calculator', label: t.newCalc, icon: '🧮', primary: true },
    { href: '/calculator?mode=photo', label: t.uploadPhoto, icon: '📷', primary: true },
    { href: '/quotes/new', label: t.createQuote, icon: '🧾', primary: true },
    { href: '/templates', label: t.templates, icon: '💬' },
    { href: '/products', label: t.products, icon: '💍' },
    { href: '/materials', label: t.materialRates, icon: '🥇' },
    { href: '/suppliers', label: t.suppliers, icon: '🏭' },
    { href: '/dashboard', label: t.dashboard, icon: '📊' },
    { href: '/brain', label: t.brain, icon: '🧠' },
    { href: '/history', label: t.history, icon: '🕘' },
    { href: '/install', label: t.installApp, icon: '📱' },
    { href: '/settings', label: t.settings, icon: '⚙️' },
  ];

  const stats = [
    { label: ar ? 'حسابات اليوم' : 'Calculations today', value: todayCalcs },
    { label: ar ? 'منتجات معتمدة' : 'Approved products', value: activeProducts },
    { label: ar ? 'بانتظار الاعتماد' : 'Pending approvals', value: pendingApprovals },
    { label: t.alerts, value: openAlerts },
  ];

  return (
    <AppShell>
      {/* brand hero */}
      <div className="mb-4 rounded-2xl border border-gold/40 bg-ink p-4 text-white">
        <p className="text-sm text-gold">{ar ? 'أهلاً بك في ثمين' : 'Welcome to Thamin'}</p>
        <p className="mt-1 text-lg font-bold leading-snug">
          {ar ? 'سعّر بثقة واحمِ هامش الربح في كل طلب' : 'Price with confidence and protect your margin on every order'}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 p-2">
              <p className="num text-xl font-bold text-gold">{s.value}</p>
              <p className="text-[10px] text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {(pendingApprovals > 0 || openAlerts > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {pendingApprovals > 0 && (
            <Link href="/products?status=PENDING" className="badge bg-amber-100 text-amber-800">
              {ar ? `بانتظار الاعتماد: ${pendingApprovals}` : `Pending approvals: ${pendingApprovals}`}
            </Link>
          )}
          {openAlerts > 0 && (
            <Link href="/dashboard#alerts" className="badge bg-red-100 text-red-700">
              {ar ? `تنبيهات: ${openAlerts}` : `Alerts: ${openAlerts}`}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`card flex min-h-[104px] flex-col items-center justify-center gap-2 text-center transition hover:-translate-y-0.5 hover:shadow-lg ${
              a.primary ? 'border-2 border-gold/60' : ''
            }`}
          >
            <span className="text-3xl" aria-hidden="true">{a.icon}</span>
            <span className="text-sm font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400">
        {t.appBrand} | {ar ? 'تسعير ذكي يحمي هامش الربح' : 'Smart pricing that protects your margin'}
      </p>
    </AppShell>
  );
}
