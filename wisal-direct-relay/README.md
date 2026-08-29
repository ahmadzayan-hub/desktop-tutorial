# wisal-direct-relay

Store-and-forward relay for **Wisal Direct** — the future end-to-end
encrypted 1:1 messaging path described in
[`docs/decisions/ADR-002-e2ee-protocol.md`](../docs/decisions/ADR-002-e2ee-protocol.md).

This is **not** the WhatsApp Business relay (`../wisal-cloud-api`) and it is
**not** an E2EE protocol implementation. It is the dumb pipe in between:
devices register a public key, senders drop opaque encrypted envelopes,
recipients pick them up, and the server deletes an envelope the moment
delivery is confirmed. It never sees, stores, or logs plaintext — there is no
field in the schema for it.

## What this is not (read before extending)

- **Not encrypted messaging yet.** No client integrates a real E2EE backend
  (libsignal/vodozemac) against this relay yet — that's the next slice. Until
  that ships and passes the ADR-002 release gates, nothing in the product may
  call this "encrypted."
- **Not production storage.** `lib/store.js` is an in-memory Map, intentional
  for this slice's tests and local dev. On Vercel serverless it resets on
  every cold start, and — this bit is easy to underestimate — a cold start
  isn't rare here: **every route below is served by the same single
  function** (`api/relay.js`, see "One function, not four" below)
  specifically so a warm instance's in-memory state actually gets shared
  across a register→submit→fetch→ack sequence at all. Under concurrent
  traffic Vercel can still route requests to *different* warm instances of
  that one function, each with its own copy of the Map — so even this fix is
  a mitigation for the common case, not a guarantee. **Production blocker**:
  swap `lib/store.js` for a real datastore (Postgres) implementing the same
  interface (`getDevice`, `putDevice`, `putEnvelope`, `getEnvelope`,
  `deleteEnvelope`, `listEnvelopesFor`, `sweepExpired`,
  `hasSeenSubmissionSignature`, `recordSubmissionSignature`) before any real
  deployment.

## One function, not four

All four routes below are handled by a single file, `api/relay.js`, dispatched
by an `op` query param that `vercel.json`'s `rewrites` attach transparently
(`/api/devices` → `/api/relay?op=devices`, etc. — the public paths don't
change). This isn't a style choice: Vercel deploys every file directly under
`api/` as its own independent Serverless Function, each with its own process
and module cache. An earlier version of this relay had one file per route,
each `require`-ing the same `lib/sharedStore.js` — which looked like a shared
singleton in tests (same Node process) but, on a real multi-function
deployment, meant `/api/devices` and `/api/envelopes` never actually shared
state: a device registered on one was invisible to the other, and
`submitEnvelope` failed `sender not registered` on essentially every real
request. `test/http-dispatch.test.js` is the regression test for this —
it calls the exported handler with fresh, unrelated request/response objects
per step (mirroring separate real invocations) and asserts state carries over.

## Endpoints

All bodies are JSON. All mutating calls require a signature proving control
of the device's private key — the server never trusts a bare device id.

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/api/devices` | Register a device (id + public key) | signs `wisal-direct-register:{deviceId}` |
| POST | `/api/envelopes` | Submit an encrypted envelope for a recipient | signs `{sender}:{recipient}:{ciphertextB64}:{backend}:{expiresAt}` |
| GET | `/api/inbox?deviceId=&timestamp=&signatureB64=` | List envelopes addressed to you | signs `fetch:{deviceId}:{timestamp}` (±5min clock skew) |
| POST | `/api/ack` | Confirm delivery — deletes the envelope | signs `ack:{envelopeId}` |

`backend` is part of the signed envelope-submission proof deliberately: it's
the field that says which E2EE protocol produced the ciphertext, and this
project's central promise is never mislabeling encryption status. Without it
in the signature, a party on the network path (or a relay bug) could rewrite
that label without invalidating the signature. Envelope submission also
rejects an exact-signature replay (a captured, verbatim-resent submission)
and requires the recipient to already be a registered device.

Signatures are ECDSA-SHA256 over EC P-256 (`prime256v1`), public key as
X.509 SubjectPublicKeyInfo, base64-encoded — the same format
`android-wife-assistant`'s `DeviceIdentityCodec` produces, so an Android
client's identity keypair verifies here with no format conversion.

## Data retention

- An envelope's `expiresAtEpochSec` is capped at 14 days from submission.
- `GET /api/inbox` sweeps expired envelopes before returning results —
  nothing past-expiry is ever handed to a client.
- `POST /api/ack` deletes the envelope immediately on confirmed delivery.
  The server never keeps a copy "just in case."

## Why the logger throws instead of redacting

`lib/log.js` uses an allowlist, not a blocklist: only known-safe fields
(ids, timestamps, counts, error reasons) may be logged, and anything else —
including `ciphertextB64` — throws instead of silently logging. A blocklist
would need someone to remember to add every future content-bearing field; an
allowlist fails loud the first time code tries to log something it shouldn't,
which is what `test/plaintext-leak.test.js` exercises directly.

## Local development

```bash
cd wisal-direct-relay
npm install    # no runtime deps beyond Node's built-ins today
npm run check  # syntax
npm test       # pure logic tests, no server needed
```

To run the actual HTTP handlers locally, use the Vercel CLI (`vercel dev`)
from this directory — the handlers are standard `(req, res) => {}` Vercel
Node functions, same shape as `../wisal-cloud-api`.

## Deploy

New Vercel project, Root Directory = `wisal-direct-relay`. Set `DATABASE_URL`
once the storage layer is swapped from in-memory (see blocker above) — there
is no shared API key to configure; every client authenticates itself with its
own device signature.
