// ============================================================
// Halftone portrait — 2x2 square, theme-swapped:
//   light mode → assets/profile.png       (formal photo, ink dots)
//   dark mode  → assets/profile-dark.png  (GitHub avatar, light dots)
// Dot grid runs at 15°; repaints when the theme toggle flips.
// ============================================================

(() => {
  const canvas = document.getElementById("halftonePhoto");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const sources = {
    // crop: source-pixel square to focus on (keeps the subject in frame)
    light: { src: "assets/profile1.jpg", crop: { x: 51, y: 6, s: 445 } },
    dark: { src: "assets/profile-dark.png" },
  };
  const cache = {}; // theme → { data, lo, hi } or { img } when pixels are unreadable

  const currentTheme = () =>
    document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

  function load(theme) {
    return new Promise((resolve) => {
      if (cache[theme]) return resolve();
      const cfg = sources[theme];
      const img = new Image();
      img.onload = () => {
        const off = document.createElement("canvas");
        off.width = W;
        off.height = H;
        const octx = off.getContext("2d");
        // focus crop when configured, else centered square biased to the top
        let { x: sx, y: sy, s } = cfg.crop || {};
        if (!s) {
          s = Math.min(img.width, img.height);
          sx = (img.width - s) / 2;
          sy = Math.min((img.height - s) / 2, img.height * 0.03);
        }
        octx.drawImage(img, sx, sy, s, s, 0, 0, W, H);
        try {
          const data = octx.getImageData(0, 0, W, H).data;
          // auto-levels: stretch the 5th–95th luminance percentiles to full
          // range so dark, busy photos don't collapse into solid ink
          const lums = [];
          for (let i = 0; i < data.length; i += 16) {
            if (data[i + 3] < 120) continue;
            lums.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
          }
          lums.sort((a, b) => a - b);
          const lo = (lums[Math.floor(lums.length * 0.05)] || 0) / 255;
          const hi = (lums[Math.floor(lums.length * 0.95)] || 255) / 255;
          cache[theme] = { data, lo, hi: Math.max(hi, lo + 0.05) };
        } catch {
          // canvas tainted (file:// preview) — fall back to the plain photo
          cache[theme] = { img, sx, sy, s };
        }
        resolve();
      };
      img.onerror = () => {
        cache[theme] = {};
        resolve();
      };
      img.src = cfg.src;
    });
  }

  function luminanceAt(data, x, y) {
    const xi = Math.min(W - 1, Math.max(0, Math.round(x)));
    const yi = Math.min(H - 1, Math.max(0, Math.round(y)));
    const i = (yi * W + xi) * 4;
    if (data[i + 3] < 120) return null; // transparent background — no dot
    return (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
  }

  function render() {
    const theme = currentTheme();
    load(theme).then(() => {
      const entry = cache[theme];
      ctx.clearRect(0, 0, W, H);
      if (!entry) return;
      if (!entry.data) {
        if (entry.img) ctx.drawImage(entry.img, entry.sx, entry.sy, entry.s, entry.s, 0, 0, W, H);
        return;
      }

      const dark = theme === "dark";
      ctx.fillStyle = dark ? "#f2f2f2" : "#141414";

      const pitch = 7;
      const angle = (15 * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const reach = Math.sqrt(W * W + H * H) / 2 + pitch;

      for (let v = -reach; v < reach; v += pitch) {
        for (let u = -reach; u < reach; u += pitch) {
          const x = u * cos - v * sin + W / 2;
          const y = u * sin + v * cos + H / 2;
          if (x < 0 || x >= W || y < 0 || y >= H) continue;
          const raw = luminanceAt(entry.data, x, y);
          if (raw === null) continue;
          const lum = Math.min(1, Math.max(0, (raw - entry.lo) / (entry.hi - entry.lo)));
          // light mode: more ink where the photo is dark;
          // dark mode: more light where the photo is bright (negative)
          const strength = dark ? lum : 1 - lum;
          const r = Math.pow(strength, 0.85) * pitch * 0.62;
          if (r < 0.35) continue;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  render();

  new MutationObserver(render).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
})();
