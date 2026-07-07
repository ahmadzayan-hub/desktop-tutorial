import AppShell from '@/components/AppShell';
import MaterialsTable from '@/components/MaterialsTable';
import { prisma } from '@/lib/db';
import { getDict, getLocale } from '@/lib/i18n';
import { getSession } from '@/lib/auth';
import { loadRules } from '@/lib/rules';

export const dynamic = 'force-dynamic';

export default async function MaterialsPage() {
  const locale = getLocale();
  const t = getDict(locale);
  const session = getSession();
  const [materials, rules] = await Promise.all([
    prisma.material.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] }),
    loadRules(),
  ]);

  return (
    <AppShell title={t.materialRates}>
      <MaterialsTable
        locale={locale}
        canEdit={session?.role === 'ADMIN' || session?.role === 'MANAGER'}
        rateMaxAgeHours={rules.rateMaxAgeHours}
        materials={materials.map((m) => ({
          id: m.id,
          name: m.name,
          nameAr: m.nameAr,
          category: m.category,
          unit: m.unit,
          ratePerUnit: m.ratePerUnit,
          currency: m.currency,
          source: m.source,
          riskNote: m.riskNote,
          updatedAt: m.updatedAt.toISOString(),
        }))}
      />
    </AppShell>
  );
}
