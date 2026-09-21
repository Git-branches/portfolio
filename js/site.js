// ============================================================
// Rhon Jon Romero — shared site behaviour (homepage + case studies)
// toast, mobile menu, scroll entrances, back to top, year, service worker
// ============================================================

// the worker lives at the site root, next to this script's parent folder;
// resolving it from the script URL works on Vercel and in an XAMPP subfolder
const SW_URL = new URL("../sw.js", document.currentScript.src).href;
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- toast (palette.js and the form call window.showToast) ----------
const toastEl = document.getElementById("toast");
let toastTimer;
window.showToast = (msg) => {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
};

// ---------- mobile menu ----------
const burger = document.getElementById("navBurger");
const menu = document.getElementById("mobileMenu");
const setMenu = (open) => {
  menu.hidden = !open;
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
};
burger?.addEventListener("click", () => setMenu(menu.hidden));
menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu && !menu.hidden) setMenu(false);
});

// ---------- scroll entrances (.rv elements, [data-words] headings) ----------
(() => {
  const items = [...document.querySelectorAll(".rv")];
  if (!items.length) return;
  document.querySelectorAll(".rv-socials > *").forEach((el, i) => el.style.setProperty("--si", i));

  // split [data-words] headings into masked words, keeping inline tags
  document.querySelectorAll("[data-words]").forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) return walk(child);
        if (child.nodeType !== Node.TEXT_NODE) return;
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
          const mask = document.createElement("span");
          mask.className = "mw";
          const inner = document.createElement("span");
          inner.textContent = part;
          inner.style.setProperty("--i", i++);
          mask.appendChild(inner);
          frag.appendChild(mask);
        });
        child.replaceWith(frag);
      });
    };
    walk(el);
  });

  const reveal = (el) => {
    el.classList.add("is-in");
    // interactive elements: once the entrance finishes, drop its delays so hover feels instant
    if (el.matches(".rv-card, .rv-pop, .rv-socials")) {
      const d = parseFloat(el.style.getPropertyValue("--d")) || 0;
      setTimeout(() => el.classList.add("rv-done"), (d + 1.4) * 1000);
    }
  };

  if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
    items.forEach(reveal);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      // elements that arrive together play in reading order, 90ms apart
      const batch = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target)
        .sort((a, b) => {
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          return ra.top - rb.top || ra.left - rb.left;
        });
      batch.forEach((el, n) => {
        if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", `${(n * 0.09).toFixed(2)}s`);
        reveal(el);
        io.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => io.observe(el));
})();

// ---------- back to top (logo + footer link) ----------
document.querySelectorAll('a[href="#top"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
    history.replaceState(null, "", location.pathname);
  })
);

// ---------- footer year ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- PWA: register service worker (needs http/https, not file://) ----------
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker
    .register(SW_URL)
    .then((reg) => {
      reg.update().catch(() => {});
      // a new deploy takes control mid-session; reload once so the page
      // matches the assets it is now being served (not on a first visit)
      const wasControlled = !!navigator.serviceWorker.controller;
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!wasControlled || reloaded) return;
        reloaded = true;
        location.reload();
      });
    })
    .catch(() => {});
}
