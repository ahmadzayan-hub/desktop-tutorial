import { describe, it, expect } from "vitest";
import { BRAND, EMIRATES } from "./brand";

/**
 * BRAND is the single source of truth for seller identity that appears in the
 * footer, contact page, checkout and the PDF quotation. These assertions guard
 * that any accidental deletion of a required field is caught immediately.
 *
 * The compliance TODOs (licenseNumber, trn, phone, whatsapp) are intentionally
 * flagged as un-launched so that a future contributor cannot silently ship
 * placeholder values to production. When the real values land, delete the
 * matching lines from the "TODO before launch" block below.
 */
describe("BRAND contract", () => {
  it("has every consumer-visible field", () => {
    const required = [
      "name", "tagline",
      "legalName", "licenseAuthority", "licenseNumber", "trn", "address", "vatRate",
      "email", "supportEmail", "phone", "whatsapp", "instagram",
      "photoRetentionDays",
    ] as const;
    for (const k of required) {
      expect(BRAND, `BRAND is missing "${k}"`).toHaveProperty(k);
      expect((BRAND as Record<string, unknown>)[k], `BRAND.${k} is empty`).toBeTruthy();
    }
  });

  it("uses the UAE 5% VAT rate", () => {
    expect(BRAND.vatRate).toBe(0.05);
  });

  it("keeps photo retention at or below 90 days (PDPL best practice)", () => {
    expect(BRAND.photoRetentionDays).toBeGreaterThan(0);
    expect(BRAND.photoRetentionDays).toBeLessThanOrEqual(90);
  });

  describe("TODO before launch (delete each line when the real value lands)", () => {
    it("licenseNumber is still the placeholder", () => {
      expect(BRAND.licenseNumber).toContain("TODO");
    });
    it("trn is still the placeholder", () => {
      expect(BRAND.trn).toContain("TODO");
    });
    it("phone is still the placeholder (+971 4 000 0000)", () => {
      expect(BRAND.phone).toContain("000 0000");
    });
    it("whatsapp is still the placeholder (971500000000)", () => {
      expect(BRAND.whatsapp).toBe("971500000000");
    });
  });
});

describe("EMIRATES catalogue", () => {
  it("lists all seven emirates", () => {
    expect(EMIRATES).toHaveLength(7);
    const ids = EMIRATES.map((e) => e.id).sort();
    expect(ids).toEqual(["abudhabi", "ajman", "dubai", "fujairah", "rak", "sharjah", "uaq"]);
  });

  it("every emirate has both an English and an Arabic name", () => {
    for (const e of EMIRATES) {
      expect(e.en, `${e.id} missing English`).toBeTruthy();
      expect(e.ar, `${e.id} missing Arabic`).toBeTruthy();
    }
  });

  it("only Dubai offers same-day today (the rest need scheduling)", () => {
    const sameDay = EMIRATES.filter((e) => e.sameDay).map((e) => e.id);
    expect(sameDay).toEqual(["dubai"]);
  });
});
