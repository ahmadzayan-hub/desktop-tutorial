# ADR-002: E2EE protocol selection for Wisal Direct (Phase 3)

Date: 2026-08-13 · Status: **Accepted — owner decided: support both backends**

> **Owner decision (2026-08-13)**: keep both options open. The client is built
> against a protocol-agnostic `CryptoProvider` abstraction; the concrete
> backend is a build-variant choice:
> - **`signal` variant** → `libsignal` (AGPL-3.0). Distributing this build
>   requires releasing that build's client source under AGPL-compatible terms.
>   AGPL obligations attach per distributed build, not to the repository as a
>   whole.
> - **`vodozemac` variant** (default) → vodozemac (Apache-2.0), no copyleft
>   obligation.
> The relay never links protocol code, so it is identical for both. The
> envelope format is opaque ciphertext either way. Scaffolding for this
> abstraction (interfaces, envelope model, `DEMO_ONLY` guard) lives in
> `android-wife-assistant/.../data/crypto/` with unit tests; both real
> backends remain NOT integrated until their Phase 3 slices ship — no E2EE
> claim before the release gates below pass, in either variant.
>
> **Progress (2026-08-14, relay)**: the relay this envelope design requires
> now exists as `wisal-direct-relay` (signature-authenticated device registry
> + opaque envelope submit/inbox/ack, 14-day max TTL, delete-on-ack). It
> speaks the `EncryptedEnvelope` shape from `CryptoProvider.kt` field-for-
> field. The Android client's transport half is also built and tested —
> `DirectRelayClient` signs and calls all four endpoints — but nothing
> encrypts yet; it currently only carries whatever bytes `CryptoProvider`
> hands it (`DEMO_ONLY` today). No `CryptoProvider` backend is wired in.
>
> **Progress (2026-08-14, feasibility)**: verified against Maven Central
> directly (not from memory) that **neither real backend requires local
> Rust/NDK cross-compilation** — both publish prebuilt Android AARs with the
> native library already built in:
> - `org.signal:libsignal-android` — latest `0.86.5`, actively maintained
>   (last publish 2025-11-17). This is the AGPL-3.0 `signal` variant.
> - `org.matrix.rustcomponents:crypto-android` — latest `26.05.12`, very
>   actively maintained (last publish 2026-05-12). This is Element's
>   production Olm/Megolm (vodozemac-backed) binding — Apache-2.0, and the
>   real artifact for the `vodozemac` variant. (No standalone raw-vodozemac
>   Android AAR is published; `crypto-android` is the maintained, in-
>   production wrapper around it and is the correct integration target.)
>
> This means CI does not need an NDK/Rust toolchain added to build either
> variant — Gradle fetches the AAR like any other dependency. What remains
> genuinely hard, and is *not* attempted in this slice, is the integration
> itself: `crypto-android`'s `OlmMachine` API (key upload, one-time-key
> claiming, X3DH-equivalent session establishment, ratchet state
> persistence) is a real API surface, not a drop-in call, and getting it
> subtly wrong is exactly the kind of mistake that needs expert review before
> it ever claims to be E2EE. Per §5.1's own rule, a partially-wired crypto
> library is not attempted here — better to ship the honest transport layer
> now and do the real integration as its own reviewed slice.
>
> **Correction (2026-08-14, verified from real source, not memory)**: started
> the `crypto-android` integration and read its actual public API
> (`matrix-org/matrix-rust-sdk`, `bindings/matrix-sdk-crypto-ffi/src/machine.rs`,
> fetched and inspected directly). Finding that changes the practical
> tradeoff between the two variants:
>
> - **`crypto-android`'s `OlmMachine` is not a generic point-to-point
>   encrypt/decrypt API.** Its surface (`outgoing_requests`,
>   `receive_sync_changes`, `share_room_key`, `create_encrypted_to_device_request`,
>   room IDs, Matrix user IDs) is shaped around the **Matrix Client-Server
>   protocol** — a homeserver's `/sync`, `/keys/upload`, `/keys/claim`,
>   `/sendToDevice` endpoints. There is no exposed raw
>   `encrypt(recipient, bytes) -> bytes` call. Wiring it to
>   `wisal-direct-relay` as designed would mean rebuilding the relay as a
>   partial Matrix homeserver (sync tokens, per-room state, the specific
>   request/response shapes above) — not "add a dependency and call it,"
>   but a second backend redesign project in its own right.
> - **`libsignal`'s API is the structural fit our relay already has.**
>   Verified from `signalapp/libsignal`,
>   `java/shared/.../protocol/{SessionCipher,SignalProtocolAddress}.java`:
>   sessions are addressed by `(name, deviceId)` — exactly our
>   `senderDeviceId`/`recipientDeviceId` model — with a plain
>   `SessionCipher.encrypt(byte[]) -> CiphertextMessage` /
>   `.decrypt(...) -> byte[]`. It needs one addition to what's built:
>   `wisal-direct-relay` would need a **pre-key bundle endpoint**
>   (identity key + signed pre-key + one-time pre-keys per device, for
>   `SessionBuilder.process(PreKeyBundle)` — X3DH) alongside the existing
>   device registry, which is a natural, small extension of the current
>   schema, not a redesign.
>
> **Net effect**: the "pick a variant" decision is no longer symmetric.
> `vodozemac`/`crypto-android` is Apache-2.0 but costs a relay-as-homeserver
> rewrite to integrate against this architecture; `libsignal` is AGPL-3.0 but
> is a natural extension of what's already built and tested. This is a real
> decision for the owner (license obligation vs. months of extra backend
> work), not one to guess silently — raised back to them rather than forcing
> either path.
>
> **Owner decision (2026-08-14)**: proceed with `libsignal` now, since it
> doesn't require the relay redesign. `vodozemac`/`crypto-android` stays
> parked pending a separate decision on whether to invest in the Matrix-
> homeserver-shaped relay work it would need.
>
> **Progress (2026-08-14, real integration)**: `LibsignalCryptoProvider`
> implements `PreKeyEstablishingProvider` against `org.signal:libsignal-android:0.86.5`
> (real Maven artifact, prebuilt native libs, no local Rust/NDK build). Every
> API call it makes (`PreKeyBundle`, `SessionBuilder`, `SessionCipher`, the
> five `SignalProtocolStore` sub-interfaces, key/record constructors) was
> verified against the **actual compiled bytecode** of the published
> `libsignal-client-0.86.5.jar` via `javap` — not against README examples or
> a possibly-diverged `main`-branch source tree, and not from memory. This
> caught two real, non-obvious details that would have been outright wrong
> guesses: (1) `PreKeyBundle`'s Java constructor orders its parameters
> differently from the Rust struct it binds to — a naive port from the Rust
> source (the only source initially reachable for this one file) would have
> swapped two fields; (2) the sender keeps sending `PreKeySignalMessage`-typed
> ciphertext until it has processed a reply from the recipient, not just
> until it has sent one — confirmed by running a real two-party handshake,
> not by reading the type constants.
>
> Both findings came from **executing the actual library**: a standalone
> Java program was compiled and run directly against the published jar
> (`javac`/`java`, no Gradle/Android needed) to perform a full bidirectional
> PQXDH handshake + Double Ratchet exchange, and separately to verify the
> exact `serialize()` → base64 → byte-array-constructor round trip that
> `SignalPreKeyBundleDto` uses for wire transport — both passed. The Kotlin
> wrapper mirrors exactly what was verified working, not what seemed
> plausible from documentation.
>
> **What this slice does *not* claim or include**: `mayClaimE2ee` stays
> `false`. No persistence — `LibsignalCryptoProvider`'s `SignalProtocolStore`
> is in-memory only; identity/pre-keys don't yet survive an app restart
> (the natural next step, parallel to `DeviceIdentityStore`). No relay
> wiring — nothing publishes a `SignalPreKeyBundleDto` to
> `wisal-direct-relay` or fetches one for a real peer yet; the two-party
> exchange proven above ran in one process, not across two real devices.
> One-time pre-keys are generated one at a time with no replenishment
> policy. None of this is claimed as done — each is a concrete, separate,
> smaller next step now that the cryptography itself is verified correct.

## Context

Phase 3 (Wisal Direct) introduces one-to-one encrypted messaging between paired
devices, relayed by a Wisal server that must never see plaintext. The product
rules are hard constraints:

- No custom cryptography — only mature, reviewed implementations.
- No E2EE claim anywhere (app, website, store listing) until the implementation
  and automated tests genuinely support it.
- Insecure/mock transport allowed in development only, behind a `DEMO_ONLY`
  flag that production builds cannot enable.

Required properties: asynchronous 1:1 messaging (offline recipients), forward
secrecy, post-compromise security, key rotation, device revocation,
multi-device later, Android now + Windows in Phase 4, and a path to small
group ("Family Circles") encryption in Phase 6.

## Options evaluated

### Option A — Signal Protocol via `libsignal` (Signal Foundation)
- **Protocol**: X3DH/PQXDH key agreement + Double Ratchet. The de-facto gold
  standard for async 1:1 E2EE; deployed at WhatsApp/Signal scale; extensively
  analyzed academically. Forward secrecy and post-compromise security are
  core properties. PQXDH adds post-quantum resistance to session setup.
- **Implementation**: Rust core with official Java/Android bindings (used by
  the Signal Android app) and C#/Node bindings usable on Windows.
- **Multi-device**: proven model (per-device sessions + device registry).
- **Maintenance**: very active, security-critical upstream.
- **License**: **AGPL-3.0**. This is the decision point: shipping `libsignal`
  in the client obligates releasing the client source under AGPL-compatible
  terms. For Wisal this is viable only if the owner accepts open-sourcing the
  messaging client (the backend relay is unaffected — it never touches
  protocol code).

### Option B — vodozemac (Matrix Foundation; Olm/Megolm)
- **Protocol**: Olm (Double Ratchet variant with one-time pre-keys) for 1:1;
  Megolm for groups. Independently audited (Least Authority, 2022, no
  unresolved criticals). Forward secrecy yes; post-compromise security weaker
  in Megolm group mode (session re-share on membership change is the
  mitigation Matrix uses).
- **Implementation**: Rust with maintained bindings; proven on Android and
  Windows via Element clients.
- **License**: **Apache-2.0** — no copyleft obligation; closed-source client
  allowed.
- **Maintenance**: active; the Matrix ecosystem's production crypto core.

### Option C — MLS (RFC 9420) via OpenMLS
- **Protocol**: IETF-standardized group messaging security; efficient key
  rotation and member removal for groups (TreeKEM); FS + PCS by design.
- **Fit**: designed for groups; 1:1 is just a 2-member group but the async
  "first message while recipient offline" story (KeyPackage directories,
  last-resort packages) is younger in practice than Signal's pre-key model.
- **License**: MIT/Apache-2.0. Maintenance: active (Phoenix R&D + community);
  adopted direction for future interoperable messaging (e.g. RCS roadmap).
- **Assessment**: the right candidate for **Phase 6 Family Circles**, not the
  safest first choice for Phase 3's 1:1 core in a small team.

### Rejected outright
- Custom/DIY protocol composition (forbidden by product rules).
- OTR/v3-era protocols (no async story), plain NaCl box without ratcheting
  (no forward secrecy per message), JWE/JOSE-based schemes (not a messaging
  ratchet).

## Decision (proposed)

1. **1:1 core**: `libsignal` **if** the owner approves releasing the Wisal
   client under an AGPL-compatible open-source license — strongest protocol,
   strongest implementation pedigree, and open-sourcing the client is itself
   a trust asset for a privacy product. **Otherwise vodozemac** (Apache-2.0),
   accepting the documented Megolm PCS caveat (irrelevant for Phase 3, which
   is 1:1 Olm only) and slightly less academic scrutiny than Signal.
2. **Family Circles (Phase 6)**: evaluate OpenMLS in its own ADR when Phase 6
   starts; do not force today's 1:1 choice to also carry groups.
3. **Relay**: protocol-agnostic encrypted-envelope store-and-forward
   (recipient routing id, opaque ciphertext, expiry, delivery state, pre-key /
   KeyPackage directory). Designing it envelope-opaque keeps the protocol
   swap cost bounded to the client.
4. **`DEMO_ONLY` policy**, effective immediately: any transport that is not
   the selected E2EE protocol (including today's business-mode Cloud API,
   which is out of scope for Direct) must never be labeled encrypted;
   development mock transports compile only in debug builds
   (`if (BuildConfig.DEBUG && DEMO_ONLY)`), and a release-build test asserts
   the flag is dead code.

## Release gates (all must pass before any E2EE claim ships)

- Two-device pairing + offline delivery + delivery-ack integration tests.
- Automated plaintext scan: seeded test messages must appear nowhere in relay
  storage, logs, or backups (already specified in testing-strategy).
- Device revocation and expired/replayed invitation rejection tests.
- External security review of the integration (not the protocol) —
  scheduled before public launch; documented as a production blocker until
  done.

## Consequences

- One owner decision (client licensing) unblocks the implementation choice;
  everything else in Phase 3 (identity, invitations, relay schema) can start
  now because the envelope design is protocol-agnostic.
- The website and app keep saying "encrypted direct messaging is coming" —
  never "is here" — until the gates above are green.
