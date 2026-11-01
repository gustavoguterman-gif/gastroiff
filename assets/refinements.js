
/* Ajustes de navegação e apresentação sem dependências externas */
(function(){
const whenReady=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
whenReady(()=>{
const email='tecnologogastronomia.cabofrio@iff.edu.br';
document.querySelectorAll('.navbar .contact-nav').forEach(a=>a.remove());
document.querySelectorAll('.nav-tip').forEach(t=>{t.style.textAlign='left';if(t.textContent.includes('Livros físicos'))t.textContent='Acervo da biblioteca';});
document.querySelectorAll('.location-address strong').forEach(x=>x.textContent='Endereço:');
document.querySelectorAll('.location-inner').forEach(bar=>{
if(bar.querySelector('.location-contact'))return;
const el=document.createElement('span');el.className='location-contact';const title=document.createElement('strong');title.textContent='Coordenação:';const a=document.createElement('a');a.href='mailto:'+email+'?subject='+encodeURIComponent('Contato pelo GASTROIFF');a.textContent=email;el.append(title,a);const trigger=bar.querySelector('.location-trigger');if(trigger)bar.insertBefore(el,trigger);else bar.append(el);
});
const cropPlan=(img,link)=>{const source=new Image();source.onload=()=>{try{const c=document.createElement('canvas');const sx=Math.round(source.naturalWidth*.085),sy=Math.round(source.naturalHeight*.15),sw=Math.round(source.naturalWidth*.83),sh=Math.round(source.naturalHeight*.817);c.width=sw;c.height=sh;c.getContext('2d').drawImage(source,sx,sy,sw,sh,0,0,sw,sh);const url=c.toDataURL('image/png');img.src=url;if(link)link.href=url;}catch(e){img.src=source.src;if(link)link.href=source.src}};source.src='assets/planta-baixa-laboratorio.webp';};
// Os links das plantas são definidos no HTML. Não criar links externos nem substituir seus destinos.
document.querySelectorAll('.calendar-agenda').forEach(box=>{box.setAttribute('tabindex','0');box.setAttribute('aria-label','Datas do mês. Role dentro desta lista para ver mais datas.');});
document.querySelectorAll('.location-map iframe').forEach(f=>{f.loading='lazy';f.referrerPolicy='no-referrer-when-downgrade'});
document.querySelectorAll('.section-head').forEach(s=>{const p=s.querySelector(':scope > p');if(p){p.style.textAlign='left';p.style.marginLeft='0';}});
});
})();
