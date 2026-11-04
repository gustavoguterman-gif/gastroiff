/* Painel de oportunidades: atualização localizada e controle de vigência. */
(() => {
  const button = document.querySelector('[data-refresh-opportunities]');
  const region = document.querySelector('[data-opportunities-content]');
  const status = document.querySelector('[data-opportunities-status]');
  const countLabel = document.querySelector('[data-opportunities-count]');
  const updatedLabel = document.querySelector('[data-opportunities-updated]');
  if (!region) return;
  const speak = message => { status.textContent = message; };
  function render() {
    const today = new Date();
    const utcDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    let visible = 0, latest = '';
    region.querySelectorAll('.gi-vacancy').forEach(card => {
      const date = card.dataset.published || '';
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
      if (!match) { card.hidden = false; visible++; return; }
      const published = Date.UTC(+match[1], +match[2]-1, +match[3]);
      const expires = card.dataset.closed === 'true' || utcDay - published > 30 * 86400000;
      card.hidden = expires;
      if (!expires) { visible++; if (date > latest) latest = date; }
    });
    const empty = region.querySelector('[data-opportunities-empty]');
    if (empty) empty.hidden = visible !== 0;
    if (countLabel) countLabel.textContent = visible + (visible === 1 ? ' anúncio recente' : ' anúncios recentes');
    if (updatedLabel) {
      updatedLabel.textContent = latest ? 'Última inclusão: ' + latest.split('-').reverse().join('/') : 'Sem anúncios recentes';
    }
  }
  render();
})();
