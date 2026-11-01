
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
document.querySelectorAll('.lab-intro-box img').forEach(img=>{img.src='assets/planta-baixa-recorte.webp';img.alt='Planta baixa do bloco de Gastronomia, toque para ampliar';const link=document.createElement('a');link.href=img.src;link.target='_blank';link.rel='noopener noreferrer';link.title='Ampliar planta baixa';img.parentElement.insertBefore(link,img);link.appendChild(img)});
document.querySelectorAll('.lab-plan-in-hero').forEach(a=>{a.href='assets/planta-baixa-recorte.webp';a.target='_blank';const img=a.querySelector('img');if(img)img.src='assets/planta-baixa-recorte.webp'});
document.querySelectorAll('.calendar-agenda').forEach(box=>{box.setAttribute('tabindex','0');box.setAttribute('aria-label','Datas do mês. Role dentro desta lista para ver mais datas.');});
document.querySelectorAll('.location-map iframe').forEach(f=>{f.loading='lazy';f.referrerPolicy='no-referrer-when-downgrade'});
document.querySelectorAll('.section-head').forEach(s=>{const p=s.querySelector(':scope > p');if(p){p.style.textAlign='left';p.style.marginLeft='0';}});
});
})();
