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
        <span class="bot__tag mono">scripted demo</span>
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

  const CHIPS = ["What do you build?", "Tech stack?", "SMS integration?", "Pricing?", "Download résumé"];

  const INTENTS = [
    {
      match: /\b(hi|hello|hey|yow?|kumusta|musta|good\s*(morning|afternoon|evening))\b/,
      reply: () =>
        "Hello! 👋 I'm Rhon's assistant — a small scripted bot, and also a demo of the chatbots he builds into client systems. Ask me about his <strong>services</strong>, <strong>tech stack</strong>, <strong>projects</strong>, <strong>SMS integration</strong>, or <strong>pricing</strong>.",
    },
    {
      match: /(sms|philsms|semaphore|unisms|otp|text\s*(blast|message)|notif)/,
      reply: () =>
        `Yes — Rhon integrates <strong>SMS notifications</strong> into systems using Philippine gateways: <strong>PhilSMS</strong>, <strong>Semaphore</strong>, and <strong>UniSMS</strong>. Think OTP logins, payment confirmations, attendance alerts to parents, or due-date reminders — straight to any PH number. <a href="mailto:ejromero294@gmail.com">Ask him about it</a>.`,
    },
    {
      match: /(download|pdf|resume|résumé|cv|curriculum|experience|education|graduate)/,
      reply: () =>
        `Here you go: <a href="assets/Rhon-Jon-Romero-Resume.pdf" download>Download his résumé (PDF)</a> — or browse the <a href="resume.html">résumé page</a>. Short version: <strong>BSIT graduate</strong> (SEAIT, 2026), two production systems for paying clients, plus a shelf of shipped projects.`,
    },
    {
      match: /(service|offer|what.*(do|build)|gawa|website|system)/,
      reply: () =>
        `Rhon builds three things: <strong>business systems</strong> (POS, attendance, scheduling, records), <strong>full-stack web apps</strong> end-to-end, and <strong>AI &amp; SMS integrations</strong> like this widget. See <a href="#services">What I Do</a> — or jump straight to <a href="#work">his shipped work</a>.`,
    },
    {
      match: /(price|pricing|cost|rate|magkano|budget|bayad|fee|how much)/,
      reply: () =>
        `Every system is scoped individually — a landing site and a full POS are very different builds. The honest answer: <a href="mailto:ejromero294@gmail.com">email Rhon</a> with what you need and you'll get a concrete quote, usually within a day.`,
    },
    {
      match: /(project|portfolio|work|shipped|example|damayan|power\s*giant|pos|attendance|cropsight)/,
      reply: () =>
        `He's shipped <strong>17+ systems</strong> — two are live in production for paying clients: <a href="projects/divine-life-damayan.html">Divine Life Damayan</a> (1,200+ members) and <a href="projects/power-giant-rmt.html">Power Giant RMT</a>. The rest — QR attendance, POS, crop monitoring with a chatbot — are in <a href="#work">Things I've Built</a> and on <a href="https://github.com/Git-branches" target="_blank" rel="noopener">GitHub</a>.`,
    },
    {
      match: /(stack|tech|php|mysql|postgres|node|java\b|laravel|language|tool|framework|tailwind|react|oauth|rest)/,
      reply: () =>
        `Backend: <strong>PHP, Laravel, Node.js, Java</strong> with REST APIs and OAuth. Databases: <strong>MySQL &amp; PostgreSQL</strong>. Frontend: JavaScript, Tailwind, Bootstrap — currently leveling up with React. Plus SMS gateways and AI chatbot integrations. Full list in <a href="#stack">Tech Stack</a>.`,
    },
    {
      match: /(ai\b|chatbot|claude|chatgpt|assistant|bot\b)/,
      reply: () =>
        `AI integration is one of his services — chatbot assistants folded into existing systems, like the one in Cropsight v2. Fun fact: this widget is a zero-cost scripted version of exactly that. Want an AI-powered one in your system? <a href="mailto:ejromero294@gmail.com">Ask him</a>.`,
    },
    {
      match: /(linkedin|jobstreet|indeed|github|social|connect|profile)/,
      reply: () =>
        `Find him here: <a href="https://github.com/Git-branches" target="_blank" rel="noopener">GitHub</a> · <a href="https://www.linkedin.com/in/ej-romero-bba17238b" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://ph.jobstreet.com/profiles/rhonjong-romero-m8LWX00L8B" target="_blank" rel="noopener">JobStreet</a> — or just <a href="mailto:ejromero294@gmail.com">email him</a>.`,
    },
    {
      match: /(contact|hire|email|reach|avail|inquir|touch)/,
      reply: () =>
        `Email is best: <a href="mailto:ejromero294@gmail.com">ejromero294@gmail.com</a> — or the <a href="#contact">contact section</a> has a copy button and all his profiles. He's currently <strong>open to projects</strong>.`,
    },
    {
      match: /(where|location|based|taga|city|remote)/,
      reply: () =>
        `Based in <strong>General Santos City, Philippines</strong> — and happy to work remotely with clients anywhere.`,
    },
    {
      match: /(dark|light)\s*mode|theme|sound|music|effect/,
      reply: () =>
        `Nice catch 👀 — try the <strong>◐ toggle</strong> up top: the whole site flips black&nbsp;&amp;&nbsp;white, and his portrait in <a href="#about">About</a> re-renders as an inverted halftone. The 🔊 toggle controls the UI sound effects. All hand-built, no libraries.`,
    },
    {
      match: /(thank|salamat|thanks|ty\b)/,
      reply: () => `Walang anuman! 🙌 Anything else — services, projects, SMS, or pricing?`,
    },
  ];

  const FALLBACK = () =>
    `I'm just a scripted bot, so that one's beyond me 😅 — try asking about <strong>services</strong>, <strong>projects</strong>, <strong>stack</strong>, <strong>SMS integration</strong>, or <strong>pricing</strong>. For everything else, <a href="mailto:ejromero294@gmail.com">email Rhon directly</a>.`;

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
