# Architecture — Lahza

**Last updated:** 2026-08-27

---

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Bundler | Vite | 5.4 |
| UI framework | React | 18.3 |
| Language | TypeScript | 5.6 |
| Styling | Tailwind CSS | 3.4 |
| Router | react-router-dom | 6.28 |
| Icons | lucide-react | 0.454 |
| Runtime target | Browser (ESM, no SSR) |  |

---

## Directory Structure

```
src/
  App.tsx               — Route tree; ErrorBoundary; Suspense
  main.tsx              — React root; I18nProvider; BrowserRouter
  components/
    Header.tsx          — Sticky nav; mobile slide-down menu
    Footer.tsx          — Links, legal, language toggle
    Layout.tsx          — Header + <Outlet> + Footer
    Seo.tsx             — <title> + <meta> updates
    BrandMark.tsx       — SVG logo
    LanguageToggle.tsx  — EN ⇄ AR button
    ProductPreview.tsx  — Live SVG mockup (cup/sleeve/box/card)
    ErrorBoundary.tsx   — Class component; catches unhandled render errors
    InstallPrompt.tsx   — PWA install; Android native + iOS instructions
    AnnouncementBar.tsx — Scrolling ticker
  pages/
    Home.tsx            — Eager (LCP route)
    Customize.tsx       — Lazy; orchestrates 7-step flow
    customize/steps.tsx — All 7 step components; AI name assistant
    Gallery.tsx         — Lazy
    Corporate.tsx       — Lazy
    Pricing.tsx         — Lazy
    HowItWorks.tsx      — Lazy
    Delivery.tsx        — Lazy
    Faq.tsx             — Lazy
    Contact.tsx         — Lazy
    Legal.tsx           — Lazy (3 named exports: Privacy, Terms, Refund)
    NotFound.tsx        — Lazy; fully i18n
    admin/Admin.tsx     — Lazy; standalone chrome (no Layout)
  i18n/
    en.ts               — Source-of-truth English dictionary (as const)
    ar.ts               — Arabic mirror; typed as Dict
    dict.ts             — Widen<typeof en> = Dict structural type
    I18nContext.tsx     — Provider; t(), raw(), pick(), toggleLang()
  lib/
    brand.ts            — Seller identity, VAT config, sellerValueSet()
    ai.ts               — AI feature façade (offline-first)
    whatsapp.ts         — waLink() order message builder
    id.ts               — LHZ- order reference generator
    demoData.ts         — Demo orders/leads for admin console
    orderMessage.ts     — WhatsApp message template
  hooks/ (if any)       — Custom React hooks
public/
  sw.js                 — Service worker (PWA cache)
  manifest.webmanifest  — PWA manifest
  icons/                — App icons
```

---

## Data Flow

```
User action
    │
    ▼
React component (useState / useReducer)
    │
    ├─── t("key") ──► I18nContext → en.ts / ar.ts
    │
    ├─── AI call ──► src/lib/ai.ts
    │                   │
    │                   ├── VITE_AI_ENDPOINT set? → fetch(endpoint)
    │                   └── unset? → deterministic offline result
    │
    └─── Order ──► src/lib/whatsapp.ts → window.open(waLink())
                       (no server, no payment gateway)
```

---

## i18n Architecture

The i18n system enforces structural parity between languages at compile time:

```typescript
// en.ts — source of truth
export const en = { nav: { home: "Home", ... }, ... } as const;

// dict.ts — widens as const to string (any value, same shape)
export type Dict = Widen<typeof en>;

// ar.ts — must satisfy Dict or TypeScript errors
export const ar: Dict = { nav: { home: "الرئيسية", ... }, ... };
```

`t(path, vars?)` supports dot-path lookup and `{var}` interpolation.  
`raw(path)` returns non-string nodes (arrays, objects) for FAQ items etc.  
`pick({ en, ar })` selects the correct string from an inline bilingual pair.

---

## Route Architecture

```
/                   → Home (eager)
/customize          → Customize (lazy) — 7-step flow
/gallery            → Gallery (lazy)
/corporate          → Corporate (lazy)
/pricing            → Pricing (lazy)
/how-it-works       → HowItWorks (lazy)
/delivery           → Delivery (lazy)
/faq                → Faq (lazy)
/contact            → Contact (lazy)
/privacy            → Privacy (lazy, named export from Legal)
/terms              → Terms (lazy, named export from Legal)
/refund             → Refund (lazy, named export from Legal)
/*                  → NotFound (lazy)

/console            → Admin (lazy, no Layout wrapper)
```

All lazy routes are wrapped in a single `<Suspense fallback={<Loader />}>` in `App.tsx`.  
A single `<ErrorBoundary>` wraps the entire tree above Suspense.

---

## PWA

- `public/sw.js` — cache-first strategy for static assets; network-first for navigation
- `public/manifest.webmanifest` — app name, icons, `display: standalone`, `dir: auto`
- `InstallPrompt.tsx` — detects `beforeinstallprompt` (Android) or `navigator.standalone === false` + Safari (iOS) and renders appropriate instructions
- No push notifications

---

## AI Feature Façade

`src/lib/ai.ts` provides three functions:

| Function | Online behaviour | Offline behaviour |
|----------|-----------------|-------------------|
| `suggestArabicName(latin)` | POST to `VITE_AI_ENDPOINT/suggest-name` | Returns heuristic transliteration |
| `moderateImage(dataUrl)` | POST to `VITE_AI_ENDPOINT/moderate` | **Fails open** — approves all images |
| `generateCaption(ctx)` | POST to `VITE_AI_ENDPOINT/caption` | Returns template string |

**Risk:** `moderateImage` failing open is a production content-safety risk. Requires either always-on endpoint or a fail-closed default.

---

## Pre-launch Blockers

These items in `src/lib/brand.ts` must be set before the site goes live:

```typescript
licenseNumber: "TODO-XXXXXX",       // UAE trade licence number
trn:           "TODO-15-DIGIT-TRN", // VAT Tax Registration Number
phone:         "+971 4 000 0000",   // real support line
whatsapp:      "971500000000",      // real WhatsApp number
```

`sellerValueSet()` returns `false` when any of these contain "TODO", blocking the order CTA.

---

_See `docs/PROJECT_AUDIT_BASELINE.md` for full quality metrics._
