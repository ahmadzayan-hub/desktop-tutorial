import { describe, it, expect } from "vitest";
import { loadBrandContext } from "../brand/governance";
import { bilingualTerminology } from "../brand/presets";

describe("brand/governance", () => {
  it("loads the UAE Pine boardroom preset", () => {
    const ctx = loadBrandContext(null, "rta_boardroom", "bilingual");
    expect(ctx.palette.primary.toUpperCase()).toBe("#013230");
    expect(ctx.language.arabic_required).toBe(true);
    expect(ctx.language.rtl_required).toBe(true);
    expect(ctx.language.approved_terminology.length).toBeGreaterThan(15);
  });

  it("locks the context (deep frozen)", () => {
    const ctx = loadBrandContext(null, "corporate_boardroom", "en");
    expect(() => {
      (ctx as any).palette.primary = "#000000";
    }).toThrow();
  });

  it("requires arabic for bilingual mode regardless of preset", () => {
    const ctx = loadBrandContext(null, "consulting_partner", "bilingual");
    expect(ctx.language.arabic_required).toBe(true);
    expect(ctx.language.rtl_required).toBe(true);
  });

  it("includes the full bilingual terminology table for the UAE pine preset", () => {
    const ctx = loadBrandContext(null, "rta_boardroom", "ar");
    const en = new Set(ctx.language.approved_terminology.map((t) => t.en));
    for (const t of bilingualTerminology) {
      expect(en.has(t.en)).toBe(true);
    }
  });
});
