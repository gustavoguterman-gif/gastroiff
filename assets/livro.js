(()=>{
const host=document.querySelector('[data-livro-profile]');if(!host)return;
const books=window.GASTROIFF_ACERVO||[];
const id=new URLSearchParams(location.search).get('id');
const book=books.find(x=>String(x.id)===id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!book){host.innerHTML='<p>Obra não localizada no catálogo apresentado.</p><a href="biblioteca.html">Voltar à Biblioteca</a>';return}
document.title=book.titulo+' | Biblioteca GASTROIFF';
const title=document.querySelector('.book-profile-title');if(title)title.textContent=book.titulo;
host.innerHTML='<div class="library-book" style="max-width:850px;margin:auto"><div class="library-book-cover">'+(book.capa?'<img src="'+esc(book.capa)+'" alt="Capa do livro '+esc(book.titulo)+'">':'<div class="cover-unavailable">Capa não disponível</div>')+'</div><div class="library-book-detail"><span class="library-book-category">'+esc(book.categoria)+'</span><h2>'+esc(book.titulo)+'</h2>'+(book.autor?'<p>Autor: '+esc(book.autor)+'</p>':'')+'<p>'+esc(book.sinopse)+'</p><p><strong>'+(book.exemplares==null?'Quantidade não informada':esc(book.exemplares)+' exemplares registrados no levantamento de 2025')+'</strong></p><p>Os números não indicam disponibilidade atual para empréstimo.</p><p><a href="https://terminal.biblioteca.iff.edu.br/" target="_blank" rel="noopener noreferrer">Consultar o catálogo oficial</a></p><p><a href="biblioteca.html">Voltar à Biblioteca</a></p></div></div>';
})();