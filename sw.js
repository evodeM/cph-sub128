// ============================================================
// SERVICE WORKER — SUB 1:28
// Cacher app-skallen så siden åbner med det samme, også offline.
// Strategi:
//   - Egne filer (HTML/CSS/JS/ikoner): network-first med cache-fallback
//     → du får altid nyeste version når der er net, og appen virker uden
//   - CDN-assets (fonts, Chart.js, Supabase-lib): cache-first
//     → de ændrer sig aldrig for en givet version
//   - API-kald (Supabase, Gemini): røres ALDRIG — går altid direkte på nettet
// Bump CACHE_VERSION når du ændrer i app-filerne, hvis du vil tvinge
// gamle caches ud (network-first opdaterer dog selv ved næste online besøg).
// ============================================================

const CACHE_VERSION = "sub128-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./config.js",
  "./data.js",
  "./plan.js",
  "./exercises.js",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Domæner der aldrig skal caches (live data)
const NETWORK_ONLY = [
  "supabase.co",
  "generativelanguage.googleapis.com"
];

// CDN-domæner der må caches cache-first
const CDN_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdn.jsdelivr.net",
  "cdnjs.cloudflare.com"
];

self.addEventListener("install", (e) => {
  // Cache hver fil for sig — én manglende fil må ikke vælte hele installationen
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then((c) => Promise.allSettled(APP_SHELL.map((f) => c.add(f))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return; // writes går altid direkte
  if (NETWORK_ONLY.some((h) => url.hostname.includes(h))) return; // live data

  if (CDN_HOSTS.some((h) => url.hostname.includes(h))) {
    // Cache-first for CDN
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
        return resp;
      }))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    // Network-first for egne filer
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
          return resp;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
    );
  }
});
