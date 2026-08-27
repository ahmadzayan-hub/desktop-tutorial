# Release Readiness Report — Lahza

**Date:** 2026-08-27  
**Branch:** `claude/saas-platform-architecture-8AvmZ`  
**Status:** 🟡 NOT READY — pre-launch blockers outstanding

---

## Gate Summary

| Gate | Criteria | Status |
|------|----------|--------|
| A — Build | 0 TS errors, 0 ESLint errors, clean prod build | ✅ PASS |
| B — Security | 0 high/critical npm vulns; no hardcoded secrets | ✅ PASS |
| C — i18n | All user-visible strings in both EN and AR | ✅ PASS |
| D — Data integrity | Order refs consistent; no TODO values in UI | 🟡 PARTIAL |
| E — Content safety | Image moderation active | ❌ FAIL |
| F — Legal identity | Real licence number, TRN, phone in brand.ts | ❌ FAIL |
| G — Admin auth | `/console` gated before production | ❌ FAIL |

---

## Gate A — Build ✅

- TypeScript errors: **0**
- ESLint errors: **0**
- Production build: **✓ 4.95 s**
- All routes load without runtime errors (verified locally)

---

## Gate B — Security ✅

- npm audit high: **0** (nanoid + postcss fixed via `npm audit fix`)
- npm audit moderate: **2** (react-router upstream open-redirect; not exploitable in current routing pattern but should be tracked)
- No API keys, tokens, or secrets committed to the repository
- WhatsApp order data never reaches a server (URL-based hand-off — privacy by design)
- PDPL photo consent enforced before upload in the customise flow

**Remaining moderate vulns (react-router):** upgrade to react-router v7 is a breaking change; recommend evaluating during next sprint.

---

## Gate C — i18n ✅

All previously missing keys have been added and verified:

| Key | EN | AR |
|-----|----|----|
| `notFound.title` | "Page not found" | "الصفحة غير موجودة" |
| `notFound.body` | "Sorry, we couldn't find that page." | "عذراً، لم نتمكن من العثور على هذه الصفحة." |
| `common.close` | "Close" | "إغلاق" |
| `common.skipToContent` | "Skip to main content" | "انتقل إلى المحتوى الرئيسي" |
| `common.pleaseConfirm` | "⚠︎ please confirm" | "⚠︎ يرجى التأكيد" |
| `nav.primaryNav` | "Primary navigation" | "التنقل الرئيسي" |
| `nav.mobileNav` | "Mobile navigation" | "قائمة الجوال" |

`Dict` structural type enforces parity at compile time — missing key = TS error.

---

## Gate D — Data Integrity 🟡

**Fixed:**
- Order ref prefix standardised to `LHZ-` in all demo data

**Outstanding:**
- `src/lib/brand.ts` contains placeholder `TODO` values (see Gate F)
- `sellerValueSet()` guard prevents order CTA when any field is TODO — correctly blocks checkout, but footer may still display placeholder values

---

## Gate E — Content Safety ❌

`src/lib/ai.ts` — `moderateImage()` **fails open** when `VITE_AI_ENDPOINT` is not set:

```typescript
// current behaviour — risk:
if (!endpoint) return { approved: true }; // every image passes
```

**Required before launch:**
- Either always deploy with a real moderation endpoint, OR
- Change the default to fail-closed (`return { approved: false, reason: "moderation unavailable" }`)

Recommend fail-closed default with a clear user message: "Image review unavailable — please try again shortly."

---

## Gate F — Legal Identity ❌

`src/lib/brand.ts` must be updated with real values:

```typescript
licenseNumber: "TODO-XXXXXX",       // → real UAE trade licence (6 digits)
trn:           "TODO-15-DIGIT-TRN", // → real 15-digit VAT TRN
phone:         "+971 4 000 0000",   // → real support landline
whatsapp:      "971500000000",      // → real WhatsApp Business number
```

These are business registration details — the engineering team cannot supply them. Action owner: **founder / operations**.

---

## Gate G — Admin Authentication ❌

`/console` is publicly accessible with no login requirement. It currently shows only demo data, but:

- In production, this route would expose real order data
- Must be gated behind at minimum a Supabase Auth session check before go-live

**Options:**
1. Supabase Auth with email/magic link (recommended — already a dependency target)
2. HTTP Basic Auth at the hosting layer (simpler short-term)
3. IP allowlist at CDN/reverse-proxy level

---

## Recommended Pre-Launch Checklist

```
[ ] Update brand.ts — real licence, TRN, phone, WhatsApp
[ ] Set VITE_AI_ENDPOINT (or flip moderateImage to fail-closed)
[ ] Gate /console with authentication
[ ] Add skip-to-content <a> in Layout.tsx (i18n key already added)
[ ] Run WCAG AA colour contrast audit on brand palette
[ ] Test RTL layout on real Arabic device (Safari iOS)
[ ] Evaluate react-router v7 upgrade (moderate security advisory)
[ ] Set up hosting: HTTPS, CDN, custom domain, redirects
[ ] Configure CSP headers at hosting layer
[ ] Add Google Search Console / sitemap.xml
[ ] Set real GA/analytics token in env
[ ] Smoke-test WhatsApp hand-off with real number
[ ] Legal review of Privacy Policy for PDPL compliance
```

---

_Update this report before each release candidate. All gates A–G must be green before public launch._
