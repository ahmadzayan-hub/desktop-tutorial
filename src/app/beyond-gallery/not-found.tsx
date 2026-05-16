import Link from "next/link";
import "./brand.css";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-beyond-ivory text-beyond-charcoal font-bg-body">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
      />
      <div className="beyond-divider mb-4">Beyond Gallery · GiftMajlis</div>
      <div className="font-display text-6xl sm:text-7xl beyond-gold-gradient font-semibold">
        404
      </div>
      <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-beyond-charcoal/70 max-w-md">
        The link may have moved or never existed. Head back to the store or
        message us on WhatsApp — we&apos;ll point you to the right collection.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <Link
          href="/beyond-gallery"
          className="px-5 py-3 rounded-full bg-beyond-navy text-beyond-ivory text-[13px] font-semibold"
        >
          Back to store
        </Link>
        <a
          href="https://wa.me/971551556991"
          className="px-5 py-3 rounded-full bg-beyond-emerald text-white text-[13px] font-semibold"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
