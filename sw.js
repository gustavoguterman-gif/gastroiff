const CACHE='gastroiff-offline-v1';
const SHELL=['./','./index.html','./cursos.html','./laboratorios.html','./biblioteca.html','./docentes.html','./perfil.html','./eventos.html','./assets/site.css','./assets/site.js','./assets/events.js','./assets/faculty.js','./assets/iff.png','./assets/campus.png','./assets/app-icon-192.png','./assets/app-icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]));});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 if(new URL(req.url).origin!==self.location.origin)return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const response=await fetch(req);if(response.ok)cache.put(req,response.clone()).catch(()=>{});return response;}
  catch(error){const saved=await cache.match(req);if(saved)return saved;if(req.mode==='navigate')return await cache.match('./index.html');throw error;}
 })());
});