// ============================================================
// Rhon Jon Romero — Homepage interactions
// ============================================================

// ---------- loader: hold until the page has loaded (min 3.5s, max 6s) ----------
// resolves immediately when the loader is skipped (seen this session / reduced motion)
const loaderDone = new Promise((resolve) => {
  const loader = document.getElementById("loader");
  if (!loader || document.documentElement.classList.contains("no-loader")) {
    loader?.remove();
    return resolve();
  }
  document.body.style.overflow = "hidden";
  const shown = performance.now();
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    const wait = Math.max(0, 3500 - (performance.now() - shown));
    setTimeout(() => {
      loader.classList.add("is-done");
      document.body.style.overflow = "";
      try { sessionStorage.setItem("loaderSeen", "1"); } catch {}
      setTimeout(() => loader.remove(), 1300);
      resolve();
    }, wait);
  };
  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish, { once: true });
  setTimeout(finish, 6000); // never block the page on a slow asset
});

// ---------- hero: ring of screens that deals out, then spins ----------
// cards rise from below, gather in a small circle, open out to the full ring,
// and then the whole ring rotates slowly (CSS animation on .ring)
(() => {
  const ring = document.getElementById("ring");
  if (!ring) return;
  const cards = [...ring.querySelectorAll(".ring__card")];
  const n = cards.length;
  const radius = () => Math.max(165, Math.min(480, window.innerWidth * 0.34));

  // keep the ring centred on the name, wherever the layout puts it
  const hero = ring.closest(".hero");
  const name = hero.querySelector(".hero__name");
  const centre = () => {
    const h = hero.getBoundingClientRect();
    const n = name.getBoundingClientRect();
    hero.style.setProperty("--ring-y", `${(n.top + n.height / 2 - h.top).toFixed(0)}px`);
  };
  centre();
  document.fonts?.ready.then(centre);

  const place = (r, spread = 1) => {
    cards.forEach((card, i) => {
      const a = (i / n) * 360;
      const rad = (a * Math.PI) / 180;
      card.style.setProperty("--x", `${(Math.cos(rad) * r).toFixed(1)}px`);
      card.style.setProperty("--y", `${(Math.sin(rad) * r).toFixed(1)}px`);
      card.style.setProperty("--r", `${((a - 90) * spread).toFixed(1)}deg`);
      card.style.setProperty("--o", "1");
    });
  };
  cards.forEach((card, i) => { card.style.zIndex = String(i + 1); });

  if (REDUCED_MOTION) {
    cards.forEach((c) => { c.style.transition = "none"; });
    place(radius());
  } else loaderDone.then(() => {
    // each stage starts only once the previous one has settled, so the
    // cards never look like they are chasing each other
    const setDuration = (ms) => cards.forEach((c) => c.style.setProperty("--t", `${ms}ms`));
    const start = 300;
    // 1. rise from below into a loose stack, one card after another
    setTimeout(() => {
      setDuration(1400);
      cards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 90}ms`;
        card.style.setProperty("--x", "0px");
        card.style.setProperty("--y", `${i * 2}px`);
        card.style.setProperty("--r", `${i * 2}deg`);
        card.style.setProperty("--o", "1");
      });
    }, start);
    // 2. fan into a small circle (stack finishes at ~2.3s)
    setTimeout(() => {
      cards.forEach((c) => { c.style.transitionDelay = "0ms"; });
      setDuration(1500);
      place(80, 0.3);
    }, start + 2400);
    // 3. open out to the full ring
    setTimeout(() => {
      setDuration(2000);
      place(radius());
    }, start + 4000);
    // 4. as the ring settles, start the spin and reveal the name
    setTimeout(() => {
      ring.classList.add("is-spinning");
      document.documentElement.classList.remove("hero-wait");
    }, start + 5600);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { centre(); place(radius()); }, 150);
  });

  // clicking a card jumps to the work section
  cards.forEach((c) =>
    c.addEventListener("click", () => document.getElementById("work").scrollIntoView({ behavior: "smooth" }))
  );
})();

// ---------- bio: words light up as the paragraph scrolls through ----------
(() => {
  const text = document.getElementById("bioText");
  if (!text) return;
  // wrap every word in a span, keeping inline tags like <strong> intact
  const wrapWords = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) return wrapWords(child);
      if (child.nodeType !== Node.TEXT_NODE) return;
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
        const span = document.createElement("span");
        span.className = "w";
        span.textContent = part;
        frag.appendChild(span);
      });
      child.replaceWith(frag);
    });
  };
  wrapWords(text);
  if (REDUCED_MOTION) return;
  const spans = [...text.querySelectorAll(".w")];
  let lit = -1;
  const update = () => {
    const r = text.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the top enters at 85% of the viewport, 1 when the bottom reaches 45%
    const p = (vh * 0.85 - r.top) / (r.height + vh * 0.4);
    const count = Math.round(Math.max(0, Math.min(1, p)) * spans.length);
    if (count === lit) return;
    lit = count;
    spans.forEach((s, i) => s.classList.toggle("is-lit", i < count));
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// ---------- more projects: stacked paper cards deal out while scrolling ----------
(() => {
  const deck = document.getElementById("deck");
  if (!deck) return;
  const cards = [...deck.querySelectorAll(".acard")];
  const mid = (cards.length - 1) / 2;
  const desktop = window.matchMedia("(min-width: 861px)");
  let ticking = false;
  const update = () => {
    ticking = false;
    if (!desktop.matches) return;
    const r = deck.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = REDUCED_MOTION ? 1 : Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - vh)));
    const e = 1 - Math.pow(1 - p, 3); // ease-out
    const cardW = cards[0].offsetWidth;
    const step = Math.min(cardW + 24, (window.innerWidth - cardW - 96) / (cards.length - 1));
    cards.forEach((card, i) => {
      const d = i - mid;
      card.style.setProperty("--x", `${(d * step * e).toFixed(1)}px`);
      card.style.setProperty("--y", `${(Math.abs(d) * 14 * e).toFixed(1)}px`);
      card.style.setProperty("--r", `${(d * (7 - 4 * e) + (1 - e) * (i % 2 ? 4 : -4)).toFixed(2)}deg`);
    });
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

// ---------- work: sticky cards shrink & dim as the next one covers them ----------
(() => {
  const stack = document.getElementById("stackCards");
  if (!stack || REDUCED_MOTION) return;
  const slots = [...stack.querySelectorAll(".stack__slot")];
  const cards = slots.map((s) => s.querySelector(".pcard"));
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    cards.forEach((card, i) => {
      const next = slots[i + 1];
      if (!next) return;
      // how far the next slot has travelled up over this one (0 → 1)
      const p = Math.max(0, Math.min(1, 1 - next.getBoundingClientRect().top / vh));
      card.style.setProperty("--scale", (1 - p * 0.06).toFixed(4));
      card.style.setProperty("--dim", (p * 0.5).toFixed(3));
    });
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

// ---------- marquee: duplicate once for a seamless loop, speed by width ----------
(() => {
  const track = document.getElementById("marqueeTrack");
  if (!track) return;
  [...track.children].forEach((n) => {
    const clone = n.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelector("img")?.setAttribute("alt", "");
    track.appendChild(clone);
  });
  // stagger index for the entrance; clones repeat the originals' timing
  const originals = track.children.length / 2;
  [...track.children].forEach((p, i) => p.style.setProperty("--pi", i % originals));
  const setSpeed = () => {
    const SPEED = 60; // px per second
    track.style.setProperty("--marquee-duration", `${Math.round(track.scrollWidth / 2 / SPEED)}s`);
  };
  setSpeed();
  window.addEventListener("load", setSpeed, { once: true });
})();

// ---------- scrollspy for the nav ----------
(() => {
  const links = [...document.querySelectorAll(".nav .roll")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => io.observe(s));
})();

// ---------- live GenSan clock (PHT) ----------
const localTime = document.getElementById("localTime");
const updateClock = () => {
  localTime.textContent = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Manila",
  }).format(new Date());
};
updateClock();
setInterval(updateClock, 15000);

// ---------- copy email ----------
document.getElementById("copyEmail").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("ejromero294@gmail.com");
    window.showToast("Email copied to clipboard ✓");
  } catch {
    window.showToast("ejromero294@gmail.com");
  }
});

// ---------- contact form dialog ----------
const formDialog = document.getElementById("formDialog");
document.getElementById("openForm").addEventListener("click", () => formDialog.showModal());
document.getElementById("closeForm").addEventListener("click", () => formDialog.close());
formDialog.addEventListener("click", (e) => {
  if (e.target === formDialog) formDialog.close(); // backdrop click
});

// Web3Forms — the access key is meant to live in client-side code; it only
// lets the form email CONTACT_EMAIL, it grants no access to the inbox.
const WEB3FORMS_KEY = "ce9b16f2-c397-459a-9bf5-e620170750ea";
const PAGE_LOADED_AT = Date.now();
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm));
  if (data.botcheck) return; // honeypot tripped — silently drop
  if (Date.now() - PAGE_LOADED_AT < 4000) return; // bots submit instantly; humans can't
  if (!data.name || !data.email || !data.message) {
    window.showToast("Please fill in name, email, and message.");
    return;
  }

  const btn = document.getElementById("contactSubmit");
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Sending…";
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `${data.subject || "New message"} — from ${data.name}`,
        from_name: "rj-romero.vercel.app",
        name: data.name,
        email: data.email,
        topic: data.subject,
        message: data.message,
      }),
    });
    const json = await res.json();
    if (json.success) {
      contactForm.reset();
      formDialog.close();
      window.showToast("Message sent — thanks! I'll reply soon ✓");
    } else {
      window.showToast("Couldn't send. Please email me directly.");
    }
  } catch {
    window.showToast("Network error. Please email me directly.");
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});

// ---------- live GitHub repo count (fails silently if offline/rate-limited) ----------
fetch("https://api.github.com/users/Git-branches")
  .then((r) => (r.ok ? r.json() : null))
  .then((user) => {
    if (!user || !user.public_repos) return;
    document.getElementById("repoCount").textContent = user.public_repos;
    document.getElementById("repoTotal").textContent = user.public_repos;
  })
  .catch(() => {});
