const CACHE = 'navigator-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Всегда сеть для HTML, API и внешних запросов
  if (
    e.request.mode === 'navigate' ||
    e.request.url.includes('api.') ||
    e.request.url.includes('bank.gov') ||
    e.request.url.includes('open-meteo') ||
    e.request.url.includes('nominatim') ||
    e.request.url.includes('fonts.')
  ) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Иконки и прочее — кеш
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return r;
    }))
  );
});
