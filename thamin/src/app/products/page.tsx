import AppShell from '@/components/AppShell';
import ProductsView from '@/components/ProductsView';
import ImportCatalog from '@/components/ImportCatalog';
import { prisma } from '@/lib/db';
import { getDict, getLocale } from '@/lib/i18n';
import { atLeast, getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: { searchParams: { status?: string } }) {
  const locale = getLocale();
  const t = getDict(locale);
  const session = getSession();
  const products = await prisma.product.findMany({
    where: searchParams.status ? { approvalStatus: searchParams.status } : undefined,
    orderBy: { updatedAt: 'desc' },
    include: { supplier: { select: { name: true } }, createdBy: { select: { name: true } }, approvedBy: { select: { name: true } } },
  });

  const internalView = !!session && atLeast(session.role, 'SALES');

  return (
    <AppShell title={t.products}>
      {!!session && atLeast(session.role, 'MANAGER') && (
        <div className="mb-3"><ImportCatalog locale={locale} /></div>
      )}
      <ProductsView
        locale={locale}
        canApprove={!!session && atLeast(session.role, 'MANAGER')}
        internalView={internalView}
        products={products.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          nameAr: p.nameAr,
          category: p.category,
          material: p.material,
          purity: p.purity,
          weightGrams: p.weightGrams,
          supplierName: p.supplier?.name ?? null,
          supplierQuote: internalView ? p.supplierQuote : null,
          targetMarginPct: p.targetMarginPct,
          vatMode: p.vatMode,
          finalPrice: p.finalPrice,
          approvedPrice: p.approvedPrice,
          approvalStatus: p.approvalStatus,
          createdByName: p.createdBy?.name ?? null,
          approvedByName: p.approvedBy?.name ?? null,
          updatedAt: p.updatedAt.toISOString(),
          costTotal: internalView
            ? p.makingCharge + p.platingCost + p.chainCost + p.claspCost + p.pendantCost + p.stoneCost +
              p.engravingCost + p.customizationCost + p.packagingCost + p.giftBoxCost + p.deliveryCost +
              p.marketingCost + p.operationsCost + p.otherCosts + (p.supplierQuote ?? 0) * p.exchangeRate
            : null,
        }))}
      />
    </AppShell>
  );
}
