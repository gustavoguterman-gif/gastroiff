
(function(){
const go=()=>{
document.querySelectorAll('.facultycard').forEach(card=>{
 const anchor=card.querySelector('.facultycard-head');if(!anchor)return;
 const old=anchor.querySelector('.pill.neutral');
 if(old)old.remove();
 let wrap=anchor.querySelector('.faculty-roles');if(!wrap){wrap=document.createElement('span');wrap.className='faculty-roles';anchor.appendChild(wrap)}
 const roles=[card.dataset.docente==='0'?'Técnico-administrativa':'Docente'];if(card.dataset.colegiado==='1')roles.push('Colegiado');if(card.dataset.nde==='1')roles.push('NDE');
 wrap.replaceChildren(...roles.map(name=>{const el=document.createElement('span');el.className='pill neutral '+(name==='Colegiado'?'coleg':name==='NDE'?'nde':'');el.textContent=name;return el}));
});
/* As definições e composições dos órgãos estão no HTML institucional. */
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

/* Navegação compartilhada: os mesmos eixos no computador e no celular. */
(function(){
 const groups=[
 {name:'Ensino',icon:'graduation-cap',items:[['cursos.html','Cursos de Gastronomia'],['docentes.html','Comunidade acadêmica'],['documentos.html','Documentos acadêmicos'],['laboratorios.html','Laboratórios'],['biblioteca.html','Biblioteca'],['praticas.html','Fichas técnicas'],['participacao.html','Participação acadêmica']]},
 {name:'Pesquisa',icon:'book-open',items:[['pesquisa.html','Pesquisas e publicações'],['revistas.html','Revistas acadêmicas de Gastronomia'],['observatorio.html','Observatório da formação']]},
 {name:'Território',icon:'map-pin',items:[['projetos.html','Projetos e extensão'],['oportunidades.html','Estágios e empregos'],['eventos.html','Calendário de eventos']]}
 ];
 const paths={
 'graduation-cap':'<path d="m2 9 10-5 10 5-10 5-10-5Z"/><path d="M6 11v5c3.8 3 8.2 3 12 0v-5"/><path d="M22 9v7"/>',
 'book-open':'<path d="M12 7v14"/><path d="M3 5.5c3-1.5 6-1.5 9 0v15c-3-1.5-6-1.5-9 0z"/><path d="M21 5.5c-3-1.5-6-1.5-9 0v15c3-1.5 6-1.5 9 0z"/>',
 'map-pin':'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'
 };
 function build(nav,kind){
  if(!nav)return;const install=nav.querySelector('[data-install-app]');nav.replaceChildren();nav.classList.add('gi-unified-nav','gi-unified-'+kind);
  const current=location.pathname.split('/').pop()||'index.html';
  function link(href,label,cls){const a=document.createElement('a');a.href=href;a.textContent=label;a.className=cls||'';if(current===href)a.setAttribute('aria-current','page');return a}
  if(kind==='mobile')nav.append(link('sobre.html','Sobre o GastroIFF','gi-axis-about'));
  else nav.append(link('sobre.html','Sobre o GastroIFF','gi-desktop-about'));
  let count=0;
  for(const group of groups){
   const wrap=document.createElement('div');wrap.className='gi-axis';
   const b=document.createElement('button');b.className='gi-axis-toggle';b.type='button';b.setAttribute('aria-expanded','false');
   const ic=document.createElement('span');ic.className='gi-axis-icon';ic.setAttribute('aria-hidden','true');ic.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths[group.icon]+'</svg>';
   const label=document.createElement('span');label.textContent=group.name;
   const chev=document.createElement('span');chev.className='gi-axis-chevron';chev.textContent='⌄';chev.setAttribute('aria-hidden','true');
   b.append(ic,label,chev);
   const panel=document.createElement('div');panel.className='gi-axis-panel';panel.id='gi-nav-'+kind+'-'+count++;panel.hidden=true;b.setAttribute('aria-controls',panel.id);
   let containsCurrent=false;
   for(const item of group.items){const a=link(item[0],item[1]);if(item[0]===current)containsCurrent=true;panel.append(a)}
   if(containsCurrent){wrap.classList.add('gi-axis-current');if(kind==='mobile'){b.setAttribute('aria-expanded','true');panel.hidden=false}}
   b.addEventListener('click',()=>{
    const wasOpen=b.getAttribute('aria-expanded')==='true';
    nav.querySelectorAll('.gi-axis-toggle').forEach(x=>x.setAttribute('aria-expanded','false'));
    nav.querySelectorAll('.gi-axis-panel').forEach(x=>x.hidden=true);
    if(!wasOpen){b.setAttribute('aria-expanded','true');panel.hidden=false}
   });
   wrap.append(b,panel);nav.append(wrap);
  }
  if(kind==='mobile'){const extras=document.createElement('div');extras.className='gi-axis-extras';extras.append(link('contato.html','Contato'));if(install)extras.append(install);nav.append(extras)}
 }
 function init(){build(document.querySelector('[data-mobile-menu]'),'mobile');build(document.querySelector('.header-refined .navbar'),'desktop')}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
