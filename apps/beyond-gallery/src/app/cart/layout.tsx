import type { Metadata } from "next";
import type { ReactNode } from "react";

// Cart is per-user state, not a canonical page — keep it out of search
// engines and answer engines.
export const metadata: Metadata = {
  title: "Cart",
  description: "Your Beyond Gallery cart.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
};

export default function CartLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
