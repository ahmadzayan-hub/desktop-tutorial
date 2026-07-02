/**
 * Client-side image helpers used by the customisation studio.
 * These run in the browser (canvas) so the preview is instant and no photo
 * leaves the device until the user consents and checks out. Heavier AI
 * (generative cleanup, deep moderation) is designed to be swapped for a
 * server call — see the `provider` hooks in ai.ts.
 */

export type QualityVerdict = "good" | "warn" | "bad";

export interface ImageAssessment {
  width: number;
  height: number;
  megapixels: number;
  verdict: QualityVerdict;
}

/** Load a File/blob URL into an HTMLImageElement. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/** Assess resolution → print-quality verdict. */
export function assessQuality(img: HTMLImageElement): ImageAssessment {
  const mp = (img.naturalWidth * img.naturalHeight) / 1_000_000;
  const minSide = Math.min(img.naturalWidth, img.naturalHeight);
  let verdict: QualityVerdict = "good";
  if (minSide < 500 || mp < 0.4) verdict = "bad";
  else if (minSide < 900 || mp < 1.2) verdict = "warn";
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    megapixels: Math.round(mp * 10) / 10,
    verdict,
  };
}

/** Auto-crop to a centred square (the cup/box print area). Returns a data URL. */
export function autoCropSquare(img: HTMLImageElement, size = 800): string {
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Lightweight "AI cleanup": auto-tone via brightness/contrast/saturation lift.
 * A production build would call a server-side Firefly/Photoshop-style endpoint;
 * this gives an honest, visible improvement with zero network + zero deps.
 */
export function autoEnhance(img: HTMLImageElement, size = 800): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  // filter is widely supported on 2D contexts in modern browsers
  ctx.filter = "brightness(1.06) contrast(1.08) saturate(1.12)";
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.92);
}
