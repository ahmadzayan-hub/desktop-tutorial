"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PRODUCTS } from "../../data/products";
import Logo from "../_components/Logo";
import ProductTile from "../_components/ProductTile";
import { useCart } from "../_components/Cart";
import { CartIcon, WhatsAppIcon } from "../_components/icons";

const WA_BASE = "https://wa.me/971551556991";

// Parse "AED 65" and similar. Falls back to 0 on unexpected shapes.
function priceNumber(price: string): number {
  const m = price.match(/[\d.]+/);
  return m ? Number(m[0]) : 0;
}

export default function CartPage() {
  const { items, setQty, remove, clear, itemCount } = useCart();

  const rows = useMemo(
    () =>
      items
        .map((it) => {
          const p = PRODUCTS.find((x) => x.id === it.productId);
          return p ? { p, qty: it.qty, unit: priceNumber(p.price) } : null;
        })
        .filter((r): r is { p: (typeof PRODUCTS)[number]; qty: number; unit: number } => Boolean(r)),
    [items]
  );

  const subtotal = rows.reduce((s, r) => s + r.unit * r.qty, 0);
  const overFree = subtotal >= 300;
  const delivery = overFree ? 0 : subtotal > 0 ? 25 : 0;
  const total = subtotal + delivery;

  const empty = rows.length === 0;

  const message = [
    "Hello Beyond Gallery, I would like to complete this order:",
    "",
    ...rows.map((r) => `- ${r.p.name} × ${r.qty} = AED ${(r.unit * r.qty).toFixed(2)}`),
    "",
    `Subtotal: AED ${subtotal.toFixed(2)}`,
    `Delivery: ${delivery === 0 ? "Free" : "AED 25"}`,
    `Total (incl. 5% VAT): AED ${total.toFixed(2)}`,
    "",
    "Delivery Emirate: ",
    "Preferred payment: ",
    "Any personalisation notes: ",
  ].join("\n");
  const waHref = `${WA_BASE}?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-beyond-ivory text-beyond-charcoal min-h-screen">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=Inter:wght@400;500;600;700&family=Alexandria:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap"
      />

      <header className="sticky top-0 z-30 bg-beyond-ivory/95 backdrop-blur border-b border-beyond-line">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="beyond-focus rounded-xl" aria-label="Beyond Gallery, home">
            <Logo size="sm" lang="en" showSub={false} />
          </Link>
          <nav className="text-[13px] font-semibold text-beyond-charcoal/80 flex items-center gap-5">
            <Link href="/" className="beyond-link hover:text-beyond-charcoal">
              Shop
            </Link>
            <Link href="/wishlist" className="beyond-link hover:text-beyond-charcoal">
              Wishlist
            </Link>
            <Link href="/journal" className="beyond-link hover:text-beyond-charcoal">
              Journal
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="beyond-kicker mb-2">Your bag</div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold beyond-ornament">
              Cart
            </h1>
            <p className="mt-3 text-[14.5px] text-beyond-charcoal/70 max-w-xl">
              {empty
                ? "Your cart is empty. Add pieces from any product page or the storefront."
                : `${itemCount} ${itemCount === 1 ? "piece" : "pieces"}. Prices in AED, inclusive of 5% VAT. Free delivery over AED 300.`}
            </p>
          </div>
          {!empty && (
            <button
              onClick={() => {
                if (confirm("Empty the cart?")) clear();
              }}
              className="text-[12.5px] text-beyond-charcoal/70 hover:text-beyond-charcoal underline underline-offset-4"
            >
              Empty cart
            </button>
          )}
        </div>

        {empty ? (
          <div className="mt-10 rounded-3xl border border-dashed border-beyond-line bg-white p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-beyond-ivory border border-beyond-line flex items-center justify-center text-beyond-gold">
              <CartIcon className="w-6 h-6" />
            </div>
            <div className="mt-4 font-display text-xl font-semibold text-beyond-charcoal">
              Your cart is empty
            </div>
            <p className="mt-2 text-[13.5px] text-beyond-charcoal/60 max-w-md mx-auto">
              Head back to the store and add a piece. Your cart is saved on this device between visits.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-beyond-charcoal text-beyond-ivory text-[13px] font-semibold hover:opacity-95"
            >
              Browse the store
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* Line items */}
            <div className="rounded-3xl border border-beyond-line bg-white overflow-hidden divide-y divide-beyond-line">
              {rows.map(({ p, qty, unit }) => (
                <div key={p.id} className="p-4 flex items-start gap-4">
                  <Link href={`/product/${p.id}`} className="shrink-0 w-24 sm:w-28 rounded-2xl overflow-hidden border border-beyond-line">
                    <ProductTile variant={p.variant} ribbon={p.ribbon} lang="en" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${p.id}`}>
                      <div className="font-display text-[15px] font-semibold text-beyond-charcoal line-clamp-1">
                        {p.name}
                      </div>
                    </Link>
                    <div className="text-[12px] text-beyond-charcoal/60 mt-0.5">{p.price} each</div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => setQty(p.id, Math.max(1, qty - 1))}
                        className="w-8 h-8 rounded-full border border-beyond-line text-beyond-charcoal hover:border-beyond-gold"
                      >
                        −
                      </button>
                      <input
                        aria-label="Quantity"
                        type="number"
                        min={1}
                        max={99}
                        value={qty}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n) && n > 0) setQty(p.id, n);
                        }}
                        className="w-14 text-center bg-beyond-ivory border border-beyond-line rounded-full py-1.5 text-[13px] font-semibold"
                      />
                      <button
                        aria-label="Increase quantity"
                        onClick={() => setQty(p.id, Math.min(99, qty + 1))}
                        className="w-8 h-8 rounded-full border border-beyond-line text-beyond-charcoal hover:border-beyond-gold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(p.id, { label: p.name })}
                        className="ms-3 text-[12px] text-beyond-charcoal/60 hover:text-beyond-charcoal underline underline-offset-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-[15px] font-semibold text-beyond-charcoal">
                      AED {(unit * qty).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="rounded-3xl border border-beyond-gold bg-white beyond-shadow-lg p-5 sm:p-6 lg:sticky lg:top-24">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-beyond-gold">
                Order summary
              </div>
              <div className="mt-4 space-y-2 text-[13.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-beyond-charcoal/70">Subtotal</span>
                  <span className="font-semibold text-beyond-charcoal">
                    AED {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-beyond-charcoal/70">Delivery</span>
                  <span className={`font-semibold ${overFree ? "text-beyond-emerald" : "text-beyond-charcoal"}`}>
                    {overFree ? "Free" : `AED ${delivery.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {!overFree && subtotal > 0 && (
                <div className="mt-3 text-[12px] text-beyond-charcoal/60">
                  Add AED {(300 - subtotal).toFixed(2)} more to qualify for free delivery.
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-beyond-line flex items-end justify-between">
                <div className="text-[13px] font-semibold text-beyond-charcoal">Total incl. VAT</div>
                <div className="font-display text-2xl font-semibold beyond-gold-gradient" dir="ltr">
                  AED {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-beyond-emerald text-white text-[14px] font-semibold hover:opacity-95"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Checkout on WhatsApp
              </a>

              <div className="mt-3 text-[11.5px] text-beyond-charcoal/60 leading-relaxed">
                We reply within 10 minutes during 9am to 11pm UAE time to confirm your order, address and total. Cash on delivery, card, Tabby and Tamara available.
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="border-t border-beyond-line bg-beyond-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-[12px] text-beyond-charcoal/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>Beyond Gallery. Operated by BEYOND CONNECT GENERAL TRADING L.L.C. Dubai, UAE.</div>
          <Link href="/" className="text-beyond-charcoal font-semibold beyond-link">
            Back to store
          </Link>
        </div>
      </footer>
    </div>
  );
}
