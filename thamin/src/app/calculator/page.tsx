import AppShell from '@/components/AppShell';
import Calculator from '@/components/Calculator';
import { prisma } from '@/lib/db';
import { getDict, getLocale } from '@/lib/i18n';
import { loadRules } from '@/lib/rules';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Map a saved product costing sheet to calculator form values so the team
// prices catalog items in one tap instead of retyping every cost.
function productToForm(p: {
  category: string;
  supplierQuote: number | null;
  exchangeRate: number;
  makingCharge: number;
  platingCost: number;
  chainCost: number;
  claspCost: number;
  pendantCost: number;
  stoneCost: number;
  engravingCost: number;
  customizationCost: number;
  packagingCost: number;
  giftBoxCost: number;
  deliveryCost: number;
  paymentMethod: string;
  paymentFeePct: number;
  marketingCost: number;
  operationsCost: number;
  otherCosts: number;
  vatMode: string;
  targetMarginPct: number;
}): Record<string, string> {
  const num = (v: number | null) => (v && v > 0 ? String(v) : '');
  return {
    productType: p.category,
    supplierCost: num(p.supplierQuote),
    exchangeRate: String(p.exchangeRate || 1),
    makingCharge: num(p.makingCharge),
    platingCost: num(p.platingCost),
    chainCost: num(p.chainCost),
    claspCost: num(p.claspCost),
    pendantCost: num(p.pendantCost),
    stoneCost: num(p.stoneCost),
    engravingCost: num(p.engravingCost),
    customizationCost: num(p.customizationCost),
    packagingCost: num(p.packagingCost),
    giftBoxCost: num(p.giftBoxCost),
    deliveryCost: num(p.deliveryCost),
    deliveryMode: p.deliveryCost > 0 ? 'standard' : 'customer',
    paymentMethod: p.paymentMethod,
    paymentFeePct: p.paymentMethod === 'COD' ? '' : String(p.paymentFeePct),
    marketingCost: num(p.marketingCost),
    operationsCost: num(p.operationsCost),
    otherCosts: num(p.otherCosts),
    vatMode: p.vatMode,
    targetMarginPct: String(p.targetMarginPct),
  };
}

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: { product?: string; mode?: string };
}) {
  const locale = getLocale();
  const t = getDict(locale);
  const session = getSession();
  const [materials, channels, rules] = await Promise.all([
    prisma.material.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] }),
    prisma.channel.findMany({ where: { active: true } }),
    loadRules(),
  ]);

  let initial: Record<string, string> | undefined;
  let initialName: string | undefined;
  if (searchParams.product) {
    const product = await prisma.product.findFirst({
      where: { OR: [{ sku: searchParams.product }, { id: searchParams.product }] },
    });
    if (product) {
      initial = productToForm(product);
      initialName = locale === 'ar' && product.nameAr ? product.nameAr : product.name;
    }
  }

  return (
    <AppShell title={initialName ? `${t.calculatePrice}: ${initialName}` : t.calculatePrice}>
      <Calculator
        locale={locale}
        isAdmin={session?.role === 'ADMIN'}
        initial={initial}
        initialProductName={initialName}
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
