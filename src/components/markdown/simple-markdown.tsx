// Minimal markdown renderer for constrained content: ##/### headings,
// **bold**, and paragraphs separated by blank lines. Purpose-built for
// executive briefs; not a full commonmark implementation.

import type { ReactNode } from "react";

interface Props {
  text: string;
  className?: string;
}

export function SimpleMarkdown({ text, className }: Props) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="mt-4 first:mt-0 text-sm font-semibold text-brand-navy">
              {trimmed.slice(4)}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="mt-4 first:mt-0 text-base font-semibold text-brand-navy">
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={i} className="mt-4 first:mt-0 text-lg font-semibold text-brand-navy">
              {trimmed.slice(2)}
            </h2>
          );
        }
        return (
          <p key={i} className="mt-3 first:mt-0 leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-brand-navy">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
