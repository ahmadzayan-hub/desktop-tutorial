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

## Deploy to Vercel (full stack)

The frontend (Vite SPA) and the API (Hono) deploy to the **same Vercel project**.
`api/[[...route]].ts` mounts the Hono app as a Node.js serverless function, so
`/api/*` is served on the same origin as the site.

1. **Point Vercel at the subfolder.** Project → Settings → Build & Deployment →
   **Root Directory** = `beyond-style-uae`. Vercel auto-detects Vite and reads
   `vercel.json` (output `dist`, SPA rewrite that excludes `/api/`).
2. **Provision a publicly reachable MySQL** (PlanetScale, Railway, Aiven, etc.)
   with SSL.
3. **Set Environment Variables** in Vercel (Production + Preview):

   | Variable | Notes |
   | --- | --- |
   | `DATABASE_URL` | `mysql://user:pass@host:3306/db?ssl={"rejectUnauthorized":true}` |
   | `VITE_CLOUDINARY_CLOUD_NAME` | image CDN |
   | `VITE_GA4_MEASUREMENT_ID`, `VITE_META_PIXEL_ID` | analytics |
   | `VITE_FREE_SHIPPING_THRESHOLD` | defaults to 200 |
   | `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `OPS_WHATSAPP_TO` | COD verification (server-only) |

   `VITE_*` vars are inlined into the client bundle at build time; the rest are
   read by the serverless function at runtime.
4. **Push the schema + seed** (run locally against the same `DATABASE_URL`):
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. **Redeploy.** `/api/health` should return `{"ok":true}` and the storefront
   renders the seeded catalogue.

> Serverless + MySQL: connections open lazily and the pool is reused across warm
> invocations. Under heavy cold-start churn consider a serverless-friendly driver
> (e.g. PlanetScale's HTTP driver) to avoid exhausting connection limits.

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
