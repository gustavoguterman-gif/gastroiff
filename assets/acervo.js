
(function(){
 const data=window.GASTROIFF_ACERVO||[];
 const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const categories=['Todos os assuntos',...new Set(data.map(d=>d.categoria))];
 const labelCount=n=>n===1?'1 exemplar cadastrado':n+' exemplares cadastrados';
 const cover=(d,large=false)=>d.capa?`<img loading="lazy" src="${esc(d.capa)}" alt="Capa de ${esc(d.titulo)}" class="${large?'cover-big':'cover-img'}">`:`<div class="cover-none">Obra sem imagem<br>no levantamento</div>`;
 const catalog=document.querySelector('[data-acervo-grid]');
 if(catalog){
  const search=document.querySelector('[data-acervo-search]'),sort=document.querySelector('[data-acervo-sort]'),filters=document.querySelector('[data-acervo-filters]'),count=document.querySelector('[data-acervo-count]');
  let active='Todos os assuntos';
  function render(){
   const q=norm(search.value.trim());
   const books=data.filter(d=>(active==='Todos os assuntos'||d.categoria===active)&&norm([d.titulo,d.autor,d.assunto,d.chamada,d.categoria].join(' ')).includes(q));
   const mode=sort.value;books.sort((a,b)=>mode==='ano'?((parseInt(b.ano.replace(/\D/g,''))||0)-(parseInt(a.ano.replace(/\D/g,''))||0)):mode==='exemplares'?((b.exemplares||0)-(a.exemplares||0)):a.titulo.localeCompare(b.titulo,'pt-BR'));
   count.textContent=`${books.length} ${books.length===1?'registro':'registros'}`;
   catalog.innerHTML=books.map(d=>`<a class="acervo-card" href="livro.html?id=${d.id}" aria-label="Ver informações de ${esc(d.titulo)}"><div class="acervo-cover">${cover(d)}</div><div class="acervo-book-meta"><small>${esc(d.categoria)}</small><h3>${esc(d.titulo)}</h3><p class="acervo-author">${esc(d.autor||'Autoria não identificada no levantamento')} · ${esc(d.ano||'Ano não informado')}</p><p class="acervo-excerpt">${esc(d.sinopse)}</p><div class="acervo-bottom"><span>${d.exemplares===null?'Quantidade não informada':labelCount(d.exemplares)}</span><span aria-hidden="true">↗</span></div></div></a>`).join('');
   document.querySelector('[data-acervo-empty]').hidden=!!books.length;
  }
  filters.innerHTML=categories.map((c,i)=>`<button type="button" class="acervo-chip${i===0?' selected':''}" data-category="${esc(c)}" aria-pressed="${i===0}">${esc(c)}</button>`).join('');
  filters.addEventListener('click',e=>{let b=e.target.closest('[data-category]');if(!b)return;active=b.dataset.category;filters.querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b))});render()});
  search.addEventListener('input',render);sort.addEventListener('change',render);render();
 }
 const profile=document.querySelector('[data-livro-profile]');
 if(profile){
  const id=Number((new URLSearchParams(location.search).get('id') || window.GASTROIFF_PREVIEW_ID));const book=data.find(d=>d.id===id);
  if(!book){profile.innerHTML='<p>Obra não encontrada. <a class="link" href="acervo.html">Voltar ao catálogo ↗</a></p>';return}
  document.title=book.titulo+' | GASTROIFF';
  profile.innerHTML=`<div class="book-profile"><div class="book-profile-cover">${cover(book,true)}</div><div><span class="upper kicker">${esc(book.categoria)}</span><h2>${esc(book.titulo)}</h2><p class="book-profile-author">${esc(book.autor||'Autoria não informada')} · ${esc(book.ano)}</p><p class="book-profile-synopsis">${esc(book.sinopse)}</p><div class="book-facts"><div><small>Exemplares no levantamento</small><strong>${book.exemplares===null?'Não informado':book.exemplares}</strong></div><div><small>Número de chamada</small><strong>${esc(book.chamada)}</strong></div><div><small>Assunto do registro</small><strong>${esc(book.assunto)}</strong></div><div><small>Tipo de material</small><strong>${esc(book.tipo)}</strong></div></div><div class="book-actions"><a class="editorial-action" href="acervo.html">← Voltar ao acervo</a><a class="editorial-action" href="https://terminal.biblioteca.iff.edu.br/" target="_blank" rel="noopener noreferrer">Verificar no catálogo oficial ↗</a></div><p class="book-notice">Informações de 02/10/2025. A quantidade cadastrada não equivale a disponibilidade atual para empréstimo. As descrições são apresentações temáticas baseadas nos dados do levantamento, não sinopses oficiais das editoras.</p></div></div>`;
 }
})();
