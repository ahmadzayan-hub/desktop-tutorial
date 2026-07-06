import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct, relatedProducts } from "../../../data/products";
import Logo from "../../_components/Logo";
import ProductTile from "../../_components/ProductTile";

const SITE = "https://beyondgallery.ae";
const WA_BASE = "https://wa.me/971551556991";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const p = getProduct(params.slug);
  if (!p) return { title: "Product" };
  return {
    title: p.name,
    description: p.longDescriptionEn ?? p.benefit,
    alternates: {
      canonical: `${SITE}/product/${p.id}`,
      languages: {
        "en-AE": `${SITE}/product/${p.id}`,
        "ar-AE": `${SITE}/product/${p.id}?lang=ar`,
      },
    },
    openGraph: {
      type: "article",
      title: `${p.name} | Beyond Gallery`,
      description: p.longDescriptionEn ?? p.benefit,
      url: `${SITE}/product/${p.id}`,
    },
  };
}

function stockLabel(stock: string): { en: string; ar: string } {
  if (stock === "in") return { en: "In stock, ships within 24 hours", ar: "متوفر، يُشحن خلال 24 ساعة" };
  if (stock === "made_to_order")
    return { en: "Made to order", ar: "يُصنع عند الطلب" };
  return { en: "Bespoke, made for you", ar: "خاص، يُصنع خصيصاً لك" };
}

export default function ProductPage({ params }: Params) {
  const p = getProduct(params.slug);
  if (!p) notFound();

  const related = relatedProducts(p.id, 4);
  const stock = stockLabel(p.stock);

  const message =
    `Hello Beyond Gallery, I am interested in this product.\nProduct Name: ${p.name}\nPrice shown: ${p.price}\nQuantity: \nDelivery Emirate: \nCustomisation required: \nPlease confirm price and availability.`;
  const waHref = `${WA_BASE}?text=${encodeURIComponent(message)}`;

  // Product JSON-LD. Price is written as a numeric string extracted from
  // the AED string. If parsing fails we omit the offer block so we do not
  // ship an invalid rich result.
  const priceNumber = Number((p.price.match(/[\d.]+/) ?? [""])[0]);
  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.longDescriptionEn ?? p.benefit,
    sku: p.id,
    brand: { "@type": "Brand", name: "Beyond Gallery by Beyond Jewellery" },
    category: p.category,
    inLanguage: ["en-AE", "ar-AE"],
  };
  if (!Number.isNaN(priceNumber) && priceNumber > 0) {
    productLd.offers = {
      "@type": "Offer",
      priceCurrency: "AED",
      price: priceNumber,
      availability:
        p.stock === "in" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${SITE}/product/${p.id}`,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "BEYOND CONNECT GENERAL TRADING L.L.C",
      },
    };
  }

  return (
    <div className="bg-beyond-ivory text-beyond-charcoal min-h-screen">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=Inter:wght@400;500;600;700&family=Alexandria:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
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
            <Link href="/journal" className="beyond-link hover:text-beyond-charcoal">
              Journal
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="max-w-6xl mx-auto px-4 pt-5 text-[12px] text-beyond-charcoal/60" aria-label="Breadcrumb">
        <Link href="/" className="beyond-link hover:text-beyond-charcoal">
          Home
        </Link>
        {" / "}
        <Link href={`/#collections`} className="beyond-link hover:text-beyond-charcoal">
          {p.category.charAt(0).toUpperCase() + p.category.slice(1)}
        </Link>
        {" / "}
        <span className="text-beyond-charcoal">{p.name}</span>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 grid lg:grid-cols-2 gap-8 lg:gap-14">
        {/* Media */}
        <div className="rounded-3xl overflow-hidden border border-beyond-line bg-white beyond-shadow max-w-xl mx-auto lg:mx-0 w-full">
          <ProductTile variant={p.variant} ribbon={p.ribbon} lang="en" />
        </div>

        {/* Info */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-beyond-gold">
            {p.category}
          </div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold beyond-ornament">
            {p.name}
          </h1>
          <div className="mt-1 font-arabic-display text-lg text-beyond-charcoal/80" dir="rtl">
            {p.nameAr}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="font-display text-3xl font-semibold beyond-gold-gradient">{p.price}</div>
            <div className="text-[11.5px] text-beyond-charcoal/60">
              Inclusive of 5% VAT
              <div className="font-arabic" dir="rtl">
                شامل ضريبة القيمة المضافة 5%
              </div>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-beyond-ivory border border-beyond-line px-3 py-1.5 text-[12.5px]">
            <span className="w-2 h-2 rounded-full bg-beyond-emerald" />
            {stock.en}
            {p.leadDays && (
              <span className="ms-1 text-beyond-charcoal/60">, {p.leadDays}</span>
            )}
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-beyond-charcoal/85">
            {p.longDescriptionEn ?? p.benefit}
          </p>
          <p className="mt-3 font-arabic text-[15.5px] leading-relaxed text-beyond-charcoal/85" dir="rtl">
            {p.longDescriptionAr ?? p.benefitAr}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-beyond-emerald text-white text-[14px] font-semibold hover:opacity-95"
            >
              Order this on WhatsApp
            </a>
            <Link
              href="/#collections"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-beyond-line text-beyond-charcoal text-[14px] font-semibold hover:border-beyond-gold"
            >
              Browse more
            </Link>
          </div>

          {/* Attribute grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 text-[13px]">
            {p.materialsEn && (
              <div className="rounded-2xl bg-white border border-beyond-line p-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-beyond-gold mb-1">
                  Materials
                </div>
                <div className="text-beyond-charcoal/85">{p.materialsEn}</div>
                <div className="mt-1.5 font-arabic text-beyond-charcoal/80" dir="rtl">
                  {p.materialsAr}
                </div>
              </div>
            )}
            {p.careEn && (
              <div className="rounded-2xl bg-white border border-beyond-line p-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-beyond-gold mb-1">
                  Care
                </div>
                <div className="text-beyond-charcoal/85">{p.careEn}</div>
                <div className="mt-1.5 font-arabic text-beyond-charcoal/80" dir="rtl">
                  {p.careAr}
                </div>
              </div>
            )}
            {p.giftBoxEn && (
              <div className="rounded-2xl bg-white border border-beyond-line p-3.5 col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-beyond-gold mb-1">
                  Packaging
                </div>
                <div className="text-beyond-charcoal/85">{p.giftBoxEn}</div>
                <div className="mt-1.5 font-arabic text-beyond-charcoal/80" dir="rtl">
                  {p.giftBoxAr}
                </div>
              </div>
            )}
          </div>

          {/* Delivery summary */}
          <div className="mt-6 rounded-2xl bg-beyond-ivory border border-beyond-line p-4">
            <div className="text-[13px] font-semibold text-beyond-charcoal mb-1">Delivery</div>
            <div className="text-[12.5px] text-beyond-charcoal/75">
              Free on orders 300 AED and above, 25 AED flat otherwise. 1 to 2 business days across all
              seven emirates via Halan or Careem. Cash on delivery available.
            </div>
            <div className="mt-1.5 font-arabic text-[12.5px] text-beyond-charcoal/75" dir="rtl">
              مجاني للطلبات 300 درهم فأكثر، أو 25 درهم للطلبات الأقل. من يوم إلى يومين عمل في كل الإمارات
              السبع عبر شركاء التوصيل حلان وكريم. الدفع عند الاستلام متاح.
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-beyond-white border-t border-beyond-line">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
            <div className="beyond-kicker mb-3">Also from Beyond Gallery</div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-beyond-charcoal">
              You might also like
            </h2>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {related.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/product/${rp.id}`}
                  className="beyond-lift group rounded-2xl overflow-hidden border border-beyond-line bg-white beyond-shadow hover:beyond-shadow-lg"
                >
                  <ProductTile variant={rp.variant} ribbon={rp.ribbon} lang="en" />
                  <div className="p-3.5">
                    <div className="font-display text-[14.5px] font-semibold text-beyond-charcoal line-clamp-1">
                      {rp.name}
                    </div>
                    <div className="mt-1 text-[12.5px] text-beyond-gold font-semibold">{rp.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-beyond-line bg-beyond-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-[12px] text-beyond-charcoal/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>Beyond Gallery. Operated by BEYOND CONNECT GENERAL TRADING L.L.C. Dubai, UAE.</div>
          <div className="flex items-center gap-4">
            <Link href="/journal" className="text-beyond-charcoal font-semibold beyond-link">
              Journal
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
