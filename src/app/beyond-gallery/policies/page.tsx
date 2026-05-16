import Link from "next/link";
import "../brand.css";

export const metadata = {
  title: "Policies — Beyond Gallery by Beyond Jewellery",
  description:
    "Privacy Policy, Terms and Conditions, Return and Exchange Policy and Shipping Policy for Beyond Gallery by Beyond Jewellery, operated by BEYOND CONNECT GENERAL TRADING L.L.C, Dubai.",
};

const SECTIONS = [
  {
    id: "privacy",
    title: "Privacy Policy",
    body: [
      "We collect only the information needed to process orders and respond to quotation requests. This includes your name, mobile number, email, delivery emirate and any details you choose to share through WhatsApp or our forms.",
      "We do not sell personal information. Your data is used solely to confirm orders, share product details, prepare quotations and provide support before and after purchase.",
      "Marketing communications such as catalogue WhatsApp messages are sent only when you have opted in. You can ask us to remove your details at any time by replying STOP on WhatsApp or emailing hello@beyondgallery.ae.",
    ],
  },
  {
    id: "terms",
    title: "Terms and Conditions",
    body: [
      "Beyond Gallery by Beyond Jewellery is operated by BEYOND CONNECT GENERAL TRADING L.L.C, Dubai, United Arab Emirates, Trade License No. 1498624.",
      "Product prices are shown in AED. Availability, customisation, branding, packaging, lead time and delivery are confirmed before order completion.",
      "Bulk and supply pricing is offered through formal quotation only and depends on quantity, branding, stock and delivery location.",
      "We reserve the right to update product specifications, photos and descriptions to reflect supplier and stock changes.",
    ],
  },
  {
    id: "returns",
    title: "Return and Exchange Policy",
    body: [
      "Eligible retail items can be returned or exchanged within 7 days of delivery provided the item is unused and in its original packaging.",
      "Personalised, customised, branded and bulk-prepared items are non-returnable unless damaged or incorrect on arrival.",
      "If your item arrives damaged or different from what was confirmed, please contact us on WhatsApp within 48 hours of delivery with photos so we can resolve quickly.",
    ],
  },
  {
    id: "shipping",
    title: "Shipping Policy",
    body: [
      "We deliver across all seven Emirates of the UAE through trusted courier partners. Delivery options and fees are confirmed before order completion.",
      "Standard retail orders typically arrive within 1–4 working days. Personalised, customised and bulk corporate orders require additional preparation time and have a separate timeline shared upon confirmation.",
      "Supply desk and B2B orders are coordinated according to feasibility, supplier confirmation and delivery location.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <div className="bg-beyond-ivory text-beyond-charcoal font-bg-body min-h-screen">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap"
      />
      <header className="bg-beyond-white border-b border-beyond-line sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/beyond-gallery" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-beyond-navy flex items-center justify-center">
              <span className="font-display font-bold text-beyond-gold">B</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-[16px] font-semibold">
                Beyond <span className="beyond-gold-gradient">Gallery</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-beyond-charcoal/60">
                by Beyond Jewellery
              </div>
            </div>
          </Link>
          <Link
            href="/beyond-gallery"
            className="text-[13px] font-semibold text-beyond-gold hover:underline"
          >
            ← Back to store
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16 grid lg:grid-cols-[220px_1fr] gap-10">
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="beyond-divider mb-3">Policies</div>
          <nav className="flex flex-col gap-2">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="font-display text-[15px] text-beyond-charcoal hover:text-beyond-gold"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="space-y-10">
          {SECTIONS.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="rounded-3xl bg-white border border-beyond-line p-6 sm:p-8 beyond-card-shadow scroll-mt-24"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                {s.title}
              </h2>
              <div className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-beyond-charcoal/85">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="text-[12px] text-beyond-charcoal/60">
            Operated by BEYOND CONNECT GENERAL TRADING L.L.C, Dubai, UAE — Trade
            License No. 1498624 — General Trading.
          </div>
        </article>
      </main>
    </div>
  );
}
