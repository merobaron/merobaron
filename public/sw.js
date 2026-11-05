// Hand-written service worker. The build fills the placeholders (scripts/precache-integration.mjs).
// It only caches this site's own files: no external requests, no analytics.
const PRECACHE = "__PRECACHE_MANIFEST__";
const CACHE = "merobaron-__CACHE_VERSION__";
const SCOPE = new URL(self.registration.scope).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(Array.isArray(PRECACHE) ? PRECACHE : [SCOPE]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith("merobaron-") && key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(SCOPE, response.clone());
    return response;
  } catch {
    return (await cache.match(SCOPE)) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true, ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;
  event.respondWith(request.mode === "navigate" ? networkFirst(request) : cacheFirst(request));
});
