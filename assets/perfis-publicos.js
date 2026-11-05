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
  function entry(host) {
    const section = document.createElement("section");
    section.className = "gi-personal-section";
    section.setAttribute("aria-label", "Encontre os recursos mais úteis para você");
    const inner = document.createElement("div");
    inner.className = "container";
    const entryChoice = document.createElement("div");
    entryChoice.className = "gi-profile-entrance";
    entryChoice.setAttribute("aria-label", "Escolha uma forma de entrar no GASTROIFF");
    const brand = document.createElement("img");
    brand.src = "assets/gastroiff-marca.jpg";
    brand.alt = "GASTROIFF, Gastronomia do IFF Campus Cabo Frio";
    brand.className = "gi-profile-entrance-logo";
    const welcome = document.createElement("h2");
    welcome.textContent = "Como você deseja acessar o GASTROIFF?";
    const welcomeText = document.createElement("p");
    welcomeText.textContent = "Escolha um perfil para encontrar os conteúdos que mais interessam a você.";
    const choices = document.createElement("div");
    choices.className = "gi-profile-entrance-options";
    const primary = [
      ["visitante", "Visitante", "Cursos, ingresso e calendário público"],
      ["estudante", "Estudante", "Formação, pesquisa e oportunidades"],
      ["docente", "Docente", "Planejamento, materiais e atividades"]
    ];
    const entranceButtons = new Map();
    for (const [key, name, description] of primary) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gi-profile-entrance-button";
      button.dataset.profileEntry = key;
      button.setAttribute("aria-pressed", "false");
      const heading = document.createElement("strong");
      heading.textContent = name;
      const details = document.createElement("span");
      details.textContent = description;
      button.append(heading, details);
      entranceButtons.set(key, button);
      choices.append(button);
    }
    entryChoice.append(brand, welcome, welcomeText, choices);
    const top = document.createElement("div");
    top.className = "gi-personal-head";
    const intro = document.createElement("div");
    const heading = document.createElement("h2");
    heading.textContent = "Seu caminho no GASTROIFF";
    const explanation = document.createElement("p");
    explanation.textContent = "Escolha como você se relaciona com a Gastronomia. Organizaremos os principais acessos sem exigir matrícula, senha ou cadastro.";
    intro.append(heading, explanation);
    const label = document.createElement("label");
    label.htmlFor = "gi-profile-choice";
    label.textContent = "Como você acessa o GASTROIFF?";
    const select = document.createElement("select");
    select.id = "gi-profile-choice";
    for (const [key, value] of Object.entries(names)) {
      const o = document.createElement("option"); o.value = key; o.textContent = value; select.append(o);
    }
    const switcher = document.createElement("div");
    switcher.className = "gi-personal-choice";
    switcher.append(label, select);
    top.append(intro, switcher);
    const panel = document.createElement("div");
    panel.className = "gi-personal-panel";
    const title = document.createElement("h3");
    const desc = document.createElement("p");
    const links = document.createElement("div");
    links.className = "gi-personal-links";
    const foot = document.createElement("p");
    foot.className = "gi-personal-foot";
    foot.textContent = "Esta escolha é salva somente neste dispositivo. Todos os conteúdos públicos do GASTROIFF continuam disponíveis para você.";
    panel.append(title, desc, links, foot);
    inner.append(entryChoice, top, panel);
    section.append(inner);
    const render = key => {
      const p = profiles[key] || profiles.visitante;
      select.value = key;
      for (const [profile, button] of entranceButtons) {
        const selected = profile === key;
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
        if (path.startsWith("https://")) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
        links.append(link);
      }
    };
    select.addEventListener("change", () => { save(select.value); render(select.value); });
    for (const [key, button] of entranceButtons) {
      button.addEventListener("click", () => { save(key); render(key); });
    }
    render(read());
    host.prepend(section);
  }
  function init() { const main = document.querySelector("main"); if (main) entry(main); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
