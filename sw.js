// ============================================================
// Service worker — offline cache for the portfolio (PWA)
// Bump CACHE version to force clients to refetch everything.
// ============================================================
const CACHE = "rjr-portfolio-v31";

const CORE = [
  "./",
  "./resume",
  "./css/style.css",
  "./js/motion.js",
  "./js/sfx.js",
  "./js/halftone.js",
  "./assets/profile1.jpg",
  "./assets/profile-dark.png",
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
  // never cache the GitHub API — stats should stay live
  if (req.url.includes("api.github.com")) return;

  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          // runtime-cache successful same-origin responses (screenshots, fonts CSS, icons)
          if (res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
