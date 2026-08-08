// ============================================================
// Hero pixel-art character — sprite-sheet driven.
//
// Sheets live in assets/ and are 1376x768: a 4x2 grid of 8 walking
// frames, each 344x384. The element is sized to one frame and the sheet
// is scrolled with background-position, so only the visible frame ever
// changes — the element itself never moves or resizes, which keeps the
// figure locked in place and the layout stable.
//
//   frame i → column i % 4, row floor(i / 4)
//   with background-size: 400% 200%, column c sits at c * 100/3 %
//   and row r at r * 100 %.
//
// Cycle: idle → 3 walking steps → idle → pause → repeat. Hovering runs a
// longer walk; switching themes crossfades to the other sheet and walks
// once. Honours prefers-reduced-motion by holding a single frame.
// ============================================================

(() => {
  const sprite = document.getElementById("heroSprite");
  if (!sprite) return;

  const COLS = 4;
  const TOTAL = 8;
  const FRAME_MS = 170; // ~6fps — slow enough to read as steps, not a flicker
  const IDLE_FRAME = 7; // the most planted, upright pose in both sheets

  const SHEETS = {
    light: "assets/graduate-walk-8frames.png",
    dark: "assets/developer-walk-8frames.png",
  };

  // both sheets are fetched up front so a theme switch never flashes
  Object.values(SHEETS).forEach((src) => {
    const pre = new Image();
    pre.src = src;
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const themeOf = () =>
    document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

  let frame = IDLE_FRAME;
  let framesLeft = 0; // remaining walk frames; 0 means idle
  let nextStroll = 0;
  let last = 0;
  let running = true;
  let rafId = null;

  function paint(i) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    sprite.style.backgroundPosition = `${(col * 100) / (COLS - 1)}% ${row * 100}%`;
  }

  function applySheet(theme) {
    sprite.style.backgroundImage = `url("${SHEETS[theme]}")`;
  }

  function walk(frames) {
    if (reduced.matches) return;
    framesLeft = Math.max(framesLeft, frames);
  }

  function scheduleStroll(now) {
    nextStroll = now + 4000 + Math.random() * 2000; // idle 4–6s between walks
  }

  function tick(now) {
    rafId = null;
    if (!running) return;

    if (now - last >= FRAME_MS) {
      last = now;
      if (framesLeft > 0) {
        frame = (frame + 1) % TOTAL;
        framesLeft--;
        // walks are whole cycles, so the last frame lands back on the idle
        // pose on its own — no snap, and the figure ends where it started
        if (framesLeft === 0) scheduleStroll(now);
        paint(frame);
      } else if (now > nextStroll) {
        walk(TOTAL); // one full cycle = 2 steps
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (rafId === null && running) rafId = requestAnimationFrame(tick);
  }

  // ---------- wiring ----------
  applySheet(themeOf());
  paint(IDLE_FRAME);

  if (!reduced.matches) {
    scheduleStroll(performance.now());
    start();

    // stop the loop while the hero is scrolled out of view
    new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) {
          last = performance.now();
          scheduleStroll(last);
          start();
        }
      },
      { threshold: 0 }
    ).observe(sprite);

    sprite.addEventListener("mouseenter", () => walk(TOTAL * 2)); // 4 steps
  }

  // theme switch: crossfade to the other sheet, then take a few steps
  new MutationObserver(() => {
    const theme = themeOf();
    if (reduced.matches) {
      applySheet(theme);
      paint(IDLE_FRAME);
      return;
    }
    sprite.classList.add("is-swapping");
    setTimeout(() => {
      applySheet(theme);
      frame = IDLE_FRAME;
      paint(frame);
      sprite.classList.remove("is-swapping");
      walk(12);
    }, 180);
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
})();
