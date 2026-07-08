// Thamin service worker: cache-first for static assets, network-first for
// pages, offline fallback for navigations. API responses are never cached.
const CACHE = 'thamin-v3';
const STATIC = ['/manifest.json', '/icon.svg', '/icon-maskable.svg', '/offline.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return; // never cache API
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        if (e.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return Response.error();
      })
  );
});

// ── Web Push: pending approval notifications ────────────────────────────
self.addEventListener('push', (e) => {
  e.waitUntil(
    self.registration.showNotification('ثمين | Thamin', {
      body: 'لديك اعتمادات أسعار معلقة بانتظار المراجعة.\nYou have pending price approvals to review.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'thamin-approvals',
      data: { url: '/products?status=PENDING' },
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
