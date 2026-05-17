// Client-side document text extraction. Runs entirely in the browser — no
// upload, no server, no third-party API. PDFs via pdfjs-dist, DOCX via
// mammoth, plain text via FileReader.

"use client";

export interface ParseResult {
  text: string;
  pages: number;
  truncated: boolean;
}

const MAX_CHARS = 60_000; // ~12k tokens, safe for small on-device LLMs

export async function extractText(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return parsePdf(file);
  if (name.endsWith(".docx")) return parseDocx(file);
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
  // Fall back to filename signal only
  return { text: "", pages: 0, truncated: false };
}

function truncate(text: string, pages: number): ParseResult {
  if (text.length <= MAX_CHARS) {
    return { text, pages, truncated: false };
  }
  return { text: text.slice(0, MAX_CHARS), pages, truncated: true };
}

async function parsePdf(file: File): Promise<ParseResult> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Use unpkg-hosted worker so we don't have to bundle/serve it ourselves.
  // pdfjs-dist 4.x exports its version via the `version` constant.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  let combined = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    if (combined.length >= MAX_CHARS) break;
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str?: string }>;
    const pageText = items
      .map((it) => it.str ?? "")
      .filter(Boolean)
      .join(" ");
    combined += `\n\n[page ${i}]\n${pageText}`;
  }
  return truncate(combined.trim(), pdf.numPages);
}

async function parseDocx(file: File): Promise<ParseResult> {
  const mammoth = await import("mammoth/mammoth.browser");
  const buffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
  return truncate(value, 1);
}
