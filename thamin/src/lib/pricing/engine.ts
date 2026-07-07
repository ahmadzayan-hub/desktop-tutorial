import type {
  BusinessRulesInput,
  CostLine,
  PricingInput,
  PricingResult,
  PricingWarning,
} from './types';

const r2 = (n: number) => Math.round(n * 100) / 100;

function warn(
  code: string,
  severity: PricingWarning['severity'],
  message: string,
  messageAr: string
): PricingWarning {
  return { code, severity, message, messageAr };
}

/**
 * The single source of truth for every price in the system.
 *
 * Formula (transparent, mirrored in `formulaTrace`):
 *   Base Cost  = Material + Supplier + Making + Plating + Chain + Clasp
 *              + Pendant + Stone + Engraving + Customization + Packaging
 *              + Gift Box + Delivery + Marketing + Operations + Ads + Other
 *   Payment fee is a % of the selling price, so the ex-VAT price is solved
 *   algebraically:  P = (BaseCost + codFee) × (1 + m) / (1 − f × (1 + m))
 *   where m = target margin (markup on cost) and f = payment fee %.
 *   Commission (channel) is treated like a fee % of price as well.
 *   VAT: EXCLUSIVE → customer price = P × (1 + vat)
 *        INCLUSIVE → customer price = P, VAT portion = P × vat/(100+vat)
 *
 * AI output NEVER sets a price — every number shown to a user passes
 * through this function.
 */
export function computePrice(
  input: PricingInput,
  rules: BusinessRulesInput
): PricingResult {
  const warnings: PricingWarning[] = [];
  const missingData: string[] = [];
  const assumptions: string[] = [];
  const trace: string[] = [];
  const qty = Math.max(1, input.quantity ?? 1);

  // ── validation ──────────────────────────────────────────────────────────
  const numericFields: [string, number | undefined][] = [
    ['supplierCost', input.supplierCost],
    ['makingCharge', input.makingCharge],
    ['weightGrams', input.weightGrams],
    ['materialRatePerGram', input.materialRatePerGram],
    ['deliveryCost', input.deliveryCost],
    ['discountPct', input.discountPct],
  ];
  for (const [name, v] of numericFields) {
    if (v !== undefined && (Number.isNaN(v) || v < 0)) {
      throw new Error(`Invalid negative or non-numeric value for ${name}`);
    }
  }

  // ── material cost (gram-based) ──────────────────────────────────────────
  const gramBased =
    input.materialCategory === 'GOLD' || input.materialCategory === 'SILVER';
  let materialCost = 0;
  if (input.materialRatePerGram !== undefined && input.weightGrams !== undefined) {
    materialCost = input.materialRatePerGram * input.weightGrams;
    trace.push(
      `Material = rate ${input.materialRatePerGram} AED/g × ${input.weightGrams} g = ${r2(materialCost)} AED`
    );
  } else if (gramBased && input.weightGrams === undefined && !input.supplierCost) {
    missingData.push('weightGrams');
    warnings.push(
      warn(
        'MISSING_WEIGHT',
        'critical',
        'Weight (grams) is required for gold/silver gram-based pricing.',
        'الوزن بالجرام مطلوب لتسعير الذهب أو الفضة.'
      )
    );
  }

  // stale rate check
  if (input.materialRateUpdatedAt) {
    const ageHours =
      (Date.now() - new Date(input.materialRateUpdatedAt).getTime()) / 36e5;
    if (ageHours > rules.rateMaxAgeHours) {
      warnings.push(
        warn(
          'STALE_RATE',
          'warning',
          `Material rate is ${Math.round(ageHours)}h old (limit ${rules.rateMaxAgeHours}h). Update before quoting.`,
          `سعر الخامة قديم (${Math.round(ageHours)} ساعة). يرجى التحديث قبل التسعير.`
        )
      );
    }
  }

  // supplier quote in foreign currency
  const fx = input.exchangeRate ?? 1;
  const supplierCost = (input.supplierCost ?? 0) * fx;
  if (input.supplierCost && fx !== 1) {
    trace.push(
      `Supplier = ${input.supplierCost} ${input.supplierCurrency ?? ''} × FX ${fx} = ${r2(supplierCost)} AED`
    );
  }
  if (!input.supplierCost && !materialCost) {
    missingData.push('supplierCost');
    warnings.push(
      warn(
        'MISSING_SUPPLIER_QUOTE',
        'critical',
        'No material cost and no supplier quote. The cost base is unknown.',
        'لا توجد تكلفة خامة ولا عرض سعر من المورد، لذلك أساس التكلفة غير معروف.'
      )
    );
  }

  // ── delivery ────────────────────────────────────────────────────────────
  let deliveryCost = input.deliveryCost;
  if (deliveryCost === undefined) {
    deliveryCost = input.remoteArea ? rules.deliveryRemote : rules.deliveryStandard;
    assumptions.push(
      `Delivery assumed ${deliveryCost} AED (${input.remoteArea ? 'remote' : 'standard'} UAE)`
    );
  }
  if (input.channel?.deliveryCost !== undefined) {
    deliveryCost = input.channel.deliveryCost;
  }
  if (deliveryCost >= rules.deliveryRemote) {
    warnings.push(
      warn(
        'HIGH_DELIVERY',
        'info',
        `Delivery cost ${deliveryCost} AED is high. Consider adding it to the customer total.`,
        `تكلفة التوصيل ${deliveryCost} درهم مرتفعة، ويُنصح بإضافتها إلى إجمالي العميل.`
      )
    );
  }

  // ── payment fees ────────────────────────────────────────────────────────
  const method = input.paymentMethod ?? 'CARD';
  let feePct = input.paymentFeePct ?? input.channel?.paymentFeePct ?? rules.paymentFeeDefaultPct;
  let codFixed = 0;
  if (method === 'COD') {
    codFixed = rules.codFee;
    feePct = input.paymentFeePct ?? 0;
  }
  if (method === 'CASH') feePct = input.paymentFeePct ?? 0;
  const commissionPct = input.channel?.commissionPct ?? 0;

  // ── assemble cost lines (per unit) ──────────────────────────────────────
  const lines: CostLine[] = [];
  const add = (key: string, label: string, labelAr: string, amount?: number) => {
    if (amount && amount > 0) lines.push({ key, label, labelAr, amount: r2(amount) });
  };
  add('material', 'Material cost', 'تكلفة الخامات', materialCost);
  add('supplier', 'Supplier cost', 'تكلفة المورد', supplierCost);
  add('making', 'Making charge', 'أجرة الصياغة', input.makingCharge);
  add('plating', 'Plating cost', 'تكلفة الطلاء', input.platingCost);
  add('chain', 'Chain cost', 'تكلفة السلسلة', input.chainCost);
  add('clasp', 'Clasp cost', 'تكلفة القفل', input.claspCost);
  add('pendant', 'Pendant cost', 'تكلفة التعليقة', input.pendantCost);
  add('stone', 'Stone / crystal cost', 'تكلفة الأحجار', input.stoneCost);
  add('engraving', 'Engraving cost', 'تكلفة النقش', input.engravingCost);
  add('customization', 'Customization cost', 'تكلفة التخصيص', input.customizationCost);
  add('packaging', 'Packaging cost', 'تكلفة التغليف', input.packagingCost ?? rules.packagingDefault);
  if (input.packagingCost === undefined)
    assumptions.push(`Packaging assumed ${rules.packagingDefault} AED (default)`);
  add('giftbox', 'Gift box cost', 'تكلفة علبة الهدية', input.giftBoxCost);
  add('delivery', 'Delivery cost', 'تكلفة التوصيل', deliveryCost);
  add('marketing', 'Marketing cost', 'تكلفة التسويق', input.marketingCost ?? rules.marketingDefault);
  if (input.marketingCost === undefined)
    assumptions.push(`Marketing assumed ${rules.marketingDefault} AED (default)`);
  add('operations', 'Operations cost', 'تكلفة التشغيل', input.operationsCost ?? rules.operationsDefault);
  if (input.operationsCost === undefined)
    assumptions.push(`Operations assumed ${rules.operationsDefault} AED (default)`);
  add('ads', 'Channel ads cost', 'تكلفة إعلانات القناة', input.channel?.adsCostPerOrder);
  add('other', 'Other costs', 'تكاليف أخرى', input.otherCosts);
  add('codfee', 'COD fee', 'رسوم الدفع عند الاستلام', codFixed);

  const baseCost = r2(lines.reduce((s, l) => s + l.amount, 0));
  trace.push(`Base cost (sum of ${lines.length} lines) = ${baseCost} AED`);

  // ── margin & fee-aware price solve ──────────────────────────────────────
  const marginPct =
    input.targetMarginPct ?? input.channel?.targetMarginPct ?? rules.targetMarginPct;
  const m = marginPct / 100;
  const f = (feePct + commissionPct) / 100;
  const denom = 1 - f * (1 + m);
  if (denom <= 0) {
    throw new Error('Payment fee plus commission is too high for this margin; the price cannot be solved.');
  }
  // Solve: netPrice = (baseCost + fee)·(1+m), fee = f·netPrice
  const netPrice = r2((baseCost * (1 + m)) / denom);
  const paymentFeeAmount = r2(f * netPrice);
  const totalCost = r2(baseCost + paymentFeeAmount);
  const targetProfit = r2(totalCost * m);
  trace.push(
    `Net price (ex-VAT) = (base ${baseCost} × (1 + ${marginPct}%)) ÷ (1 − ${r2(f * 100)}% × (1 + ${marginPct}%)) = ${netPrice} AED`
  );
  trace.push(`Payment/commission fee = ${r2(f * 100)}% × ${netPrice} = ${paymentFeeAmount} AED`);
  trace.push(`Total cost = ${baseCost} + ${paymentFeeAmount} = ${totalCost} AED`);
  trace.push(`Target profit = ${totalCost} × ${marginPct}% = ${targetProfit} AED`);

  // ── VAT ─────────────────────────────────────────────────────────────────
  const vat = rules.vatRatePct / 100;
  let vatAmount = 0;
  let recommended = netPrice;
  if (input.vatMode === 'EXCLUSIVE') {
    vatAmount = r2(netPrice * vat);
    recommended = r2(netPrice + vatAmount);
    trace.push(`VAT (exclusive) = ${netPrice} × ${rules.vatRatePct}% = ${vatAmount} AED → customer price ${recommended} AED`);
  } else if (input.vatMode === 'INCLUSIVE') {
    recommended = netPrice; // price already carries VAT inside
    vatAmount = r2((netPrice * vat) / (1 + vat));
    trace.push(`VAT (inclusive) = ${recommended} × ${rules.vatRatePct}/(100+${rules.vatRatePct}) = ${vatAmount} AED inside the price`);
  } else {
    trace.push('VAT: not applicable');
  }
  // ── reference prices ────────────────────────────────────────────────────
  // Customer-facing price at a given markup-on-cost margin. In both VAT modes
  // the margin is protected on ex-VAT revenue; "inclusive" only changes how
  // the price is displayed (VAT inside) vs "exclusive" (VAT added on top).
  const grossMul = input.vatMode === 'NONE' ? 1 : 1 + vat;
  const priceAtMargin = (pct: number) => {
    const mm = pct / 100;
    const d = 1 - f * (1 + mm);
    const net = (baseCost * (1 + mm)) / d;
    return r2(net * grossMul);
  };

  const minimumSafePrice = priceAtMargin(rules.minMarginPct);
  const breakEvenPrice = priceAtMargin(0);
  const wholesalePrice = priceAtMargin(rules.wholesaleMarginPct);
  const recommendedCustomer =
    input.vatMode === 'INCLUSIVE' ? r2(netPrice * (1 + vat)) : recommended;
  const premiumRetailPrice = r2(recommendedCustomer * (1 + rules.premiumUpliftPct / 100));

  // For INCLUSIVE mode: the solved netPrice is the ex-VAT revenue needed for the
  // margin; the customer pays netPrice × (1+vat) and VAT is remitted from it.
  const finalRecommended = recommendedCustomer;
  if (input.vatMode === 'INCLUSIVE') {
    vatAmount = r2(finalRecommended - netPrice);
    trace.push(`VAT-inclusive customer price = ${netPrice} × (1 + ${rules.vatRatePct}%) = ${finalRecommended} AED (VAT inside: ${vatAmount})`);
  }

  // ── psychological rounding (never below safe floor) ─────────────────────
  const ladder = [...rules.roundingLadder].sort((a, b) => a - b);
  let roundedPrice = finalRecommended;
  const candidates = ladder.filter((p) => p >= minimumSafePrice);
  if (candidates.length) {
    // nearest ladder step at/above the recommended price, else the highest safe step below it
    const above = candidates.find((p) => p >= finalRecommended);
    const below = [...candidates].reverse().find((p) => p <= finalRecommended);
    roundedPrice = above !== undefined && (below === undefined || above - finalRecommended <= finalRecommended - below)
      ? above
      : (below ?? above ?? finalRecommended);
  } else if (finalRecommended > (ladder[ladder.length - 1] ?? 0)) {
    // beyond the ladder → round up to the next X99
    roundedPrice = Math.ceil((finalRecommended + 1) / 100) * 100 - 1;
  }
  if (roundedPrice < minimumSafePrice) roundedPrice = r2(Math.max(finalRecommended, minimumSafePrice));
  trace.push(`Rounded retail price = ${roundedPrice} AED (floor: minimum safe ${minimumSafePrice} AED)`);

  // ── bundles (margin-protected) ──────────────────────────────────────────
  const bundle = (n: number, discountPct: number) => {
    const raw = roundedPrice * n * (1 - discountPct / 100);
    const floor = minimumSafePrice * n;
    return r2(Math.max(raw, floor));
  };
  const bundle2Price = bundle(2, rules.bundle2DiscountPct);
  const bundle3Price = bundle(3, rules.bundle3DiscountPct);

  // ── effective price: override / discount scenarios ──────────────────────
  let effectivePrice = input.sellingPriceOverride ?? roundedPrice;
  if (input.discountPct) {
    effectivePrice = r2(effectivePrice * (1 - input.discountPct / 100));
    trace.push(`Discount ${input.discountPct}% → effective price ${effectivePrice} AED`);
  }
  const effNet = r2(netOfVatCustomer(effectivePrice));
  function netOfVatCustomer(gross: number) {
    return input.vatMode === 'NONE' ? gross : gross / (1 + vat);
  }
  // profit at effective price: revenue(ex VAT) − base − fee(f × revenue)
  const effFee = r2(f * effNet);
  const netProfitAed = r2(effNet - baseCost - effFee);
  const grossMarginPct = effNet > 0 ? r2((netProfitAed / effNet) * 100) : 0;
  trace.push(
    `At selling price ${effectivePrice} AED: revenue ex-VAT ${effNet}, fees ${effFee}, profit ${netProfitAed} AED (${grossMarginPct}% margin)`
  );

  // ── margin protection ───────────────────────────────────────────────────
  let blocked = false;
  const markupPct = baseCost + effFee > 0 ? (netProfitAed / (baseCost + effFee)) * 100 : 0;
  if (netProfitAed < 0) {
    if (input.adminOverride) {
      warnings.push(
        warn('BELOW_COST_OVERRIDE', 'critical',
          'Selling below cost. Approved by admin override only.',
          'البيع بأقل من التكلفة، وقد تم بموافقة المدير فقط.'));
    } else {
      blocked = true;
      warnings.push(
        warn('BELOW_COST', 'critical',
          'Selling price is below cost. Approval is blocked and admin override is required.',
          'سعر البيع أقل من التكلفة. تم إيقاف الاعتماد ويلزم تجاوز من المدير.'));
    }
  } else if (markupPct < rules.minMarginPct - 0.01) {
    warnings.push(
      warn('MARGIN_BELOW_MIN', 'critical',
        `Margin ${r2(markupPct)}% is below the minimum ${rules.minMarginPct}%. Manager approval required.`,
        `هامش الربح ${r2(markupPct)}٪ أقل من الحد الأدنى ${rules.minMarginPct}٪. يلزم اعتماد المدير.`));
  } else if (markupPct < marginPct - 0.01) {
    warnings.push(
      warn('MARGIN_BELOW_TARGET', 'warning',
        `Margin ${r2(markupPct)}% is below the ${marginPct}% target.`,
        `هامش الربح ${r2(markupPct)}٪ أقل من الهدف ${marginPct}٪.`));
  }
  const discountFloorPrice = minimumSafePrice;
  if (input.discountPct && effectivePrice < discountFloorPrice) {
    warnings.push(
      warn('DISCOUNT_BELOW_FLOOR', 'critical',
        `Discounted price ${effectivePrice} AED is below the safe floor ${discountFloorPrice} AED.`,
        `السعر بعد الخصم ${effectivePrice} درهم أقل من الحد الآمن ${discountFloorPrice} درهم.`));
  }

  return {
    ok: missingData.length === 0,
    blocked,
    costLines: lines,
    totalCost,
    totalCostBeforeFee: baseCost,
    paymentFeeAmount,
    targetMarginPct: marginPct,
    targetProfit,
    netPrice,
    vatAmount,
    vatMode: input.vatMode,
    recommendedSellingPrice: finalRecommended,
    roundedPrice,
    minimumSafePrice,
    breakEvenPrice,
    wholesalePrice,
    premiumRetailPrice,
    bundle2Price,
    bundle3Price,
    discountFloorPrice,
    grossMarginPct,
    netProfitAed,
    effectivePrice,
    quantity: qty,
    warnings,
    missingData,
    assumptions,
    formulaTrace: trace,
  };
}

export const DEFAULT_RULES: BusinessRulesInput = {
  vatRatePct: 5,
  deliveryStandard: 25,
  deliveryRemote: 50,
  packagingDefault: 10,
  marketingDefault: 5,
  operationsDefault: 50,
  paymentFeeDefaultPct: 2.5,
  codFee: 10,
  targetMarginPct: 40,
  minMarginPct: 25,
  rateMaxAgeHours: 24,
  quoteValidityHours: 24,
  roundingLadder: [79, 89, 99, 119, 129, 149, 179, 199, 249, 299, 399, 499, 599, 699, 799, 899, 999, 1299, 1499, 1999, 2499, 2999, 3999, 4999],
  bundle2DiscountPct: 10,
  bundle3DiscountPct: 15,
  wholesaleMarginPct: 25,
  premiumUpliftPct: 15,
};
