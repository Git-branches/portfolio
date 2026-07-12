// ============================================================
// "Ask my assistant" — lightweight scripted chatbot.
// No API calls, no cost: keyword-matched answers about Rhon's
// services, stack, and projects. Also a live demo of the kind
// of assistant he integrates into client systems.
// ============================================================
(() => {
  // the launcher button lives in the floating quick-actions dial (#fab)
  const launcher = document.getElementById("botLauncher");
  if (!launcher) return;

  const root = document.createElement("div");
  root.className = "bot";
  root.innerHTML = `
    <div class="bot__panel" id="botPanel" role="dialog" aria-label="Chat assistant" hidden>
      <div class="bot__head">
        <span class="bot__title">RJR Assistant</span>
        <span class="bot__tag mono">scripted bot · no AI bill</span>
        <button class="bot__close" id="botClose" aria-label="Close chat">✕</button>
      </div>
      <div class="bot__messages" id="botMessages"></div>
      <div class="bot__chips" id="botChips"></div>
      <form class="bot__form" id="botForm">
        <input class="bot__input" id="botInput" type="text" placeholder="Ask about services, stack, pricing…" autocomplete="off" />
        <button class="bot__send" type="submit" aria-label="Send">→</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const panel = document.getElementById("botPanel");
  const messages = document.getElementById("botMessages");
  const chipsEl = document.getElementById("botChips");
  const form = document.getElementById("botForm");
  const input = document.getElementById("botInput");

  const CHIPS = ["What do you build?", "Tech stack?", "Pricing?", "How do I contact you?"];

  const INTENTS = [
    {
      match: /\b(hi|hello|hey|yo|kumusta|musta|good\s*(morning|afternoon|evening))\b/,
      reply: () =>
        "Hello! 👋 I'm Rhon's assistant — a small scripted bot, and also a demo of the chatbots he builds into client systems. Ask me about his <strong>services</strong>, <strong>tech stack</strong>, <strong>projects</strong>, or <strong>pricing</strong>.",
    },
    {
      match: /(service|offer|what.*(do|build)|gawa|website|system)/,
      reply: () =>
        `Rhon builds three things: <strong>business systems</strong> (POS, attendance, scheduling, records), <strong>full-stack web apps</strong> end-to-end, and <strong>AI integrations</strong> like this widget. See <a href="#services">What I Do</a> — or jump straight to <a href="#work">his shipped work</a>.`,
    },
    {
      match: /(price|pricing|cost|rate|magkano|budget|bayad|fee|how much)/,
      reply: () =>
        `Every system is scoped individually — a landing site and a full POS are very different builds. The honest answer: <a href="mailto:ejromero294@gmail.com">email Rhon</a> with what you need and you'll get a concrete quote, usually within a day.`,
    },
    {
      match: /(project|portfolio|work|shipped|example|damayan|power\s*giant|pos|attendance)/,
      reply: () =>
        `He's shipped 7+ systems — two are live in production for paying clients: <a href="projects/divine-life-damayan.html">Divine Life Damayan</a> (1,200+ members) and <a href="projects/power-giant-rmt.html">Power Giant RMT</a>. The rest are on <a href="https://github.com/Git-branches" target="_blank" rel="noopener">GitHub</a>.`,
    },
    {
      match: /(stack|tech|php|mysql|language|tool|framework|tailwind|react|laravel)/,
      reply: () =>
        `Core stack: <strong>PHP + MySQL</strong> — it runs reliably on the cPanel hosting most PH businesses already have. Frontend: JavaScript, Tailwind, Bootstrap. Currently leveling up with React and Laravel. Full list in <a href="#stack">Tech Stack</a>.`,
    },
    {
      match: /(ai|chatbot|claude|chatgpt|assistant|bot)/,
      reply: () =>
        `AI integration is one of his services — chatbot assistants folded into existing systems, like the one in Cropsight v2. Fun fact: this widget is a zero-cost scripted version of exactly that. Want an AI-powered one in your system? <a href="mailto:ejromero294@gmail.com">Ask him</a>.`,
    },
    {
      match: /(contact|hire|email|reach|avail|inquir|touch)/,
      reply: () =>
        `Email is best: <a href="mailto:ejromero294@gmail.com">ejromero294@gmail.com</a> — or the <a href="#contact">contact section</a> has a copy button. He's currently <strong>open to projects</strong>.`,
    },
    {
      match: /(resume|cv|curriculum|experience|education|graduate)/,
      reply: () =>
        `There's a full <a href="resume.html">résumé page</a> with work experience, education, and a Download PDF button. Short version: BSIT graduate (SEAIT, 2026), two production systems for real clients.`,
    },
    {
      match: /(where|location|based|taga|city|remote)/,
      reply: () =>
        `Based in <strong>General Santos City, Philippines</strong> — and happy to work remotely with clients anywhere.`,
    },
    {
      match: /(thank|salamat|thanks|ty\b)/,
      reply: () => `Walang anuman! 🙌 Anything else — services, projects, pricing?`,
    },
  ];

  const FALLBACK = () =>
    `I'm just a scripted bot, so that one's beyond me 😅 — try asking about <strong>services</strong>, <strong>projects</strong>, <strong>stack</strong>, or <strong>pricing</strong>. For everything else, <a href="mailto:ejromero294@gmail.com">email Rhon directly</a>.`;

  const addMsg = (html, who) => {
    const div = document.createElement("div");
    div.className = `bot__msg bot__msg--${who}`;
    div.innerHTML = html;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  };

  const respond = (text) => {
    const typing = addMsg("<span class='bot__dots'><i></i><i></i><i></i></span>", "bot");
    setTimeout(() => {
      const q = text.toLowerCase();
      const intent = INTENTS.find((i) => i.match.test(q));
      typing.innerHTML = intent ? intent.reply() : FALLBACK();
      messages.scrollTop = messages.scrollHeight;
    }, 550);
  };

  const ask = (text) => {
    addMsg(text.replace(/</g, "&lt;"), "user");
    respond(text);
  };

  // quick-reply chips
  CHIPS.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "bot__chip";
    b.textContent = c;
    b.addEventListener("click", () => ask(c));
    chipsEl.appendChild(b);
  });

  let greeted = false;
  const toggle = (show) => {
    panel.hidden = !show;
    if (show) {
      // collapse the quick-actions dial so the panel has the corner to itself
      document.getElementById("fab")?.classList.remove("is-open");
      if (!greeted) {
        greeted = true;
        respond("hello");
      }
      input.focus();
    }
  };

  launcher.addEventListener("click", () => toggle(true));
  document.getElementById("botClose").addEventListener("click", () => toggle(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) toggle(false);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    ask(text);
  });
})();
