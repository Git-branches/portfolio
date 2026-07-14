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

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
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
const rotatorWords = ["systems", "POS tools", "dashboards", "web apps", "platforms"];
let rotatorIndex = 0;
setInterval(() => {
  rotator.classList.add("is-out");
  setTimeout(() => {
    rotatorIndex = (rotatorIndex + 1) % rotatorWords.length;
    rotator.textContent = rotatorWords[rotatorIndex];
    rotator.classList.remove("is-out");
  }, 350);
}, 3200);

// ---------- live GenSan clock (PHT, UTC+8) ----------
const localTime = document.getElementById("localTime");
function updateClock() {
  localTime.textContent = new Intl.DateTimeFormat("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
const contactForm = document.getElementById("contactForm");
contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm));
  if (data.botcheck) return; // honeypot tripped — silently drop
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

fetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=3`)
  .then((r) => (r.ok ? r.json() : null))
  .then((repos) => {
    if (!Array.isArray(repos) || repos.length === 0) return;
    const list = document.getElementById("ghActivityList");
    list.innerHTML = repos
      .map((repo) => {
        const date = new Date(repo.pushed_at).toLocaleDateString("en-PH", {
          year: "numeric", month: "short", day: "numeric",
        });
        return `<li><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a><span class="gh-activity__date">${date}</span></li>`;
      })
      .join("");
    document.getElementById("ghActivity").hidden = false;
  })
  .catch(() => {});
