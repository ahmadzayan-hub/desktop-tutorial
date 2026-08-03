// Cooperative yielding to the browser event loop so long batch jobs
// don't lock up the main thread (and, on constrained mobiles, the
// entire System UI). Use `await yieldToBrowser()` inside tight loops.

export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as Window & {
        requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void;
      }).requestIdleCallback(() => resolve(), { timeout: 50 });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

/**
 * Rough device-capability guess for gating heavy client-side work such
 * as downloading a multi-hundred-MB WebLLM model. Uses
 * `navigator.deviceMemory` (GB, Chromium-only) and hardwareConcurrency
 * as a fallback signal. Conservative — returns false when unsure.
 */
export function hasEnoughRamForLargeModel(minGb: number): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === "number") {
    return nav.deviceMemory >= minGb;
  }
  // Fallback: at least 4 CPU cores usually means a mid-range or better
  // device. Still a guess — err on the side of allowing.
  if (typeof nav.hardwareConcurrency === "number") {
    return nav.hardwareConcurrency >= 4;
  }
  return true;
}
