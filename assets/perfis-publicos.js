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
  const names = {visitante:"Visitante", estudante:"Estudante", docente:"Docente"};
  function read() {
    try {
      const p = localStorage.getItem(KEY);
      return Object.hasOwn(names, p) ? p : "visitante";
    } catch { return "visitante"; }
  }
  function save(p) {
    if (!Object.hasOwn(profiles, p)) return;
    try { localStorage.setItem(KEY, p); } catch { /* preferência opcional */ }
  }

  // A abertura deve aparecer em todas as visitas à página inicial,
  // incluindo recargas e retornos no mesmo navegador (desktop, tablet e PWA).
  // Somente a preferência de conteúdo é armazenada localmente.
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    screen.tabIndex = -1;
    screen.hidden = true;

    // Uma única marca permanece visível e se desloca até o alto da lista.
    const composition = document.createElement("div");
    composition.className = "gi-entry-composition";
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
    choice.inert = true;
    choice.setAttribute("aria-hidden", "true");
    const choices = document.createElement("div");
    choices.className = "gi-profile-entrance-options";
    choices.setAttribute("aria-label", "Perfis de navegação");
    const primary = [
      ["visitante", "Visitante", "Cursos, projetos, pesquisa e calendário"],
      ["estudante", "Estudante", "Formação, atividades e oportunidades"],
      ["docente", "Docente", "Planejamento, materiais e atividades acadêmicas"]
    ];
    const entranceButtons = new Map();
    for (const [key, name, description] of primary) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gi-profile-entrance-button";
      button.dataset.profileEntry = key;
      button.disabled = true;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", name + ". " + description);
      button.textContent = name;
      entranceButtons.set(key, button);
      choices.append(button);
    }
    choice.append(choices);
    composition.append(brand, choice);
    screen.append(composition);
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

    const INTRO_MS = 2450;
    const ENTRANCE_MS = 1800;
    const EXIT_MS = 720;
    let stepTimer = null;
    let enableTimer = null;
    let dismissed = false;
    const content = [
      document.querySelector("header"),
      document.querySelector(".site-location-bar"),
      host,
      document.querySelector("footer")
    ].filter(Boolean);
    const previousInert = new Map();

    function showChoices() {
      if (screen.hidden || screen.dataset.stage === "choices" || dismissed) return;
      if (stepTimer !== null) clearTimeout(stepTimer);
      screen.dataset.stage = "choices";
      screen.classList.remove("is-intro");
      screen.classList.add("is-choices");
      choice.inert = false;
      choice.removeAttribute("aria-hidden");
      enableTimer = setTimeout(() => {
        for (const button of entranceButtons.values()) button.disabled = false;
      }, reduceMotion() ? 0 : ENTRANCE_MS);
    }
    function releaseScreen() {
      screen.hidden = true;
      screen.classList.remove("is-intro", "is-choices", "is-leaving");
      for (const node of content) node.inert = previousInert.get(node) || false;
      document.documentElement.classList.remove("gi-entry-boot");
      window.scrollTo({top: 0, behavior: "instant"});
      title.focus({preventScroll: true});
      window.setTimeout(() => document.body.classList.remove("gi-entry-revealed"), 1000);
    }
    function selectProfile(key) {
      if (dismissed || !Object.hasOwn(profiles, key)) return;
      dismissed = true;
      if (stepTimer !== null) clearTimeout(stepTimer);
      if (enableTimer !== null) clearTimeout(enableTimer);
      save(key);
      render(key);
      screen.dataset.stage = "leaving";
      screen.classList.add("is-leaving");
      document.body.classList.remove("gi-entry-lock");
      document.body.classList.add("gi-entry-revealed");
      setTimeout(releaseScreen, reduceMotion() ? 0 : EXIT_MS);
    }
    for (const [key, button] of entranceButtons) {
      button.addEventListener("click", () => selectProfile(key));
    }
    screen.addEventListener("keydown", event => {
      if (event.key !== "Tab" || screen.dataset.stage !== "choices") return;
      const focusables = [...entranceButtons.values()].filter(button => !button.disabled);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    select.addEventListener("change", () => { save(select.value); render(select.value); });

    render(read());
    // Não ignorar a abertura por visitas anteriores: isso ocultava a tela
    // de escolha no desktop após a primeira sessão.
    for (const node of content) {
      previousInert.set(node, node.inert);
      node.inert = true;
    }
    document.body.classList.add("gi-entry-lock");
    screen.hidden = false;
    screen.focus({preventScroll: true});
    document.documentElement.classList.remove("gi-entry-boot");
    if (reduceMotion()) {
      showChoices();
    } else {
      screen.dataset.stage = "intro";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!dismissed && screen.dataset.stage === "intro") screen.classList.add("is-intro");
      }));
      stepTimer = setTimeout(showChoices, INTRO_MS);
    }
    window.addEventListener("pagehide", () => {
      if (stepTimer !== null) clearTimeout(stepTimer);
      if (enableTimer !== null) clearTimeout(enableTimer);
    }, {once: true});
  }
  function init() {
    const main = document.querySelector("main");
    if (main) entry(main);
    else document.documentElement.classList.remove("gi-entry-boot");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
