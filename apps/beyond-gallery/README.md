# Beyond Gallery — Standalone Storefront

This is a self-contained Next.js 14 app for **Beyond Gallery by Beyond Jewellery**, the flagship storefront running on the **GiftMajlis** platform (UAE).

It is intentionally separated from the rest of the monorepo and is meant to be deployed as its **own Vercel project** so it has its own URL, its own build pipeline, and its own deployment protection settings — fully independent from the main `desktop-tutorial` project.

## Local development

```bash
cd apps/beyond-gallery
npm install
npm run dev   # http://localhost:3001
```

## Build

```bash
npm run build
npm run start
```

## Vercel deployment (one-time setup)

Create a new Vercel project pointed at this subfolder:

1. Vercel dashboard → **Add New… → Project**
2. Import the `ahmadzayan-hub/desktop-tutorial` repo
3. Set:
   - **Project name:** `beyond-gallery`
   - **Root Directory:** `apps/beyond-gallery`
   - **Framework Preset:** Next.js (auto-detected)
   - **Production Branch:** `main` (or whichever you launch from)
4. Under **Settings → Deployment Protection**, choose **Disabled** (or leave **Vercel Authentication** on if you want previews private — production will still be public if you turn protection off for production only)
5. Add the custom domain (e.g. `beyondgallery.ae`) under **Settings → Domains**

After that, every push to this folder triggers a Beyond Gallery deploy only — the main `desktop-tutorial` project is unaffected.

## Routes

| URL | File |
|---|---|
| `/` | `src/app/page.tsx` — full storefront landing |
| `/policies` | `src/app/policies/page.tsx` — Privacy, Terms, Returns, Shipping |
| `/opengraph-image` | `src/app/opengraph-image.tsx` — dynamic OG card (edge) |

## Brand

- Trade entity: BEYOND CONNECT GENERAL TRADING L.L.C
- Trade License: 1498624
- Email: info@beyondconnect.ae
- WhatsApp: +971 55 155 6991
- Instagram: @beyond.style.uae
- TikTok: @beyondstyleuae
