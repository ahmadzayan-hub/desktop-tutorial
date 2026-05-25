# Beyond Style UAE — Project Overview

> Luxury bilingual (EN/AR) gold-tone plated fashion jewelry storefront for the UAE.
> This document is the high-level handoff: what was built, how it fits together,
> and what's needed to go live. For day-to-day commands see [`README.md`](./README.md).

---

## 1. At a glance

| | |
| --- | --- |
| **Product** | Direct-to-consumer jewelry store, mobile-first, EN/AR with RTL |
| **Frontend** | React 19 · TypeScript · Vite · Tailwind · Framer Motion |
| **Backend** | Hono (serverless on Vercel + local Node) |
| **Data** | MySQL via Drizzle ORM |
| **Payments** | Cash on Delivery (WhatsApp-verified) + Stripe card checkout |
| **Hosting** | Single Vercel project — SPA + `/api/*` serverless functions |

---

## 2. Design system

- **Palette:** ink black `#0A0A0A` base, gold `#C9A96E` accent (+ light/dark stops).
- **Type:** Inter for UI; Alexandria for Arabic display (auto-swapped in RTL).
- **Gold gradient** utility for CTAs and borders; `hover-glow` + `fade-in-up`
  micro-interactions via Framer Motion.
- **Mobile-first**, with a sticky Add-to-Cart bar on product pages.

---

## 3. Feature map

### Storefront
- **Home** — animated product grid (sample data fallback when API is offline).
- **Product detail (PDP)** — gallery, compliant copy, `JewelryCareBadge`,
  `Reviews` (star ratings), sticky mobile Add-to-Cart, JSON-LD `Product`.
- **Cart** — quantity edits, live free-shipping progress.
- **Checkout** — address + emirate, COD or card, client + server Zod validation.
- **Thank-you** — payment-agnostic confirmation.

### Conversion & revenue engines
| Engine | Where | Behaviour |
| --- | --- | --- |
| Free shipping | `lib/shipping.ts`, `ShippingBanner` | 200 AED threshold, *"Add AED X to unlock Free Delivery"* + progress bar |
| COD trust | `api/payment.ts` | COD forced to `pending_verification` + WhatsApp ping (logs as fallback) |
| Abandoned cart | `hooks/useAbandonedCart.ts` | 20-minute recovery timer after each add |
| Compliance | `schemas/product.ts` | Zod `.refine()` blocks "Real Gold"/"18k"; requires "Gold-tone plated" |
| Trust elements | PDP | Care badge + reviews widget on every product |

### Payments
- **COD:** order saved `pending_verification`; ops confirm via WhatsApp before dispatch.
- **Card (Stripe):** hosted Checkout Session (no card data on our servers) →
  order `pending_payment` → client redirects → `/api/stripe/webhook` confirms on
  `checkout.session.completed`. Currency AED.

### Admin (`/admin`, `x-admin-token`)
- **Products:** create (compliance-validated), activate/deactivate.
- **Orders:** view newest-first; advance fulfilment
  `pending_verification → confirmed → dispatched → delivered` (or `cancelled`).

### Performance & SEO
- Cloudinary `f_auto,q_auto` + responsive `srcSet`, `dpr_auto`.
- Font preload + `display: swap`.
- Route-level `React.lazy` code splitting.
- GA4 + Meta Pixel funnel events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`).
- JSON-LD `Product` / `Organization` structured data.

---

## 4. Architecture

```
beyond-style-uae/
├── api/[[...route]].ts     Vercel serverless entry (Hono via hono/vercel)
├── scripts/stripe-smoke.ts Stripe test-mode smoke test
└── src/
    ├── api/
    │   ├── app.ts          Hono routes (shared by serverless + local server)
    │   ├── server.ts       Local Node bootstrap
    │   ├── payment.ts      createOrder → COD pending_verification + WhatsApp
    │   └── stripe.ts       Checkout Session builder
    ├── components/         Header, ShippingBanner, ProductCard, JewelryCareBadge,
    │                       Reviews, StickyAddToCart, JsonLd, motion helpers
    ├── context/CartContext.tsx   Cart state + 200 AED threshold
    ├── db/                 Drizzle schema, connection, seed
    ├── hooks/useAbandonedCart.ts
    ├── lib/                cloudinary, analytics, i18n, shipping, api, utils
    ├── pages/              Home, ProductDetail, Cart, Checkout, ThankYou, Admin
    └── schemas/product.ts  Zod validation (compliance, orders, status)
```

**Request flow (card order):**
`Checkout` → `POST /api/orders` → `createOrder` (DB, `pending_payment`) →
`createCheckoutSession` → client redirect to Stripe → payment →
`POST /api/stripe/webhook` → order `confirmed`.

---

## 5. Data model (MySQL)

- **products** — bilingual title/description, `priceAed`, `compareAtAed`,
  `material` (plated), `cloudinaryIds[]`, `stock`, `ratingAvg/Count`, `active`.
- **orders** — customer/phone/emirate/address, `paymentMethod` (cod|card),
  `status` (pending_payment | pending_verification | confirmed | dispatched |
  delivered | cancelled), totals, `items[]`, `stripeSessionId`, `verificationSentAt`.
- **reviews** — `productId`, `author`, `rating`, `body`.

---

## 6. Launch checklist

- [ ] **Vercel Root Directory** set to `beyond-style-uae` (auto-detects Vite).
- [ ] **MySQL** provisioned (publicly reachable, SSL) and `DATABASE_URL` set.
- [ ] `npm run db:push` then `npm run db:seed`.
- [ ] **Env vars** in Vercel (Production + Preview):
  - `DATABASE_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_GA4_MEASUREMENT_ID`,
    `VITE_META_PIXEL_ID`, `VITE_FREE_SHIPPING_THRESHOLD`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_BASE_URL`
  - `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `OPS_WHATSAPP_TO`
  - `ADMIN_TOKEN` (strong secret)
- [ ] **Stripe webhook** registered → `https://<domain>/api/stripe/webhook`
  (`checkout.session.completed`).
- [ ] `npm run stripe:smoke` passes with a `sk_test_` key.
- [ ] Real Cloudinary asset IDs uploaded and referenced on products.
- [ ] `/api/health` returns `{"ok":true,"stripe":true}`.
- [ ] Place a COD order and walk it through the admin Orders tab.

---

## 7. Known gaps / next steps

- **Auth:** admin is a single shared token — fine for one operator; add real auth
  + audit logging for a team.
- **Card capture path** is unverified end-to-end in CI (needs live test key + DB);
  smoke test covers session creation only.
- **No inventory decrement** on order placement yet.
- **Abandoned-cart** currently logs/beacons; wire to an email/WhatsApp sender.
- **Order admin** could gain detail view, search, and CSV export.
- **Tests** cover shipping + compliance units; add API integration + E2E coverage.

---

*Wishing Beyond Style UAE a successful and profitable launch.*
