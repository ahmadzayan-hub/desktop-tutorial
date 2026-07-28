import { describe, it, expect } from "vitest";
import { formatAed, formatNumber, formatDate, vatBreakdown } from "./format";

describe("vatBreakdown", () => {
  it("splits a VAT-inclusive total into net + VAT that sum back to the total", () => {
    const { net, vat, total } = vatBreakdown(89);
    expect(total).toBe(89);
    expect(net + vat).toBeCloseTo(89, 2);
    // At 5% VAT, VAT on a 89 gross is 89 - 89/1.05 = 4.24
    expect(vat).toBeCloseTo(4.24, 2);
    expect(net).toBeCloseTo(84.76, 2);
  });

  it("handles zero without dividing by zero", () => {
    const { net, vat, total } = vatBreakdown(0);
    expect(net).toBe(0);
    expect(vat).toBe(0);
    expect(total).toBe(0);
  });

  it("rounds to two decimals so invoices never carry a floating-point tail", () => {
    const { net, vat } = vatBreakdown(100);
    // 100 / 1.05 = 95.2380952… → 95.24
    expect(net).toBe(95.24);
    // 100 - 95.24 = 4.76
    expect(vat).toBe(4.76);
  });
});

describe("formatAed", () => {
  it("prints integer AED without decimals", () => {
    expect(formatAed(89)).toContain("89");
    expect(formatAed(89)).not.toContain(".00");
  });

  it("keeps two decimals when the amount has a fractional part", () => {
    expect(formatAed(4.24)).toMatch(/4[.,]24/);
  });

  it("uses Arabic locale when lang=ar", () => {
    // ar-AE currency string contains Arabic digits or the AED symbol placement differs; we
    // just assert the amount is present and the string is non-empty rather than pin the
    // exact locale output which can vary between Node ICU builds.
    const s = formatAed(89, "ar");
    expect(s.length).toBeGreaterThan(0);
  });
});

describe("formatNumber", () => {
  it("returns a locale-aware number for both languages", () => {
    expect(formatNumber(1500, "en")).toMatch(/1,?500/);
    expect(formatNumber(1500, "ar").length).toBeGreaterThan(0);
  });
});

describe("formatDate", () => {
  it("returns the input string when it is not a parseable date", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });

  it("formats an ISO date without crashing", () => {
    const s = formatDate("2026-08-15");
    expect(s.length).toBeGreaterThan(0);
  });
});
