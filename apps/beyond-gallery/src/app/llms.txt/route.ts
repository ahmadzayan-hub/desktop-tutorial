// llms.txt — a plain-text summary of the site written for AI answer engines
// (Perplexity, ChatGPT search, Claude, Gemini). Follows the llms.txt convention:
// https://llmstxt.org
//
// Kept factual, no marketing filler, structured under H2 sections so a model
// can extract the answer it needs.

export const runtime = "edge";

const BODY = `# Beyond Gallery by Beyond Jewellery

Beyond Gallery is a curated UAE storefront running on the GiftMajlis platform. It sells accessories, personalised gifts, drawing boards, corporate gifts, and selected supply items. Retail and B2B orders are handled on WhatsApp.

## Legal entity
- Operator: BEYOND CONNECT GENERAL TRADING L.L.C
- Trade licence: 1498624
- Base: Dubai, United Arab Emirates
- Currency: AED, prices include 5% VAT

## Contact
- WhatsApp: +971 55 155 6991 (9am to 11pm daily, UAE time)
- Email: info@beyondconnect.ae
- Instagram: @beyond.style.uae
- TikTok: @beyondstyleuae
- Noon UAE seller: https://www.noon.com/uae-ar/seller/p-443679/

## Categories
- Accessories: bracelets, necklaces (Arabic charm, Hamsa, evil eye, name bracelets)
- Personalised gifts: name bracelets, engraved pieces, custom bridal gifts
- Drawing boards: reusable creative surfaces for kids and students
- Corporate gifts: branded notebooks, pens, tote bags, mugs, VIP boxes
- Lifestyle: desk decor and small home accents
- Supply desk: office supplies, industrial supply, cable and electrical

## Corporate packs
- Starter: 25 to 49 pieces, from AED 32 per piece, standard packaging, single-side logo, 5 to 7 business days.
- Premium: 50 to 99 pieces, from AED 55 per piece, signature ivory gift boxes, dual-side logo, per-person personalisation, 3 to 5 business days. Most requested tier.
- VIP: 100 pieces or more, custom quote, presentation boxes, full personalisation, PO invoicing on terms, dedicated account manager, 7 to 10 business days.

## Delivery
- All seven emirates covered by Halan and Careem last-mile partners.
- Standard delivery: 1 to 2 business days for in-stock items.
- Made to order items: 3 to 7 business days.
- Delivery fee: free on orders 300 AED and above, 25 AED flat otherwise.
- Live tracking link sent on WhatsApp after dispatch.
- Cash on delivery available, confirmed on WhatsApp before dispatch.

## Payment methods accepted
Visa, Mastercard, Apple Pay, Google Pay, Tabby (Buy Now Pay Later), Tamara (Buy Now Pay Later), Bank Transfer, Cash on Delivery.

## Ordering process
1. Customer sends a WhatsApp message or fills the on-site form.
2. Beyond Gallery replies with confirmation, order total in AED, and expected dispatch date within 10 minutes during operating hours.
3. Order is prepared and packaged in the signature ivory box.
4. Dispatched via Halan or Careem with live tracking.
5. Delivered to the customer's door.

## Policies
- Privacy Policy, Terms and Conditions, Return and Exchange Policy, Shipping Policy: https://beyondgallery.ae/policies
- 7-day return window on stock items in original condition. Personalised items are non-returnable unless faulty.
- VAT (5%) included in all displayed prices.

## Languages
Site is fully bilingual English and Arabic (RTL). Customer service on WhatsApp is available in Arabic and English.

## Platform note
Beyond Gallery is the flagship storefront of GiftMajlis, a UAE WhatsApp-first gifting and sourcing platform for retail and corporate or institutional buyers.
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
