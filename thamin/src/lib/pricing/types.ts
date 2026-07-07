export type VatMode = 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE';
export type PaymentMethod = 'CARD' | 'COD' | 'ZIINA' | 'LINK' | 'CASH';

export interface BusinessRulesInput {
  vatRatePct: number;
  deliveryStandard: number;
  deliveryRemote: number;
  packagingDefault: number;
  marketingDefault: number;
  operationsDefault: number;
  paymentFeeDefaultPct: number;
  codFee: number;
  targetMarginPct: number;
  minMarginPct: number;
  rateMaxAgeHours: number;
  quoteValidityHours: number;
  roundingLadder: number[];
  bundle2DiscountPct: number;
  bundle3DiscountPct: number;
  wholesaleMarginPct: number;
  premiumUpliftPct: number;
}

export interface ChannelCosts {
  key?: string;
  commissionPct?: number;
  adsCostPerOrder?: number;
  paymentFeePct?: number;
  deliveryCost?: number;
  targetMarginPct?: number;
}

export interface PricingInput {
  quantity?: number;
  // material (gram-based)
  materialCategory?: string; // GOLD | SILVER | STAINLESS | ...
  materialRatePerGram?: number;
  weightGrams?: number;
  materialRateUpdatedAt?: string; // ISO timestamp of the rate
  materialRateSource?: string;
  // direct costs (AED per unit unless stated)
  supplierCost?: number;
  supplierCurrency?: string;
  exchangeRate?: number; // to AED
  makingCharge?: number;
  platingCost?: number;
  chainCost?: number;
  claspCost?: number;
  pendantCost?: number;
  stoneCost?: number;
  engravingCost?: number;
  customizationCost?: number;
  packagingCost?: number;
  giftBoxCost?: number;
  deliveryCost?: number;
  remoteArea?: boolean;
  paymentMethod?: PaymentMethod;
  paymentFeePct?: number; // % of selling price
  marketingCost?: number;
  operationsCost?: number;
  otherCosts?: number;
  // tax & margin
  vatMode: VatMode;
  targetMarginPct?: number;
  // overrides / scenarios
  sellingPriceOverride?: number; // "what is profit if I sell at X"
  discountPct?: number;
  channel?: ChannelCosts;
  adminOverride?: boolean;
}

export interface CostLine {
  key: string;
  label: string;
  labelAr: string;
  amount: number;
}

export interface PricingWarning {
  code: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  messageAr: string;
}

export interface PricingResult {
  ok: boolean;
  blocked: boolean; // true when selling below cost without admin override
  costLines: CostLine[];
  totalCost: number; // all costs incl. payment fee, excl. VAT
  totalCostBeforeFee: number;
  paymentFeeAmount: number;
  targetMarginPct: number;
  targetProfit: number;
  netPrice: number; // price before VAT (the solved selling price, ex-VAT)
  vatAmount: number;
  vatMode: VatMode;
  recommendedSellingPrice: number; // customer-facing (incl. VAT when applicable)
  roundedPrice: number; // psychological UAE retail price, never below safe floor
  minimumSafePrice: number; // min-margin price, customer-facing
  breakEvenPrice: number; // customer-facing price at zero profit
  wholesalePrice: number;
  premiumRetailPrice: number;
  bundle2Price: number;
  bundle3Price: number;
  discountFloorPrice: number; // lowest allowed discounted price
  grossMarginPct: number; // profit / net revenue at effective price
  netProfitAed: number; // at effective price
  effectivePrice: number; // override/discount applied, else recommended
  quantity: number;
  warnings: PricingWarning[];
  missingData: string[];
  assumptions: string[];
  formulaTrace: string[]; // human-readable calculation steps
}
