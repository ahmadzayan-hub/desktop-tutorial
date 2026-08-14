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
