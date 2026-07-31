const CACHE_NAME = "mxiqi-ops-demo-v32";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=32",
  "./app.js?v=32",
  "./matching-core.js?v=32",
  "./package-core.js?v=32",
  "./workflow-core.js?v=32",
  "./commission-core.js?v=32",
  "./logistics-core.js?v=32",
  "./connector-bridge.js?v=32",
  "./zhenzhenpu-logo.jpg",
  "./manifest.webmanifest",
  "./vendor/exceljs.min.js?v=32",
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
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

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
