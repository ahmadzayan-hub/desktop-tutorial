# lessons.md — Durable Lessons
<!-- purpose: Hard-won lessons promoted from session logs for permanent reference -->
<!-- owner: Fable -->
<!-- last-updated: 2026-07-14 -->

## Next.js 14

- `export const metadata` only works in Server Components. Any file with `"use client"` cannot export metadata. Fix: create `page.tsx` (server, exports metadata) + `*Client.tsx` (client, uses hooks).
- `usePathname()` requires `"use client"` and `next/navigation` — not available in Server Components.
- `new Date()` in sitemap.ts causes unnecessary re-crawl signals on every deploy. Use static date strings per page instead.

## i18n

- Never move `MODES` or tab definitions with `label` strings outside the component that calls `t()` — they'll render as raw key strings at build time. Keep them inside the component as constants with `labelKey`.
- Arabic copy: always use MSA grammar. Avoid AI-generated Arabic slop. RTL direction must be set on `<html>` at first paint (localStorage + inline script in layout.tsx), not only via CSS.

## PNG Generation (Node.js, no sharp)

- CRC32 can produce negative numbers in JS. Force unsigned 32-bit with `>>> 0` before writing to a 4-byte Buffer.
- Use `zlib.deflateSync` for IDAT chunk compression, not manual zlib.

## Security

- Rate limit must have an in-process Map fallback (not hard-fail) so the app works without Redis configured in dev.
- `rateLimit()` upgrading to async requires adding `await` to every call site.

## Git / GitHub

- Never push to main directly. Always use a feature branch + PR.
- Session branches are named `claude/[description]-[8-char-hash]` for easy identification.

## Privacy (permanent rule)

- Remove employer names, internal system names, and any workplace-identifying information before committing or publishing.
- Replace with generic terms in all outputs that could be public.
