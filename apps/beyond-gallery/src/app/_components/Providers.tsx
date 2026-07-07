"use client";

import type { ReactNode } from "react";
import { ToastHost, WishlistProvider } from "./Wishlist";
import { CartProvider } from "./Cart";

// Global providers mounted from the root layout so wishlist + cart state
// are shared across every route (/, /product/[slug], /journal/*, /cart,
// /wishlist). ToastHost is here too so any component can call toast()
// without wiring anything else up.
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        {children}
        <ToastHost />
      </CartProvider>
    </WishlistProvider>
  );
}
