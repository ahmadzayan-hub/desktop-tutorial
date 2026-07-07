import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { getDict, getLocale } from '@/lib/i18n';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const locale = getLocale();
  const t = getDict(locale);

  const [pendingApprovals, openAlerts] = await Promise.all([
    prisma.product.count({ where: { approvalStatus: 'PENDING' } }),
    prisma.alert.count({ where: { resolved: false } }),
  ]);

  const actions = [
    { href: '/calculator', label: t.newCalc, icon: '🧮', primary: true },
    { href: '/calculator?mode=photo', label: t.uploadPhoto, icon: '📷', primary: true },
    { href: '/quotes/new', label: t.createQuote, icon: '📄', primary: true },
    { href: '/materials', label: t.materialRates, icon: '🥇' },
    { href: '/products', label: t.products, icon: '💍' },
    { href: '/suppliers', label: t.suppliers, icon: '🏭' },
    { href: '/dashboard', label: t.dashboard, icon: '📊' },
    { href: '/brain', label: t.brain, icon: '🧠' },
    { href: '/history', label: t.history, icon: '🕘' },
    { href: '/settings', label: t.settings, icon: '⚙️' },
  ];

  return (
    <AppShell>
      {(pendingApprovals > 0 || openAlerts > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {pendingApprovals > 0 && (
            <Link href="/products?status=PENDING" className="badge bg-amber-100 text-amber-800">
              {locale === 'ar' ? `بانتظار الاعتماد: ${pendingApprovals}` : `Pending approvals: ${pendingApprovals}`}
            </Link>
          )}
          {openAlerts > 0 && (
            <Link href="/dashboard#alerts" className="badge bg-red-100 text-red-700">
              {locale === 'ar' ? `تنبيهات: ${openAlerts}` : `Alerts: ${openAlerts}`}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`card flex min-h-[110px] flex-col items-center justify-center gap-2 text-center transition hover:-translate-y-0.5 hover:shadow-lg ${
              a.primary ? 'border-2 border-gold/60' : ''
            }`}
          >
            <span className="text-3xl">{a.icon}</span>
            <span className="text-sm font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400">
        Beyond Style UAE · {locale === 'ar' ? 'تسعير ذكي يحمي هامش الربح' : 'Smart pricing that protects your margin'}
      </p>
    </AppShell>
  );
}
