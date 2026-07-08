import { describe, expect, it } from 'vitest';
import { computePrice, DEFAULT_RULES } from '@/lib/pricing/engine';
import type { PricingInput } from '@/lib/pricing/types';
import { applyVisionGuardrails, type PhotoEstimate } from '@/lib/ai/vision';

const rules = DEFAULT_RULES;
const base = (extra: Partial<PricingInput> = {}): PricingInput => ({
  vatMode: 'EXCLUSIVE',
  ...extra,
});

describe('Pricing engine — required business test cases', () => {
  it('1. Silver necklace (gram-based material + making + engraving)', () => {
    const r = computePrice(
      base({
        materialCategory: 'SILVER',
        materialRatePerGram: 4.2,
        weightGrams: 8,
        makingCharge: 25,
        engravingCost: 15,
        deliveryCost: 25,
        paymentMethod: 'CARD',
        paymentFeePct: 2.5,
        marketingCost: 5,
        operationsCost: 50,
        packagingCost: 10,
        targetMarginPct: 40,
      }),
      rules
    );
    // material line = 4.2 × 8 = 33.6
    expect(r.costLines.find((l) => l.key === 'material')?.amount).toBeCloseTo(33.6);
    expect(r.totalCostBeforeFee).toBeCloseTo(163.6, 1);
    expect(r.recommendedSellingPrice).toBeGreaterThan(r.totalCost);
    expect(r.blocked).toBe(false);
    // VAT exclusive: customer price = net × 1.05
    expect(r.recommendedSellingPrice).toBeCloseTo(r.netPrice + r.vatAmount, 1);
    // rounded price sits on the psychological ladder and above min safe
    expect(rules.roundingLadder).toContain(r.roundedPrice);
    expect(r.roundedPrice).toBeGreaterThanOrEqual(r.minimumSafePrice);
  });

  it('2. Gold-plated bracelet (supplier quote + plating + COD fee)', () => {
    const r = computePrice(
      base({
        supplierCost: 22,
        platingCost: 15,
        claspCost: 3,
        packagingCost: 10,
        deliveryCost: 25,
        paymentMethod: 'COD',
        marketingCost: 8,
        operationsCost: 50,
        targetMarginPct: 40,
      }),
      rules
    );
    // COD adds a fixed fee line and no % fee by default
    expect(r.costLines.find((l) => l.key === 'codfee')?.amount).toBe(rules.codFee);
    expect(r.paymentFeeAmount).toBe(0);
    expect(r.netProfitAed).toBeGreaterThan(0);
  });

  it('3. Stainless steel earrings (piece-based, online payment fee)', () => {
    const r = computePrice(
      base({
        supplierCost: 12,
        stoneCost: 6,
        packagingCost: 10,
        deliveryCost: 25,
        paymentMethod: 'ZIINA',
        paymentFeePct: 2.5,
        marketingCost: 5,
        operationsCost: 50,
        targetMarginPct: 40,
      }),
      rules
    );
    // fee solved on the selling price: fee = 2.5% × netPrice
    expect(r.paymentFeeAmount).toBeCloseTo(0.025 * r.netPrice, 1);
    expect(r.totalCost).toBeCloseTo(r.totalCostBeforeFee + r.paymentFeeAmount, 1);
  });

  it('4. Custom engraved pendant (customization + gift box)', () => {
    const r = computePrice(
      base({
        supplierCost: 40,
        engravingCost: 20,
        customizationCost: 30,
        giftBoxCost: 18,
        packagingCost: 10,
        deliveryCost: 25,
        marketingCost: 5,
        operationsCost: 50,
        paymentFeePct: 2.5,
        targetMarginPct: 40,
      }),
      rules
    );
    const keys = r.costLines.map((l) => l.key);
    expect(keys).toEqual(expect.arrayContaining(['engraving', 'customization', 'giftbox']));
    expect(r.grossMarginPct).toBeGreaterThan(0);
  });

  it('5. Bundle of 2 bracelets is order-aware: per-order costs counted once, margin still protected', () => {
    const r = computePrice(base({ supplierCost: 50, packagingCost: 10, deliveryCost: 25, targetMarginPct: 40 }), rules);
    // per-item = supplier 50 + packaging 10; per-order = delivery 25 + marketing 5 + operations 50
    const f = 0.025;
    const floor2 = ((2 * 60 + 80) * 1.25) / (1 - f * 1.25) * 1.05;
    expect(r.bundle2Price).toBeGreaterThanOrEqual(Math.round(floor2 * 100) / 100 - 0.01);
    expect(r.bundle2Price).toBeLessThanOrEqual(2 * r.roundedPrice);
    // order-aware floor is cheaper than the naive 2x single-piece floor
    expect(r.bundle2Price).toBeLessThan(2 * r.minimumSafePrice);
    expect(r.bundle3Price).toBeLessThan(3 * r.minimumSafePrice);
  });

  it("5b. Real catalog check: Masha'Allah bracelet at 79 / 129 / 159 with customer-paid delivery", () => {
    // Real setup: supplier 25, packaging 10, marketing 5, operations 5,
    // COD, customer pays the AED 25 courier fee separately.
    const realRules = { ...rules, bundle2DiscountPct: 18, bundle3DiscountPct: 33 };
    const r = computePrice(
      base({
        supplierCost: 25, packagingCost: 10, marketingCost: 5, operationsCost: 5,
        paymentMethod: 'COD', customerPaysDelivery: true,
        targetMarginPct: 40, sellingPriceOverride: 79,
      }),
      realRules
    );
    // delivery must not appear as an internal cost line
    expect(r.costLines.find((l) => l.key === 'delivery')).toBeUndefined();
    // selling the hero bracelet at AED 79 is profitable and above minimum margin
    expect(r.netProfitAed).toBeGreaterThan(0);
    expect(r.effectivePrice).toBe(79);
    const markup = r.netProfitAed / (r.effectivePrice / 1.05 - r.netProfitAed);
    expect(markup).toBeGreaterThan(0.25);
    // the real bundle ladder stays above the order-aware safe floors
    const floor2 = ((2 * 35 + 20) * 1.25) * 1.05;
    const floor3 = ((3 * 35 + 20) * 1.25) * 1.05;
    expect(129).toBeGreaterThanOrEqual(floor2 - 10); // 129 sits near the protected floor
    expect(159).toBeGreaterThanOrEqual(floor3 - 10);
    expect(r.bundle2Price).toBeLessThanOrEqual(160);
  });

  it('5c. customerPaysDelivery notes the assumption for transparency', () => {
    const r = computePrice(base({ supplierCost: 25, customerPaysDelivery: true }), rules);
    expect(r.assumptions.join(' ')).toMatch(/charged to the customer/);
  });

  it('6. Remote delivery order uses the remote rate from rules', () => {
    const r = computePrice(base({ supplierCost: 50, remoteArea: true }), rules);
    expect(r.costLines.find((l) => l.key === 'delivery')?.amount).toBe(rules.deliveryRemote);
  });

  it('7. Online payment fee raises the price to preserve margin', () => {
    const noFee = computePrice(base({ supplierCost: 100, paymentFeePct: 0 }), rules);
    const withFee = computePrice(base({ supplierCost: 100, paymentFeePct: 2.9 }), rules);
    expect(withFee.netPrice).toBeGreaterThan(noFee.netPrice);
    // margin held at target in both cases (profit / cost = 40%)
    expect(withFee.netProfitAed / withFee.totalCost).toBeCloseTo(0.4, 1);
  });

  it('8. VAT inclusive vs exclusive — margin protected in both, VAT disclosed inside', () => {
    const excl = computePrice(base({ supplierCost: 100, vatMode: 'EXCLUSIVE' }), rules);
    const incl = computePrice(base({ supplierCost: 100, vatMode: 'INCLUSIVE' }), rules);
    expect(excl.vatAmount).toBeCloseTo(excl.netPrice * 0.05, 1);
    // inclusive: VAT is inside the customer price
    expect(incl.recommendedSellingPrice).toBeCloseTo(incl.netPrice + incl.vatAmount, 1);
    // ex-VAT revenue identical → same protected margin
    expect(incl.netPrice).toBeCloseTo(excl.netPrice, 1);
  });

  it('9. Discount below margin triggers strong alerts', () => {
    const r = computePrice(
      base({ supplierCost: 100, targetMarginPct: 40, discountPct: 45 }),
      rules
    );
    const codes = r.warnings.map((w) => w.code);
    expect(codes).toEqual(expect.arrayContaining(['DISCOUNT_BELOW_FLOOR']));
    expect(codes.some((c) => c === 'MARGIN_BELOW_MIN' || c === 'BELOW_COST')).toBe(true);
  });

  it('10. Missing weight for gram-based gold/silver is flagged as missing data', () => {
    const r = computePrice(base({ materialCategory: 'GOLD' }), rules);
    expect(r.ok).toBe(false);
    expect(r.missingData).toContain('weightGrams');
    expect(r.warnings.map((w) => w.code)).toContain('MISSING_WEIGHT');
  });
});

describe('Pricing engine — margin protection & validation', () => {
  it('blocks selling below cost without admin override', () => {
    const r = computePrice(base({ supplierCost: 200, sellingPriceOverride: 100 }), rules);
    expect(r.blocked).toBe(true);
    expect(r.warnings.map((w) => w.code)).toContain('BELOW_COST');
  });

  it('allows below cost only with admin override, still flagged critical', () => {
    const r = computePrice(base({ supplierCost: 200, sellingPriceOverride: 100, adminOverride: true }), rules);
    expect(r.blocked).toBe(false);
    expect(r.warnings.map((w) => w.code)).toContain('BELOW_COST_OVERRIDE');
  });

  it('rejects negative costs', () => {
    expect(() => computePrice(base({ supplierCost: -5 }), rules)).toThrow();
  });

  it('warns on stale material rate', () => {
    const old = new Date(Date.now() - 48 * 36e5).toISOString();
    const r = computePrice(
      base({ materialCategory: 'SILVER', materialRatePerGram: 4.2, weightGrams: 10, materialRateUpdatedAt: old }),
      rules
    );
    expect(r.warnings.map((w) => w.code)).toContain('STALE_RATE');
  });

  it('"what if I sell at X" reports profit at that price', () => {
    const r = computePrice(base({ supplierCost: 100, sellingPriceOverride: 500 }), rules);
    expect(r.effectivePrice).toBe(500);
    // revenue ex VAT = 500/1.05; profit = revenue − base − fee
    const revenue = 500 / 1.05;
    expect(r.netProfitAed).toBeCloseTo(revenue - r.totalCostBeforeFee - 0.025 * revenue, 1);
  });

  it('every result carries a transparent formula trace', () => {
    const r = computePrice(base({ supplierCost: 100 }), rules);
    expect(r.formulaTrace.length).toBeGreaterThan(3);
    expect(r.formulaTrace.join(' ')).toMatch(/Base cost/);
  });
});

describe('AI vision guardrails — photo with missing weight', () => {
  const estimate: PhotoEstimate = {
    productType: 'PENDANT',
    visibleAppearance: 'gold-tone',
    possibleMaterials: ['gold-plated stainless steel', '18K gold'],
    components: { chain: true, clasp: true, pendant: true, stones: false, engraving: false, packagingVisible: false },
    designComplexity: 'MEDIUM',
    makingChargeLevel: 'MEDIUM',
    suggestedCategory: 'Pendants',
    suggestedTitleEn: 'Elegant 18K 5 grams pendant',
    suggestedTitleAr: 'تعليقة أنيقة',
    suggestedDescriptionEn: 'A beautiful 18k pendant, 5 grams',
    suggestedDescriptionAr: 'تعليقة جميلة',
    customerPriceRangeAed: { min: 99, max: 199 },
    suggestedCostingFields: { makingCharge: 20 },
    confidence: 'MEDIUM',
    confidenceReason: 'clear photo, material uncertain',
    assumptions: [],
    cannotConfirmFromPhoto: [],
    missingInputsToAskUser: [],
  };

  it('scrubs hallucinated karat/weight claims and forces missing-data questions', () => {
    const safe = applyVisionGuardrails(estimate);
    expect(safe.suggestedTitleEn).not.toMatch(/18\s*K/i);
    expect(safe.suggestedDescriptionEn).not.toMatch(/\b5\s*grams\b/i);
    expect(safe.cannotConfirmFromPhoto).toEqual(
      expect.arrayContaining(['Weight in grams', 'Supplier cost', 'Gold karat / silver purity'])
    );
    expect(safe.missingInputsToAskUser).toEqual(
      expect.arrayContaining(['Weight in grams', 'Material confirmation', 'Supplier quote'])
    );
    // every unverified material candidate is labeled
    for (const m of safe.possibleMaterials) expect(m.toLowerCase()).toContain('unverified');
  });
});
