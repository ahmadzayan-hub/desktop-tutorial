import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  AVAILABLE_MODELS,
  DEFAULT_MODEL_ID,
  MODEL_OPTIONS,
} from "./web-llm";

// Build the set of model ids known to the installed @mlc-ai/web-llm.
// We can't `import` the SDK here (it needs browser globals like
// WebGPU); instead we read the compiled catalog off disk and grep out
// the model_id literals. This test guarantees every id we advertise in
// the AI Engine card actually exists in the runtime — if a future
// dependency bump renames or removes one, this test catches it.
function knownModelIds(): Set<string> {
  const dir = join(
    process.cwd(),
    "node_modules/@mlc-ai/web-llm/lib",
  );
  const ids = new Set<string>();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".js")) continue;
    const src = readFileSync(join(dir, file), "utf8");
    for (const match of src.matchAll(/model_id:\s*"([^"]+)"/g)) {
      ids.add(match[1]!);
    }
  }
  return ids;
}

describe("web-llm catalogue", () => {
  const known = knownModelIds();

  it("has at least the default model exposed", () => {
    expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);
    expect(AVAILABLE_MODELS).toBe(MODEL_OPTIONS);
    expect(AVAILABLE_MODELS.some((m) => m.id === DEFAULT_MODEL_ID)).toBe(true);
  });

  it("every advertised model id exists in the installed @mlc-ai/web-llm catalog", () => {
    expect(known.size).toBeGreaterThan(0);
    for (const model of AVAILABLE_MODELS) {
      expect(
        known.has(model.id),
        `${model.id} is not in the installed @mlc-ai/web-llm prebuilt catalog`,
      ).toBe(true);
    }
  });

  it("default is one of the two smallest listed models (mobile-first bias)", () => {
    const sorted = [...AVAILABLE_MODELS].sort((a, b) => a.size_mb - b.size_mb);
    const twoSmallestIds = new Set(sorted.slice(0, 2).map((m) => m.id));
    expect(twoSmallestIds.has(DEFAULT_MODEL_ID)).toBe(true);
  });

  it("every model has bilingual descriptions and a positive size", () => {
    for (const m of AVAILABLE_MODELS) {
      expect(m.description_en.length).toBeGreaterThan(10);
      expect(m.description_ar.length).toBeGreaterThan(10);
      expect(m.size_mb).toBeGreaterThan(0);
    }
  });
});
