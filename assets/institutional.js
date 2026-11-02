
(function(){
const go=()=>{
document.querySelectorAll('.facultycard').forEach(card=>{
 const anchor=card.querySelector('.facultycard-head');if(!anchor)return;
 const old=anchor.querySelector('.pill.neutral');
 if(old)old.remove();
 let wrap=anchor.querySelector('.faculty-roles');if(!wrap){wrap=document.createElement('span');wrap.className='faculty-roles';anchor.appendChild(wrap)}
 const roles=['Docente'];if(card.dataset.colegiado==='1')roles.push('Colegiado');if(card.dataset.nde==='1')roles.push('NDE');
 wrap.replaceChildren(...roles.map(name=>{const el=document.createElement('span');el.className='pill neutral '+(name==='Colegiado'?'coleg':name==='NDE'?'nde':'');el.textContent=name;return el}));
});
document.querySelectorAll('.governance-panel').forEach(box=>{
 const p=box.querySelector('p');if(p)p.innerHTML='<strong>Corpo docente</strong> reúne os professores que atuam nos cursos de Gastronomia. <strong>Colegiado</strong> é o órgão permanente que planeja, avalia e delibera sobre as ações didático-pedagógicas de ensino, pesquisa e extensão do curso, conforme o art. 40 da Regulamentação Didático-Pedagógica do IFF. <strong>NDE</strong>, Núcleo Docente Estruturante, acompanha a concepção, a atualização e o desenvolvimento do Projeto Pedagógico do Curso (PPC), conforme o art. 41 da mesma regulamentação.';
 const titles=box.querySelectorAll('.governance-grid h3');
 titles.forEach(t=>{if(t.textContent.includes('técnico-administrativas')){const v=t.parentElement.querySelector('p');if(v)v.textContent='Daiana Costa Pereira · Lygia Gottgtroy Fraga Zigolis Filha de Oliveira';}
 if(t.textContent.includes('discente')){const v=t.parentElement.querySelector('p');if(v)v.textContent='Composição discente em confirmação';}});
});
document.querySelectorAll('.footbrand').forEach(el=>{
 const a=document.createElement('a');a.className='footer-logo-wrapper';a.href='index.html';a.setAttribute('aria-label','GASTROIFF, página inicial');
 const im=document.createElement('img');im.src='assets/gastroiff-marca.jpg';im.alt='GASTROIFF Gastronomia campus Cabo Frio - RJ';im.className='logo-footer-official';a.appendChild(im);el.replaceWith(a);
});
document.querySelectorAll('.lab-opening-grid figure').forEach(f=>{f.style.background='transparent';f.style.border='none';const image=f.querySelector('img');const link=f.querySelector('a');if(image){image.src='assets/planta-baixa-laboratorio.webp';image.style.width='100%';image.style.height='auto'}if(link)link.href='assets/planta-baixa-laboratorio.webp'});
};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go();
})();


/* Botão de cópia para a assinatura opcional da agenda */
document.addEventListener('click',async function(event){
 const button=event.target.closest('[data-copy-agenda]');
 if(!button)return;
 const url=button.getAttribute('data-copy-agenda');
 try{
  await navigator.clipboard.writeText(url);
  const old=button.textContent;
  button.textContent='Endereço copiado';
  window.setTimeout(()=>{button.textContent=old},2200);
 }catch(error){
  const field=document.createElement('textarea');
  field.value=url;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';
  document.body.appendChild(field);field.select();
  const copied=document.execCommand('copy');field.remove();
  button.textContent=copied?'Endereço copiado':'Selecione e copie o endereço';
  if(!copied){window.prompt('Copie o endereço da agenda:',url);}
 }
});

document.querySelectorAll('.gi-nav-dropdown').forEach(root=>{const btn=root.querySelector('.gi-nav-trigger');if(!btn)return;btn.addEventListener('click',()=>{const open=root.classList.toggle('is-open');btn.setAttribute('aria-expanded',String(open))});document.addEventListener('click',e=>{if(!root.contains(e.target)){root.classList.remove('is-open');btn.setAttribute('aria-expanded','false')}});root.addEventListener('keydown',e=>{if(e.key==='Escape'){root.classList.remove('is-open');btn.setAttribute('aria-expanded','false');btn.focus()}})});

/* Organização da navegação e alinhamento das ações sem alterar conteúdo */
(function(){
 function apply(){
  const desktop=document.querySelector('.header-refined .navbar');
  if(desktop && !desktop.querySelector('.gi-about-first')){
   const a=document.createElement('a');a.className='nav-anchor gi-about-first';a.href='sobre.html';a.innerHTML='<span class="nav-name">Sobre</span><span class="nav-tip" role="tooltip">O que é o GastroIFF</span>';
   const first=desktop.querySelector('.nav-anchor');if(first)first.after(a);else desktop.prepend(a);
  }
  const mobile=document.querySelector('[data-mobile-menu]');
  if(mobile && !mobile.querySelector('.gi-about-first')){
   const a=document.createElement('a');a.href='sobre.html';a.className='gi-about-first';a.innerHTML='<strong>Sobre o GastroIFF</strong><span>Conheça o projeto e seus objetivos</span>';
   const first=mobile.querySelector('a');if(first)first.after(a);else mobile.append(a);
   const duplicate=mobile.querySelector('.gi-mobile-resources a[href="sobre.html"]');if(duplicate)duplicate.remove();
  }
  const first=document.querySelector('main .hero .hero-actions-academic');
  const second=document.querySelector('main .hero .hero-support-links');
  if(first&&second&&!first.dataset.unified){[...second.querySelectorAll('a')].forEach(a=>first.appendChild(a));first.dataset.unified='true'}
  if(location.pathname.endsWith('/sobre.html')){document.querySelectorAll('.gi-about-first').forEach(a=>a.setAttribute('aria-current','page'))}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();

/* Marca responsiva: mantém o símbolo original e permite texto com tamanho independente. */
(function(){
 function prepare(){
  document.querySelectorAll('.header-refined .headerline > .gastrobrand').forEach(brand=>{
   if(brand.querySelector('.gi-mobile-wordmark'))return;
   const mark=document.createElement('span');
   mark.className='gi-mobile-wordmark';
   mark.setAttribute('aria-hidden','true');
   mark.innerHTML='<span class="gi-mobile-symbol"></span><span class="gi-mobile-lettering"><span class="gi-mobile-name">GASTRO<span>IFF</span></span><span class="gi-mobile-subtitle">Gastronomia • campus Cabo Frio - RJ</span></span>';
   brand.appendChild(mark);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare);else prepare();
})();

/* Navegação móvel por três eixos, com ícones e um único grupo aberto */
(function(){
 function organize(){
  const nav=document.querySelector('[data-mobile-menu]');if(!nav)return;
  const groups=[
   {name:'Ensino',icon:'graduation',items:[['cursos.html','Cursos de Gastronomia'],['docentes.html','Comunidade acadêmica'],['documentos.html','Documentos acadêmicos'],['laboratorios.html','Laboratórios'],['biblioteca.html','Biblioteca'],['praticas.html','Fichas técnicas']]},
   {name:'Pesquisa',icon:'book',items:[['pesquisa.html','Pesquisas e publicações'],['observatorio.html','Observatório da formação']]},
   {name:'Território',icon:'pin',items:[['projetos.html','Projetos de extensão'],['oportunidades.html','Estágios e empregos'],['eventos.html','Calendário de eventos']]}
  ];
  const icons={
   graduation:'<path d="m2 9 10-5 10 5-10 5-10-5Z"/><path d="M6 11v5c3.8 3 8.2 3 12 0v-5"/><path d="M22 9v7"/>',
   book:'<path d="M12 7v14"/><path d="M3 5.5c3-1.5 6-1.5 9 0v15c-3-1.5-6-1.5-9 0z"/><path d="M21 5.5c-3-1.5-6-1.5-9 0v15c3-1.5 6-1.5 9 0z"/>',
   pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'
  };
  const previousInstall=nav.querySelector('[data-install-app]');
  nav.replaceChildren();
  const current=location.pathname.split('/').pop()||'index.html';
  let activeGroup=null;
  for(const group of groups){
   const wrapper=document.createElement('div');wrapper.className='gi-axis';
   const button=document.createElement('button');button.type='button';button.className='gi-axis-toggle';button.setAttribute('aria-expanded','false');
   const icon=document.createElement('span');icon.className='gi-axis-icon';icon.setAttribute('aria-hidden','true');
   icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+icons[group.icon]+'</svg>';
   const label=document.createElement('span');label.textContent=group.name;
   const arrow=document.createElement('span');arrow.className='gi-axis-chevron';arrow.setAttribute('aria-hidden','true');arrow.textContent='⌄';
   button.append(icon,label,arrow);
   const panel=document.createElement('div');panel.className='gi-axis-panel';panel.hidden=true;
   panel.id='gi-axis-'+group.icon;button.setAttribute('aria-controls',panel.id);
   for(const [href,title] of group.items){const a=document.createElement('a');a.href=href;a.textContent=title;if(href===current){a.setAttribute('aria-current','page');activeGroup=wrapper}panel.append(a)}
   button.addEventListener('click',()=>{
    const expanded=button.getAttribute('aria-expanded')==='true';
    nav.querySelectorAll('.gi-axis-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));
    nav.querySelectorAll('.gi-axis-panel').forEach(p=>p.hidden=true);
    if(!expanded){button.setAttribute('aria-expanded','true');panel.hidden=false}
   });
   wrapper.append(button,panel);nav.append(wrapper);
  }
  const extras=document.createElement('div');extras.className='gi-axis-extras';
  for(const [href,title] of [['sobre.html','Sobre o GastroIFF'],['contato.html','Contato']]){
   const a=document.createElement('a');a.href=href;a.textContent=title;if(href===current)a.setAttribute('aria-current','page');extras.append(a);
  }
  if(previousInstall){previousInstall.classList.add('gi-axis-install');extras.append(previousInstall)}
  nav.append(extras);
  if(activeGroup){const btn=activeGroup.querySelector('.gi-axis-toggle');btn.setAttribute('aria-expanded','true');activeGroup.querySelector('.gi-axis-panel').hidden=false}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',organize);else organize();
})();
