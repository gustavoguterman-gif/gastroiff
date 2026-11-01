const CACHE='gastroiff-offline-v30';
const SHELL=[
 './','./index.html','./contato.html','./cursos.html','./laboratorios.html','./biblioteca.html',
 './docentes.html','./pesquisa.html','./projetos.html','./manual-laboratorio.html','./perfil.html','./eventos.html','./acervo.html','./documentos.html','./livro.html',
 './assets/site.css','./assets/story.css','./assets/refinements.css','./assets/institutional.css','./assets/site.js','./assets/refinements.js','./assets/institutional.js','./assets/transparent-marks.js','./assets/install.js','./assets/events.js','./assets/faculty.js','./assets/acervo.js','./assets/livro.js','./assets/acervo-data.js',
 './assets/instagram.js','./assets/instagram-feed.json','./assets/planta-baixa-laboratorio.webp','./assets/iff.png','./assets/gastroiff-marca.jpg','./assets/iff-marca-oficial.jpg','./assets/campus.png','./assets/sede-cabecalho.png','./assets/laboratorio-desenho.jpg','./agenda-gastroiff.ics',
 './assets/app-icon-round-v2-180.png','./assets/app-icon-round-v2-192.png','./assets/app-icon-round-v2-512.png'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(SHELL.map(url=>cache.add(url)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),
  self.clients.claim()
 ]));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(req);
   if(response.ok)cache.put(req,response.clone()).catch(()=>{});
   return response;
  }catch(error){
   const saved=await cache.match(req);
   if(saved)return saved;
   if(req.mode==='navigate')return await cache.match(req,{ignoreSearch:true}) || Response.error();
   throw error;
  }
 })());
});
