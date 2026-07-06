# Deploying Beyond Style UAE as its own repo + Vercel project

The storefront lives in `beyond-style-uae/` inside this monorepo. To run it as a
standalone product on its own GitHub repository and Vercel project, follow these
steps once. They keep it fully separate from any other branch or app here.

## 1. Create a standalone repo from this subfolder

From the repo root:

```bash
# Copy just the app into a fresh folder
git subtree split --prefix=beyond-style-uae -b beyond-style-standalone
mkdir ../beyond-style-uae && cd ../beyond-style-uae
git init
git pull ../<this-repo> beyond-style-standalone
```

Or simply copy the `beyond-style-uae/` directory into a new empty repo. It is
self-contained: `package.json`, `vite.config.ts`, `vercel.json`, `public/`, and
`src/` are all here.

Then create the GitHub repo and push:

```bash
git remote add origin git@github.com:<you>/beyond-style-uae.git
git add -A && git commit -m "chore: standalone Beyond Style UAE storefront"
git push -u origin main
```

## 2. Import into Vercel

1. Vercel dashboard → **Add New… → Project** → import the new repo.
2. Framework preset: **Vite** (auto-detected via `vercel.json`).
3. Build command `npm run build`, output `dist` (already in `vercel.json`).
4. Add the environment variables from `.env.example` (Supabase/MySQL, Stripe,
   WhatsApp, analytics). The app boots without them and shows safe fallbacks.
5. Deploy. The SPA rewrite in `vercel.json` runs **after** the filesystem check,
   so `/sw.js`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml`, and the
   icons are served directly; only client routes fall back to `index.html`.

## 3. Progressive Web App (installable "Android app")

The app is a full PWA:

- `public/manifest.webmanifest` — standalone display, RTL/Arabic default,
  maskable icon, app shortcuts.
- `public/sw.js` — offline app shell (stale-while-revalidate; never caches
  `/api/*`), registered from `src/main.tsx` in production only.
- `src/components/InstallPrompt.tsx` — a tasteful in-app "Install app" button
  driven by `beforeinstallprompt`.

On Android Chrome, visitors get an **Add to Home Screen / Install** prompt and
the store opens full-screen like a native app. For a Play Store listing later,
wrap this PWA with a Trusted Web Activity (Bubblewrap) — no code changes needed.

## 4. SEO + AIO

- `index.html` carries title, description, canonical, hreflang (ar/en),
  Open Graph, Twitter, and `OnlineStore` + `WebSite` JSON-LD.
- Per-page titles/meta update on navigation via `src/lib/seo.ts`.
- `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` (an AI /
  answer-engine summary) are included.

> Note: `og.svg` is a vector share image. Some social scrapers prefer PNG/JPG —
> if you want perfect link previews on every platform, export `og.svg` to a
> 1200×630 PNG and point `og:image` / `twitter:image` at it.
