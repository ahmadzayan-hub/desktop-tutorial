import { GIFT_PACKAGES, DELIVERY_FEES } from "@/lib/catalog";
import { vatBreakdown } from "@/lib/format";
import type { OrderDraft } from "./types";

/** VAT-inclusive totals for the current draft (consumer pricing). */
export function computeTotals(draft: OrderDraft) {
  const pkg = GIFT_PACKAGES.find((p) => p.id === draft.packageId) ?? null;
  const subtotal = pkg?.price ?? 0;
  const deliveryFee = DELIVERY_FEES[draft.emirate] ?? 0;
  const total = subtotal + deliveryFee;
  const { net, vat } = vatBreakdown(total);
  return { pkg, subtotal, deliveryFee, total, net, vat };
}
