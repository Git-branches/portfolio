// ============================================================
// Motion layer — shared across all pages. Purely additive:
// loader, page transitions, scroll reveal + stagger, parallax,
// card tilt, magnetic buttons, cursor glow, toasts, back-to-top.
// Everything decorative is skipped under prefers-reduced-motion,
// and cursor-driven effects only run on fine pointers (desktop).
// ============================================================
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  /* ---------- success toasts ---------- */
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  let toastTimer;
  window.showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2200);
  };
  document.getElementById("copyEmail")?.addEventListener("click", () =>
    setTimeout(() => showToast("Email copied to clipboard ✓"), 150)
  );
  document.querySelectorAll("a[download]").forEach((a) =>
    a.addEventListener("click", () => showToast("Résumé PDF downloading ↓"))
  );

  /* ---------- give reveal to pages that don't mark it up ---------- */
  const autoReveal = [];
  if (document.querySelector(".resume"))
    autoReveal.push(".resume__head", ".resume h2", ".resume__item", ".resume > p", ".resume__skills li", ".resume__actions");
  if (document.querySelector(".case"))
    autoReveal.push(".case__kicker", ".case__title", ".case__meta", ".case__shot", ".case h2", ".case p", ".case ul", ".case__cta");
  autoReveal.forEach((sel) =>
    document.querySelectorAll(sel).forEach((el) => el.classList.add("reveal"))
  );
  document.querySelector(".footer")?.classList.add("reveal");

  /* ---------- stagger groups: children cascade in ---------- */
  const staggerGroups = [".stack-grid", ".ledger", ".fan", ".contact-links", ".resume__skills", ".gh-activity__list"];
  staggerGroups.forEach((sel) =>
    document.querySelectorAll(sel).forEach((group) => {
      [...group.children].forEach((el, i) => {
        el.classList.add("reveal");
        el.style.transitionDelay = Math.min(i * 70, 480) + "ms";
      });
    })
  );

  /* ---------- shared reveal observer ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        // clear the stagger delay afterwards so hover transitions stay snappy
        setTimeout(() => (en.target.style.transitionDelay = "0s"), 1200);
        io.unobserve(en.target);
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- back-to-top (pages without the quick-actions dial) ---------- */
  if (!document.getElementById("toTop")) {
    const btn = document.createElement("button");
    btn.className = "to-top-btn";
    btn.setAttribute("aria-label", "Back to top");
    btn.textContent = "↑";
    document.body.appendChild(btn);
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
    window.addEventListener("scroll", () => btn.classList.toggle("is-on", window.scrollY > 480), { passive: true });
  }

  if (reduced) return; // everything below is decoration

  /* ---------- loading screen (every full page load) ---------- */
  {
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.innerHTML =
      '<div style="text-align:center"><div class="loader__logo">RJR<span class="accent">.</span></div><div class="loader__bar"><i></i></div></div>';
    document.body.appendChild(loader);
    const t0 = performance.now();
    const finish = () => {
      const wait = Math.max(0, 800 - (performance.now() - t0));
      setTimeout(() => {
        loader.classList.add("is-done");
        setTimeout(() => loader.remove(), 600);
      }, wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
  }

  /* ---------- page transitions (fade out on internal navigation) ---------- */
  const veil = document.createElement("div");
  veil.className = "page-veil";
  document.body.appendChild(veil);
  window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return; // same-page anchor
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => (location.href = a.href), 240);
  });

  /* ---------- parallax: the big </> mark drifts with scroll ---------- */
  const mark = document.querySelector(".hero__mark");
  if (mark) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          mark.style.transform = `translateY(calc(-50% + ${(window.scrollY * 0.18).toFixed(1)}px)) rotate(8deg)`;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  if (!finePointer) return; // touch devices: skip cursor-driven effects

  /* ---------- cursor glow ---------- */
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.style.opacity = "0";
  document.body.appendChild(glow);
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; glow.style.opacity = "1"; }, { passive: true });
  (function glowLoop() {
    gx += (tx - gx) * 0.12;
    gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx.toFixed(1)}px, ${gy.toFixed(1)}px)`;
    requestAnimationFrame(glowLoop);
  })();

  /* ---------- card tilt (fan + stack cards) ---------- */
  document.querySelectorAll(".fan__card, .stack-card").forEach((card) => {
    const isFan = card.classList.contains("fan__card");
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const lift = isFan ? "translateY(-0.4rem)" : "translateY(-5px)";
      card.style.transform = `perspective(700px) ${lift} rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
      if (isFan) card.style.zIndex = 3;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.zIndex = "";
    });
  });

  /* ---------- magnetic buttons ---------- */
  document.querySelectorAll(".btn, .fab__toggle, .fab__action, .to-top-btn, .theme-toggle").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.22 - 1).toFixed(1)}px)`;
    });
    btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
  });
})();
