import Link from "next/link";
import type { Metadata } from "next";
import { JOURNAL } from "../../data/journal";
import Logo from "../_components/Logo";
import ProductTile from "../_components/ProductTile";
import type { Variant } from "../_components/ProductTile";

const SITE = "https://beyondgallery.ae";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Editorial guides from Beyond Gallery on choosing UAE gifts, corporate gifting done right, and the meaning behind our most-loved pieces.",
  alternates: { canonical: `${SITE}/journal` },
  openGraph: {
    type: "website",
    url: `${SITE}/journal`,
    title: "Beyond Gallery Journal",
    description:
      "Editorial guides on UAE gifting, corporate gift programmes, and product stories.",
  },
};

export default function JournalIndex() {
  return (
    <div className="bg-beyond-ivory text-beyond-charcoal min-h-screen">
      {/* Font stack for the journal */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=Inter:wght@400;500;600;700&family=Alexandria:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap"
      />

      <header className="sticky top-0 z-30 bg-beyond-ivory/95 backdrop-blur border-b border-beyond-line">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Beyond Gallery, home" className="beyond-focus rounded-xl">
            <Logo size="sm" lang="en" showSub={false} />
          </Link>
          <nav className="text-[13px] font-semibold text-beyond-charcoal/80 flex items-center gap-5">
            <Link href="/" className="beyond-link hover:text-beyond-charcoal">
              Shop
            </Link>
            <Link href="/journal" className="text-beyond-charcoal">
              Journal
            </Link>
            <Link href="/policies" className="beyond-link hover:text-beyond-charcoal">
              Policies
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <div className="beyond-kicker justify-center mb-3">Journal</div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold beyond-ornament">
            Notes on <span className="beyond-gold-gradient">gifting well</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-beyond-charcoal/75 max-w-2xl mx-auto">
            Short, practical reads on choosing UAE gifts, running a corporate gift programme,
            and the meaning behind our most-requested pieces. Published in English and Arabic.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {JOURNAL.map((post) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="beyond-lift group rounded-3xl overflow-hidden border border-beyond-line bg-white beyond-shadow hover:beyond-shadow-lg block"
            >
              <div className="relative">
                <ProductTile variant={post.coverVariant as Variant} />
                <span className="absolute top-3 end-3 text-[10px] font-semibold px-2 py-1 rounded-full bg-beyond-charcoal text-beyond-ivory uppercase tracking-wider">
                  {post.category}
                </span>
              </div>
              <div className="p-5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-beyond-gold">
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {"  ·  "}
                  {post.readMinutes} min read
                </div>
                <h2 className="mt-2 font-display text-[20px] font-semibold text-beyond-charcoal group-hover:text-beyond-gold transition-colors">
                  {post.titleEn}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-beyond-charcoal/70 line-clamp-3">
                  {post.excerptEn}
                </p>
                <div className="mt-4 text-[12.5px] font-semibold text-beyond-gold beyond-link inline-block">
                  Read the guide
                </div>
              </div>
            </Link>
          ))}
        </div>
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
