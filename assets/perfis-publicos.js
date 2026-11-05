/* GASTROIFF: personalização local, sem identificação nem envio de dados. */
(() => {
  "use strict";
  const KEY = "gastroiff-publico-v1";
  const profiles = {
    visitante: {
      title: "Quero conhecer a Gastronomia no IFF",
      description: "Entenda os cursos, como ingressar e quais experiências estão abertas à comunidade.",
      links: [
        ["Conhecer os cursos", "cursos.html"],
        ["Acompanhar editais de ingresso", "https://selecoes.iff.edu.br/"],
        ["Projetos e território", "projetos.html"],
        ["Calendário público", "eventos.html"]
      ]
    },
    estudante: {
      title: "Estou estudando Gastronomia",
      description: "Acesse conteúdos do curso, práticas, experiências no território e oportunidades.",
      links: [
        ["Cursos e formação", "cursos.html"],
        ["Gastronomia em ação", "gastronomia-em-acao.html"],
        ["Fichas técnicas", "praticas.html"],
        ["Bolsas, estágios e vagas", "oportunidades.html"],
        ["Relatar necessidades", "ocorrencias.html"]
      ]
    },
    docente: {
      title: "Sou docente",
      description: "Encontre os materiais acadêmicos, as atividades e os caminhos para registrar necessidades.",
      links: [
        ["Calendário de atividades", "eventos.html"],
        ["Planejamento das práticas", "planejamento-docente.html"],
        ["Laboratórios e manual", "laboratorios.html"],
        ["Livro de Ocorrências", "ocorrencias.html"],
        ["Documentos dos cursos", "documentos.html"],
        ["Pesquisa e extensão", "pesquisa.html"]
      ]
    },
    egresso: {
      title: "Concluí minha formação",
      description: "Explore oportunidades profissionais, pesquisa, formação continuada e a comunidade do curso.",
      links: [
        ["Vagas e seleções", "oportunidades.html"],
        ["Trajetórias na Gastronomia", "trajetorias.html"],
        ["Pesquisa", "pesquisa.html"],
        ["Gastronomia em ação", "gastronomia-em-acao.html"]
      ]
    },
    comunidade: {
      title: "Faço parte da comunidade",
      description: "Conheça as iniciativas do campus e proponha colaboração com os cursos.",
      links: [
        ["Projetos e território", "projetos.html"],
        ["Participação acadêmica", "participacao.html"],
        ["Cursos", "cursos.html"],
        ["Atividades abertas", "eventos.html"]
      ]
    }
  };
  const names = {
    visitante: "Quero conhecer os cursos", estudante: "Estudante",
    docente: "Docente", egresso: "Egresso(a)", comunidade: "Comunidade"
  };
  function read() {
    try {
      const p = localStorage.getItem(KEY);
      return Object.hasOwn(profiles, p) ? p : "visitante";
    } catch { return "visitante"; }
  }
  function save(p) {
    if (!Object.hasOwn(profiles, p)) return;
    try { localStorage.setItem(KEY, p); } catch { /* preferência opcional */ }
  }

  const SESSION_KEY = "gastroiff-entry-session-v1";
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function sessionSeen() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
  }
  function markSession() {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* navegação continua mesmo sem armazenamento */ }
  }
  function entry(host) {
    const section = document.createElement("section");
    section.className = "gi-personal-section";
    section.setAttribute("aria-label", "Acessos sugeridos para o perfil de navegação");
    const inner = document.createElement("div");
    inner.className = "container";
    const panel = document.createElement("div");
    panel.className = "gi-personal-panel";
    panel.setAttribute("data-profile-content", "");
    const title = document.createElement("h2");
    title.tabIndex = -1;
    const desc = document.createElement("p");
    const links = document.createElement("div");
    links.className = "gi-personal-links";
    const foot = document.createElement("p");
    foot.className = "gi-personal-foot";
    foot.textContent = "A escolha é guardada apenas neste dispositivo. Todos os conteúdos públicos continuam acessíveis.";
    panel.append(title, desc, links, foot);

    const top = document.createElement("div");
    top.className = "gi-personal-head";
    const switcher = document.createElement("div");
    switcher.className = "gi-personal-choice";
    const label = document.createElement("label");
    label.htmlFor = "gi-profile-choice";
    label.textContent = "Mudar perfil";
    const select = document.createElement("select");
    select.id = "gi-profile-choice";
    for (const [key, name] of Object.entries(names)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = name;
      select.append(option);
    }
    switcher.append(label, select);
    top.append(switcher);
    inner.append(panel, top);
    section.append(inner);
    host.prepend(section);

    const screen = document.createElement("div");
    screen.className = "gi-entry-screen";
    screen.dataset.entryScreen = "";
    screen.dataset.stage = "idle";
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-label", "Escolha de perfil do GASTROIFF");
    screen.hidden = true;
    const skip = document.createElement("button");
    skip.type = "button";
    skip.className = "gi-entry-skip";
    skip.textContent = "Pular animação";
    const brand = document.createElement("div");
    brand.className = "gi-entry-brand";
    brand.setAttribute("aria-hidden", "true");
    const logo = document.createElement("img");
    logo.className = "gi-profile-entrance-logo";
    logo.src = "assets/gastroiff-marca.jpg";
    logo.alt = "";
    brand.append(logo);

    const choice = document.createElement("div");
    choice.className = "gi-profile-entrance";
    choice.setAttribute("aria-labelledby", "gi-entry-heading");
    choice.inert = true;
    choice.setAttribute("aria-hidden", "true");
    const eyebrow = document.createElement("p");
    eyebrow.className = "gi-entry-eyebrow";
    eyebrow.textContent = "IFF campus Cabo Frio";
    const heading = document.createElement("h2");
    heading.id = "gi-entry-heading";
    heading.textContent = "Como deseja navegar?";
    const subtitle = document.createElement("p");
    subtitle.className = "gi-entry-subtitle";
    subtitle.textContent = "Escolha um perfil para conhecer a plataforma.";
    const choices = document.createElement("div");
    choices.className = "gi-profile-entrance-options";
    const primary = [
      ["estudante", "Estudante", "Formação, atividades e oportunidades"],
      ["docente", "Docente", "Planejamento e materiais acadêmicos"],
      ["visitante", "Visitante", "Cursos, pesquisa e projetos do campus"]
    ];
    const entranceButtons = new Map();
    for (const [i, [key, name, description]] of primary.entries()) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gi-profile-entrance-button";
      button.dataset.profileEntry = key;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", name + ". " + description);
      const number = document.createElement("span");
      number.className = "gi-entry-number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(i + 1).padStart(2, "0");
      const nameHolder = document.createElement("span");
      nameHolder.className = "gi-entry-name";
      const strong = document.createElement("strong");
      strong.textContent = name;
      const details = document.createElement("span");
      details.className = "gi-entry-tooltip";
      details.textContent = description;
      nameHolder.append(strong, details);
      const arrow = document.createElement("span");
      arrow.className = "gi-entry-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      button.append(number, nameHolder, arrow);
      entranceButtons.set(key, button);
      choices.append(button);
    }
    const note = document.createElement("p");
    note.className = "gi-entry-note";
    note.textContent = "Acesso livre nesta fase de testes. Nenhuma identificação é solicitada.";
    choice.append(eyebrow, heading, subtitle, choices, note);
    screen.append(skip, brand, choice);
    document.body.prepend(screen);

    const render = key => {
      const p = profiles[key] || profiles.visitante;
      select.value = key;
      for (const [name, button] of entranceButtons) {
        const selected = name === key;
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("is-selected", selected);
      }
      title.textContent = p.title;
      desc.textContent = p.description;
      links.replaceChildren();
      for (const [name, path] of p.links) {
        const link = document.createElement("a");
        link.href = path;
        link.textContent = name;
        if (path.startsWith("https://")) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        links.append(link);
      }
    };

    let stepTimer = null;
    let focusTimer = null;
    let dismissed = false;
    let previousFocus = null;
    const content = [document.querySelector("header"), document.querySelector(".site-location-bar"), host, document.querySelector("footer")].filter(Boolean);
    const previousInert = new Map();
    function showChoices() {
      if (screen.hidden || screen.dataset.stage === "choices" || dismissed) return;
      if (stepTimer !== null) clearTimeout(stepTimer);
      screen.dataset.stage = "choices";
      screen.classList.remove("is-intro");
      screen.classList.add("is-choices");
      skip.hidden = true;
      choice.inert = false;
      choice.removeAttribute("aria-hidden");
      focusTimer = setTimeout(() => entranceButtons.get("estudante").focus({preventScroll: true}), reduceMotion() ? 0 : 380);
    }
    function releaseScreen() {
      screen.hidden = true;
      screen.classList.remove("is-intro", "is-choices", "is-leaving");
      document.body.classList.remove("gi-entry-lock");
      for (const node of content) node.inert = previousInert.get(node) || false;
      document.documentElement.classList.remove("gi-entry-boot");
      window.scrollTo({top: 0, behavior: "instant"});
      title.focus({preventScroll: true});
      document.body.classList.add("gi-entry-revealed");
      setTimeout(() => document.body.classList.remove("gi-entry-revealed"), 650);
    }
    function selectProfile(key) {
      if (dismissed || !Object.hasOwn(profiles, key)) return;
      dismissed = true;
      if (stepTimer !== null) clearTimeout(stepTimer);
      if (focusTimer !== null) clearTimeout(focusTimer);
      save(key);
      markSession();
      render(key);
      screen.dataset.stage = "leaving";
      screen.classList.add("is-leaving");
      setTimeout(releaseScreen, reduceMotion() ? 0 : 400);
    }
    skip.addEventListener("click", showChoices);
    for (const [key, button] of entranceButtons) {
      button.addEventListener("click", () => selectProfile(key));
    }
    screen.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (screen.dataset.stage === "intro") showChoices();
        else selectProfile("visitante");
      }
      if (event.key !== "Tab") return;
      const focusables = [skip, ...entranceButtons.values()].filter(el => !el.hidden && !el.closest("[aria-hidden='true']"));
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    select.addEventListener("change", () => { save(select.value); render(select.value); });

    render(read());
    document.documentElement.classList.remove("gi-entry-boot");
    if (sessionSeen()) return;
    previousFocus = document.activeElement;
    for (const node of content) { previousInert.set(node, node.inert); node.inert = true; }
    document.body.classList.add("gi-entry-lock");
    screen.hidden = false;
    if (reduceMotion()) {
      showChoices();
    } else {
      screen.dataset.stage = "intro";
      screen.classList.add("is-intro");
      skip.focus({preventScroll: true});
      stepTimer = setTimeout(showChoices, 1260);
    }
    window.addEventListener("pagehide", () => {
      if (stepTimer !== null) clearTimeout(stepTimer);
      if (focusTimer !== null) clearTimeout(focusTimer);
    }, {once:true});
  }
  function init() {
    const main = document.querySelector("main");
    if (main) entry(main);
    else document.documentElement.classList.remove("gi-entry-boot");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
