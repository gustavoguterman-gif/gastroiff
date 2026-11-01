(async()=>{
const gallery=document.querySelector('[data-instagram-gallery]');if(!gallery)return;
try{const response=await fetch('assets/instagram-feed.json',{cache:'no-store'});if(!response.ok)return;const feed=await response.json();if(!Array.isArray(feed)||!feed.length)return;
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const valid=feed.filter(x=>x.permalink?.startsWith('https://www.instagram.com/') && x.image?.startsWith('https://'));
if(!valid.length)return;
gallery.innerHTML=valid.slice(0,6).map(x=>`<a href="${esc(x.permalink)}" target="_blank" rel="noopener noreferrer" class="instagram-feature"><div class="ig-square"><img src="${esc(x.image)}" loading="lazy" alt="Publicação do @gastroiff"></div><div class="ig-caption"><small>@gastroiff · Instagram</small><strong>${esc((x.caption||'').slice(0,78)||'Publicação da Gastronomia')}</strong><p>${esc((x.caption||'').slice(78,200))}</p></div></a>`).join('');
const note=document.querySelector('.instagram-footer span');if(note)note.textContent='Publicações do Instagram @gastroiff. Novas imagens aparecem após a sincronização autorizada do perfil.';
}catch(e){ /* Fotos do acervo institucional permanecem disponíveis */ }
})();