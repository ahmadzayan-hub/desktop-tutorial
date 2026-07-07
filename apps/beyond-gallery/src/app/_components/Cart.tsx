"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "./Wishlist";

// Cart persistence. Same shape and localStorage pattern as WishlistProvider
// so the two providers stay symmetric. Items are keyed by product id and
// carry a quantity; price is looked up at render time from data/products
// to keep this store lean.

export type CartItem = { productId: string; qty: number };

type Api = {
  items: CartItem[];
  itemCount: number;
  add: (productId: string, opts?: { qty?: number; label?: string }) => void;
  remove: (productId: string, opts?: { label?: string }) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<Api | null>(null);
const LS_CART = "bg_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_CART) || "[]");
      if (Array.isArray(raw)) {
        // Validate shape; drop anything malformed to avoid crashing on old data.
        const clean: CartItem[] = raw
          .filter(
            (r): r is CartItem =>
              !!r &&
              typeof (r as CartItem).productId === "string" &&
              typeof (r as CartItem).qty === "number" &&
              (r as CartItem).qty > 0
          )
          .map((r) => ({ productId: r.productId, qty: Math.min(99, Math.max(1, Math.floor(r.qty))) }));
        setItems(clean);
      }
    } catch {}
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    try {
      localStorage.setItem(LS_CART, JSON.stringify(next));
    } catch {}
  }, []);

  const add = useCallback<Api["add"]>(
    (productId, opts) => {
      const qty = Math.max(1, Math.min(99, Math.floor(opts?.qty ?? 1)));
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.productId === productId);
        let next: CartItem[];
        if (idx === -1) {
          next = [...prev, { productId, qty }];
        } else {
          next = prev.map((i, k) =>
            k === idx ? { ...i, qty: Math.min(99, i.qty + qty) } : i
          );
        }
        persist(next);
        if (opts?.label) toast(`Added ${opts.label} to cart.`);
        return next;
      });
    },
    [persist]
  );

  const remove = useCallback<Api["remove"]>(
    (productId, opts) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.productId !== productId);
        persist(next);
        if (opts?.label) toast(`Removed ${opts.label} from cart.`);
        return next;
      });
    },
    [persist]
  );

  const setQty = useCallback<Api["setQty"]>(
    (productId, qty) => {
      const clamped = Math.max(1, Math.min(99, Math.floor(qty)));
      setItems((prev) => {
        const next = prev.map((i) =>
          i.productId === productId ? { ...i, qty: clamped } : i
        );
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clear = useCallback(() => {
    setItems([]);
    persist([]);
  }, [persist]);

  const itemCount = useMemo(
    () => items.reduce((n, i) => n + i.qty, 0),
    [items]
  );

  const api = useMemo<Api>(
    () => ({ items, itemCount, add, remove, setQty, clear }),
    [items, itemCount, add, remove, setQty, clear]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) {
    // Safe defaults for SSR or pre-mount.
    return {
      items: [] as CartItem[],
      itemCount: 0,
      add: () => {},
      remove: () => {},
      setQty: () => {},
      clear: () => {},
    } as Api;
  }
  return v;
}
