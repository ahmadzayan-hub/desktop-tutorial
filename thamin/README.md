# Beyond Style UAE — Smart Pricing Brain

Bilingual (العربية / English) pricing platform for jewelry, accessories and customized items:
transparent cost formulas, margin protection, AI photo estimation, customer quotations,
supplier & material management, dashboards, alerts and a full audit trail.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma (SQLite → Postgres/Supabase) · PWA · open-source LLMs via any OpenAI-compatible endpoint.

---

## Quick start (2 minutes)

```bash
cd thamin
npm install
cp .env.example .env          # set AUTH_SECRET (openssl rand -hex 32)
npm run setup                 # prisma generate + db push + seed
npm run dev                   # http://localhost:3000
```

**Demo logins** (change after first use):

| Role | Email | Password | Can do |
| --- | --- | --- | --- |
| Admin | admin@beyondstyle.ae | Admin@123 | Everything + edit rules + below-cost override |
| Manager | manager@beyondstyle.ae | Manager@123 | Approve/reject prices, edit rates & suppliers |
| Sales | sales@beyondstyle.ae | Sales@123 | Calculate prices, create quotes (no override) |
| Viewer | viewer@beyondstyle.ae | Viewer@123 | Read-only |

```bash
npm test        # 17 pricing-engine + AI-guardrail test cases
npm run build   # production build
```

---

## What's inside

| Module | Where |
| --- | --- |
| Pricing formula engine (single source of truth) | `src/lib/pricing/engine.ts` |
| Business rules (VAT, margins, fees, rounding ladder) | `/settings` · `BusinessRules` table |
| Calculator — Quick Quote / Advanced Costing / AI Photo | `/calculator` |
| AI layer (open-source LLM orchestration) | `src/lib/ai/` |
| Material library with stale-rate alerts | `/materials` |
| Supplier database + quotes | `/suppliers` |
| Product costing sheets + approval workflow | `/products` |
| Customer quotations (AR/EN, WhatsApp, Instagram, print/PDF) | `/quotes`, public view `/q/<token>` |
| Dashboard + alerts + channel performance | `/dashboard` |
| Price history / audit log | `/history` · `PriceCalculation`, `AuditLog` tables |
| Pricing assistant chat | `/brain` |
| Customer message templates + loyalty codes | `/templates` |
| Android app install page (PWA) | `/install` (public) |

## The pricing formula (transparent)

Every price passes through `computePrice()` — AI never sets a price directly.

```
Base Cost = Material (rate × grams) + Supplier×FX + Making + Plating + Chain
          + Clasp + Pendant + Stone + Engraving + Customization + Packaging
          + Gift box + Delivery + Marketing + Operations + Channel ads + Other
          + COD fixed fee

Payment fee is % of the selling price, so the ex-VAT price is solved:
  netPrice = BaseCost × (1 + margin) / (1 − feePct × (1 + margin))

VAT 5%:  EXCLUSIVE → customer price = netPrice × 1.05
         INCLUSIVE → customer price shows VAT inside; margin still protected ex-VAT

Also computed: minimum safe price (min margin), break-even, wholesale,
premium retail, buy-2 / buy-3 bundles (floored at n × minimum safe),
UAE psychological rounding (79/99/149/199/249…) never below the safe floor.
```

Margin protection: below target → warning · below minimum → critical (manager approval) ·
below cost → **blocked** unless an Admin overrides with a reason (audited + alerted).

### Sample calculation (seeded silver necklace)

Silver 925, 8 g × 4.2 AED + making 25 + engraving 15 + packaging 10 + delivery 25
+ marketing 5 + operations 50 = **163.60 AED** base → 40% margin + 2.5% card fee
→ net 235.60 AED → +5% VAT → **247.38 AED** → rounded customer price **249 AED**,
minimum safe **214.83 AED**, expected profit ≈ 65 AED. (Run it in `/calculator` to
see the full trace.)

## AI architecture (open-source LLMs)

The AI layer speaks the **OpenAI chat-completions protocol**, so it runs on any
open-source model server — no vendor lock-in:

| Deployment | `AI_BASE_URL` | Recommended models |
| --- | --- | --- |
| Local (free) | `http://localhost:11434/v1` (Ollama) | `llama3.1:8b` text · `qwen2.5vl:7b` vision |
| Hosted OSS | Groq / Together / Fireworks / OpenRouter | Llama 3.3 70B text · Qwen 2.5-VL 72B vision |
| Self-hosted GPU | vLLM / LM Studio | Qwen 2.5 72B · Llama 3.x |

Design (see `src/lib/ai/`):

- **Orchestration** — `brain.ts` runs a goal-driven agent loop (plan → tool call →
  observe → loop, max 6 steps) with tools: `get_business_rules`, `get_material_rates`,
  `compute_price`, `find_product`, `recent_calculations`.
- **Grounding guardrail** — every AED figure must come from the `compute_price` tool
  (the deterministic engine). Un-grounded price answers get flagged automatically.
- **Memory** — conversations persist in `BrainConversation`/`BrainMessage` and are
  replayed each turn.
- **Structured extraction + looping** — `extractJson()` validates model JSON with zod
  and feeds parse errors back for retry (self-repair loop).
- **Vision guardrails** — `vision.ts` never confirms material/karat/weight from a photo:
  a post-processor scrubs hallucinated "18K"/"5 grams" claims, forces an
  "unverified" label on material candidates, always returns confidence (HIGH/MEDIUM/LOW)
  and the list of missing inputs to ask the user.
- **Graceful degradation** — without `AI_BASE_URL` the whole app still works;
  AI endpoints return a clear 503 with setup instructions.

## Deployment

### Vercel + Supabase (recommended)

1. In `prisma/schema.prisma` change `provider = "sqlite"` → `"postgresql"`.
2. Create a Supabase project; set `DATABASE_URL` to its Postgres connection string.
3. `npx prisma db push && npm run db:seed` (once, from your machine or CI).
4. Import this repo into Vercel with **Root Directory = `thamin`**.
5. Environment variables: `DATABASE_URL`, `AUTH_SECRET`, and optionally
   `AI_BASE_URL`, `AI_API_KEY`, `AI_TEXT_MODEL`, `AI_VISION_MODEL`.
6. Open `/install` on Android for one-tap app installation (PWA). For a Google Play
   release see `docs/ANDROID.md` (TWA wrapper via Bubblewrap).
7. Set `NEXT_PUBLIC_SITE_URL` to your deployed domain so SEO metadata, the sitemap
   and Open Graph tags point to the right host.

Note: image uploads are stored base64 in the DB for simplicity; move to Supabase
Storage/S3 for heavy production use (the `Attachment` model is ready).

### Environment variables

See `.env.example` — includes placeholders for future integrations
(metal price API, exchange rates, WhatsApp Business, Ziina).

## Future-ready integrations

Clean seams already in place: manual material rates carry `source`/`updatedAt` and a
stale-rate alert, so a metal-price API can write the same table; channels
(Instagram/WhatsApp/TikTok/Noon/website/corporate/marketplace) are DB rows with their own
commission/ads/fee/margin; quotes have `publicToken` links + payment-link placeholder for
Ziina; CSV export exists for Sheets; the `Attachment` model handles invoices/certificates.

## Security

- HMAC-signed httpOnly session cookies (7-day expiry), bcrypt password hashing.
- Route middleware + per-API role checks (`requireRole`), role hierarchy
  VIEWER < SALES < MANAGER < ADMIN.
- Sales cannot use admin override (server-side enforced), viewers are read-only.
- Customer quote view (`/q/<token>`) exposes price only — never cost, margin or supplier.
- Every rate change, approval, override and rule edit is written to `AuditLog`.

## SEO and AI discoverability

- Bilingual metadata with Open Graph, Twitter cards and JSON-LD (`SoftwareApplication`).
- `robots.txt` indexes only the public pages (home, login, install) and blocks
  internal tools and customer quote links.
- `sitemap.xml` generated by the app; `llms.txt` describes the platform for AI
  crawlers and assistants.
- Arabic is written in correct, natural Modern Standard Arabic and rendered with an
  Arabic-first font stack; numerals stay left-to-right inside RTL text.
