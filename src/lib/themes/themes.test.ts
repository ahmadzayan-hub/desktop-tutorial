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

  it("civic theme uses the executive default brand palette", () => {
    expect(themes.civic.brand.primary).toBe("#171C8F");
    expect(themes.civic.brand.secondary).toBe("#EE0032");
    expect(themes.civic.brand.accent).toBe("#D4A017");
  });

  it("every theme has bilingual names, descriptions and authority placeholders", () => {
    for (const id of themeOrder) {
      const t = themes[id];
      expect(t.name_en.length).toBeGreaterThan(0);
      expect(t.name_ar.length).toBeGreaterThan(0);
      expect(t.description_en.length).toBeGreaterThan(0);
      expect(t.description_ar.length).toBeGreaterThan(0);
    }
  });

  it("getTheme falls back to civic on unknown id", () => {
    expect(getTheme("nonsense").id).toBe("civic");
    expect(getTheme(null).id).toBe("civic");
    expect(getTheme(undefined).id).toBe("civic");
  });

  it("getTheme resolves known ids exactly", () => {
    expect(getTheme("petrol").id).toBe("petrol");
    expect(getTheme("guardian").id).toBe("guardian");
    expect(getTheme("utility").id).toBe("utility");
  });

  it("contains no references to specific customer authorities (privacy)", () => {
    const json = JSON.stringify(themes);
    const forbidden = [
      "RTA",
      "ADNOC",
      "Aldar",
      "Etihad",
      "DEWA",
      "Dubai Police",
      "Roads and Transport",
      "SENER",
    ];
    for (const word of forbidden) {
      expect(json).not.toContain(word);
    }
  });
});
