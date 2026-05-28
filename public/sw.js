// TMU TP Platform Service Worker v2
const CACHE_NAME = "tmu-tp-cache-v2";
const STATIC_ASSETS = [
  "/tmu-logo.png?v=2",
  "/icon-192x192.png?v=2",
  "/icon-512x512.png?v=2",
  "/apple-touch-icon.png?v=2",
  "/favicon.ico",
];

// Install: pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for navigations/API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension/next internal requests
  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;
  if (url.pathname.startsWith("/_next/")) return;
  if (url.pathname.startsWith("/api/")) return;

  // Static assets: cache-first
  if (
    STATIC_ASSETS.includes(url.pathname) ||
    /\.(png|jpg|jpeg|svg|ico|webp|woff2?)$/.test(url.pathname)
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

  // Navigation requests: network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/login"))
      )
    );
    return;
  }
});
