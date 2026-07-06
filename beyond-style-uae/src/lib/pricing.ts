// Single source of truth for pair-offer pricing, shared by the client cart
// (CartContext) and the server order path (createOrder / Stripe line items).
// Keeping this pure and shared guarantees the amount the customer is charged
// equals the amount the cart advertised — the server never recomputes totals
// with different rules than the storefront displayed.

export interface PairOffer {
  qty: number;
  priceAed: number;
}

// Buying ≥ `qty` of an eligible product collapses each full group to the bundle
// price (and repeats for further groups). Keyed by product id.
// Active campaign: 1 Masha'Allah Bracelet (Black) 79, 2 for 129.
export const PAIR_OFFERS: Record<string, PairOffer> = {
  p1: { qty: 2, priceAed: 129 },
};

export interface PricedItem {
  productId: string;
  priceAed: number;
  qty: number;
}

/** Price for a single cart line, applying any active pair offer. */
export function lineSubtotal(item: PricedItem): number {
  const offer = PAIR_OFFERS[item.productId];
  if (offer && item.qty >= offer.qty) {
    const bundles = Math.floor(item.qty / offer.qty);
    const remainder = item.qty % offer.qty;
    return bundles * offer.priceAed + remainder * item.priceAed;
  }
  return item.priceAed * item.qty;
}

/** Order subtotal with pair offers applied — the authoritative amount. */
export function computeSubtotal(items: PricedItem[]): number {
  return items.reduce((sum, i) => sum + lineSubtotal(i), 0);
}

/** Total saved versus the plain unit-price subtotal (for "you save" display). */
export function computeSavings(items: PricedItem[]): number {
  return items.reduce((saved, i) => {
    const offer = PAIR_OFFERS[i.productId];
    if (offer && i.qty >= offer.qty) {
      const bundles = Math.floor(i.qty / offer.qty);
      return saved + bundles * (offer.qty * i.priceAed - offer.priceAed);
    }
    return saved;
  }, 0);
}
