# Security & Responsible AI Assessment — Lahza

**Date:** 2026-08-27  
**Scope:** `src/` codebase + `public/` assets + npm dependency tree

---

## 1. Dependency Vulnerabilities

### Resolved
| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| `nanoid` | High | Predictable ID generation in older versions | `npm audit fix` — upgraded |
| `postcss` | High | Path traversal in CSS parsing | `npm audit fix` — upgraded |

### Outstanding
| Package | Severity | Issue | Recommendation |
|---------|----------|-------|---------------|
| `react-router-dom` | Moderate | Open redirect via manipulated `to` prop | Upgrade to v7 (breaking); review redirect surfaces; low exploitability in this app's routing pattern |

---

## 2. Secrets & Credentials

| Check | Result |
|-------|--------|
| API keys in source | None found |
| Tokens in source | None found |
| `.env` committed | Not present |
| `VITE_AI_ENDPOINT` | Env-var only; not in source |
| WhatsApp number | Placeholder in brand.ts (`TODO`) — not a real credential |

**Note:** VITE_ prefixed env vars are inlined at build time and visible in the browser bundle. Do not place secret keys in VITE_ vars — they are public.

---

## 3. Client-Side Data Handling

Lahza is a fully client-side SPA. There is no server, no database, and no API in the current implementation.

| Data type | Where stored | Risk |
|-----------|-------------|------|
| Uploaded photo | Browser memory (FileReader) | Lost on page refresh — by design |
| Order details | Built into WhatsApp URL | Sent to user's own WhatsApp; no server storage |
| Language preference | `localStorage` key `bcm.lang` | Low — not sensitive |
| Admin demo data | Hardcoded in `demoData.ts` | No real data; safe |

**PDPL (UAE Personal Data Protection Law):** Photo upload requires explicit consent in the customise flow. Consent is collected before the `<input type="file">` is presented. Photo is never transmitted to any server in the default (offline) configuration.

---

## 4. Content Security

### Image Moderation

`src/lib/ai.ts → moderateImage()`:

**Current behaviour (offline/no endpoint):**
```
Every uploaded image is approved automatically.
```

**Risk:** Users could upload inappropriate content that appears in the final product preview and is shared via WhatsApp without any review.

**Recommendation:** Flip default to fail-closed:
```typescript
if (!endpoint) return { approved: false, reason: "moderation unavailable" };
```

### Admin Console

`/console` has no authentication. In the current state it displays only hardcoded demo data (`demoData.ts`). If connected to a real backend, this becomes a critical vulnerability.

**Recommendation:** Add Supabase Auth session check as a route guard before any production data connection.

---

## 5. Cross-Site Scripting (XSS)

React's JSX escapes all interpolated values by default. No `dangerouslySetInnerHTML` was found in the codebase. The WhatsApp URL builder (`waLink()`) uses `encodeURIComponent()` on user-supplied values.

**Status: Low risk** in current implementation.

---

## 6. Responsible AI Assessment

### AI Features in Scope

| Feature | Function | Model dependency |
|---------|----------|-----------------|
| Arabic name suggestion | `suggestArabicName(latinName)` | Optional external endpoint |
| Image content moderation | `moderateImage(dataUrl)` | Optional external endpoint |
| Gift caption generation | `generateCaption(context)` | Optional external endpoint |

### Principles Assessment

| Principle | Assessment |
|-----------|-----------|
| **Transparency** | Users see the AI suggestion inline with a "⚠︎ please confirm" flag when confidence is low. They can ignore or override the suggestion. |
| **Human oversight** | Final name confirmation is always manual. AI suggestion is non-binding. |
| **Fail-safe defaults** | Name suggestion and caption generation fail gracefully (return deterministic fallback). Moderation fails open — **must be fixed** (see §4). |
| **Data minimisation** | Photos are processed client-side; only transmitted to the AI endpoint if configured and only for the moderation call. |
| **Bias / fairness** | Arabic name transliteration heuristics may favour certain regional dialects. No formal bias evaluation has been conducted. |
| **UAE PDPL compliance** | Consent collected before photo upload. No personal data stored server-side in current implementation. |

### Recommendations

1. **Flip moderation to fail-closed** — highest priority responsible AI action
2. **Log AI rejections** — when moderation rejects an image, log (without the image) so patterns can be monitored
3. **User appeal path** — if moderation rejects, offer the user a "Contact us" link rather than a dead end
4. **Bias evaluation** — commission an Arabic-English name transliteration review with native speakers from multiple Gulf dialects before relying on the AI suggestion in production
5. **Provider selection** — if using a third-party AI endpoint, ensure provider's data processing agreement is compatible with UAE PDPL

---

## 7. Hosting & Infrastructure (Pre-deployment)

The following controls are not yet in place (no deployment exists):

| Control | Status | Action |
|---------|--------|--------|
| HTTPS | Not configured | Required — use any CDN with TLS termination |
| Content Security Policy headers | Not configured | Add at hosting layer |
| HSTS | Not configured | Enable after HTTPS confirmed |
| Rate limiting | Not applicable (client-side SPA) | N/A |
| DDoS protection | Not configured | CDN-level protection recommended |

---

_This document should be reviewed and updated before each release and whenever a new external service is connected._
