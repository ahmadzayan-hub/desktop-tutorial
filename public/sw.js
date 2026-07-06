// Tweenz AI — Service Worker v2
const CACHE_NAME = "tweenz-v2";
const FONT_CACHE = "tweenz-fonts-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icon.svg",
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", event => {
  const keep = new Set([CACHE_NAME, FONT_CACHE]);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !keep.has(k)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, API, and third-party auth requests
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.hostname.includes("supabase.co")) return;
  if (url.hostname.includes("stripe.com")) return;

  // Fonts — cache-first, long-lived
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // Navigation — network-first, fallback to offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then(cached =>
            cached ?? caches.match(OFFLINE_URL).then(r => r ?? new Response("Offline", { status: 503 }))
          )
        )
    );
    return;
  }

  // Static assets (JS, CSS, images, SVG) — cache-first
  const isStatic =
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webmanifest");

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return res;
        }).catch(() => cached ?? new Response("", { status: 404 }));
      })
    );
  }
});

// ── Background sync stub (placeholder for future offline queue) ───────────
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
