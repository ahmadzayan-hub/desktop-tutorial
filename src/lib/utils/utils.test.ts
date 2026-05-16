import { describe, expect, it } from "vitest";
import { cn } from "./cn";
import { countdownColor, daysUntil, formatDate } from "./dates";
import { formatCurrency, formatNumber, formatPercent } from "./format";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("dedupes tailwind conflicts via tailwind-merge", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters falsy values", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });
});

describe("dates", () => {
  it("formats ISO dates as DD MMM YYYY", () => {
    expect(formatDate("2026-05-13")).toBe("13 May 2026");
  });

  it("returns em-dash for null", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });

  it("countdownColor follows R6 thresholds", () => {
    expect(countdownColor(29)).toBe("red");
    expect(countdownColor(30)).toBe("amber");
    expect(countdownColor(60)).toBe("amber");
    expect(countdownColor(61)).toBe("green");
    expect(countdownColor(null)).toBe("neutral");
  });

  it("daysUntil returns null for missing dates", () => {
    expect(daysUntil(null)).toBeNull();
  });
});

describe("format", () => {
  it("formats AED currency without decimals", () => {
    const out = formatCurrency(12_400_000, "AED");
    expect(out).toContain("12,400,000");
    expect(out).toContain("AED");
  });

  it("returns em-dash for null currency", () => {
    expect(formatCurrency(null)).toBe("—");
  });

  it("formats numbers with locale separators", () => {
    expect(formatNumber(1234567.89)).toContain("1,234,567");
  });

  it("formats percent with default 1 decimal", () => {
    expect(formatPercent(42.345)).toBe("42.3%");
  });
});
