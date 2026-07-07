import { prisma } from './db';
import { DEFAULT_RULES } from './pricing/engine';
import type { BusinessRulesInput } from './pricing/types';

/** Load business rules from DB (single row), falling back to safe defaults. */
export async function loadRules(): Promise<BusinessRulesInput> {
  const row = await prisma.businessRules.findUnique({ where: { id: 'default' } });
  if (!row) return DEFAULT_RULES;
  let ladder: number[] = DEFAULT_RULES.roundingLadder;
  try {
    const parsed = JSON.parse(row.roundingLadder);
    if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) ladder = parsed;
  } catch { /* keep default */ }
  return {
    vatRatePct: row.vatRatePct,
    deliveryStandard: row.deliveryStandard,
    deliveryRemote: row.deliveryRemote,
    packagingDefault: row.packagingDefault,
    marketingDefault: row.marketingDefault,
    operationsDefault: row.operationsDefault,
    paymentFeeDefaultPct: row.paymentFeeDefaultPct,
    codFee: row.codFee,
    targetMarginPct: row.targetMarginPct,
    minMarginPct: row.minMarginPct,
    rateMaxAgeHours: row.rateMaxAgeHours,
    quoteValidityHours: row.quoteValidityHours,
    roundingLadder: ladder,
    bundle2DiscountPct: row.bundle2DiscountPct,
    bundle3DiscountPct: row.bundle3DiscountPct,
    wholesaleMarginPct: row.wholesaleMarginPct,
    premiumUpliftPct: row.premiumUpliftPct,
  };
}
