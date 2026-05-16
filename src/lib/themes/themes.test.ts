import { describe, expect, it } from "vitest";
import { getTheme, themeOrder, themes } from "./index";

describe("themes", () => {
  it("has all eight theme slots populated", () => {
    expect(themeOrder).toHaveLength(8);
    for (const id of themeOrder) {
      expect(themes[id]).toBeDefined();
      expect(themes[id].id).toBe(id);
    }
  });

  it("every theme uses the universal traffic-light palette (R1)", () => {
    for (const id of themeOrder) {
      const t = themes[id];
      expect(t.status.green).toBe("#10B981");
      expect(t.status.amber).toBe("#F59E0B");
      expect(t.status.red).toBe("#EF4444");
    }
  });

  it("RTA theme matches v8 SENER brand spec", () => {
    expect(themes.rta.brand.primary).toBe("#171C8F");
    expect(themes.rta.brand.secondary).toBe("#EE0032");
    expect(themes.rta.brand.accent).toBe("#D4A017");
  });

  it("every theme has bilingual names and authority", () => {
    for (const id of themeOrder) {
      const t = themes[id];
      expect(t.name_en.length).toBeGreaterThan(0);
      expect(t.name_ar.length).toBeGreaterThan(0);
      expect(t.authority_en.length).toBeGreaterThan(0);
      expect(t.authority_ar.length).toBeGreaterThan(0);
    }
  });

  it("getTheme falls back to RTA on unknown id", () => {
    expect(getTheme("nonsense").id).toBe("rta");
    expect(getTheme(null).id).toBe("rta");
    expect(getTheme(undefined).id).toBe("rta");
  });

  it("getTheme resolves known ids exactly", () => {
    expect(getTheme("adnoc").id).toBe("adnoc");
    expect(getTheme("dewa").id).toBe("dewa");
  });
});
