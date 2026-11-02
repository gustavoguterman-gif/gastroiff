const { chromium } = require('playwright');
const fs=require('node:fs');
const pages=['index.html','cursos.html','pesquisa.html','projetos.html','laboratorios.html','documentos.html','docentes.html','eventos.html','biblioteca.html','contato.html','sobre.html','praticas.html','oportunidades.html','observatorio.html','perfil.html','livro.html','revistas.html','manual-laboratorio.html'];
const root=process.env.TEST_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true});const failures=[],results=[];
 for(const [label,width,height] of [['celular',390,844],['tablet',768,1024],['desktop',1440,900]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  for(const file of pages){
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(root+file,{waitUntil:'networkidle',timeout:30000}).catch(e=>null);
   const status=response?.status()||0;
   const data=await page.evaluate(()=>({title:document.title, overflow:document.documentElement.scrollWidth-innerWidth, broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src')), dead:[...document.querySelectorAll('a[href]')].filter(a=>{const u=new URL(a.href);return u.origin===location.origin&&!document.querySelector('#'+CSS.escape(u.hash.slice(1)))&&u.pathname===location.pathname&&u.hash}).map(a=>a.href),links:[...document.querySelectorAll('a[href]')].filter(a=>a.getAttribute('href')==='#'||a.getAttribute('href')==='').length}));
   const internalLinks=await page.locator('a[href]').evaluateAll(els=>[...new Set(els.map(a=>a.href).filter(h=>h.startsWith(location.origin)&&!h.includes('#')&& !h.startsWith('javascript:')))]);
   const brokenLocal=[];
   for(const u of internalLinks){try{const r=await page.request.get(u,{timeout:10000});if(r.status()>=400)brokenLocal.push({url:u,status:r.status()});}catch(e){brokenLocal.push({url:u,error:String(e).slice(0,130)});}}
   const controls=await page.locator('button').count();
   const result={viewport:label,file,status,...data,brokenLocal,controls,errors:errors.slice(0,8)};
   results.push(result);
   if(status!==200||data.overflow>2||data.broken.length||data.links||brokenLocal.length||errors.length)failures.push(result);
   if(label==='celular'||label==='desktop'){await page.screenshot({path:'reports/'+label+'-'+file.replace('.html','')+'.png',fullPage:true}).catch(()=>{});}
   if(file==='index.html'){
    const toggle=page.locator('[data-menu-toggle]');if(await toggle.isVisible()){await toggle.click();const expanded=await toggle.getAttribute('aria-expanded');if(expanded!=='true')failures.push({viewport:label,file,issue:'Menu nao abriu'});await page.keyboard.press('Escape');if(await toggle.getAttribute('aria-expanded')!=='false')failures.push({viewport:label,file,issue:'Menu nao fechou pelo Escape'});}
   }
   if(file==='docentes.html'){
    for(const type of ['docente','colegiado','nde']){const b=page.locator('[data-faculty-group="'+type+'"]');if(await b.count()){await b.click();let visible=await page.locator('.facultycard:visible').count();if(!visible)failures.push({viewport:label,file,issue:'Filtro '+type+' sem resultados'});}}
   }
  }
  await page.close();
 }
 await browser.close();fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/resultados.json',JSON.stringify({testedAt:new Date().toISOString(),pages:pages.length,viewports:3,checks:results.length,failures,results},null,2));
 console.log('Verificacoes:',results.length,'Falhas:',failures.length);for(const f of failures)console.error(JSON.stringify(f));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
