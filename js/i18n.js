// ============================================================
// English / Tagalog toggle
// Elements opt in via data-i18n (textContent), data-i18n-html
// (innerHTML, for strings with <strong>/<br>), or data-i18n-ph
// (placeholder). Each key maps to [english, tagalog].
// ============================================================
(() => {
  const I18N = {
    // nav
    nav_work: ["Work", "Mga Gawa"],
    nav_services: ["Services", "Serbisyo"],
    nav_about: ["About", "Tungkol"],
    nav_contact: ["Contact", "Kontak"],

    // hero
    hero_t1: ["I build", "Gumagawa ako ng"],
    hero_t2: [
      "that keep<br />real businesses running.",
      "na nagpapatakbo<br />sa totoong mga negosyo.",
    ],
    hero_sub: [
      "Hi, I'm <strong>Rhon Jon Romero</strong> — an IT graduate and <strong>aspiring Full Stack Developer</strong> building web &amp; mobile experiences. From personal projects to production features, I ship things that actually work.",
      "Hi, ako si <strong>Rhon Jon Romero</strong> — IT graduate at <strong>aspiring Full Stack Developer</strong> na gumagawa ng web at mobile experiences. Mula sa personal projects hanggang production features, gumagawa ako ng mga bagay na talagang gumagana.",
    ],
    hero_cta1: ["See my work ↓", "Tingnan ang gawa ko ↓"],
    hero_cta2: ["Get in touch", "Makipag-ugnayan"],
    hero_badge: ["Open to projects and work", "Bukas sa projects at trabaho"],
    stat_repos: ["Public repositories", "Mga public repository"],
    stat_shipped: ["Systems shipped", "Mga na-ship na system"],

    // section heads
    note_stack: ["tools I reach for daily", "mga tool na gamit ko araw-araw"],
    title_work: ["Things I've Built", "Mga Nagawa Ko"],
    note_work: ["systems in production & on GitHub", "mga system sa production at sa GitHub"],
    note_github: ["a year of commits at a glance", "isang taon ng commits sa isang tingin"],
    title_services: ["What I Do", "Ano ang Ginagawa Ko"],
    note_services: ["from idea to deployed system", "mula idea hanggang naka-deploy na system"],
    title_about: ["About", "Tungkol sa Akin"],
    note_about: ["the person behind the commits", "ang tao sa likod ng mga commit"],
    title_contact: ["Contact", "Kontak"],
    note_contact: ["let's build something", "gumawa tayo ng bago"],

    // projects
    proj1_desc: [
      "Membership & mutual-aid platform with CMS-managed landing pages, over-the-counter payment processing, and multi-language support.",
      "Membership at mutual-aid platform na may CMS-managed landing pages, over-the-counter payment processing, at multi-language support.",
    ],
    proj2_desc: [
      "Corporate site for a multi-service company — oils, waste management, cleaning, and logistics — with service catalog, testimonials, and quote requests.",
      "Corporate site para sa multi-service company — oils, waste management, cleaning, at logistics — may service catalog, testimonials, at quote requests.",
    ],
    proj3_desc: [
      "Attendance tracking that replaces paper logbooks — students scan a QR code and records land in a live dashboard.",
      "Attendance tracking na pumapalit sa papel na logbook — magsa-scan ng QR code ang estudyante at diretso sa live dashboard ang record.",
    ],
    proj4_desc: [
      "Crop-monitoring platform, rebuilt with a chatbot assistant and a refreshed UI/UX for farmers and agri-technicians.",
      "Crop-monitoring platform, ni-rebuild na may chatbot assistant at bagong UI/UX para sa mga magsasaka at agri-technician.",
    ],
    proj5_desc: [
      "Point-of-sale system with barcode scanning, inventory, and sales reporting for small retail stores.",
      "Point-of-sale system na may barcode scanning, inventory, at sales reporting para sa maliliit na retail store.",
    ],
    proj6_desc: [
      "License portal and records information system — application, renewal, and record lookup in one place.",
      "License portal at records information system — application, renewal, at record lookup sa iisang lugar.",
    ],
    proj7_desc: [
      "Classroom scheduling system that untangles room conflicts and teacher loads for schools.",
      "Classroom scheduling system na nag-aayos ng room conflicts at teacher loads para sa mga paaralan.",
    ],
    read_case: ["Read case study →", "Basahin ang case study →"],
    repos_all: ["All", "Lahat ng"],
    repos_tail: ["repositories on GitHub ↗", "repositories sa GitHub ↗"],

    // services
    svc1_desc: [
      "POS with barcode scanning, attendance tracking, scheduling, and record management — custom-built around how your business actually operates.",
      "POS na may barcode scanning, attendance tracking, scheduling, at record management — custom-built ayon sa kung paano talaga tumatakbo ang negosyo mo.",
    ],
    svc2_desc: [
      "End-to-end delivery: database design, backend logic, responsive UI, and deployment to the cPanel hosting you already pay for.",
      "End-to-end delivery: database design, backend logic, responsive UI, at deployment sa cPanel hosting na binabayaran mo na.",
    ],
    svc3_desc: [
      "Chatbot assistants and AI-assisted workflows folded into existing systems — like the assistant built into Cropsight v2.",
      "Chatbot assistants at AI-assisted workflows na isinama sa mga existing system — tulad ng assistant sa Cropsight v2.",
    ],

    // about
    about_p1: [
      "I'm a recent <strong>Bachelor of Science in Information Technology</strong> graduate from South East Asian Institute of Technology (Tupi, South Cotabato, Philippines), now based in <strong>General Santos City</strong>. My development journey spans web — from building and shipping full applications from the ground up, to engineering production-level features during a hands-on internship.",
      "Bagong graduate ako ng <strong>Bachelor of Science in Information Technology</strong> mula sa South East Asian Institute of Technology (Tupi, South Cotabato, Philippines), at nakabase na ngayon sa <strong>General Santos City</strong>. Sumasaklaw ang development journey ko sa web — mula sa pagbuo at pag-ship ng buong applications mula sa simula, hanggang sa paggawa ng production-level features noong hands-on internship ko.",
    ],
    about_p2: [
      "I care about clean code, meaningful user experiences, and building tools that actually work for the people who use them.",
      "Mahalaga sa akin ang malinis na code, makabuluhang user experience, at paggawa ng mga tool na talagang gumagana para sa mga gumagamit nito.",
    ],
    about_p3: [
      "My default stack is <strong>PHP + MySQL</strong> because it's what runs reliably on the hosting my clients already have. Lately I've been folding <strong>AI assistants</strong> into those systems and leveling up with React.",
      "Ang default stack ko ay <strong>PHP + MySQL</strong> dahil ito ang maaasahang tumatakbo sa hosting na meron na ang mga kliyente ko. Kamakailan, isinasama ko na ang <strong>AI assistants</strong> sa mga system na iyon habang nagle-level up sa React.",
    ],
    about_time: ["Local time in General Santos City:", "Oras ngayon sa General Santos City:"],
    gh_latest: ["// latest pushes on GitHub", "// pinakabagong pushes sa GitHub"],

    // contact
    form_name: ["// your name", "// pangalan mo"],
    form_email: ["// your email", "// email mo"],
    form_topic: ["// what's this about?", "// tungkol saan ito?"],
    form_msg: ["// message", "// mensahe"],
    form_msg_ph: ["Tell me about your project or role…", "Ikuwento mo ang project o role mo…"],
    opt_none: ["— select a topic (optional) —", "— pumili ng topic (optional) —"],
    opt_hi: ["Just saying hi", "Kumusta lang"],
    opt_other: ["Other", "Iba pa"],
    send_btn: ["Send message →", "Ipadala ang mensahe →"],

    // footer
    footer_note: ["Designed & built by hand — no templates", "Dinisenyo at ginawa nang mano-mano — walang template"],
    footer_top: ["Back to top ↑", "Balik sa taas ↑"],
  };

  const langLabel = document.getElementById("langLabel");

  function applyLang(lang) {
    const idx = lang === "tl" ? 1 : 0;
    document.documentElement.lang = lang === "tl" ? "tl" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const t = I18N[el.dataset.i18n];
      if (t) el.textContent = t[idx];
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const t = I18N[el.dataset.i18nHtml];
      if (t) el.innerHTML = t[idx];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const t = I18N[el.dataset.i18nPh];
      if (t) el.placeholder = t[idx];
    });
    // label shows the language you'd switch TO
    if (langLabel) langLabel.textContent = lang === "tl" ? "EN" : "TL";
  }

  let lang = localStorage.getItem("lang") === "tl" ? "tl" : "en";
  if (lang === "tl") applyLang(lang);

  window.toggleLang = () => {
    lang = lang === "tl" ? "en" : "tl";
    localStorage.setItem("lang", lang);
    applyLang(lang);
  };

  document.getElementById("langToggle")?.addEventListener("click", window.toggleLang);
})();
