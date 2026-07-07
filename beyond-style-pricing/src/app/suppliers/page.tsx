import AppShell from '@/components/AppShell';
import SuppliersView from '@/components/SuppliersView';
import { prisma } from '@/lib/db';
import { getDict, getLocale } from '@/lib/i18n';
import { getSession, atLeast } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const locale = getLocale();
  const t = getDict(locale);
  const session = getSession();
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    include: { quotes: { orderBy: { quotedAt: 'desc' }, take: 3 } },
  });

  return (
    <AppShell title={t.suppliers}>
      <SuppliersView
        locale={locale}
        canEdit={!!session && atLeast(session.role, 'MANAGER')}
        suppliers={suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          country: s.country,
          contact: s.contact,
          materialsSupplied: s.materialsSupplied,
          moq: s.moq,
          deliveryCost: s.deliveryCost,
          leadTimeDays: s.leadTimeDays,
          currency: s.currency,
          qualityNotes: s.qualityNotes,
          reliabilityScore: s.reliabilityScore,
          quotes: s.quotes.map((q) => ({
            id: q.id,
            description: q.description,
            amount: q.amount,
            currency: q.currency,
            quotedAt: q.quotedAt.toISOString(),
          })),
        }))}
      />
    </AppShell>
  );
}
