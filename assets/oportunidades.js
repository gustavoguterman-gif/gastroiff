/* Painel de oportunidades: atualização localizada e controle de vigência. */
(() => {
  const button = document.querySelector('[data-refresh-opportunities]');
  const region = document.querySelector('[data-opportunities-content]');
  const status = document.querySelector('[data-opportunities-status]');
  const countLabel = document.querySelector('[data-opportunities-count]');
  const updatedLabel = document.querySelector('[data-opportunities-updated]');
  if (!button || !region || !status) return;
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
    if (countLabel) countLabel.textContent = visible + (visible === 1 ? ' oportunidade vigente' : ' oportunidades vigentes');
    if (updatedLabel) {
      updatedLabel.textContent = latest ? 'Última inclusão: ' + latest.split('-').reverse().join('/') : 'Sem vagas vigentes';
    }
  }
  render();
  button.addEventListener('click', async () => {
    if (!navigator.onLine) { speak('Sem conexão. Verifique sua internet para consultar novas vagas.'); return; }
    button.disabled = true;
    speak('Consultando vagas...');
    try {
      const url = new URL('oportunidades.html', location.href);
      url.searchParams.set('verificar', String(Date.now()));
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw Error('Falha ao consultar vagas');
      const documentNew = new DOMParser().parseFromString(await response.text(), 'text/html');
      const fresh = documentNew.querySelector('[data-opportunities-content]');
      if (!fresh) throw Error('Painel não encontrado');
      const existing = region.innerHTML.replace(/\s+/g, ' ').trim();
      const incoming = fresh.innerHTML.replace(/\s+/g, ' ').trim();
      if (incoming !== existing) region.innerHTML = fresh.innerHTML;
      render();
      speak(incoming !== existing ? 'Painel atualizado.' : 'Consulta concluída. Nenhuma nova alteração.');
    } catch (e) { speak('Não foi possível consultar as vagas. Tente novamente.'); }
    finally { button.disabled = false; }
  });
})();