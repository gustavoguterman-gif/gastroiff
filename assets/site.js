
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
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
 const urlLink=(text,href)=>{const a=el('a','',text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a};
 prof.replaceChildren();
 if(!p){prof.append(el('p','', 'Perfil não encontrado. Consulte a lista de docentes.'));}
 else{
   const side=el('aside','profile-side'),avatar=el('div','avatar portrait-letter',p.initials);
   side.append(avatar,el('p','','Retrato padronizado. A fotografia do currículo Lattes será exibida após confirmação da imagem e da autorização de uso.'));
   const main=el('div','profile-main');main.append(el('span','upper kicker','Corpo docente'),el('h2','',p.name),el('p','tagline',p.area),el('p','bio',p.bio));
   let badges=el('div','profile-badges'); if(p.colegiado)badges.append(el('span','pill neutral','Colegiado'));if(p.nde)badges.append(el('span','pill neutral','NDE'));main.append(badges);
   const actions=el('div','profile-actions');if(p.lattes){actions.append(urlLink('Currículo Lattes ↗',p.lattes))}else{actions.append(el('span','pill neutral','Lattes ainda não confirmado'))}main.append(actions);
   const details=el('section','profile-details');
   details.append(el('h3','','Formação acadêmica'));
   if(p.degree){details.append(el('p','',p.degree));if(p.degree_title){const div=el('div','profile-record');div.append(el('strong','','Trabalho acadêmico: '+p.degree_title));if(p.degree_link)div.append(urlLink('Consultar trabalho ↗',p.degree_link));else div.append(el('p','profile-muted','Link do texto integral ainda não localizado em repositório público.'));details.append(div)}}
   else details.append(el('p','profile-muted','Formação em conferência com currículo acadêmico.'));
   details.append(el('h3','','Grupos de pesquisa'));
   details.append(el('p',p.group?'': 'profile-muted',p.group||'Vínculo com grupo formal ainda não confirmado.'));
   details.append(el('h3','','Projetos de pesquisa e extensão'));
   if(p.projects?.length){for(const r of p.projects){const div=el('div','profile-record');div.append(el('strong','',r[0]));div.append(el('p','',r[1]));if(r[2])div.append(urlLink('Fonte do projeto ↗',r[2]));details.append(div)}}
   else details.append(el('p','profile-muted','Projetos não identificados nas fontes consultadas. Esta indicação não significa ausência de projetos.'));
   details.append(el('h3','','Publicações identificadas'));
   if(p.pubs?.length){for(const r of p.pubs.slice(0,3)){const div=el('div','profile-record');div.append(el('strong','',r[0]),el('span','',r[1]));if(r[2])div.append(urlLink('Consultar publicação ↗',r[2]));details.append(div)}}
   else details.append(el('p','profile-muted','Ainda não foi possível confirmar publicações recentes em fonte pública.'));
   details.append(el('h3','','TCC, dissertação e tese'));
   details.append(el('p','profile-muted',p.degree_title?'O trabalho identificado aparece acima, em Formação acadêmica. Outros TCCs, dissertações ou teses terão links individuais após conferência.':'Não foram localizados links públicos verificáveis para trabalhos próprios. A pesquisa bibliográfica permanece em atualização.'));
   details.append(el('p','profile-meta','Perfil baseado em fontes públicas identificadas e na composição enviada pela coordenação. A lista de publicações contém até três registros verificados, sem afirmar que sejam necessariamente os três mais recentes.'));main.append(details);
   prof.append(side,main);document.title=p.name+' | GASTROIFF';
 }
}
const filters=document.querySelectorAll('[data-faculty-group]');
if(filters.length){let group='all';const search=document.querySelector('[data-faculty-search]');const normalize=x=>(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const refresh=()=>{let count=0;document.querySelectorAll('[data-person]').forEach(card=>{const q=normalize(search?.value),matches=normalize(card.textContent).includes(q);const eligible=group==='all'||card.dataset[group]==='1';card.hidden=!(matches&&eligible);if(!card.hidden)count++});const empty=document.querySelector('[data-faculty-empty]');if(empty)empty.hidden=count>0;};filters.forEach(btn=>btn.addEventListener('click',()=>{group=btn.dataset.facultyGroup;filters.forEach(b=>b.classList.toggle('selected',b===btn));refresh()}));search?.addEventListener('input',refresh);refresh();}
const gallery=document.querySelector('[data-gallery]');
if(gallery){const slides=[...gallery.querySelectorAll('.gallery-slide')],position=gallery.querySelector('[data-gallery-position]');let idx=0;const set=n=>{idx=(n+slides.length)%slides.length;slides.forEach((s,i)=>{const active=i===idx;s.classList.toggle('selected',active);s.setAttribute('aria-hidden',String(!active));});if(position)position.textContent=String(idx+1).padStart(2,'0');}; gallery.querySelector('[data-gallery-prev]').addEventListener('click',()=>set(idx-1));gallery.querySelector('[data-gallery-next]').addEventListener('click',()=>set(idx+1));
 let timer=setInterval(()=>set(idx+1),5300);const pause=()=>{clearInterval(timer)};const resume=()=>{clearInterval(timer);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>set(idx+1),5300)};gallery.addEventListener('pointerenter',pause);gallery.addEventListener('pointerleave',resume);gallery.addEventListener('focusin',pause);gallery.addEventListener('focusout',resume);
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)pause();
}
