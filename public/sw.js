// Mutabasir service worker. Strategy: network-first with an offline
// fallback so users on flaky connections keep working, and a small cache
// of the app shell so an installed PWA opens instantly.

const CACHE = "mutabasir-shell-v1";
const SHELL = [
  "/",
  "/projects",
  "/new",
  "/faq",
  "/pricing",
  "/favicon.svg",
  "/apple-touch-icon.svg",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept auth or API endpoints — always talk to the server.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.status === 200 && req.destination !== "document") {
          const clone = fresh.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone).catch(() => {}));
        }
        return fresh;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.destination === "document") {
          const fallback = await caches.match("/");
          if (fallback) return fallback;
        }
        return new Response("Offline", {
          status: 503,
          statusText: "Offline",
          headers: { "Content-Type": "text/plain" },
        });
      }
    })(),
  );
});
