// ============================================================
// FinWallet Service Worker — PWA Offline Support
// Chiến lược: Cache First cho assets, Network First cho API
// ============================================================

const CACHE_NAME = 'finwallet-v1';
const OFFLINE_URL = '/offline';

// App Shell — các file quan trọng cần cache khi cài app
const APP_SHELL = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/offline',
];

// ── Install Event ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[SW] Some files failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate Event ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});

// ── Fetch Event ────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bỏ qua non-GET requests
  if (request.method !== 'GET') return;

  // API requests → Network First (không cache)
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request).catch(() => {
        // API offline → trả về lỗi JSON
        return new Response(
          JSON.stringify({ error: 'Offline', message: 'Không có kết nối mạng' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Static assets (JS, CSS, images) → Cache First
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages → Network First với fallback offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Fallback trang offline
        const offlinePage = await caches.match(OFFLINE_URL);
        return offlinePage || new Response(
          '<h1>FinWallet — Offline</h1><p>Vui lòng kiểm tra kết nối mạng.</p>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
  );
});

// ── Push Notifications (tương lai) ────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'FinWallet', {
    body: data.message || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: { url: data.url || '/dashboard' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/dashboard')
  );
});
