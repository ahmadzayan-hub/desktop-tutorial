import { describe, expect, it } from "vitest";
import { computeSavings, computeSubtotal, lineSubtotal } from "./pricing";

// p1 has an active pair offer: 1 for 79, 2 for 129.
const p1 = (qty: number) => ({ productId: "p1", priceAed: 79, qty });
// p2 has no offer.
const p2 = (qty: number) => ({ productId: "p2", priceAed: 89, qty });

describe("pair-offer pricing (shared by cart + server)", () => {
  it("charges the unit price below the offer threshold", () => {
    expect(lineSubtotal(p1(1))).toBe(79);
  });

  it("applies the bundle price at the threshold", () => {
    expect(lineSubtotal(p1(2))).toBe(129);
  });

  it("bundles as many full groups as possible, unit price for the remainder", () => {
    expect(lineSubtotal(p1(3))).toBe(129 + 79); // one bundle + one single
    expect(lineSubtotal(p1(4))).toBe(129 * 2); // two bundles
    expect(lineSubtotal(p1(5))).toBe(129 * 2 + 79);
  });

  it("leaves non-offer products at plain unit pricing", () => {
    expect(lineSubtotal(p2(2))).toBe(178);
  });

  it("sums a mixed cart correctly", () => {
    expect(computeSubtotal([p1(2), p2(1)])).toBe(129 + 89);
  });

  it("reports savings versus the plain subtotal", () => {
    expect(computeSavings([p1(2)])).toBe(29); // 158 - 129
    expect(computeSavings([p1(4)])).toBe(58);
    expect(computeSavings([p1(1)])).toBe(0);
    expect(computeSavings([p2(3)])).toBe(0);
  });

  it("keeps the server subtotal equal to the advertised cart price for 2× p1", () => {
    // Regression: the server used to bill 79×2 = 158 while the cart showed 129.
    expect(computeSubtotal([p1(2)])).toBe(129);
  });
});
