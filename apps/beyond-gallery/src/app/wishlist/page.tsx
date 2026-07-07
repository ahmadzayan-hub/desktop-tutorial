"use client";

import Link from "next/link";
import { PRODUCTS } from "../../data/products";
import Logo from "../_components/Logo";
import ProductTile from "../_components/ProductTile";
import { useWishlist } from "../_components/Wishlist";
import { HeartIcon, WhatsAppIcon } from "../_components/icons";

const WA_BASE = "https://wa.me/971551556991";

export default function WishlistPage() {
  const { wishlist, toggleWish } = useWishlist();
  const items = wishlist
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));

  const empty = items.length === 0;

  const bulkMessage = [
    "Hello Beyond Gallery, I would like a quote for these items from my wishlist:",
    "",
    ...items.map((p) => `- ${p.name}, ${p.price}`),
    "",
    "Delivery Emirate: ",
    "Preferred payment: ",
    "Any personalisation notes: ",
  ].join("\n");
  const waHref = `${WA_BASE}?text=${encodeURIComponent(bulkMessage)}`;

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
            <Link href="/cart" className="beyond-link hover:text-beyond-charcoal">
              Cart
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
            <div className="beyond-kicker mb-2">Saved</div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold beyond-ornament">
              Your wishlist
            </h1>
            <p className="mt-3 text-[14.5px] text-beyond-charcoal/70 max-w-xl">
              {empty
                ? "Nothing saved yet. Tap the heart on any product to keep it here for later."
                : `${items.length} ${items.length === 1 ? "piece" : "pieces"} kept for later. Send the list to us on WhatsApp for a single-message quote.`}
            </p>
          </div>
          {!empty && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-beyond-emerald text-white text-[13px] font-semibold hover:opacity-95"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Send all to WhatsApp
            </a>
          )}
        </div>

        {empty ? (
          <div className="mt-10 rounded-3xl border border-dashed border-beyond-line bg-white p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-beyond-ivory border border-beyond-line flex items-center justify-center text-beyond-gold">
              <HeartIcon className="w-6 h-6" />
            </div>
            <div className="mt-4 font-display text-xl font-semibold text-beyond-charcoal">
              No saved pieces yet
            </div>
            <p className="mt-2 text-[13.5px] text-beyond-charcoal/60 max-w-md mx-auto">
              Start with the storefront and tap the heart on anything you like. Your wishlist stays here between visits.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-beyond-charcoal text-beyond-ivory text-[13px] font-semibold hover:opacity-95"
            >
              Browse the store
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {items.map((p) => (
              <div
                key={p.id}
                className="beyond-lift group rounded-2xl overflow-hidden border border-beyond-line bg-white beyond-shadow hover:beyond-shadow-lg flex flex-col"
              >
                <Link href={`/product/${p.id}`} className="block">
                  <ProductTile variant={p.variant} ribbon={p.ribbon} lang="en" />
                </Link>
                <div className="p-3.5 flex-1 flex flex-col">
                  <Link href={`/product/${p.id}`} className="block">
                    <div className="font-display text-[14.5px] font-semibold text-beyond-charcoal line-clamp-1">
                      {p.name}
                    </div>
                  </Link>
                  <div className="mt-1 text-[12.5px] text-beyond-gold font-semibold">{p.price}</div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <Link
                      href={`/product/${p.id}`}
                      className="text-[11.5px] font-semibold px-2.5 py-2 rounded-full bg-beyond-charcoal text-beyond-ivory text-center hover:opacity-95"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => toggleWish(p.id, p.name)}
                      className="text-[11.5px] font-semibold px-2.5 py-2 rounded-full border border-beyond-line text-beyond-charcoal hover:border-beyond-gold hover:text-beyond-gold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
