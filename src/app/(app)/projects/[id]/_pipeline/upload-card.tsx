"use client";

import type { RefObject } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileText, FileUp, Loader2, Trash2 } from "lucide-react";
import { Section, Empty } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { formatBytes, type PipelineDocument } from "@/lib/store/pipeline-store";
import { cn } from "@/lib/utils/cn";

interface Props {
  documents: PipelineDocument[];
  parsing: boolean;
  pages: Record<string, number>;
  onPick: () => void;
  onFiles: (f: FileList | null) => void;
  onRemove: (id: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export function UploadCard({
  documents,
  parsing,
  pages,
  onPick,
  onFiles,
  onRemove,
  fileInputRef,
}: Props) {
  const { t, locale } = useLocale();
  const [over, setOver] = useState(false);
  const totalBytes = documents.reduce((n, d) => n + d.size_bytes, 0);

  return (
    <Section
      icon={<FileUp className="h-4 w-4" />}
      title={t.pipeline.upload.title}
      hint={t.pipeline.upload.hint}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.md,.csv,.json,.log,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      <motion.button
        type="button"
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFiles(e.dataTransfer.files);
        }}
        onClick={onPick}
        animate={{
          borderColor: over ? "#171C8F" : "#E2E8F0",
          backgroundColor: over ? "rgba(23,28,143,0.04)" : "rgba(248,250,252,0.5)",
        }}
        className="group flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed py-10 transition-shadow hover:shadow-inner"
      >
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-navy shadow-sm">
          <FileUp className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-slate-700">
          {t.pipeline.upload.drop}
        </p>
        <span className="rounded-full bg-brand-navy px-3 py-1 text-xs font-medium text-white shadow-sm group-hover:bg-brand-navy/90">
          {t.pipeline.upload.choose}
        </span>
      </motion.button>

      {parsing && (
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t.pipeline.upload.parsing}
        </div>
      )}

      <div className="mt-5">
        {documents.length === 0 ? (
          <Empty
            title={t.pipeline.upload.empty}
            hint={t.pipeline.upload.hint}
            icon={<FileText className="h-4 w-4" />}
          />
        ) : (
          <>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t.pipeline.upload.count
                .replace("{n}", String(documents.length))
                .replace("{bytes}", formatBytes(totalBytes, locale))}
            </p>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <AnimatePresence initial={false}>
                {documents.map((d) => (
                  <motion.li
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {d.filename}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(d.size_bytes, locale)} ·{" "}
                        {pages[d.id]
                          ? t.pipeline.upload.parsed.replace("{n}", String(pages[d.id]))
                          : t.pipeline.upload.textOnly}{" "}
                        · <span className="uppercase">{d.document_type}</span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(d.id)}
                      aria-label={t.pipeline.upload.remove}
                      className={cn("text-slate-400 hover:text-brand-red")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </div>
    </Section>
  );
}
