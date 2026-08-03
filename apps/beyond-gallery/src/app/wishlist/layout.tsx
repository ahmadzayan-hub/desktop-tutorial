import type { Metadata } from "next";
import type { ReactNode } from "react";

// Wishlist is per-user state, not a canonical page — keep it out of
// search engines and answer engines.
export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your Beyond Gallery wishlist.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
};

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
