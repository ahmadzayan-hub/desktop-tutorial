"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// --------- Toast singleton (lightweight, no provider needed for emits) ----------

type ToastMsg = { id: number; message: string };
type ToastListener = (msg: ToastMsg) => void;
let toastListeners: ToastListener[] = [];

export function toast(message: string) {
  const m = { id: Date.now() + Math.random(), message };
  toastListeners.forEach((l) => l(m));
}

export function ToastHost() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    const l: ToastListener = (m) => {
      setItems((prev) => [...prev, m]);
      setTimeout(
        () => setItems((prev) => prev.filter((x) => x.id !== m.id)),
        3200
      );
    };
    toastListeners.push(l);
    return () => {
      toastListeners = toastListeners.filter((x) => x !== l);
    };
  }, []);
  return (
    <div
      aria-live="polite"
      className="fixed top-4 inset-x-0 z-[80] flex flex-col items-center gap-2 pointer-events-none"
    >
      <AnimatePresence>
        {items.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            className="beyond-toast"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-beyond-gold" />
            {m.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// --------- Wishlist + Recently Viewed (localStorage backed) ----------

type ListState = {
  wishlist: string[];
  recents: string[];
};

type Api = {
  wishlist: string[];
  recents: string[];
  isWished: (id: string) => boolean;
  toggleWish: (id: string, label?: string) => void;
  trackView: (id: string) => void;
};

const Ctx = createContext<Api | null>(null);

const LS_WISH = "bg_wishlist_v1";
const LS_REC = "bg_recents_v1";
const REC_MAX = 6;

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ListState>({ wishlist: [], recents: [] });

  useEffect(() => {
    try {
      const w = JSON.parse(localStorage.getItem(LS_WISH) || "[]");
      const r = JSON.parse(localStorage.getItem(LS_REC) || "[]");
      setState({
        wishlist: Array.isArray(w) ? w : [],
        recents: Array.isArray(r) ? r : [],
      });
    } catch {}
  }, []);

  const persist = useCallback((next: ListState) => {
    try {
      localStorage.setItem(LS_WISH, JSON.stringify(next.wishlist));
      localStorage.setItem(LS_REC, JSON.stringify(next.recents));
    } catch {}
  }, []);

  const toggleWish = useCallback(
    (id: string, label?: string) => {
      setState((prev) => {
        const has = prev.wishlist.includes(id);
        const wishlist = has
          ? prev.wishlist.filter((x) => x !== id)
          : [...prev.wishlist, id];
        const next = { ...prev, wishlist };
        persist(next);
        if (label) {
          toast(has ? `Removed ${label} from wishlist.` : `Saved ${label} to wishlist.`);
        }
        return next;
      });
    },
    [persist]
  );

  const trackView = useCallback(
    (id: string) => {
      setState((prev) => {
        const filtered = prev.recents.filter((x) => x !== id);
        const recents = [id, ...filtered].slice(0, REC_MAX);
        const next = { ...prev, recents };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const api = useMemo<Api>(
    () => ({
      wishlist: state.wishlist,
      recents: state.recents,
      isWished: (id) => state.wishlist.includes(id),
      toggleWish,
      trackView,
    }),
    [state, toggleWish, trackView]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const v = useContext(Ctx);
  if (!v) {
    // Safe defaults for SSR or pre-mount
    return {
      wishlist: [] as string[],
      recents: [] as string[],
      isWished: () => false,
      toggleWish: () => {},
      trackView: () => {},
    } as Api;
  }
  return v;
}
