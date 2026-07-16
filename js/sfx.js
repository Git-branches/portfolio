// ============================================================
// UI sound effects — shared across all pages (Web Audio, no files)
// Hover tick, click blip, theme-toggle sweep. Mutable via 🔊 toggle,
// persisted in localStorage("sound").
// ============================================================

(() => {
  const soundToggle = document.getElementById("soundToggle");
  const soundIcon = document.getElementById("soundIcon");
  let soundOn = localStorage.getItem("sound") !== "off";
  let audioCtx = null;

  // speaker glyphs: volume-high (3 waves) vs muted (X)
  const SPEAKER = '<path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none"/>';
  const SVG_OPEN =
    '<svg class="vol-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  const VOL_ON =
    `${SVG_OPEN}${SPEAKER}<path d="M15 9.5a3.5 3.5 0 0 1 0 5"/><path d="M17.7 7a7 7 0 0 1 0 10"/><path d="M20.3 4.5a10.5 10.5 0 0 1 0 15"/></svg>`;
  const VOL_OFF =
    `${SVG_OPEN}${SPEAKER}<path d="M16 9.5l5 5m0-5l-5 5"/></svg>`;

  function syncSoundIcon() {
    if (!soundToggle) return;
    soundIcon.innerHTML = soundOn ? VOL_ON : VOL_OFF;
    soundToggle.setAttribute("aria-pressed", String(soundOn));
  }
  syncSoundIcon();

  function playTone(freq, dur, type, vol, delay = 0) {
    if (!soundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const t = audioCtx.currentTime + delay;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur);
    } catch {
      /* audio unavailable — stay silent */
    }
  }

  const sfx = {
    hover: () => playTone(1500, 0.045, "sine", 0.02),
    click: () => playTone(650, 0.09, "triangle", 0.05),
    theme: () => { playTone(480, 0.12, "sine", 0.05); playTone(920, 0.16, "sine", 0.05, 0.09); },
    on:    () => { playTone(600, 0.08, "sine", 0.05); playTone(1200, 0.12, "sine", 0.05, 0.07); },
  };

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      soundOn = !soundOn;
      localStorage.setItem("sound", soundOn ? "on" : "off");
      syncSoundIcon();
      if (soundOn) sfx.on();
    });
  }

  // everything that should tick when the cursor lands on it
  const HOVER_TARGETS =
    "a, button, summary, .stack-card, .ledger__row, .fan__card, .stat, .resume__item, .case__shot";

  let lastHovered = null;
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest(HOVER_TARGETS);
    if (!el) { lastHovered = null; return; }
    if (el === lastHovered) return;
    // moving between a card and a link inside it shouldn't double-tick
    if (lastHovered && (el.contains(lastHovered) || lastHovered.contains(el))) {
      lastHovered = el;
      return;
    }
    lastHovered = el;
    sfx.hover();
  });

  // blip on every click of a link/button (theme toggle gets its own sweep)
  document.addEventListener("click", (e) => {
    const el = e.target.closest("a, button, summary");
    if (!el || el.id === "soundToggle") return;
    if (el.id === "themeToggle") { sfx.theme(); return; }
    sfx.click();
  });
})();
