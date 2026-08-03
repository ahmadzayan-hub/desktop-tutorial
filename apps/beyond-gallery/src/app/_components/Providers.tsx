"use client";

import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastHost, WishlistProvider } from "./Wishlist";
import { CartProvider } from "./Cart";

// Global providers mounted from the root layout so wishlist + cart state
// are shared across every route (/, /product/[slug], /journal/*, /cart,
// /wishlist). ToastHost is here too so any component can call toast()
// without wiring anything else up.
//
// Vercel Analytics + Speed Insights are cookie-less, privacy-first, and
// only send beacons when deployed to Vercel — they no-op in local dev.
// Both tools require zero configuration and populate the project's
// Analytics / Speed Insights dashboards automatically.
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        {children}
        <ToastHost />
        <Analytics />
        <SpeedInsights />
      </CartProvider>
    </WishlistProvider>
  );
}
