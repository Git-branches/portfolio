// ============================================================
// Rhon Jon Romero — Portfolio interactions
// ============================================================

// ---------- theme toggle (persisted) ----------
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.setAttribute("data-theme", "dark");
}

const applyTheme = (next) => {
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
};

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  // animate the new theme sweeping down from the top (View Transitions API);
  // browsers without support (or reduced-motion users) switch instantly
  if (
    document.startViewTransition &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const root = document.documentElement;
    root.classList.add("theme-wipe"); // freeze per-element color transitions
    const vt = document.startViewTransition(() => applyTheme(next));
    vt.ready
      .then(() => {
        root.animate(
          { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"] },
          {
            duration: 450,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {}); // ready rejects if the transition is skipped — fine
    vt.finished.finally(() => root.classList.remove("theme-wipe"));
  } else {
    applyTheme(next);
  }
});

// ---------- mobile nav ----------
const burger = document.getElementById("navBurger");
const navLinks = document.getElementById("navLinks");
burger.addEventListener("click", () => navLinks.classList.toggle("is-open"));
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("is-open"))
);

// ---------- scroll progress bar ----------
const progressBar = document.getElementById("progressBar");
window.addEventListener("scroll", () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  progressBar.style.width = max > 0 ? `${(doc.scrollTop / max) * 100}%` : "0%";
}, { passive: true });

// ---------- reveal on scroll ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- animated stat counters ----------
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".stat__num").forEach((el) => statObserver.observe(el));

// ---------- seamless, continuously moving ticker ----------
// 1. repeat items inside the group until it's wider than the screen
// 2. clone the group once, so translateX(-50%) loops with no visible seam
// 3. scale the duration to the width, so speed stays constant on any screen
const tickerTrack = document.getElementById("tickerTrack");
const tickerGroup = tickerTrack.querySelector(".ticker__group");
const tickerItems = tickerGroup.innerHTML;
let guard = 0;
while (tickerGroup.scrollWidth < window.innerWidth && guard < 10) {
  tickerGroup.innerHTML += tickerItems;
  guard++;
}
tickerTrack.appendChild(tickerGroup.cloneNode(true));
const TICKER_SPEED = 70; // px per second
tickerTrack.style.setProperty(
  "--ticker-duration",
  `${Math.max(10, Math.round(tickerGroup.scrollWidth / TICKER_SPEED))}s`
);

// ---------- hero headline word slideshow ----------
const rotator = document.getElementById("rotator");
const rotatorWords = ["systems", "web apps", "platforms", "dashboards", "portals"];
let rotatorIndex = 0;

// reserve the longest word's width so the headline never re-wraps mid-rotation
const sizeRotator = () => {
  // on phones the word sits on its own line (see CSS) — no reserved slot
  if (window.innerWidth <= 640) {
    rotator.style.minWidth = "";
    rotator.style.textAlign = "";
    return;
  }
  const cs = getComputedStyle(rotator);
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "nowrap";
  probe.style.fontFamily = cs.fontFamily;
  probe.style.fontSize = cs.fontSize;
  probe.style.fontWeight = cs.fontWeight;
  probe.style.fontStyle = cs.fontStyle;
  probe.style.letterSpacing = cs.letterSpacing;
  document.body.appendChild(probe);
  let max = 0;
  rotatorWords.forEach((w) => {
    probe.textContent = w;
    max = Math.max(max, probe.offsetWidth);
  });
  probe.remove();
  rotator.style.minWidth = `${Math.ceil(max)}px`;
  rotator.style.textAlign = "center";
};
window.sizeRotator = sizeRotator; // i18n.js re-runs this after a language switch
if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeRotator);
else sizeRotator();
let rotatorResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(rotatorResizeTimer);
  rotatorResizeTimer = setTimeout(sizeRotator, 150);
});

setInterval(() => {
  rotator.classList.add("is-out");
  setTimeout(() => {
    rotatorIndex = (rotatorIndex + 1) % rotatorWords.length;
    rotator.textContent = rotatorWords[rotatorIndex];
    rotator.classList.remove("is-out");
  }, 350);
}, 3200);

// ---------- services card-stack carousel ----------
// center card is active; prev/next buttons, click a side card, drag with the
// mouse, or swipe on touch to rotate the stack. transforms only — no reflow.
const svcDeck = document.querySelector(".svc-deck");
if (svcDeck) {
  const cards = Array.from(svcDeck.querySelectorAll(".svc-card"));
  // slot for a card = how far it sits from the active one (0 front, 1 right, 2 left)
  const SLOT = ["svc-card--center", "svc-card--right", "svc-card--left"];
  let active = 1; // Full-Stack Web Apps starts in front

  const render = () => {
    cards.forEach((card, i) => {
      card.classList.remove(...SLOT);
      card.classList.add(SLOT[(i - active + cards.length) % cards.length]);
    });
  };
  const step = (dir) => {
    active = (active + dir + cards.length) % cards.length;
    render();
  };
  render();

  // the deck is absolutely positioned, so it needs an explicit height:
  // tallest card + the side cards' tuck offset
  const sizeDeck = () => {
    let max = 0;
    cards.forEach((c) => { max = Math.max(max, c.offsetHeight); });
    svcDeck.style.height = `${Math.ceil(max + 34)}px`;
  };
  window.sizeDeck = sizeDeck; // i18n.js re-runs this (description lengths change)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeDeck);
  else sizeDeck();
  let deckResizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(deckResizeTimer);
    deckResizeTimer = setTimeout(sizeDeck, 150);
  });

  document.getElementById("svcPrev")?.addEventListener("click", () => step(-1));
  document.getElementById("svcNext")?.addEventListener("click", () => step(1));

  // click / keyboard: bring a side card to the front
  let suppressClick = false; // don't treat the end of a drag as a click
  cards.forEach((card, i) => {
    card.setAttribute("tabindex", "0");
    card.addEventListener("click", () => {
      if (suppressClick) return;
      if (i !== active) { active = i; render(); }
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (i !== active) { active = i; render(); }
      } else if (e.key === "ArrowLeft") {
        step(-1);
      } else if (e.key === "ArrowRight") {
        step(1);
      }
    });
  });

  // interactive drag / swipe: the stack scrubs along with the pointer in
  // real time, then springs to its new arrangement on release
  const DRAG_LIMIT = 150; // px the stack will follow before resisting
  const SWIPE_AT = 60;    // px needed to commit a swap on release
  let dragStartX = null;
  let dragDx = 0;

  const clampDx = (dx) => Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dx));

  svcDeck.addEventListener("pointerdown", (e) => {
    dragStartX = e.clientX;
    dragDx = 0;
  });
  window.addEventListener("pointermove", (e) => {
    if (dragStartX === null) return;
    dragDx = clampDx(e.clientX - dragStartX);
    // only enter drag mode once it's clearly a drag, so taps stay clicks
    if (Math.abs(dragDx) > 5) {
      svcDeck.classList.add("is-dragging");
      svcDeck.style.setProperty("--drag", dragDx);
    }
  });
  window.addEventListener("pointerup", () => {
    if (dragStartX === null) return;
    dragStartX = null;
    svcDeck.classList.remove("is-dragging");
    svcDeck.style.setProperty("--drag", 0); // spring back (or into the swap)
    if (Math.abs(dragDx) > SWIPE_AT) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 100);
      step(dragDx < 0 ? 1 : -1); // drag left → next card
    }
    dragDx = 0;
  });
}

// ---------- live GenSan clock (PHT, UTC+8) ----------
const localTime = document.getElementById("localTime");
function updateClock() {
  localTime.textContent = new Intl.DateTimeFormat("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 1000);

// ---------- copy email ----------
const copyBtn = document.getElementById("copyEmail");
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("ejromero294@gmail.com");
    copyBtn.textContent = "Copied ✓";
  } catch {
    copyBtn.textContent = "ejromero294@gmail.com";
  }
  setTimeout(() => (copyBtn.textContent = "Copy email"), 2000);
});

// ---------- contact form ----------
// Web3Forms — the access key is meant to live in client-side code; it only
// lets the form email CONTACT_EMAIL, it grants no access to the inbox.
const WEB3FORMS_KEY = "ce9b16f2-c397-459a-9bf5-e620170750ea";
const PAGE_LOADED_AT = Date.now();
const contactForm = document.getElementById("contactForm");
contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm));
  if (data.botcheck) return; // honeypot tripped — silently drop
  if (Date.now() - PAGE_LOADED_AT < 4000) return; // bots submit instantly; humans can't
  if (!data.name || !data.email || !data.message) {
    window.showToast?.("Please fill in name, email, and message.");
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
      window.showToast?.("Message sent — thanks! I'll reply soon ✓");
    } else {
      window.showToast?.("Couldn't send. Please email me directly.");
    }
  } catch {
    window.showToast?.("Network error. Please email me directly.");
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});

// ---------- scrollspy: highlight nav link for the section in view ----------
const spyLinks = [...navLinks.querySelectorAll("a")];
const spySections = spyLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter((el) => el && el.tagName === "SECTION");

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      spyLinks.forEach((a) =>
        a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
spySections.forEach((sec) => spyObserver.observe(sec));

// ---------- tech-stack provider modals ----------
document.querySelectorAll("[data-modal]").forEach((btn) => {
  btn.addEventListener("click", () => document.getElementById(btn.dataset.modal)?.showModal());
});
document.querySelectorAll(".stack-modal").forEach((dlg) => {
  dlg.querySelector(".stack-modal__close").addEventListener("click", () => dlg.close());
  // clicking the dimmed backdrop (the dialog element itself) closes it
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
});

// ---------- footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- live GitHub data (fails silently if offline/rate-limited) ----------
const GH_USER = "Git-branches";

fetch(`https://api.github.com/users/${GH_USER}`)
  .then((r) => (r.ok ? r.json() : null))
  .then((user) => {
    if (!user || !user.public_repos) return;
    const repoStat = document.getElementById("repoCount");
    // if the counter hasn't animated yet it will count to the real number;
    // if it already finished, snap to the real number once it settles
    repoStat.dataset.count = user.public_repos;
    document.getElementById("repoTotal").textContent = user.public_repos;
    setTimeout(() => {
      if (parseInt(repoStat.textContent, 10) !== user.public_repos) {
        repoStat.textContent = user.public_repos;
      }
    }, 2500);
  })
  .catch(() => {});

// ---------- PWA: register service worker (needs http/https, not file://) ----------
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// ---------- premium pointer effects (fine pointers + motion allowed only) ----------
const FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (FINE_POINTER && !REDUCED_MOTION) {
  // cursor spotlight across each project row (CSS reads --mx/--my)
  document.querySelectorAll(".ledger__row").forEach((row) => {
    row.addEventListener("mousemove", (e) => {
      const r = row.getBoundingClientRect();
      row.style.setProperty("--mx", `${e.clientX - r.left}px`);
      row.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // 3D tilt on screenshot thumbnails — tilts toward the cursor
  document.querySelectorAll(".ledger__row--thumb").forEach((row) => {
    const thumb = row.querySelector(".ledger__thumb");
    if (!thumb) return;
    row.addEventListener("mousemove", (e) => {
      const r = row.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      thumb.style.transform =
        `perspective(600px) rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg) scale(1.05)`;
    });
    row.addEventListener("mouseleave", () => { thumb.style.transform = ""; });
  });

  // magnetic buttons — pull gently toward the cursor, spring back on leave
  document.querySelectorAll(".btn, .svc-nav__btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
      btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
}

// ---------- hero kicker: decode/unscramble on load ----------
(() => {
  // only the place name decodes — the clock beside it is a live element
  const kicker = document.querySelector(".hero .kicker__place");
  if (!kicker || REDUCED_MOTION) return;
  const finalText = kicker.textContent;
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&";
  const totalFrames = Math.ceil(finalText.length * 2.2);
  let frame = 0;
  const tick = () => {
    frame++;
    const reveal = Math.floor((frame / totalFrames) * finalText.length);
    kicker.textContent = [...finalText]
      .map((ch, i) => {
        if (ch === " " || ch === "," || i < reveal) return ch;
        return CHARS[(Math.random() * CHARS.length) | 0];
      })
      .join("");
    if (reveal < finalText.length) setTimeout(tick, 28);
    else kicker.textContent = finalText;
  };
  setTimeout(tick, 350);
})();

// ---------- a11y: keep the burger's expanded state in sync ----------
burger.setAttribute("aria-expanded", "false");
burger.addEventListener("click", () =>
  burger.setAttribute("aria-expanded", String(navLinks.classList.contains("is-open")))
);
