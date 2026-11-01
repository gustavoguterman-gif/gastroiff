
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
   if(p.pubs?.length){details.append(el('h3','','Publicações'));for(const r of p.pubs.slice(0,3)){const div=el('div','profile-record');div.append(el('strong','',r[0]));if(r[1])div.append(el('span','',r[1]));if(r[2])div.append(urlLink('Ler publicação ↗',r[2]));details.append(div)}}
   if(p.degree_title && p.degree_link){details.append(el('h3','','Trabalhos acadêmicos'));const div=el('div','profile-record');div.append(el('strong','',p.degree_title),urlLink('Acessar texto integral ↗',p.degree_link));details.append(div)}
   if(details.childElementCount)main.append(details);
   main.append(el('p','profile-meta','Os registros desta página são uma seleção de fontes identificadas, não um espelho atualizado automaticamente do currículo Lattes.'));
   prof.append(side,main);document.title=p.name+' | GASTROIFF';
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


// Barra compacta de contato e localização em todas as páginas.
(()=> {
 const old=document.querySelector('.site-location-bar');
 if(!old)return;
 const map='https://www.google.com/maps?q=Instituto%20Federal%20Fluminense%20campus%20Cabo%20Frio%2C%20Estrada%20Cabo%20Frio%20B%C3%BAzios%2C%20Ba%C3%ADa%20Formosa%2C%20Cabo%20Frio%20RJ';
 const route='https://www.google.com/maps/dir/?api=1&destination=Instituto%20Federal%20Fluminense%20campus%20Cabo%20Frio%2C%20Estrada%20Cabo%20Frio%20B%C3%BAzios%2C%20Ba%C3%ADa%20Formosa%2C%20Cabo%20Frio%20RJ';

/* Estilos essenciais da barra, inseridos junto com o componente para evitar ícones sem dimensão quando a folha externa estiver em cache. */
const essentials=document.createElement('style');
essentials.id='quick-access-core';
essentials.textContent=`.quick-access{position:relative;z-index:20;background:#f8f7f3;border-bottom:1px solid #dce5dc;padding:9px 0}.quick-access-inner{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}.quick-item{position:relative;min-width:0}.quick-item>summary{list-style:none;display:flex;align-items:center;gap:9px;min-height:40px;border:1px solid #d5e1d7;border-radius:10px;background:#fff;color:#21583a;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 5px rgba(19,55,34,.06)}.quick-item>summary::-webkit-details-marker{display:none}.quick-item>summary svg{display:inline-block!important;width:17px!important;height:17px!important;min-width:17px!important;max-width:17px!important;min-height:17px!important;max-height:17px!important;flex:0 0 17px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.quick-chevron{font-size:18px;line-height:1;margin-left:4px}.quick-panel{position:absolute;right:0;top:calc(100% + 9px);width:min(375px,calc(100vw - 30px));max-height:72vh;overflow:auto;z-index:40;border:1px solid #d7e2d7;border-radius:14px;padding:16px;background:#fff;box-shadow:0 12px 30px rgba(13,39,24,.15)}.quick-panel-heading{font-size:14px;font-weight:700;color:#183d29;margin-bottom:10px}.quick-panel>a{display:block;border-top:1px solid #edf0eb;padding:12px 0;overflow-wrap:anywhere}.quick-panel>a span{display:block;color:#617569;font-size:12px;margin-bottom:4px}.quick-panel>a strong{display:block;color:#24643e;font-size:13px}.quick-panel p{font-size:13px;line-height:1.5;color:#576a5c;margin:0 0 12px}.quick-panel iframe{display:block;width:100%;height:210px;border:0;border-radius:9px}.quick-links{display:grid;gap:7px;margin-top:12px}.quick-links a{display:block;padding:10px 12px;border:1px solid #e0e9df;border-radius:8px;color:#205f3e;background:#f6f9f5;font-size:12px}@media(max-width:600px){.quick-access-inner{justify-content:center;gap:9px}.quick-item{flex:1;max-width:220px}.quick-item>summary{width:100%;padding:9px 10px}.quick-panel{left:0;right:auto}.quick-location .quick-panel{left:auto;right:0}}`;
essentials.textContent += ".quick-access{z-index:55!important;padding:0!important}.quick-access-inner{padding-top:9px!important;padding-bottom:9px!important;gap:9px!important}.quick-item{max-width:none!important;flex:0 0 auto!important}.quick-item>summary{min-height:36px!important;width:auto!important;background:transparent!important;border:1px solid #dbe3da!important;border-radius:9px!important;box-shadow:none!important;padding:8px 13px!important;font-weight:600!important;font-size:12.5px!important;gap:7px!important}.quick-item>summary:hover,.quick-item[open]>summary{background:#f0f4ef!important;box-shadow:none!important}.quick-item>summary svg{width:15px!important;height:15px!important;min-width:15px!important;max-width:15px!important;min-height:15px!important;max-height:15px!important;fill:none!important;stroke:currentColor!important}.quick-chevron{font-size:14px!important}.quick-panel{padding:18px!important;border:1px solid #e3e9e1!important;box-shadow:0 12px 35px #193b2920!important;border-radius:13px!important;z-index:70!important}.quick-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:13px}.quick-panel-heading{margin:0!important;font-size:15px!important;line-height:1.4!important}.quick-close{display:inline-flex;align-items:center;white-space:nowrap;min-height:30px;padding:5px 9px;background:#f7faf7;border:1px solid #dfe7df;border-radius:7px;color:#28543c;font-size:12px;cursor:pointer}.quick-links{display:grid!important;gap:0!important;margin-top:12px!important}.quick-links a{background:transparent!important;border:0!important;border-bottom:1px solid #e6ece5!important;border-radius:0!important;padding:12px 2px!important;font-size:12.5px!important;line-height:1.5!important;font-weight:600!important}.quick-panel iframe{height:185px!important}.quick-backdrop{display:none}@media(max-width:600px){.quick-access-inner{justify-content:center!important}.quick-item{flex:0 1 auto!important;max-width:none!important}.quick-item>summary{width:auto!important;padding:8px 12px!important}.quick-backdrop.active{display:block;position:fixed;inset:0;z-index:65;background:#10251b55}.quick-panel,.quick-location .quick-panel{position:fixed!important;left:0!important;right:0!important;top:auto!important;bottom:0!important;width:100%!important;max-width:none!important;max-height:82dvh!important;overflow:auto!important;border-radius:18px 18px 0 0!important;padding:22px 20px calc(20px + env(safe-area-inset-bottom))!important;z-index:66!important;box-shadow:0 -12px 40px #0002!important}.quick-close{min-height:36px;padding:7px 11px;font-size:13px}}";
document.head.appendChild(essentials);
 const bar=document.createElement('section');bar.className='quick-access';bar.setAttribute('aria-label','Informações de contato e localização');
 bar.innerHTML=`<div class="container quick-access-inner">
 <details class="quick-item"><summary><svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" style="width:17px;height:17px;fill:none;stroke:currentColor"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>Contato<span class="quick-chevron" aria-hidden="true">⌄</span></summary>
 <div class="quick-panel"><div class="quick-panel-head"><div class="quick-panel-heading">Fale com o IFF Cabo Frio</div><button type="button" class="quick-close" aria-label="Fechar painel">✕ Fechar</button></div>
 <a href="tel:+552226459500"><span>Recepção do campus</span><strong>(22) 2645-9500</strong></a>
 <a href="mailto:tecnicogastronomia.cabofrio@iff.edu.br"><span>Coordenação do Técnico</span><strong>tecnicogastronomia.cabofrio@iff.edu.br</strong></a>
 <a href="mailto:tecnologo.gastronomia.cabofrio@iff.edu.br"><span>Coordenação do Tecnólogo</span><strong>tecnologo.gastronomia.cabofrio@iff.edu.br</strong></a>
 </div></details>
 <details class="quick-item quick-location"><summary><svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" style="width:17px;height:17px;fill:none;stroke:currentColor"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>Localização<span class="quick-chevron" aria-hidden="true">⌄</span></summary>
 <div class="quick-panel"><div class="quick-panel-head"><div class="quick-panel-heading">IFF campus Cabo Frio</div><button type="button" class="quick-close" aria-label="Fechar painel">✕ Fechar</button></div><p>Estrada Cabo Frio-Búzios, s/nº, Baía Formosa, Cabo Frio, RJ</p>
 <iframe title="Mapa do IFF campus Cabo Frio" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${map}&output=embed"></iframe>
 <div class="quick-links"><a href="${route}" target="_blank" rel="noopener noreferrer">Traçar rota no Google Maps</a><a href="https://www.salineira.com.br/linhas-e-horarios" target="_blank" rel="noopener noreferrer">Linhas e horários da Salineira</a><a href="https://play.google.com/store/apps/details?id=br.salineira" target="_blank" rel="noopener noreferrer">Aplicativo Salineira para Android</a><a href="https://apps.apple.com/br/app/salineira/id1481524615" target="_blank" rel="noopener noreferrer">Aplicativo Salineira para iPhone</a></div></div></details>
 </div>`;
 old.replaceWith(bar);
 document.querySelectorAll('.trialbar').forEach(el=>el.remove());
 const items=bar.querySelectorAll('.quick-item');
 const backdrop=document.createElement('div');backdrop.className='quick-backdrop';backdrop.setAttribute('aria-hidden','true');document.body.append(backdrop);
 let panelHistory=false;
 const shut=(fromHistory=false)=>{items.forEach(i=>i.open=false);backdrop.classList.remove('active');document.body.style.removeProperty('overflow');if(panelHistory&&!fromHistory){panelHistory=false;history.back()}else panelHistory=false};
 items.forEach(item=>{
   item.querySelector('.quick-close').addEventListener('click',()=>{shut();item.querySelector('summary').focus()});
   item.addEventListener('toggle',()=>{if(item.open){items.forEach(other=>{if(other!==item)other.open=false});if(window.matchMedia('(max-width:600px)').matches){backdrop.classList.add('active');document.body.style.overflow='hidden';if(!panelHistory){history.pushState({gastroiffPanel:true},'');panelHistory=true}}}else if(!items.some(i=>i.open)){backdrop.classList.remove('active');document.body.style.removeProperty('overflow')}});
 });
 backdrop.addEventListener('click',()=>shut());
 document.addEventListener('pointerdown',e=>{if(items.some(i=>i.open)&&!bar.contains(e.target)&&e.target!==backdrop)shut()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&items.some(i=>i.open)){e.preventDefault();shut()}});
 window.addEventListener('popstate',()=>{if(panelHistory)shut(true)});

})();
