
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

/* Navegação móvel única: ordem editorial sem seções duplicadas */
(function(){
 function organize(){
  const nav=document.querySelector('[data-mobile-menu]');if(!nav)return;
  const entries=[
   ['index.html','Início',''],
   ['sobre.html','Sobre o GastroIFF',''],
   ['cursos.html','Ensino',''],
   ['praticas.html','Fichas técnicas',''],
   ['pesquisa.html','Pesquisa',''],
   ['observatorio.html','Observatório',''],
   ['projetos.html','Território',''],
   ['oportunidades.html','Estágios e empregos',''],
   ['laboratorios.html','Laboratórios',''],
   ['documentos.html','Documentos',''],
   ['docentes.html','Comunidade',''],
   ['eventos.html','Calendário',''],
   ['biblioteca.html','Biblioteca',''],
   ['contato.html','Contato','']
  ];
  const install=nav.querySelector('[data-install-app]');
  nav.querySelectorAll('a,.gi-mobile-resources,.gi-about-first').forEach(el=>el.remove());
  for(const [href,label] of entries){
   const a=document.createElement('a');a.href=href;
   const strong=document.createElement('strong');strong.textContent=label;a.append(strong);
   if(location.pathname.endsWith('/'+href)||(href==='index.html'&&location.pathname.endsWith('/gastroiff/')))a.setAttribute('aria-current','page');
   nav.insertBefore(a,install||null);
  }
  if(install)nav.append(install);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',organize);else organize();
})();
