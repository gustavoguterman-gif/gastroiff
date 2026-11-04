/* Candidatas a oportunidades encontradas em fonte pública, sem declarar vaga confirmada. */
(() => {
  "use strict";
  const button = document.querySelector("[data-refresh-opportunities]");
  const host = document.querySelector("[data-monitored-opportunities]");
  const status = document.querySelector("[data-opportunities-status]");
  const summary = document.querySelector("[data-monitor-summary]");
  if (!host || !summary || !button) return;
  const FEED = "data/oportunidades-monitoradas.json";
  const OFFICIAL = "https://bancodetalentos.grupojose.com.br/";
  const trusted = value => {
    try {
      const u = new URL(value);
      return u.protocol === "https:" && (
        value === OFFICIAL ||
        (u.hostname === "grupobzbuzios.rhgestor.com.br" && u.pathname.startsWith("/vagas/detalhes/"))
      );
    } catch { return false; }
  };
  const format = date => /^\d{4}-\d{2}-\d{2}$/.test(date||"") ? date.split("-").reverse().join("/") : "data não informada";
  const text = (parent,tag,value,css) => {
    const el = document.createElement(tag);
    if (css) el.className = css;
    el.textContent = value; parent.append(el); return el;
  };
  function render(feed) {
    host.replaceChildren();
    const rows = Array.isArray(feed.candidatas) ? feed.candidatas : [];
    const safe = rows.filter(x =>
      x && typeof x.cargo==="string" && typeof x.empresa==="string" &&
      typeof x.cidade==="string" && trusted(x.url) &&
      x.situacao==="encontrada_na_fonte_nao_verificada_individualmente"
    ).slice(0,40);
    summary.textContent = feed.ultima_consulta
      ? "Última consulta automática: "+format(feed.ultima_consulta)+". "+safe.length+
        " anúncio(s) relacionados à Gastronomia encontrados na fonte consultada. Confira a disponibilidade diretamente com a empresa."
      : "Monitoramento inicial ainda sem consulta concluída.";
    if (!safe.length) {
      text(host,"p","Nenhuma oportunidade identificada na consulta disponível. Isso não comprova ausência de vagas.","gi-note");
      return;
    }
    const grid=document.createElement("div");grid.className="gi-grid gi-vacancies";
    safe.forEach(x=>{
      const card=document.createElement("article");card.className="gi-panel gi-vacancy";
      text(card,"h3",x.cargo);
      text(card,"p",x.empresa+" · "+x.cidade,"gi-vacancy-meta");
      text(card,"p","Anúncio encontrado na fonte. Confira se a seleção continua aberta antes de se candidatar.","gi-vacancy-note");
      text(card,"p","Publicado na fonte em "+format(x.publicada_em)+". Consulta em "+format(x.consulta_em)+".","gi-vacancy-source");
      const link=document.createElement("a");link.href=x.url;link.target="_blank";link.rel="noopener noreferrer";
      link.className="gi-vacancy-apply";link.textContent="Conferir na página de recrutamento";
      card.append(link);grid.append(card);
    });
    host.append(grid);
  }
  async function load() {
    button.disabled=true;
    if (status) status.textContent="Consultando o monitor de vagas...";
    try {
      const response=await fetch(FEED+"?v="+Date.now(),{cache:"no-store"});
      if (!response.ok) throw Error("Monitor temporariamente indisponível");
      const data=await response.json();
      if (data.versao!==1 || !Array.isArray(data.candidatas) || data.candidatas.length>100) throw Error("Formato inesperado");
      render(data);
      if (status) status.textContent="Consulta concluída. Verifique cada anúncio na fonte.";
    } catch(error) {
      summary.textContent="Não foi possível consultar o monitor automático neste momento.";
      if (status) status.textContent="Falha ao consultar anúncios. Tente novamente.";
    } finally {
      button.disabled=false;
    }
  }
  button.addEventListener("click",load);
  load();
})();
