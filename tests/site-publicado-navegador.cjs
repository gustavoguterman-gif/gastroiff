const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const BASE=(process.env.GASTROIFF_SITE_URL||"https://gustavoguterman-gif.github.io/gastroiff/").replace(/\/?$/,"/");
const pages=["index.html","gestao.html","gestao-documentos-praticas.html","planejamento-docente.html","oportunidades.html"];
(async()=>{
 fs.mkdirSync("reports/site-publicado",{recursive:true});
 const browser=await chromium.launch({headless:true});
 try{
  const checks=[];
  for(const [view,width,height] of [["aplicativo-mobile",390,844],["navegador-desktop",1440,900]]){
   const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:"allow"});
   for(const file of pages){
    const page=await ctx.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    const response=await page.goto(BASE+file,{waitUntil:"domcontentloaded",timeout:30000});
    assert.equal(response.status(),200,file+" "+view+" status");
    await page.waitForTimeout(600);
    // Em PRs, o site publicado ainda pode estar na versão anterior. A prova
    // obrigatória da nova entrada ocorre nos testes locais e após o deploy.
    const isNewEntrance=file==="index.html" && await page.locator('script[src*="perfis-publicos.js?v=5"], script[src*="perfis-publicos.js?v=6"]').count()===1;
    const entrancePublished=file==="index.html" && await page.locator('script[src*="perfis-publicos.js?v=4"], script[src*="perfis-publicos.js?v=5"], script[src*="perfis-publicos.js?v=6"]').count()===1;
    if(entrancePublished){
      await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:7000});
      assert.equal(await page.locator("[data-profile-entry]").count(),3,"três perfis disponíveis no site publicado: "+view);
      if(isNewEntrance){
        assert.deepEqual(await page.locator("[data-profile-entry]").evaluateAll(nodes=>nodes.map(n=>n.dataset.profileEntry)),["visitante","estudante","docente"],"ordem da nova abertura publicada: "+view);
        assert.equal(await page.locator(".gi-entry-screen h2, .gi-entry-screen p, .gi-entry-screen .gi-entry-skip").count(),0,"somente marca e três botões: "+view);
        assert.equal(await page.locator(".gi-entry-brand").evaluate(el=>getComputedStyle(el).opacity),"1","logo permanece ao lado da escolha: "+view);
      }
      await page.locator('[data-profile-entry="visitante"]').click();
      await page.locator("[data-entry-screen]").waitFor({state:"hidden"});
      assert.ok(await page.locator(".gi-personal-panel h2").isVisible(),"conteúdo da escolha de perfil visível: "+view);
      if(await page.locator('script[src*="perfis-publicos.js?v=6"]').count()){
        await page.reload({waitUntil:"domcontentloaded"});
        await page.locator('[data-entry-screen][data-stage="intro"]').waitFor({timeout:3000});
        await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:7000});
        assert.deepEqual(await page.locator("[data-profile-entry]").allTextContents(),["Visitante","Estudante","Docente"],"nova visita mostra a animação em "+view);
        await page.locator('[data-profile-entry="visitante"]').click();
        await page.locator("[data-entry-screen]").waitFor({state:"hidden"});
      }
    }
    // Algumas áreas administrativas usam um cabeçalho próprio sem ações rápidas.
    // Conferir o trio apenas nas páginas que de fato o oferecem.
    const quickAvailable=await page.locator(".header-refined .headerline>.quick-access").count();
    if(file==="index.html")assert.equal(quickAvailable,1,"cabeçalho público sem ações rápidas: "+view);
    if(quickAvailable){
     const quick=await page.locator(".header-refined .headerline>.quick-access").evaluate(el=>{
      const nodes=[...el.children];
      return nodes.map(node=>(node.matches("details")?node.querySelector("summary"):node).getBoundingClientRect().toJSON());
     });
     assert.equal(quick.length,3,"três botões rápidos: "+view+" "+file);
     assert.ok(quick.every(box=>Math.abs(box.width-quick[0].width)<=1&&Math.abs(box.y-quick[0].y)<=1),"ações alinhadas: "+view+" "+file);
     const versionWithCompactHeader=await page.locator('link[href*="institutional.css?v=20261105-quickfix1"]').count()===1;
     if(width<=700&&versionWithCompactHeader)
      assert.ok(quick.every(box=>box.width<=43&&box.height<=45),"ações compactas no celular: "+view+" "+file);
    }
    const status=await page.evaluate(()=>({
     title:document.title,
     overflow:document.documentElement.scrollWidth-innerWidth,
     h1:document.querySelector("h1")?.textContent?.trim()||""
    }));
    assert.ok(status.title&&status.h1,file+" sem título");
    assert.ok(status.overflow<=3,file+" "+view+" largura excedida "+status.overflow);
    assert.deepEqual(errors,[],file+" "+view+" erros JavaScript");
    await page.screenshot({path:"reports/site-publicado/"+view+"-"+file.replace(".html",".png"),fullPage:true,animations:"disabled"});
    checks.push({file,view,...status});
    await page.close();
   }
   await ctx.close();
  }
  const context=await browser.newContext({serviceWorkers:"allow"});
  const page=await context.newPage();
  await page.goto(BASE+"index.html",{waitUntil:"load",timeout:30000});
  const m=await page.request.get(BASE+"manifest.webmanifest");
  assert.equal(m.status(),200,"manifesto remoto");
  const manifest=await m.json();
  assert.equal(manifest.display,"standalone");
  for(const icon of manifest.icons){
   const r=await page.request.get(new URL(icon.src,BASE).href);
   assert.equal(r.status(),200,icon.src);
  }
  await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,null,{timeout:30000});
  await context.close();
  fs.writeFileSync("reports/site-publicado/resultado.json",JSON.stringify({base:BASE,checks},null,2));
  console.log("Portal publicado aprovado:",checks.length,"verificações de páginas em mobile e desktop; manifesto e SW ativos");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
