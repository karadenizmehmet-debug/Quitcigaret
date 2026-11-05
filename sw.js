// Nefes – çevrimdışı çalışma için service worker
// Mehmet Karadeniz, 2026-2027
const CACHE = 'nefes-v17';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './css/style.css', './js/config.js', './js/i18n/tr.js', './js/i18n.js',
  ...['data','core','content','app','screens','achievements','insights','recovery','crisis','games','notifications','backup','gdrive','plus','main'].map(f => './js/' + f + '.js')];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Aynı sitedeki dosyalar: önce ağ (güncel sürüm), ağ yoksa önbellek.
// Bulut senkronu gibi başka sitelere giden istekler hiç önbelleğe alınmaz.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
