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
    const isNewEntrance=file==="index.html" && await page.locator('script[src*="perfis-publicos.js?v=5"]').count()===1;
    const entrancePublished=file==="index.html" && await page.locator('script[src*="perfis-publicos.js?v=4"], script[src*="perfis-publicos.js?v=5"]').count()===1;
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
