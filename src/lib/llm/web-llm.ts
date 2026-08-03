// On-device LLM runtime built on @mlc-ai/web-llm. Models run in the browser
// via WebGPU and are cached in IndexedDB after the first download. No
// network calls during inference — the user's documents never leave the
// device. Designed for mobile-friendly small models (Llama-3.2-1B ≈ 700 MB
// quantized).

"use client";

import type {
  MLCEngine,
  InitProgressReport,
  ChatCompletionRequest,
} from "@mlc-ai/web-llm";

export interface ModelOption {
  id: string;
  label: string;
  size_mb: number;
  notes: string;
  description_en: string;
  description_ar: string;
}

// Curated catalogue of on-device instruct models, all present in the
// installed @mlc-ai/web-llm prebuilt list. Ordered smallest → largest so
// the AI panel surfaces mobile-friendly choices first. Sizes are the
// approximate weight-file downloads; the WebGPU runtime buffers add on
// top of that at load time.
export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    label: "Qwen 2.5 · 0.5B",
    size_mb: 360,
    notes: "Smallest · ~360 MB",
    description_en:
      "Smallest model. Ideal for older phones and quick extractions.",
    description_ar:
      "أصغر نموذج. مناسبٌ للهواتف الأقدم والاستخراجات السريعة.",
  },
  {
    id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    label: "SmolLM2 · 360M",
    size_mb: 260,
    notes: "Ultralight · ~260 MB",
    description_en:
      "Ultralight fallback. Fastest download on constrained networks.",
    description_ar:
      "خيارٌ فائق الخفّة. أسرع تنزيلٍ على الشبكات المحدودة.",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    label: "Llama 3.2 · 1B",
    size_mb: 712,
    notes: "Mobile balance · ~700 MB",
    description_en:
      "Good balance of quality and speed on modern phones with ≥4 GB RAM.",
    description_ar:
      "توازنٌ جيّد بين الجودة والسرعة على الهواتف الحديثة بذاكرة ٤ ج.ب فأكثر.",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen 2.5 · 1.5B (recommended)",
    size_mb: 950,
    notes: "Best quality-to-size · ~950 MB",
    description_en:
      "Recommended for extraction quality. Needs ≥6 GB RAM.",
    description_ar:
      "الخيار الموصى به لجودة الاستخراج. يتطلّب ذاكرةً ≥ ٦ ج.ب.",
  },
  {
    id: "gemma-2-2b-it-q4f16_1-MLC",
    label: "Gemma 2 · 2B",
    size_mb: 1400,
    notes: "Google's small · ~1.4 GB",
    description_en:
      "Google's compact instruct model. Stronger reasoning; needs ≥6 GB RAM.",
    description_ar:
      "نموذج Google المضغوط. استدلالٌ أقوى؛ يتطلّب ذاكرةً ≥ ٦ ج.ب.",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 · 3B",
    size_mb: 1800,
    notes: "Mid-desktop · ~1.8 GB",
    description_en:
      "High-quality mid-size model. Best on desktop or 8 GB+ tablets.",
    description_ar:
      "نموذجٌ متوسطٌ عالي الجودة. الأفضل على سطح المكتب أو الأجهزة اللوحية ذات الذاكرة ≥ ٨ ج.ب.",
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    label: "Phi 3.5 mini · 3.8B",
    size_mb: 2200,
    notes: "Highest quality · ~2.2 GB",
    description_en:
      "Highest extraction quality. WebGPU required, desktop preferred.",
    description_ar:
      "أعلى جودة استخراج. يتطلّب WebGPU؛ يُفضَّل سطح المكتب.",
  },
];

// Alias used by the pipeline UI.
export const AVAILABLE_MODELS = MODEL_OPTIONS;

// Default to the smallest model (Qwen 2.5 0.5B, ~360 MB) so we don't
// OOM low-RAM Android WebViews on first tap. Users can upgrade to
// Llama 3.2 1B or Phi 3.5 mini from the AI Engine card. The freeze
// we observed in production was traceable to a 700 MB model download
// landing on a 3 GB-RAM device.
export const DEFAULT_MODEL_ID = MODEL_OPTIONS[0]!.id;

export type EngineStatus =
  | { phase: "idle" }
  | { phase: "checking" }
  | { phase: "downloading"; progress: number; text: string }
  | { phase: "ready"; modelId: string }
  | { phase: "error"; message: string };

export type LlmStatus =
  | "idle"
  | "checking_support"
  | "downloading"
  | "loading"
  | "ready"
  | "generating"
  | "unsupported"
  | "error";

export interface LlmProgress {
  status: LlmStatus;
  progress: number;
  text: string;
  model_id: string | null;
  error: string | null;
}

let engineSingleton: MLCEngine | null = null;
let loadedModelId: string | null = null;
let webgpuChecked = false;
let webgpuAvailable = false;

export function isWebGpuAvailable(): boolean {
  if (webgpuChecked) return webgpuAvailable;
  webgpuChecked = true;
  webgpuAvailable =
    typeof navigator !== "undefined" &&
    "gpu" in navigator &&
    !!(navigator as Navigator & { gpu?: unknown }).gpu;
  return webgpuAvailable;
}

export async function ensureEngine(
  modelId: string,
  onProgress: (status: EngineStatus) => void,
): Promise<MLCEngine> {
  if (engineSingleton && loadedModelId === modelId) {
    onProgress({ phase: "ready", modelId });
    return engineSingleton;
  }
  if (!isWebGpuAvailable()) {
    const msg =
      "This browser does not support WebGPU. Try Chrome 121+ on desktop or Android, or Safari 18+ on iOS.";
    onProgress({ phase: "error", message: msg });
    throw new Error(msg);
  }

  onProgress({ phase: "checking" });
  const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

  try {
    const engine = await CreateMLCEngine(modelId, {
      initProgressCallback: (report: InitProgressReport) => {
        onProgress({
          phase: "downloading",
          progress: report.progress ?? 0,
          text: report.text ?? "Loading…",
        });
      },
    });
    engineSingleton = engine;
    loadedModelId = modelId;
    onProgress({ phase: "ready", modelId });
    return engine;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load on-device model.";
    onProgress({ phase: "error", message });
    throw err;
  }
}

export function getEngine(): MLCEngine | null {
  return engineSingleton;
}

export function getLoadedModelId(): string | null {
  return loadedModelId;
}

export async function unloadEngine(): Promise<void> {
  if (!engineSingleton) return;
  try {
    await engineSingleton.unload();
  } catch {
    // ignore — unload best-effort
  }
  engineSingleton = null;
  loadedModelId = null;
}

export async function chat(
  request: ChatCompletionRequest,
): Promise<string> {
  const engine = engineSingleton;
  if (!engine) throw new Error("On-device model is not loaded.");
  const completion = await engine.chat.completions.create({
    ...request,
    stream: false,
  });
  const choice = completion.choices?.[0];
  return choice?.message?.content ?? "";
}
