/* Atualização localizada das oportunidades, sem avisos globais. */
(() => {
  const button = document.querySelector('[data-refresh-opportunities]');
  const region = document.querySelector('[data-opportunities-content]');
  const status = document.querySelector('[data-opportunities-status]');
  if (!button || !region || !status) return;
  const speak = message => { status.textContent = message; };
  const filterExpired = () => {
    const today = new Date();
    const utcDay = Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());
    let count = 0;
    region.querySelectorAll('.gi-vacancy[data-published]').forEach(card => {
      const date = card.getAttribute('data-published');
      const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(date);
      if (!match) return;
      const published = Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3]));
      const expired = utcDay - published > 30 * 86400000;
      card.hidden = expired;
      if (!expired) count++;
    });
    const empty = region.querySelector('[data-opportunities-empty]');
    if (empty) empty.hidden = count > 0;
  };
  filterExpired();
  button.addEventListener('click', async () => {
    if (!navigator.onLine) {
      speak('Sem conexão. As oportunidades exibidas são as últimas disponíveis neste dispositivo.');
      return;
    }
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    speak('Verificando oportunidades...');
    try {
      const url = new URL('oportunidades.html', window.location.href);
      url.searchParams.set('atualizacao', String(Date.now()));
      const response = await fetch(url.href, { cache: 'no-store' });
      if (!response.ok) throw new Error('Resposta HTTP ' + response.status);
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const latest = html.querySelector('[data-opportunities-content]');
      if (!latest) throw new Error('Conteúdo de oportunidades ausente');
      if (latest.innerHTML.trim() !== region.innerHTML.trim()) {
        region.innerHTML = latest.innerHTML;
        filterExpired();
        speak('Oportunidades atualizadas.');
      } else {
        speak('Consulta concluída. Nenhuma alteração nas oportunidades.');
      }
    } catch (error) {
      speak('Não foi possível atualizar as oportunidades. Tente novamente.');
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
})();
