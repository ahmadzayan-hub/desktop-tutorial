import AppShell from '@/components/AppShell';
import Calculator from '@/components/Calculator';
import { prisma } from '@/lib/db';
import { getDict, getLocale } from '@/lib/i18n';
import { loadRules } from '@/lib/rules';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function CalculatorPage() {
  const locale = getLocale();
  const t = getDict(locale);
  const session = getSession();
  const [materials, channels, rules] = await Promise.all([
    prisma.material.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] }),
    prisma.channel.findMany({ where: { active: true } }),
    loadRules(),
  ]);

  return (
    <AppShell title={t.calculatePrice}>
      <Calculator
        locale={locale}
        isAdmin={session?.role === 'ADMIN'}
        materials={materials.map((m) => ({
          id: m.id,
          name: locale === 'ar' ? m.nameAr : m.name,
          category: m.category,
          unit: m.unit,
          ratePerUnit: m.ratePerUnit,
          updatedAt: m.updatedAt.toISOString(),
          source: m.source,
        }))}
        channels={channels.map((c) => ({ key: c.key, name: locale === 'ar' ? c.nameAr : c.name }))}
        defaults={{
          targetMarginPct: rules.targetMarginPct,
          minMarginPct: rules.minMarginPct,
          vatMode: 'EXCLUSIVE',
          rateMaxAgeHours: rules.rateMaxAgeHours,
        }}
      />
    </AppShell>
  );
}
