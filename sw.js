const CACHE_NAME = "mxiqi-ops-demo-v36";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=36",
  "./app.js?v=36",
  "./matching-core.js?v=36",
  "./package-core.js?v=36",
  "./workflow-core.js?v=36",
  "./commission-core.js?v=36",
  "./logistics-core.js?v=36",
  "./connector-bridge.js?v=36",
  "./logistics-gateway.js?v=36",
  "./zhenzhenpu-logo.jpg",
  "./manifest.webmanifest",
  "./vendor/exceljs.min.js?v=36",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== "GET" || requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith("/api/")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request, {ignoreSearch:true})),
  );
});
