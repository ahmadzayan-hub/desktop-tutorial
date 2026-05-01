"use client";

import { useRef, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  text: string;       // raw extracted text (truncated to ~200 KB)
  kind: "structured" | "unstructured";
}

const MAX_BYTES = 200 * 1024; // 200 KB per file — keeps prompts tractable
const STRUCTURED_EXT = /\.(csv|tsv|json|jsonl|xml|yaml|yml|toml)$/i;
const TEXT_LIKE = /\.(txt|md|markdown|html|css|js|jsx|ts|tsx|py|rb|go|java|c|cpp|sql|sh|env|log|csv|tsv|json|jsonl|xml|yaml|yml|toml)$/i;

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

  async function handleFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const next: AttachedFile[] = [...files];
    for (const f of Array.from(list)) {
      if (!TEXT_LIKE.test(f.name) && !f.type.startsWith("text/") && f.type !== "application/json") {
        setError(
          locale === "ar"
            ? "صيغة الملف غير مدعومة (نَصٌّ فقط)."
            : "Unsupported file type (text-only)."
        );
        continue;
      }
      if (f.size > MAX_BYTES) {
        setError(t("files.too_big"));
        continue;
      }
      const text = await f.text();
      next.push({
        id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        size: f.size,
        type: f.type,
        text: text.slice(0, MAX_BYTES),
        kind: STRUCTURED_EXT.test(f.name) ? "structured" : "unstructured"
      });
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
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
          className="btn-ghost border border-slate-300 text-xs"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {t("files.add")}
        </button>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept=".csv,.tsv,.json,.jsonl,.xml,.yaml,.yml,.toml,.txt,.md,.markdown,.html,.css,.js,.jsx,.ts,.tsx,.py,.rb,.go,.java,.c,.cpp,.sql,.sh,.env,.log,text/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      )}

      {files.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="inline-flex items-center gap-2 text-xs bg-slate-100 text-slate-700 rounded-full ps-3 pe-1 py-1"
              title={`${f.kind} · ${f.name}`}
            >
              <span className={
                "w-1.5 h-1.5 rounded-full " +
                (f.kind === "structured" ? "bg-violet-500" : "bg-amber-500")
              } />
              <span className="truncate max-w-[180px]">{f.name}</span>
              <span className="text-slate-500">{t("files.size", { kb: Math.max(1, Math.round(f.size / 1024)) })}</span>
              <button
                type="button"
                onClick={() => remove(f.id)}
                aria-label={t("files.remove")}
                className="ml-1 rtl:ml-0 rtl:mr-1 w-5 h-5 rounded-full hover:bg-slate-200 inline-flex items-center justify-center"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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

/** Format attached files as a single context block to append to the raw prompt. */
export function formatAttachedAsContext(files: AttachedFile[], locale: "en" | "ar"): string {
  if (!files.length) return "";
  const header = locale === "ar" ? "البيانات المُرفقة" : "Attached data";
  const blocks = files.map((f) => {
    const tag =
      f.kind === "structured"
        ? locale === "ar"
          ? "بيانات مهيكلة"
          : "structured data"
        : locale === "ar"
          ? "بيانات غير مهيكلة"
          : "unstructured data";
    return `### ${f.name} (${tag})\n\`\`\`\n${f.text}\n\`\`\``;
  });
  return `\n\n## ${header}\n${blocks.join("\n\n")}`;
}
