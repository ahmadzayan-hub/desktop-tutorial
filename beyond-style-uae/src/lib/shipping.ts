export const FREE_SHIPPING_THRESHOLD = Number(
  import.meta.env.VITE_FREE_SHIPPING_THRESHOLD ?? 200,
);

export const STANDARD_SHIPPING_AED = 20;

export interface ShippingState {
  qualifies: boolean;
  remaining: number; // AED still needed to unlock free delivery
  shippingAed: number;
}

/** Pure helper so the threshold logic is testable and shared. */
export function computeShipping(subtotal: number): ShippingState {
  const qualifies = subtotal >= FREE_SHIPPING_THRESHOLD;
  return {
    qualifies,
    remaining: qualifies ? 0 : Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    shippingAed: qualifies ? 0 : STANDARD_SHIPPING_AED,
  };
}
