// ============================================================
// Command palette — press Cmd/Ctrl+K (or "/") to open. Fuzzy-filter
// a list of navigation + action commands, arrow keys to move, Enter
// to run. Shared across all pages. Zero dependencies.
// ============================================================
(() => {
  const commands = [
    { label: "Home", hint: "top of page", icon: "⌂", run: () => go("/#top") },
    { label: "Tech Stack", hint: "tools I use", icon: "§", run: () => go("/#stack") },
    { label: "Things I've Built", hint: "projects", icon: "§", run: () => go("/#work") },
    { label: "What I Do", hint: "services", icon: "§", run: () => go("/#services") },
    { label: "About", hint: "the person", icon: "§", run: () => go("/#about") },
    { label: "Contact", hint: "send a message", icon: "§", run: () => go("/#contact") },
    { label: "Open Résumé", hint: "full CV page", icon: "↗", run: () => go("/resume") },
    { label: "Download Résumé (PDF)", hint: "save a copy", icon: "↓", run: () => go("/assets/Rhon-Jon-Romero-Resume.pdf") },
    { label: "Toggle theme", hint: "light / dark", icon: "◐", run: () => document.getElementById("themeToggle")?.click() },
    { label: "Toggle sound", hint: "SFX on / off", icon: "♪", run: () => document.getElementById("soundToggle")?.click() },
    { label: "Email me", hint: "ejromero294@gmail.com", icon: "✉", run: () => (location.href = "mailto:ejromero294@gmail.com") },
    { label: "GitHub", hint: "github.com/Git-branches", icon: "↗", run: () => openTab("https://github.com/Git-branches") },
    { label: "LinkedIn", hint: "connect", icon: "↗", run: () => openTab("https://www.linkedin.com/in/ej-romero-bba17238b") },
  ];

  function go(url) {
    const u = new URL(url, location.href);
    const el = u.hash && document.querySelector(u.hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", u.hash);
    } else {
      location.href = url;
    }
  }
  const openTab = (u) => window.open(u, "_blank", "noopener");

  const root = document.createElement("div");
  root.className = "cmdk";
  root.hidden = true;
  root.innerHTML = `
    <div class="cmdk__backdrop" data-close></div>
    <div class="cmdk__panel" role="dialog" aria-label="Command palette" aria-modal="true">
      <input class="cmdk__input" id="cmdkInput" type="text" placeholder="Type a command or search…" autocomplete="off" spellcheck="false" />
      <ul class="cmdk__list" id="cmdkList"></ul>
      <div class="cmdk__foot mono"><span>↑↓ move</span><span>⏎ select</span><span>esc close</span></div>
    </div>`;
  document.body.appendChild(root);

  const input = root.querySelector("#cmdkInput");
  const list = root.querySelector("#cmdkList");
  let results = commands;
  let active = 0;

  // strip accents so "resume" matches "Résumé"
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const match = (q, label) => {
    q = norm(q); label = norm(label);
    if (label.includes(q)) return true;
    let i = 0; // subsequence fuzzy fallback
    for (const ch of label) if (ch === q[i]) i++;
    return i === q.length;
  };

  function render() {
    if (!results.length) {
      list.innerHTML = `<li class="cmdk__empty mono">No commands found</li>`;
      return;
    }
    list.innerHTML = results
      .map(
        (c, i) =>
          `<li class="cmdk__item${i === active ? " is-active" : ""}" data-i="${i}">
             <span class="cmdk__icon" aria-hidden="true">${c.icon}</span>
             <span class="cmdk__label">${c.label}</span>
             <span class="cmdk__hint mono">${c.hint}</span>
           </li>`
      )
      .join("");
  }

  function filter() {
    const q = input.value.trim();
    results = q ? commands.filter((c) => match(q, c.label) || match(q, c.hint)) : commands;
    active = 0;
    render();
  }

  function open() {
    root.hidden = false;
    input.value = "";
    filter();
    requestAnimationFrame(() => input.focus());
  }
  function close() {
    root.hidden = true;
    input.blur();
  }
  const isOpen = () => !root.hidden;

  function exec(i) {
    const cmd = results[i];
    if (!cmd) return;
    close();
    cmd.run();
  }

  // global open shortcut
  document.addEventListener("keydown", (e) => {
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      isOpen() ? close() : open();
      return;
    }
    // "/" opens too, unless typing in a field
    if (e.key === "/" && !isOpen() && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
      e.preventDefault();
      open();
    }
  });

  // in-palette keys
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, results.length - 1); render(); scrollActive(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); render(); scrollActive(); }
    else if (e.key === "Enter") { e.preventDefault(); exec(active); }
  });
  input.addEventListener("input", filter);
  list.addEventListener("click", (e) => {
    const li = e.target.closest(".cmdk__item");
    if (li) exec(Number(li.dataset.i));
  });
  list.addEventListener("mousemove", (e) => {
    const li = e.target.closest(".cmdk__item");
    if (li && Number(li.dataset.i) !== active) { active = Number(li.dataset.i); render(); }
  });
  root.querySelector("[data-close]").addEventListener("click", close);

  function scrollActive() {
    list.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
  }
})();
