// Client-side document text extraction. Runs entirely in the browser — no
// upload, no server, no third-party API. PDFs via pdfjs-dist, DOCX via
// mammoth, plain text via FileReader.
//
// Mobile-aware: caps per-doc text at 30k chars, yields to the browser
// between PDF pages, and surfaces parse errors instead of swallowing
// them (so a corrupted PDF doesn't silently look like "no text").

"use client";

import { yieldToBrowser } from "@/lib/utils/yield";

export interface ParseResult {
  text: string;
  pages: number;
  truncated: boolean;
  /** Human-readable reason when parsing failed; empty result but no throw. */
  error?: string;
}

const MAX_CHARS = 30_000; // ~7.5k tokens, mobile-safe for small on-device LLMs

export async function extractText(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith(".pdf")) return await parsePdf(file);
    if (name.endsWith(".docx")) return await parseDocx(file);
    if (
      name.endsWith(".txt") ||
      name.endsWith(".md") ||
      name.endsWith(".csv") ||
      name.endsWith(".log") ||
      name.endsWith(".json")
    ) {
      const text = await file.text();
      return truncate(text, 1);
    }
    // Unknown extension — fall back to filename-only classification.
    return { text: "", pages: 0, truncated: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[parser] failed", file.name, message);
    return {
      text: "",
      pages: 0,
      truncated: false,
      error: message.slice(0, 200),
    };
  }
}

function truncate(text: string, pages: number): ParseResult {
  if (text.length <= MAX_CHARS) {
    return { text, pages, truncated: false };
  }
  return { text: text.slice(0, MAX_CHARS), pages, truncated: true };
}

async function parsePdf(file: File): Promise<ParseResult> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // CDN-hosted worker matching the installed version. Runs in a Web
  // Worker off the main thread — this is what keeps pdfjs from
  // freezing the browser during layout extraction. If the CDN can't be
  // reached (offline / captive network / firewall), pdfjs falls back to
  // an inline "fake worker" that still works, just on the main thread.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    // Be forgiving with malformed PDFs and skip external font requests
    // so extraction doesn't stall waiting on network fonts.
    isEvalSupported: false,
    disableFontFace: true,
  });
  const pdf = await loadingTask.promise;
  let combined = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    if (combined.length >= MAX_CHARS) break;
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const items = content.items as Array<{ str?: string }>;
      const pageText = items
        .map((it) => it.str ?? "")
        .filter(Boolean)
        .join(" ");
      combined += `\n\n[page ${i}]\n${pageText}`;
    } catch (err) {
      // A single bad page shouldn't kill the whole extraction — image-
      // only pages or those with unsupported features throw here.
      console.warn(`[parser] pdf page ${i} failed`, err);
    }
    if (i % 3 === 0) await yieldToBrowser();
  }
  const trimmed = combined.trim();
  if (trimmed.length === 0 && pdf.numPages > 0) {
    // PDF loaded but every page returned empty — almost always means
    // it's a scanned/image-only PDF that needs OCR. Surface it clearly.
    return {
      text: "",
      pages: pdf.numPages,
      truncated: false,
      error: "image-only PDF (no selectable text)",
    };
  }
  return truncate(trimmed, pdf.numPages);
}

async function parseDocx(file: File): Promise<ParseResult> {
  const mammoth = await import("mammoth/mammoth.browser");
  const buffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = (value ?? "").trim();
  if (text.length === 0) {
    return {
      text: "",
      pages: 1,
      truncated: false,
      error: "DOCX contained no extractable text",
    };
  }
  return truncate(text, 1);
}
