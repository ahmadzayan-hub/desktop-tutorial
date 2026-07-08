/**
 * Live metal rates integration.
 *
 * Works with metalpriceapi.com and metals-api.com style endpoints
 * (GET {base}/latest?api_key=KEY&base=USD&currencies=XAU,XAG).
 * Configure via METAL_PRICE_API_URL and METAL_PRICE_API_KEY.
 *
 * Manual entry stays first-class: rows a manager edited by hand
 * (manualOverride = true) are never touched by a refresh, because UAE
 * supplier prices can legitimately differ from the global spot rate.
 */

export const TROY_OUNCE_GRAMS = 31.1034768;
export const USD_TO_AED = 3.6725; // AED is pegged to USD

export interface SpotPrices {
  goldUsdPerOunce: number;
  silverUsdPerOunce: number;
  fetchedAt: string;
}

/** Convert a USD-per-troy-ounce spot price to AED per gram. */
export function ouncePriceToAedPerGram(usdPerOunce: number): number {
  return (usdPerOunce / TROY_OUNCE_GRAMS) * USD_TO_AED;
}

/** Purity multipliers relative to pure (24K / fine silver). */
export const PURITY: Record<string, number> = {
  GOLD_24K: 1,
  GOLD_22K: 22 / 24,
  GOLD_21K: 21 / 24,
  GOLD_18K: 18 / 24,
  SILVER_999: 1,
  SILVER_925: 0.925,
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Map a material name from the library to its live AED/gram rate, or null when not derivable. */
export function liveRateForMaterial(name: string, spot: SpotPrices): number | null {
  const gold = ouncePriceToAedPerGram(spot.goldUsdPerOunce);
  const silver = ouncePriceToAedPerGram(spot.silverUsdPerOunce);
  const n = name.toLowerCase();
  if (n.includes('24k')) return r2(gold * PURITY.GOLD_24K);
  if (n.includes('22k')) return r2(gold * PURITY.GOLD_22K);
  if (n.includes('21k')) return r2(gold * PURITY.GOLD_21K);
  if (n.includes('18k')) return r2(gold * PURITY.GOLD_18K);
  if (n.includes('925')) return r2(silver * PURITY.SILVER_925);
  if (n.includes('silver 999') || n.includes('fine silver')) return r2(silver);
  return null;
}

export function metalsApiConfigured(): boolean {
  return Boolean(process.env.METAL_PRICE_API_KEY);
}

/** Fetch current gold and silver spot prices in USD per troy ounce. */
export async function fetchSpotPrices(): Promise<SpotPrices> {
  const key = process.env.METAL_PRICE_API_KEY;
  if (!key) throw new Error('METAL_PRICE_API_KEY is not configured');
  const base = (process.env.METAL_PRICE_API_URL || 'https://api.metalpriceapi.com/v1').replace(/\/$/, '');
  const res = await fetch(`${base}/latest?api_key=${key}&base=USD&currencies=XAU,XAG`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Metal price API error ${res.status}`);
  const data = await res.json();
  if (data.success === false) {
    throw new Error(`Metal price API error: ${data.error?.info ?? 'unknown'}`);
  }
  const rates = data.rates ?? {};
  // Providers expose either USDXAU (USD per ounce) or XAU (ounces per USD).
  const gold = rates.USDXAU ?? (rates.XAU ? 1 / rates.XAU : undefined);
  const silver = rates.USDXAG ?? (rates.XAG ? 1 / rates.XAG : undefined);
  if (!gold || !silver) throw new Error('Metal price API returned no XAU/XAG rates');
  return {
    goldUsdPerOunce: gold,
    silverUsdPerOunce: silver,
    fetchedAt: new Date().toISOString(),
  };
}
