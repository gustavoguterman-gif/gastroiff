// GASTROIFF: opções de calendário conforme o sistema, sem forçar visualização desktop.
(()=>{
 const add=document.getElementById('calendar-device-add');
 const help=document.getElementById('calendar-device-help');
 if(!add||!help)return;
 const feed='https://gustavoguterman-gif.github.io/gastroiff/agenda-gastroiff.ics';
 const ua=navigator.userAgent||'';
 const ios=/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1);
 const android=/Android/i.test(ua);
 if(ios){
   add.href='webcal://gustavoguterman-gif.github.io/gastroiff/agenda-gastroiff.ics';
   add.removeAttribute('target');
   add.textContent='Assinar no Calendário do iPhone ↗';
   help.textContent='Abre a assinatura no Calendário da Apple, quando disponível. Para usar o Google Agenda, faça a assinatura pelo Google em um computador.';
 }else if(android){
   add.href=feed;
   add.removeAttribute('target');
   add.setAttribute('download','agenda-gastroiff.ics');
   add.textContent='Obter agenda para o celular ↓';
   help.textContent='O arquivo .ics pode ser aberto por aplicativos de calendário compatíveis. Para receber futuras atualizações no Google Agenda do celular, faça a assinatura uma única vez na versão para computador do Google Agenda; depois ela será sincronizada automaticamente.';
 }else{
   help.textContent='A assinatura é adicionada ao Google Agenda e sincronizada com os dispositivos conectados à mesma conta.';
 }
 const old=add.parentElement.querySelector('.calendar-download');
 if(old&&android)old.textContent='Baixar arquivo .ics para importar ↗';
 if(old&&ios)old.textContent='Baixar arquivo .ics (cópia sem atualização) ↗';
})();