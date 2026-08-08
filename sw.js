// ============================================================
// Service worker Ã¢â‚¬â€ offline cache for the portfolio (PWA)
// Bump CACHE version to force clients to refetch everything.
// ============================================================
const CACHE = "rjr-portfolio-v54";

const CORE = [
  "./",
  "./resume",
  "./css/style.css",
  "./js/motion.js",
  "./js/sfx.js",
  "./js/hero-sprite.js",
  "./js/palette.js",
  "./assets/graduate-walk-8frames.png",
  "./assets/developer-walk-8frames.png",
  "./js/main.js",
  "./js/lightbox.js",
  "./projects/divine-life-damayan",
  "./projects/power-giant-rmt",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // never cache the GitHub APIs Ã¢â‚¬â€ stats & contribution graph should stay live
  if (req.url.includes("api.github.com") || req.url.includes("github-contributions-api")) return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // NETWORK-FIRST for app code (pages, CSS, JS): a deploy shows up on the
  // very next load Ã¢â‚¬â€ no more stale-CSS + fresh-JS mixes breaking layouts.
  // The cached copy is only a fallback for offline.
  const isAppCode =
    sameOrigin &&
    (req.mode === "navigate" ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".webmanifest"));
  if (isAppCode) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // CACHE-FIRST for everything else (images, fonts) Ã¢â‚¬â€ they rarely change
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && sameOrigin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});


