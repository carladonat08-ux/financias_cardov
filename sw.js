// Guarda la app en el móvil para que funcione sin internet. No toca tus datos.
// Versión 3: al abrir, siempre pide la última versión a internet (sin usar copias viejas).
const CACHE = "mis-cuentas-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero internet, saltándose la caché del navegador; si no hay conexión, la copia guardada.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const fresh = e.request.mode === "navigate" ? new Request(e.request.url, { cache: "no-store" }) : new Request(e.request, { cache: "no-cache" });
  e.respondWith(
    fetch(fresh).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
