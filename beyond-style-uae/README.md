# Beyond Style UAE

Luxury bilingual (EN/AR) gold-tone plated fashion jewelry platform.

**Stack:** React 19 · TypeScript · Vite · Tailwind · Framer Motion · Hono · Drizzle ORM · MySQL

## Quick start

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, Cloudinary, analytics, WhatsApp
npm run db:push             # sync the Drizzle schema to MySQL
npm run server              # Hono API on :8787
npm run dev                 # Vite dev server on :5173 (proxies /api -> :8787)
```

The storefront runs against sample data if the API/DB is offline, so `npm run dev`
works standalone.

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` | Vite dev server |
| `server` | Hono API (tsx watch) |
| `build` | Typecheck + production build |
| `test` | Vitest unit tests |
| `db:push` / `db:generate` / `db:studio` | Drizzle Kit |

## Architecture

```
src/
├── api/            Hono server + COD/payment logic
│   ├── server.ts   Routes: products, orders, abandoned-cart
│   └── payment.ts  createOrder → COD forced to pending_verification + WhatsApp ping
├── components/     Header, ShippingBanner, ProductCard, JewelryCareBadge,
│                   Reviews, StickyAddToCart, JsonLd, motion helpers
├── context/        CartContext (200 AED free-shipping threshold)
├── db/             Drizzle schema + connection (MySQL)
├── hooks/          useAbandonedCart (20-min timer)
├── lib/            cloudinary (f_auto,q_auto), analytics (GA4+Pixel), i18n, shipping, api
├── pages/          Home, ProductDetail, Cart, Checkout, ThankYou (all React.lazy)
└── schemas/        product.ts — Zod compliance (.refine forbids "Real Gold"/"18k")
```

## Conversion & compliance highlights

- **Free shipping** — `lib/shipping.ts` + `ShippingBanner` show *"Add AED X to unlock Free Delivery"*.
- **COD trust** — `api/payment.ts` forces COD orders to `pending_verification` and fires a WhatsApp confirmation (logs as fallback without creds).
- **Abandoned cart** — `useAbandonedCart` starts a 20-minute recovery timer after each add.
- **Compliance** — Zod `.refine()` blocks "Real Gold", "18k", etc. and requires "Gold-tone plated".
- **Trust** — `JewelryCareBadge` + `Reviews` on every PDP; sticky mobile Add-to-Cart.
- **Performance** — Cloudinary `f_auto,q_auto`, font preload + `display=swap`, route code-splitting.
- **SEO** — JSON-LD `Product` / `Organization` structured data.
- **Analytics** — GA4 + Meta Pixel initialized in `main.tsx`.
```
