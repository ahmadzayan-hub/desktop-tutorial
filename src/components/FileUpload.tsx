"use client";

import { useRef, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

export type AttachedKind = "structured" | "unstructured" | "image" | "binary";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  /** Extracted text for text-like files. Empty for image/binary. */
  text: string;
  /** Data URL for images (used as a markdown thumbnail). Empty otherwise. */
  dataUrl: string;
  kind: AttachedKind;
}

const TEXT_TRUNCATE = 200 * 1024;            // truncate text-extract to 200 KB
const MAX_FILE_BYTES = 10 * 1024 * 1024;     // hard cap 10 MB per file
const MAX_IMAGE_INLINE = 1.5 * 1024 * 1024;  // images ≤ 1.5 MB are inlined as data URL

const STRUCTURED_EXT = /\.(csv|tsv|json|jsonl|xml|yaml|yml|toml)$/i;
const TEXT_LIKE_EXT =
  /\.(txt|md|markdown|html|htm|css|js|jsx|ts|tsx|py|rb|go|java|c|h|cpp|hpp|cs|rs|kt|swift|php|sql|sh|bash|zsh|env|log|csv|tsv|json|jsonl|xml|yaml|yml|toml|ini|conf|cfg)$/i;

function classify(file: File): AttachedKind {
  if (file.type.startsWith("image/")) return "image";
  if (STRUCTURED_EXT.test(file.name)) return "structured";
  if (TEXT_LIKE_EXT.test(file.name)) return "unstructured";
  if (file.type.startsWith("text/")) return "unstructured";
  if (file.type === "application/json") return "structured";
  return "binary";
}

function readAsText(file: File): Promise<string> {
  return file.text();
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

interface Props {
  files: AttachedFile[];
  onChange: (files: AttachedFile[]) => void;
  className?: string;
}

export default function FileUpload({ files, onChange, className }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    setBusy(true);
    try {
      const next: AttachedFile[] = [...files];
      for (const f of Array.from(list)) {
        if (f.size > MAX_FILE_BYTES) {
          setError(
            locale === "ar"
              ? `الملف "${f.name}" أكبر من 10 ميغابايت.`
              : `"${f.name}" is larger than 10 MB.`
          );
          continue;
        }

        const kind = classify(f);
        let text = "";
        let dataUrl = "";

        try {
          if (kind === "image") {
            if (f.size <= MAX_IMAGE_INLINE) dataUrl = await readAsDataUrl(f);
          } else if (kind === "structured" || kind === "unstructured") {
            const raw = await readAsText(f);
            text = raw.slice(0, TEXT_TRUNCATE);
          }
          // Binary files: only metadata is captured — no read needed.
        } catch (e) {
          setError(
            locale === "ar"
              ? `تعذّر قراءة "${f.name}".`
              : `Could not read "${f.name}".`
          );
          continue;
        }

        next.push({
          id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          name: f.name,
          size: f.size,
          type: f.type || "application/octet-stream",
          text,
          dataUrl,
          kind
        });
      }
      onChange(next);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(id: string) {
    onChange(files.filter((f) => f.id !== id));
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-xs text-slate-500">{t("files.label")}</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn-ghost border border-slate-300 text-xs disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {busy
            ? (locale === "ar" ? "جارٍ التحميل…" : "Loading…")
            : t("files.add")}
        </button>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
              title={`${f.kind} · ${f.type || "?"} · ${f.name}`}
            >
              {f.kind === "image" && f.dataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={f.dataUrl}
                  alt={f.name}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              ) : (
                <span className={
                  "w-10 h-10 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-semibold uppercase " +
                  kindToColor(f.kind)
                }>
                  {extOf(f.name)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-700">{f.name}</div>
                <div className="text-slate-500">
                  {kindLabel(f.kind, locale)} · {humanSize(f.size, locale)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(f.id)}
                aria-label={t("files.remove")}
                className="w-6 h-6 rounded-full hover:bg-slate-200 inline-flex items-center justify-center flex-shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1, i + 5).toUpperCase() : "FILE";
}

function kindToColor(k: AttachedKind): string {
  switch (k) {
    case "structured":   return "bg-violet-100 text-violet-700";
    case "unstructured": return "bg-amber-100 text-amber-700";
    case "image":        return "bg-emerald-100 text-emerald-700";
    case "binary":       return "bg-slate-200 text-slate-700";
  }
}

function kindLabel(k: AttachedKind, locale: "en" | "ar"): string {
  if (locale === "ar") {
    return { structured: "بيانات مهيكلة", unstructured: "نصّ", image: "صورة", binary: "ملف" }[k];
  }
  return { structured: "structured", unstructured: "text", image: "image", binary: "file" }[k];
}

function humanSize(bytes: number, locale: "en" | "ar"): string {
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} ${locale === "ar" ? "ك.ب" : "KB"}`;
  return `${(kb / 1024).toFixed(1)} ${locale === "ar" ? "م.ب" : "MB"}`;
}

/** Format attached files as a single context block to append to the raw prompt. */
export function formatAttachedAsContext(files: AttachedFile[], locale: "en" | "ar"): string {
  if (!files.length) return "";
  const header = locale === "ar" ? "البيانات المُرفقة" : "Attached files";

  const blocks = files.map((f) => {
    if (f.kind === "image") {
      const note = locale === "ar"
        ? `صورة مرفقة — اسم الملف: ${f.name} · النوع: ${f.type} · الحجم: ${humanSize(f.size, locale)}.`
        : `Attached image — filename: ${f.name} · type: ${f.type} · size: ${humanSize(f.size, locale)}.`;
      // Inline the data URL when small enough; vision-capable models can read
      // it, others at least see the filename and size.
      return f.dataUrl
        ? `### ${f.name}\n${note}\n\n![${f.name}](${f.dataUrl})`
        : `### ${f.name}\n${note}`;
    }
    if (f.kind === "binary") {
      const note = locale === "ar"
        ? `ملف ثنائي مرفق (لم يُستخرَج محتواه نصّيًا) — اسم الملف: ${f.name} · النوع: ${f.type} · الحجم: ${humanSize(f.size, locale)}.`
        : `Attached binary file (text not extracted) — filename: ${f.name} · type: ${f.type} · size: ${humanSize(f.size, locale)}.`;
      return `### ${f.name}\n${note}`;
    }
    const tag = f.kind === "structured"
      ? (locale === "ar" ? "بيانات مهيكلة" : "structured data")
      : (locale === "ar" ? "نصّ غير مهيكل" : "unstructured text");
    return `### ${f.name} (${tag})\n\`\`\`\n${f.text}\n\`\`\``;
  });

  return `\n\n## ${header}\n${blocks.join("\n\n")}`;
}
