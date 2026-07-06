import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JOURNAL, getPost } from "../../../data/journal";
import { PRODUCTS } from "../../../data/products";
import Logo from "../../_components/Logo";
import ProductTile from "../../_components/ProductTile";
import type { Variant } from "../../_components/ProductTile";

const SITE = "https://beyondgallery.ae";
const WA = "https://wa.me/971551556991";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return JOURNAL.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: "Journal" };
  return {
    title: post.titleEn,
    description: post.excerptEn,
    alternates: {
      canonical: `${SITE}/journal/${post.slug}`,
      languages: {
        "en-AE": `${SITE}/journal/${post.slug}`,
        "ar-AE": `${SITE}/journal/${post.slug}?lang=ar`,
      },
    },
    openGraph: {
      type: "article",
      url: `${SITE}/journal/${post.slug}`,
      title: post.titleEn,
      description: post.excerptEn,
      publishedTime: post.publishedAt,
      authors: ["Beyond Gallery"],
      tags: [post.category, "UAE", "gifting", "Beyond Gallery"],
    },
  };
}

// Very small paragraph and heading renderer: markdown-lite.
// Each blank line separates a paragraph. Lines starting with "## " are
// H2. Lines starting with "- " are list items. Bold uses **markers**.
function renderBody(body: string) {
  const blocks = body.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 mb-3 font-display text-[22px] font-semibold text-beyond-charcoal">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("- ")) {
      const items = trimmed.split(/\n/).map((l) => l.replace(/^-\s+/, ""));
      return (
        <ul key={i} className="my-4 list-disc ps-6 space-y-1.5 text-[15px] leading-relaxed text-beyond-charcoal/85 marker:text-beyond-gold">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="my-3 text-[15px] leading-relaxed text-beyond-charcoal/85">
        {renderInline(trimmed)}
      </p>
    );
  });
}

// Inline formatter: turn **bold** into <strong>. Safe on server render.
function renderInline(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-beyond-charcoal">
        {p}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export default function PostPage({ params }: Params) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const related = post.relatedProductIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));

  const dateStr = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.titleEn,
    description: post.excerptEn,
    inLanguage: ["en-AE", "ar-AE"],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    articleSection: post.category,
    author: { "@type": "Organization", name: "Beyond Gallery" },
    publisher: {
      "@type": "Organization",
      name: "Beyond Gallery by Beyond Jewellery",
      logo: { "@type": "ImageObject", url: `${SITE}/icon` },
    },
    mainEntityOfPage: `${SITE}/journal/${post.slug}`,
  };

  return (
    <div className="bg-beyond-ivory text-beyond-charcoal min-h-screen">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=Inter:wght@400;500;600;700&family=Alexandria:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <header className="sticky top-0 z-30 bg-beyond-ivory/95 backdrop-blur border-b border-beyond-line">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="beyond-focus rounded-xl" aria-label="Beyond Gallery, home">
            <Logo size="sm" lang="en" showSub={false} />
          </Link>
          <nav className="text-[13px] font-semibold text-beyond-charcoal/80 flex items-center gap-5">
            <Link href="/journal" className="beyond-link hover:text-beyond-charcoal">
              Journal
            </Link>
            <Link href="/" className="beyond-link hover:text-beyond-charcoal">
              Shop
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-beyond-line">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-beyond-gold">
            {post.category}
            {"  ·  "}
            {dateStr}
            {"  ·  "}
            {post.readMinutes} min read
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold leading-tight beyond-ornament">
            {post.titleEn}
          </h1>
          <p className="mt-4 text-[16.5px] leading-relaxed text-beyond-charcoal/75 max-w-2xl">
            {post.excerptEn}
          </p>
        </div>
      </div>

      {/* Cover */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="rounded-3xl overflow-hidden border border-beyond-line bg-white beyond-shadow max-w-md">
          <ProductTile variant={post.coverVariant as Variant} />
        </div>
      </div>

      {/* Body — English first, then Arabic below in a bordered section */}
      <article className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div>{renderBody(post.bodyEn)}</div>

        <hr className="my-14 border-beyond-line" />

        <div dir="rtl" className="font-arabic">
          <div className="beyond-kicker mb-3">النسخة العربية</div>
          <h2 className="font-arabic-display text-2xl sm:text-3xl font-semibold beyond-ornament">
            {post.titleAr}
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-beyond-charcoal/75">
            {post.excerptAr}
          </p>
          <div className="mt-6 [&_p]:font-arabic [&_h2]:font-arabic-display">
            {renderBody(post.bodyAr)}
          </div>
        </div>
      </article>

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-beyond-white border-y border-beyond-line">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
            <div className="beyond-kicker mb-3">Featured in this piece</div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-beyond-charcoal">
              Pieces mentioned above
            </h2>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="beyond-lift group rounded-2xl overflow-hidden border border-beyond-line bg-white beyond-shadow hover:beyond-shadow-lg"
                >
                  <ProductTile variant={p.variant} ribbon={p.ribbon} lang="en" />
                  <div className="p-3.5">
                    <div className="font-display text-[14.5px] font-semibold text-beyond-charcoal line-clamp-1">
                      {p.name}
                    </div>
                    <div className="mt-1 text-[12.5px] text-beyond-gold font-semibold">{p.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-4 py-14 text-center">
        <a
          href={WA}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-beyond-emerald text-white text-[14px] font-semibold hover:opacity-95"
        >
          Chat with our team on WhatsApp
        </a>
        <div className="mt-3 text-[12px] text-beyond-charcoal/60">
          Reply in under 10 minutes during 9am to 11pm UAE time.
        </div>
      </div>

      <footer className="border-t border-beyond-line bg-beyond-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-[12px] text-beyond-charcoal/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>Beyond Gallery. Operated by BEYOND CONNECT GENERAL TRADING L.L.C. Dubai, UAE.</div>
          <div className="flex items-center gap-4">
            <Link href="/journal" className="text-beyond-charcoal font-semibold beyond-link">
              More journal
            </Link>
            <Link href="/" className="text-beyond-charcoal font-semibold beyond-link">
              Back to store
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
