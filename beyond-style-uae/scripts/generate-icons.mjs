// Rasterize the brand SVGs in public/ to the PNG sizes the manifest and social
// meta reference. One-off asset tooling — not part of the app build.
//
// Requirements:
//   - playwright-core installed (npm i -D playwright-core), or run from a dir
//     that has it: `npx --yes playwright-core@1 node scripts/generate-icons.mjs`
//   - a Chromium binary. Set CHROME_PATH, or rely on the default below.
//
// Usage:
//   CHROME_PATH=/path/to/chrome node scripts/generate-icons.mjs

import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const PUB = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
const EXEC =
  process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const jobs = [
  { svg: "og.svg", w: 1200, h: 630, out: "og.png" },
  { svg: "icon.svg", w: 512, h: 512, out: "icon-512.png" },
  { svg: "icon.svg", w: 192, h: 192, out: "icon-192.png" },
  { svg: "icon.svg", w: 180, h: 180, out: "apple-touch-icon.png" },
  { svg: "icon-maskable.svg", w: 512, h: 512, out: "icon-maskable-512.png" },
  { svg: "icon-maskable.svg", w: 192, h: 192, out: "icon-maskable-192.png" },
];

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ["--no-sandbox", "--force-color-profile=srgb"],
});

for (const job of jobs) {
  const svg = readFileSync(resolve(PUB, job.svg), "utf8");
  const page = await browser.newPage({
    viewport: { width: job.w, height: job.h },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<!doctype html><html><head><style>*{margin:0;padding:0}svg{width:${job.w}px;height:${job.h}px;display:block}</style></head><body>${svg}</body></html>`,
    { waitUntil: "networkidle" },
  );
  writeFileSync(
    resolve(PUB, job.out),
    await page.screenshot({ clip: { x: 0, y: 0, width: job.w, height: job.h } }),
  );
  await page.close();
  console.log(`wrote public/${job.out} (${job.w}x${job.h})`);
}

await browser.close();
