# Wisal — Privacy Data Flow (honest map)

> Rule: marketing copy may never claim more than this document proves.

## Personal Assistant mode (Android/Windows)

| Data | Where it lives | Ever leaves the device? |
|---|---|---|
| People (names, relations, numbers, notes, photos) | Device only (SharedPreferences/JSON, app-private) | ❌ Never uploaded. Optional user-initiated backup is a local text export (excludes secrets) |
| Message history, favorites, style learning | Device only (`store.json`, atomic writes) | ❌ |
| Groq API key | Android Keystore (EncryptedSharedPreferences) | ❌ Excluded from backups |
| Generation context (relation, name, notes, occasion, draft) | — | ⚠️ Sent to **Groq** only at the moment the user requests a suggestion; disclosed in onboarding + first-run AI dialog + website. Not stored by Wisal (we run no servers for personal mode) |
| Calendar/contacts reads | Device only, optional permissions | ❌ read locally, never uploaded |

## Business mode (opt-in, separate)

- Configured by the user with an explicit endpoint + key (`wisal-cloud-api`).
- Message + customer number transit the user's configured Vercel deployment → Meta WhatsApp Business Cloud API. Disclosed in the UI before use.
- Backend stores nothing (stateless functions); logs exclude message bodies except Meta's delivery metadata (`inbound from/type/id`, `status`). Webhook signature (HMAC-SHA256, timing-safe) prevents forged events; API key compare is timing-safe; best-effort rate limit.

## What we deliberately do NOT do

- No auto-send, no scheduled sends, no auto-replies, no bulk blast.
- No analytics/tracking SDKs in the app or website; website makes zero external requests.
- No contact-book upload. No account. No message-content push notifications (no push at all today).
- No "no servers" claims for anything that touches a server (business mode, future Direct relay).

## Future Direct mode (commitment)
When built: E2EE envelopes only on the relay, no plaintext in storage/logs (with automated leak tests), minimal metadata, neutral notifications («رسالة جديدة في وصال»). Until then, nothing in the product claims E2EE.
