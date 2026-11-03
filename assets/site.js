
const menuButton=document.querySelector('[data-menu-toggle]');const menu=document.querySelector('[data-mobile-menu]');
if(menuButton&&menu){
 const setOpen=open=>{
   menu.classList.toggle('open',open);
   menuButton.setAttribute('aria-expanded',String(open));
   menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
 };
 menuButton.addEventListener('click',()=>setOpen(!menu.classList.contains('open')));
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){setOpen(false);menuButton.focus();}});
 document.addEventListener('pointerdown',e=>{if(menu.classList.contains('open')&&!menu.contains(e.target)&&!menuButton.contains(e.target))setOpen(false);});
 window.matchMedia('(min-width:1241px)').addEventListener('change',e=>{if(e.matches)setOpen(false)});
}
const search=document.querySelector('[data-doc-search]'),filter=document.querySelector('[data-doc-filter]');
function filterDocuments(){if(!search||!filter)return;const q=search.value.trim().toLowerCase(),type=filter.value;let count=0;document.querySelectorAll('[data-document]').forEach(el=>{const matches=el.textContent.toLowerCase().includes(q)&&(type==='all'||el.dataset.kind===type);el.hidden=!matches;if(matches)count++;});const empty=document.querySelector('[data-empty]');if(empty)empty.hidden=count>0;}
if(search&&filter){search.addEventListener('input',filterDocuments);filter.addEventListener('change',filterDocuments);}

const personSearch=document.querySelector('[data-faculty-search]');
if(personSearch){personSearch.addEventListener('input',()=>{const q=personSearch.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();let visible=0;document.querySelectorAll('[data-person]').forEach(el=>{const searchable=el.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const yes=searchable.includes(q);el.hidden=!yes;if(yes)visible++;});const empty=document.querySelector('[data-faculty-empty]');if(empty)empty.hidden=visible>0;});}
const prof=document.querySelector('#faculty-profile');
if(prof&&Array.isArray(window.GASTROIFF_FACULTY)){
 const p=window.GASTROIFF_FACULTY.find(x=>x.id===new URLSearchParams(location.search).get('id'));
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
 const urlLink=(text,href)=>{const a=el('a','',text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a};
 prof.replaceChildren();
 if(!p){prof.append(el('p','', 'Perfil não encontrado. Consulte a lista de docentes.'));}
 else{
   const side=el('aside','profile-side'),avatar=el('div','avatar portrait-letter',p.initials);
   side.append(avatar); if(p.image){avatar.replaceChildren();const img=el('img','faculty-headshot');img.src=p.image;img.alt='Foto acadêmica de '+p.name;img.loading='lazy';avatar.append(img)}
   const main=el('div','profile-main');main.append(el('span','upper kicker',p.category==='Técnico-administrativa'?'Representação técnico-administrativa':'Corpo docente'),el('h2','',p.name),el('p','tagline',p.area),el('p','bio',p.bio));
   let badges=el('div','profile-badges'); if(p.colegiado)badges.append(el('span','pill neutral','Colegiado'));if(p.nde)badges.append(el('span','pill neutral','NDE'));main.append(badges);
   const actions=el('div','profile-actions');if(p.lattes){actions.append(urlLink('Currículo Lattes ↗',p.lattes))}else{actions.append(el('span','pill neutral','Lattes ainda não confirmado'))}main.append(actions);
   const details=el('section','profile-details');
   if(p.degree){details.append(el('h3','','Formação acadêmica'),el('p','',p.degree));}
   if(p.group){details.append(el('h3','','Grupo de pesquisa'),el('p','',p.group));}
   if(p.projects?.length){details.append(el('h3','','Pesquisa e extensão'));for(const r of p.projects){const div=el('div','profile-record');div.append(el('strong','',r[0]));if(r[1])div.append(el('p','',r[1]));if(r[2])div.append(urlLink('Conhecer projeto ↗',r[2]));details.append(div)}}
   if(p.pubs?.length){details.append(el('h3','','Publicações'));for(const r of p.pubs){const div=el('div','profile-record');div.append(el('strong','',r[0]));if(r[1])div.append(el('span','',r[1]));if(r[2])div.append(urlLink(r[3]?'Consultar edição da revista ↗':'Ler publicação ↗',r[2]));if(r[3])div.append(urlLink('Ler artigo completo ↗',r[3]));details.append(div)}}
   if(p.degree_title && p.degree_link){details.append(el('h3','','Trabalhos acadêmicos'));const div=el('div','profile-record');div.append(el('strong','',p.degree_title),urlLink('Acessar texto integral ↗',p.degree_link));details.append(div)}
   if(details.childElementCount)main.append(details);
   main.append(el('p','profile-meta','Os registros desta página são uma seleção de fontes identificadas, não um espelho atualizado automaticamente do currículo Lattes.'));
   prof.append(side,main);document.title=p.name+' | GASTROIFF';const heroTitle=document.querySelector('.pagehero h1');if(heroTitle)heroTitle.textContent=p.category==='Técnico-administrativa'?'Perfil profissional.':'Perfil docente.';
 }
}
const filters=document.querySelectorAll('[data-faculty-group]');
if(filters.length){let group='docente';const search=document.querySelector('[data-faculty-search]');const normalize=x=>(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const refresh=()=>{let count=0;document.querySelectorAll('[data-person]').forEach(card=>{const q=normalize(search?.value),matches=normalize(card.textContent).includes(q);const eligible=group==='all'||card.dataset[group]==='1';card.hidden=!(matches&&eligible);if(!card.hidden)count++});const empty=document.querySelector('[data-faculty-empty]');if(empty)empty.hidden=count>0;};filters.forEach(btn=>btn.addEventListener('click',()=>{group=btn.dataset.facultyGroup;filters.forEach(b=>b.classList.toggle('selected',b===btn));refresh()}));search?.addEventListener('input',refresh);refresh();}
const gallery=document.querySelector('[data-gallery]');
if(gallery){const slides=[...gallery.querySelectorAll('.gallery-slide')],position=gallery.querySelector('[data-gallery-position]');let idx=0;const set=n=>{idx=(n+slides.length)%slides.length;slides.forEach((s,i)=>{const active=i===idx;s.classList.toggle('selected',active);s.setAttribute('aria-hidden',String(!active));});if(position)position.textContent=String(idx+1).padStart(2,'0');}; gallery.querySelector('[data-gallery-prev]').addEventListener('click',()=>set(idx-1));gallery.querySelector('[data-gallery-next]').addEventListener('click',()=>set(idx+1));
 let timer=setInterval(()=>set(idx+1),5300);const pause=()=>{clearInterval(timer)};const resume=()=>{clearInterval(timer);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>set(idx+1),5300)};gallery.addEventListener('pointerenter',pause);gallery.addEventListener('pointerleave',resume);gallery.addEventListener('focusin',pause);gallery.addEventListener('focusout',resume);
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)pause();
}

// Planta: visualização ampliada, com zoom e rolagem no celular.
(()=>{const opens=document.querySelectorAll('[data-open-plan]'),dialog=document.querySelector('[data-plan-dialog]');if(!opens.length||!dialog)return;const img=dialog.querySelector('img');let zoom=1;const set=()=>{img.style.width=(Math.round(zoom*100))+'%';};opens.forEach(open=>open.addEventListener('click',()=>{zoom=1;set();dialog.showModal()}));dialog.querySelector('[data-plan-close]').addEventListener('click',()=>dialog.close());dialog.querySelector('[data-plan-zoom-in]').addEventListener('click',()=>{zoom=Math.min(2.5,zoom+.25);set()});dialog.querySelector('[data-plan-zoom-out]').addEventListener('click',()=>{zoom=Math.max(1,zoom-.25);set()});dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});})();


// Cabeçalho GASTROIFF: menu, marca central e acessos suspensos.
(()=>{
 const original=document.querySelector('.site-location-bar');
 const header=document.querySelector('.header-refined .headerline');
 if(!original||!header)return;
 const menu=header.querySelector('.menu-toggle');
 const brand=header.querySelector('.gastrobrand');
 const institution=header.querySelector('.institution');
 if(institution)institution.remove();
 const bar=document.createElement('div');bar.className='quick-access';bar.setAttribute('aria-label','Contato e localização');
 const maps='https://www.google.com/maps/search/?api=1&query=Instituto%20Federal%20Fluminense%20campus%20Cabo%20Frio';
 const route='https://www.google.com/maps/dir/?api=1&destination=Instituto%20Federal%20Fluminense%20campus%20Cabo%20Frio';
 const iconMail='<svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>';
 const iconPin='<svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
 const close='<button type="button" class="quick-close" aria-label="Fechar lista">Fechar ×</button>';
 const contact='<div class="quick-panel"><div class="quick-panel-head"><strong>Contato</strong>'+close+'</div><a href="tel:+552226459500"><span>Telefone do campus</span><strong>(22) 2645-9500</strong></a><a href="mailto:tecnicogastronomia.cabofrio@iff.edu.br"><span>Coordenação do Técnico</span><strong>tecnicogastronomia.cabofrio@iff.edu.br</strong></a><a href="mailto:tecnologo.gastronomia.cabofrio@iff.edu.br"><span>Coordenação do Tecnólogo</span><strong>tecnologo.gastronomia.cabofrio@iff.edu.br</strong></a></div>';
 const location='<div class="quick-panel"><div class="quick-panel-head"><strong>Localização</strong>'+close+'</div><p>IFF campus Cabo Frio, Estrada Cabo Frio-Búzios, s/nº, Baía Formosa, Cabo Frio, RJ.</p><div class="quick-links"><a target="_blank" rel="noopener noreferrer" href="'+maps+'">Abrir no Google Maps ↗</a><a target="_blank" rel="noopener noreferrer" href="'+route+'">Traçar rota ↗</a><a target="_blank" rel="noopener noreferrer" href="https://www.salineira.com.br/linhas-e-horarios">Linhas e horários da Salineira ↗</a><a target="_blank" rel="noopener noreferrer" href="https://play.google.com/store/apps/details?id=br.salineira">Aplicativo Salineira para Android ↗</a><a target="_blank" rel="noopener noreferrer" href="https://apps.apple.com/br/app/salineira/id1481524615">Aplicativo Salineira para iPhone ↗</a></div></div>';
 const make=(name,icon,panel)=>{const d=document.createElement('details');d.className='quick-item';d.innerHTML='<summary aria-label="Abrir '+name+'">'+icon+'<span class="quick-label">'+name+'</span></summary>'+panel;return d};
 const a=make('Contato',iconMail,contact),b=make('Localização',iconPin,location);bar.append(a,b);
 original.remove();document.querySelectorAll('.trialbar').forEach(el=>el.remove());header.append(bar);
 const items=[a,b];const shut=()=>items.forEach(d=>d.open=false);
 items.forEach(d=>{d.addEventListener('toggle',()=>{if(d.open)items.forEach(other=>{if(other!==d)other.open=false})});d.querySelector('.quick-close').addEventListener('click',()=>{d.open=false;d.querySelector('summary').focus()})});
 document.addEventListener('pointerdown',e=>{if(!bar.contains(e.target))shut()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
 if(menu)menu.addEventListener('click',shut);
 const footer=document.querySelector('.footer .footerrow');
 if(footer&&!footer.querySelector('.gastroiff-footer-iff')){const link=document.createElement('a');link.className='gastroiff-footer-iff';link.href='https://portal1.iff.edu.br/nossos-campi/cabo-frio';link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Instituto Federal Fluminense campus Cabo Frio');link.innerHTML='<img src="assets/iff-marca-oficial.jpg" alt="Instituto Federal Fluminense, campus Cabo Frio">';footer.append(link)}
})();