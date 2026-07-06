import { describe, expect, it } from "vitest";
import { dictionary } from "./dictionary";

function collectKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  if (Array.isArray(obj)) {
    return obj.flatMap((item, i) => collectKeys(item, `${prefix}[${i}]`));
  }
  return Object.entries(obj).flatMap(([key, value]) =>
    collectKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe("dictionary parity", () => {
  it("English and Arabic have identical key structures (R3)", () => {
    const enKeys = collectKeys(dictionary.en).sort();
    const arKeys = collectKeys(dictionary.ar).sort();
    expect(arKeys).toEqual(enKeys);
  });

  it("Arabic has no transliterated English brand words (R3)", () => {
    const arJson = JSON.stringify(dictionary.ar);
    // Common transliterations the master prompt forbids in Arabic UI text.
    expect(arJson).not.toMatch(/كنترات/);
    expect(arJson).not.toMatch(/كونسلتنسي/);
    expect(arJson).not.toMatch(/إنهانسمنت/);
  });

  it("contains no em-dashes anywhere (R3)", () => {
    expect(JSON.stringify(dictionary.en)).not.toMatch(/—/);
    expect(JSON.stringify(dictionary.ar)).not.toMatch(/—/);
  });

  it("brand strings are present in both locales", () => {
    expect(dictionary.en.appName).toBe("Mutabasir");
    expect(dictionary.ar.appName).toBe("مُتَبَصِّر");
    expect(dictionary.en.engineCodename).toBe("Basira");
    expect(dictionary.ar.engineCodename).toBe("بصيرة");
  });
});
