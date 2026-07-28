import { describe, it, expect } from "vitest";
import { GIFT_PACKAGES, DELIVERY_FEES } from "@/lib/catalog";
import { INITIAL_DRAFT } from "./types";
import { computeTotals } from "./totals";

describe("computeTotals", () => {
  it("returns zero across the board for an empty draft", () => {
    const t = computeTotals(INITIAL_DRAFT);
    expect(t.pkg).toBeNull();
    expect(t.subtotal).toBe(0);
    // Initial draft has emirate=dubai (see types.ts), so delivery is the Dubai fee.
    expect(t.deliveryFee).toBe(DELIVERY_FEES.dubai);
    expect(t.total).toBe(DELIVERY_FEES.dubai);
  });

  it("adds the package price to the delivery fee for the selected emirate", () => {
    const keepsake = GIFT_PACKAGES.find((p) => p.id === "keepsake");
    expect(keepsake).toBeDefined();
    const draft = { ...INITIAL_DRAFT, packageId: "keepsake", emirate: "abudhabi" as const };
    const t = computeTotals(draft);
    expect(t.pkg?.id).toBe("keepsake");
    expect(t.subtotal).toBe(keepsake!.price);
    expect(t.deliveryFee).toBe(DELIVERY_FEES.abudhabi);
    expect(t.total).toBe(keepsake!.price + DELIVERY_FEES.abudhabi);
    // VAT is displayed "of which" — net + vat must sum back to the total.
    expect(t.net + t.vat).toBeCloseTo(t.total, 2);
  });

  it("handles a missing package id gracefully (subtotal falls back to 0)", () => {
    const draft = { ...INITIAL_DRAFT, packageId: "does-not-exist" };
    const t = computeTotals(draft);
    expect(t.pkg).toBeNull();
    expect(t.subtotal).toBe(0);
  });

  it("charges every emirate at the published fee (no silent free tier)", () => {
    for (const [id, fee] of Object.entries(DELIVERY_FEES)) {
      const draft = { ...INITIAL_DRAFT, emirate: id as keyof typeof DELIVERY_FEES };
      const t = computeTotals(draft);
      expect(t.deliveryFee).toBe(fee);
    }
  });
});
