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

// -------------------- Device-driver capability probe --------------------
//
// Some Android GPU drivers (Adreno, Mali, PowerVR) expose WebGPU but the
// underlying Vulkan/Metal backend crashes when a real compute pipeline
// is compiled — the app then dies mid-download with
// `CreateComputePipelines failed with VK_ERROR_UNKNOWN`. We probe by
// compiling a trivial compute shader BEFORE downloading a 360+ MB
// model, and cache the verdict per-device so future visits skip the
// wasted work entirely.

const PROBE_STORAGE_KEY = "mutabasir.webgpu.probe.v1";
const PROBE_SHADER = /* wgsl */ `
  @group(0) @binding(0) var<storage, read_write> out: array<u32>;
  @compute @workgroup_size(1)
  fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    out[gid.x] = gid.x + 1u;
  }
`;

export interface WebGpuProbeResult {
  /** true iff we successfully created a compute pipeline. */
  compute_ok: boolean;
  /** GPU adapter name / architecture when available, for diagnostics. */
  adapter: string | null;
  /** The specific error (helps distinguish "no WebGPU" from "driver bug"). */
  error: string | null;
}

interface Adapter {
  info?: { vendor?: string; architecture?: string; device?: string };
  requestDevice: () => Promise<Device>;
}
interface Device {
  createShaderModule: (opts: { code: string }) => ShaderModule;
  createComputePipeline: (opts: {
    layout: string;
    compute: { module: ShaderModule; entryPoint: string };
  }) => Promise<unknown>;
  destroy?: () => void;
  addEventListener?: (type: string, cb: (e: unknown) => void) => void;
}
interface ShaderModule {
  getCompilationInfo?: () => Promise<{ messages: Array<{ type: string; message: string }> }>;
}

function loadCachedProbe(): WebGpuProbeResult | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROBE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WebGpuProbeResult;
  } catch {
    return null;
  }
}

function saveCachedProbe(result: WebGpuProbeResult) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PROBE_STORAGE_KEY, JSON.stringify(result));
  } catch {
    // storage full / disabled — probe just won't be cached
  }
}

/** Public: clear the cached verdict (e.g. after a browser/driver update). */
export function resetWebGpuProbeCache(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(PROBE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Try to compile a trivial compute pipeline on the user's GPU. Returns
 * `{ compute_ok: true }` when the pipeline compiles; on any failure
 * (driver rejection, missing adapter, permission denied) returns
 * `compute_ok: false` with a diagnostic `error`. Result is cached per
 * device.
 */
export async function probeWebGpuCompute(
  useCache = true,
): Promise<WebGpuProbeResult> {
  if (useCache) {
    const cached = loadCachedProbe();
    if (cached) return cached;
  }

  const fail = (error: string, adapter: string | null = null): WebGpuProbeResult => {
    const r = { compute_ok: false, adapter, error };
    saveCachedProbe(r);
    return r;
  };

  if (!isWebGpuAvailable()) return fail("navigator.gpu not present");

  const nav = navigator as Navigator & {
    gpu?: { requestAdapter?: () => Promise<Adapter | null> };
  };
  if (!nav.gpu?.requestAdapter) return fail("gpu.requestAdapter missing");

  let device: Device | null = null;
  try {
    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) return fail("no GPU adapter available");
    const adapterName =
      [adapter.info?.vendor, adapter.info?.architecture, adapter.info?.device]
        .filter(Boolean)
        .join(" · ") || null;

    device = await adapter.requestDevice();

    // Any uncaptured device error (async validation, driver-level
    // rejection) means we can't trust the device for real inference.
    let uncaptured: string | null = null;
    device.addEventListener?.("uncapturederror", (e) => {
      const anyE = e as { error?: { message?: string } };
      uncaptured = anyE.error?.message ?? "uncaptured device error";
    });

    const shaderModule = device.createShaderModule({ code: PROBE_SHADER });
    if (shaderModule.getCompilationInfo) {
      const info = await shaderModule.getCompilationInfo();
      const errors = info.messages.filter((m) => m.type === "error");
      if (errors.length > 0) {
        return fail(
          `shader compilation errors: ${errors[0]!.message}`,
          adapterName,
        );
      }
    }
    await device.createComputePipeline({
      layout: "auto",
      compute: { module: shaderModule, entryPoint: "main" },
    });

    if (uncaptured) return fail(uncaptured, adapterName);

    const ok: WebGpuProbeResult = { compute_ok: true, adapter: adapterName, error: null };
    saveCachedProbe(ok);
    return ok;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return fail(msg);
  } finally {
    try {
      device?.destroy?.();
    } catch {
      // best effort
    }
  }
}

/** Pattern-matches the class of driver failure so the UI can help the user. */
export function classifyProbeError(msg: string | null): {
  is_driver_bug: boolean;
  friendly_en: string;
  friendly_ar: string;
} {
  const lower = (msg ?? "").toLowerCase();
  const isDriverBug =
    lower.includes("vk_error") ||
    lower.includes("createcomputepipelines") ||
    lower.includes("checkvksuccessimpl") ||
    lower.includes("uncaptured") ||
    lower.includes("device is lost");
  if (isDriverBug) {
    return {
      is_driver_bug: true,
      friendly_en:
        "Your device's GPU driver rejected the on-device AI compute pipeline. This is a hardware/driver limitation, not an app bug. Try a desktop Chrome or a different device.",
      friendly_ar:
        "رفض سائق GPU في جهازك تشغيل خطّ الاستدلال. هذه محدوديّة سائق/عتاد، وليست خطأً في التطبيق. جرّب Chrome على سطح المكتب أو جهازاً آخر.",
    };
  }
  return {
    is_driver_bug: false,
    friendly_en: msg ?? "On-device AI is unavailable on this device.",
    friendly_ar: "الذكاء على الجهاز غير متاح هنا.",
  };
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

  // Cheap driver probe before we start the 300+ MB download. If the
  // adapter compiles a trivial compute pipeline, we're safe to
  // continue. If it rejects (VK_ERROR_UNKNOWN and friends), we bail
  // with a friendly message instead of crashing mid-load.
  const probe = await probeWebGpuCompute();
  if (!probe.compute_ok) {
    const classified = classifyProbeError(probe.error);
    const friendly = classified.friendly_en;
    onProgress({ phase: "error", message: friendly });
    throw new Error(friendly);
  }

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
    const raw = err instanceof Error ? err.message : "Failed to load on-device model.";
    const classified = classifyProbeError(raw);
    // If the failure looks driver-level, remember it so the next visit
    // skips the download and shows the fallback path immediately.
    if (classified.is_driver_bug) {
      saveCachedProbe({ compute_ok: false, adapter: null, error: raw });
    }
    const message = classified.is_driver_bug ? classified.friendly_en : raw;
    onProgress({ phase: "error", message });
    throw new Error(message);
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
