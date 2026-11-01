
(function(){
const go=()=>{
document.querySelectorAll('.facultycard').forEach(card=>{
 const anchor=card.querySelector('.facultycard-head');if(!anchor)return;
 const old=anchor.querySelector('.pill.neutral');
 if(old)old.remove();
 let wrap=anchor.querySelector('.faculty-roles');if(!wrap){wrap=document.createElement('span');wrap.className='faculty-roles';anchor.appendChild(wrap)}
 const roles=['Docente'];if(card.dataset.colegiado==='1')roles.push('Colegiado');if(card.dataset.nde==='1')roles.push('NDE');
 wrap.replaceChildren(...roles.map(name=>{const el=document.createElement('span');el.className='pill neutral '+(name==='Colegiado'?'coleg':name==='NDE'?'nde':'');el.textContent=name;return el}));
});
document.querySelectorAll('.governance-panel').forEach(box=>{
 const p=box.querySelector('p');if(p)p.innerHTML='<strong>Corpo docente</strong> reúne os professores que atuam nos cursos de Gastronomia. <strong>Colegiado</strong> é o órgão permanente que planeja, avalia e delibera sobre as ações didático-pedagógicas de ensino, pesquisa e extensão do curso, conforme o art. 40 da Regulamentação Didático-Pedagógica do IFF. <strong>NDE</strong>, Núcleo Docente Estruturante, acompanha a concepção, a atualização e o desenvolvimento do Projeto Pedagógico do Curso (PPC), conforme o art. 41 da mesma regulamentação.';
 const titles=box.querySelectorAll('.governance-grid h3');
 titles.forEach(t=>{if(t.textContent.includes('técnico-administrativas')){const v=t.parentElement.querySelector('p');if(v)v.textContent='Daiana Costa Pereira · Lygia Gottgtroy Fraga Zigolis Filha de Oliveira';}
 if(t.textContent.includes('discente')){const v=t.parentElement.querySelector('p');if(v)v.textContent='Composição discente em confirmação';}});
});
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
