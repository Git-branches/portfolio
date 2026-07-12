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

  function syncSoundIcon() {
    if (!soundToggle) return;
    soundIcon.textContent = soundOn ? "🔊" : "🔇";
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
