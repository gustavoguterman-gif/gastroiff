/* Atualização localizada das oportunidades, sem avisos globais. */
(() => {
  const button = document.querySelector('[data-refresh-opportunities]');
  const region = document.querySelector('[data-opportunities-content]');
  const status = document.querySelector('[data-opportunities-status]');
  if (!button || !region || !status) return;
  const speak = message => { status.textContent = message; };
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
