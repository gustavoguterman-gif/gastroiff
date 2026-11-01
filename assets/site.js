
const menuButton=document.querySelector('[data-menu-toggle]');const menu=document.querySelector('[data-mobile-menu]');
if(menuButton&&menu){menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});}
const search=document.querySelector('[data-doc-search]'),filter=document.querySelector('[data-doc-filter]');
function filterDocuments(){if(!search||!filter)return;const q=search.value.trim().toLowerCase(),type=filter.value;let count=0;document.querySelectorAll('[data-document]').forEach(el=>{const matches=el.textContent.toLowerCase().includes(q)&&(type==='all'||el.dataset.kind===type);el.hidden=!matches;if(matches)count++;});const empty=document.querySelector('[data-empty]');if(empty)empty.hidden=count>0;}
if(search&&filter){search.addEventListener('input',filterDocuments);filter.addEventListener('change',filterDocuments);}

const personSearch=document.querySelector('[data-faculty-search]');
if(personSearch){personSearch.addEventListener('input',()=>{const q=personSearch.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();let visible=0;document.querySelectorAll('[data-person]').forEach(el=>{const searchable=el.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const yes=searchable.includes(q);el.hidden=!yes;if(yes)visible++;});const empty=document.querySelector('[data-faculty-empty]');if(empty)empty.hidden=visible>0;});}
const prof=document.querySelector('#faculty-profile');
if(prof&&Array.isArray(window.GASTROIFF_FACULTY)){
 const p=window.GASTROIFF_FACULTY.find(x=>x.id===new URLSearchParams(location.search).get('id'));
 const el=(tag,cls,text)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(text)d.textContent=text;return d;};
 prof.replaceChildren();
 if(!p){prof.append(el('p','', 'Perfil não encontrado. Volte à lista de docentes.'));}
 else{
   const side=el('aside','profile-side'),avatar=el('div','avatar',p.initials),sidep=el('p','', 'Fotografia oficial ainda não disponibilizada ou confirmada.');side.append(avatar,sidep);
   const main=el('div','profile-main');main.append(el('span','upper kicker','Perfil acadêmico'),el('h2','',p.name),el('p','tagline',p.area),el('p','bio',p.bio));
   const actions=el('div','profile-actions'); if(p.lattes){const a=el('a','button','Abrir currículo Lattes ↗');a.href=p.lattes;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);}else{actions.append(el('span','pill neutral','Lattes em verificação'));}
   main.append(actions,el('p','profile-meta','Fonte: '+p.source+'. Texto resumido a partir de registros institucionais; atualização da trajetória e confirmação da foto ainda pendentes.'));
   prof.append(side,main);document.title=p.name+' | GASTROIFF';
 }
}
const gallery=document.querySelector('[data-gallery]');
if(gallery){const slides=[...gallery.querySelectorAll('.gallery-slide')],position=gallery.querySelector('[data-gallery-position]');let idx=0;const set=n=>{idx=(n+slides.length)%slides.length;slides.forEach((s,i)=>{const active=i===idx;s.classList.toggle('selected',active);s.setAttribute('aria-hidden',String(!active));});if(position)position.textContent=String(idx+1).padStart(2,'0');}; gallery.querySelector('[data-gallery-prev]').addEventListener('click',()=>set(idx-1));gallery.querySelector('[data-gallery-next]').addEventListener('click',()=>set(idx+1));
 let timer=setInterval(()=>set(idx+1),5300);const pause=()=>{clearInterval(timer)};const resume=()=>{clearInterval(timer);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>set(idx+1),5300)};gallery.addEventListener('pointerenter',pause);gallery.addEventListener('pointerleave',resume);gallery.addEventListener('focusin',pause);gallery.addEventListener('focusout',resume);
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)pause();
}
