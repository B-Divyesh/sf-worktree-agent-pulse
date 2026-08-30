const CACHE = "worktree-agent-pulse-v5";
const SHELL = ["/", "/demo", "/privacy", "/terms", "/assets/hero-lattice.webp", "/favicon.svg"];
const BUILD_ASSETS = [];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll([...new Set([...SHELL, ...BUILD_ASSETS])]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === "navigate") {
      try {
        const response = await fetch(event.request);
        await cache.put(event.request, response.clone());
        return response;
      } catch {
        return (await cache.match(event.request, { ignoreVary: true })) || (await cache.match("/", { ignoreVary: true }));
      }
    }
    const cached = await cache.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    const response = await fetch(event.request);
    await cache.put(event.request, response.clone());
    return response;
  })());
});
