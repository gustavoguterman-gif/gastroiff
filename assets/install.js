/* GASTROIFF: instalação opcional como aplicativo web (Android, iPhone e computadores). */
(()=>{
 const supportsSW='serviceWorker' in navigator;
 if(supportsSW && window.isSecureContext){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=23',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{}));
 }
 let deferredInstall=null;
 const installed=()=>window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
 const isAppleMobile=/iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
 const buttons=[...document.querySelectorAll('[data-install-app]')];
 const dialog=document.querySelector('[data-install-dialog]');
 const body=document.querySelector('[data-install-instructions]');
 const title=document.querySelector('[data-install-title]');
 function setVisibility(){buttons.forEach(b=>b.hidden=installed());}
 function showInstructions(){
  if(!dialog||!body)return;
  const text=isAppleMobile
    ? ['Abra este site pelo Safari do iPhone.','Toque em Compartilhar (quadrado com seta para cima).','Escolha “Adicionar à Tela de Início”, ative “Abrir como App da Web” se aparecer e toque em “Adicionar”.']
    : /Android/i.test(navigator.userAgent)
      ? ['Abra o GASTROIFF no Chrome do Android.','Toque no menu de três pontos e selecione “Instalar aplicativo” ou “Adicionar à tela inicial”.','Confirme a instalação. O ícone aparecerá na tela inicial do celular.']
      : ['Abra o GASTROIFF no Chrome ou Edge.','No menu do navegador, procure “Instalar GASTROIFF” ou “Instalar aplicativo”.','Caso não apareça, o seu navegador pode não oferecer instalação. O site continua acessível normalmente.'];
  if(title)title.textContent=isAppleMobile?'Instalar no iPhone':/Android/i.test(navigator.userAgent)?'Instalar no Android':'Instalar GASTROIFF';
  body.replaceChildren();
  const list=document.createElement('ol');
  text.forEach(line=>{const li=document.createElement('li');li.textContent=line;list.append(li);});
  body.append(list);
  if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
  else dialog.setAttribute('open','');
 }
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;setVisibility();});
 window.addEventListener('appinstalled',()=>{deferredInstall=null;setVisibility();if(dialog?.open)dialog.close();});
 buttons.forEach(b=>b.addEventListener('click',async()=>{
  if(installed()){setVisibility();return;}
  if(deferredInstall){
   const prompt=deferredInstall;deferredInstall=null;
   try{await prompt.prompt();await prompt.userChoice;}catch(e){showInstructions();}
  }else showInstructions();
 }));
 document.querySelectorAll('[data-install-close]').forEach(button=>button.addEventListener('click',()=>dialog?.close()));
 dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 setVisibility();
})();
