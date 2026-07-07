"use client";

import Link from "next/link";
import { useCart } from "./Cart";
import { useWishlist } from "./Wishlist";
import { CartIcon, HeartIcon, WhatsAppIcon } from "./icons";

// Client-side action row for the product detail page.
// Kept as a small island so the rest of the page stays server-rendered
// for SEO, and the button labels can update from cart / wishlist state.
export default function ProductActions({
  productId,
  productName,
  waHref,
}: {
  productId: string;
  productName: string;
  waHref: string;
}) {
  const { add, items } = useCart();
  const { isWished, toggleWish } = useWishlist();
  const inCart = items.some((i) => i.productId === productId);
  const wished = isWished(productId);

  return (
    <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
      <button
        onClick={() => add(productId, { label: productName })}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[14px] font-semibold transition-colors ${
          inCart
            ? "bg-beyond-charcoal text-beyond-ivory"
            : "bg-beyond-gold text-white hover:opacity-95"
        }`}
      >
        <CartIcon className="w-4 h-4" />
        {inCart ? "Add another" : "Add to cart"}
      </button>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-emerald text-white text-[14px] font-semibold hover:opacity-95"
      >
        <WhatsAppIcon className="w-4 h-4" />
        Order on WhatsApp
      </a>

      <button
        onClick={() => toggleWish(productId, productName)}
        className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-[14px] font-semibold transition-colors ${
          wished
            ? "bg-beyond-ivory border-beyond-gold text-beyond-gold"
            : "border-beyond-line text-beyond-charcoal hover:border-beyond-gold hover:text-beyond-gold"
        }`}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
      >
        <HeartIcon className={`w-4 h-4 ${wished ? "fill-current" : ""}`} />
      </button>

      {inCart && (
        <Link
          href="/cart"
          className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-beyond-line text-beyond-charcoal text-[14px] font-semibold hover:border-beyond-gold"
        >
          View cart
        </Link>
      )}
    </div>
  );
}
