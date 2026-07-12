// ============================================================
// Lightbox — click any case-study screenshot to zoom
// ============================================================
(() => {
  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <button class="lightbox__close" aria-label="Close">✕</button>
    <div class="lightbox__scroll"><img class="lightbox__img" alt="" /></div>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector(".lightbox__img");

  const open = (src, alt) => {
    img.src = src;
    img.alt = alt || "";
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    img.src = "";
  };

  document.querySelectorAll(".case__shot img").forEach((shot) => {
    shot.addEventListener("click", () => open(shot.src, shot.alt));
  });

  overlay.addEventListener("click", (e) => {
    // close on backdrop or ✕, but not while clicking/scrolling the image
    if (e.target !== img) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
})();
