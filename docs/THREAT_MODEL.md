# Threat Model — Lahza

Application- and environment-level threat model to surface security gaps early.
Method: asset inventory → trust boundaries → data-flow → **STRIDE** per element →
prioritised gaps → mitigations. Scope covers the **current** client-side app and
the **planned** production integrations (payments, photo storage, AI, WhatsApp,
admin), since most risk lives in what gets wired next.

> Status legend: ✅ in place · ⚠️ partial / gap · ⛔ missing (do before launch)

## 1. Assets to protect
| Asset | Why it matters |
| --- | --- |
| Customer photo uploads | Personal data (PDPL); may include children/biometrics |
| Order + contact details (name, phone, address, email) | Personal data; fraud target |
| Payment data | Handled by gateway, but flows/links must not leak |
| Corporate leads / quotations | Commercially sensitive |
| Admin console + operational data | Business integrity; must not be public |
| Brand + domain reputation | Phishing / defacement risk |
| VAT invoice data | Legally must be retained, unaltered, in-UAE |

## 2. Trust boundaries
```
[ User browser / PWA ]  --HTTPS-->  [ CDN static host (Vercel/Netlify) ]
        |                                   (serves static SPA only today)
        | (planned)                         
        +--HTTPS--> [ API / BFF ]  --> [ DB ]  [ Object storage (photos) ]
                        |  \--> [ Payment gateway (Telr/PayTabs, Tabby/Tamara) ]
                        |  \--> [ AI / moderation endpoint ]
                        \-----> [ WhatsApp BSP ]
```
Current build has **no backend**: it is a static SPA. All "server" boxes above
are planned. Each arrow crossing a box is a trust boundary and an attack surface.

## 3. STRIDE analysis (by element)

### 3.1 Client SPA (current)
| Threat | Assessment | Gap |
| --- | --- | --- |
| **S**poofing | No auth in client; `/console` is reachable by anyone | ⚠️ Console is demo-only but must be auth-gated before real data |
| **T**ampering | Static assets are hashed + immutable; SRI not set | ⚠️ Add `frame-ancestors`, CSP to blunt injected content |
| **R**epudiation | No client-side logging of consent events | ⚠️ Log PDPL consent server-side when backend lands |
| **I**nfo disclosure | No secrets in bundle (verified: only `VITE_*` public envs) | ✅ Keep all keys server-side |
| **D**oS | Static CDN absorbs load | ✅ |
| **E**oP | No privileged client operations | ✅ |

### 3.2 Photo upload + preview (current: 100% client-side)
- Photos never leave the device until checkout; preview/crop/enhance run in-canvas. ✅ good privacy default.
- `moderateImage()` **fails open** when no `VITE_AI_ENDPOINT` is set. ⛔ Real moderation must run server-side and **fail closed** before an order is accepted.
- No file-type/size enforcement beyond `accept`/UI. ⚠️ Validate MIME + magic bytes + size server-side; strip EXIF/GPS on upload.

### 3.3 Payments (planned)
- Never handle PAN in the SPA — use gateway-hosted fields / redirect / payment links. ⛔ requirement.
- Payment-link flow: verify amounts server-side; sign/verify webhook callbacks; idempotency keys. ⛔
- Enforce server-side price recomputation (never trust client totals). ⛔

### 3.4 Admin console (planned real version)
- Needs authentication + RBAC, server-side authorization on every action, audit log, and network/IP allow-listing. ⛔
- `robots.txt` disallows `/console` — that is **obscurity, not security**. ⚠️

### 3.5 AI / moderation endpoint (planned)
- Sends personal data (photos) off-device → must be HTTPS, authenticated, rate-limited, and covered by a DPIA + processor agreement (PDPL). ⛔
- Treat AI output as untrusted; keep human review for rejects (already designed). ✅ design intent.

### 3.6 WhatsApp deep links (current)
- `waLink()` uses `encodeURIComponent` on message text → no query injection. ✅
- Phone number is a constant, not user-controlled. ✅

## 4. Environment / deployment hardening
| Control | State | Action |
| --- | --- | --- |
| HTTPS everywhere | ✅ (Vercel/Netlify default) | — |
| Security headers (XFO, XCTO, Referrer-Policy, Permissions-Policy) | ✅ set in `vercel.json` | mirror in `netlify.toml` |
| **Content-Security-Policy** | ✅ added (this change) | tighten `connect-src` to the real API host at launch |
| Preview-deploy exposure | ⚠️ Vercel preview auth = ON (good); public previews would leak WIP | keep protection on non-prod |
| Secrets management | ✅ no secrets in repo/bundle | store gateway/WhatsApp/AI keys in host env, server-only |
| Dependency supply chain | ⚠️ | enable Dependabot + `npm audit` in CI; pin/lock (lockfile present) |
| Data residency (PDPL/FTA) | ⛔ (no backend yet) | host photos + invoices in a UAE region; lifecycle-delete source photos after fulfilment |
| Service worker | ✅ same-origin only, no opaque caching of APIs | scope `/`, never cache authenticated responses |

## 5. Prioritised gaps (fix order)
1. ⛔ **Server-side image moderation that fails closed** before accepting an order.
2. ⛔ **Real admin auth + RBAC + audit log** (never ship `/console` with live data unauthenticated).
3. ⛔ **Server-side price/amount validation** and **signed payment webhooks**.
4. ⛔ **UAE-region storage** + **auto-deletion** of source photos + **EXIF/GPS stripping** on upload.
5. ⚠️ **DPIA + processor agreements** for the AI/moderation vendor and cloud host (PDPL).
6. ⚠️ **CI security gates**: `npm audit`, Dependabot, secret scanning.
7. ⚠️ **Tighten CSP `connect-src`** to the exact API origin once the backend exists.

## 6. Security acceptance checklist (pre-launch)
- [ ] No secret ends up in the client bundle (`grep -r "SECRET\|_KEY" dist/` is clean).
- [ ] `/console` requires authentication and authorises every action server-side.
- [ ] Uploads validated (MIME + size + magic bytes), EXIF stripped, stored in-region, auto-deleted per retention.
- [ ] Payments via hosted fields/redirect; amounts recomputed server-side; webhooks signature-verified + idempotent.
- [ ] CSP present and `connect-src` limited to the real API; headers verified on prod.
- [ ] PDPL: consent recorded server-side; DPIA done; erasure/delete-my-photos flow works end-to-end.
- [ ] CI runs `npm audit` + secret scanning; Dependabot enabled.

_This document is a living artefact — revisit it whenever a new trust boundary
(backend, vendor, integration) is introduced._
