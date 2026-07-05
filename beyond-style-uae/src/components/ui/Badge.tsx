import type { ReactNode } from "react";

/** Small trust chip used on cards and PDPs (e.g. "New arrival", "Gift ready"). */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-gold/30 px-2 py-0.5 text-xs text-gold/90">
      {children}
    </span>
  );
}
