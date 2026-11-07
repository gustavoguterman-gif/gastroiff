const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const BASE=(process.env.GASTROIFF_SITE_URL||"https://gustavoguterman-gif.github.io/gastroiff/").replace(/\/?$/,"/");
const pages=["index.html","contato.html","revistas.html","gestao.html","gestao-documentos-praticas.html","planejamento-docente.html","oportunidades.html"];
(async()=>{
 fs.mkdirSync("reports/site-publicado",{recursive:true});
 const browser=await chromium.launch({headless:true});
 try{
  const checks=[];
  for(const [view,width,height] of [["aplicativo-mobile",390,844],["tablet",768,1024],["navegador-desktop",1440,900]]){
   const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:"allow"});
   for(const file of pages){
    const page=await ctx.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    try{
    const response=await page.goto(BASE+file,{waitUntil:"domcontentloaded",timeout:30000});
    assert.equal(response.status(),200,file+" "+view+" status");
    await page.waitForTimeout(600);
    // Em PRs, o site publicado ainda pode estar na versão anterior. A prova
    // obrigatória da nova entrada ocorre nos testes locais e após o deploy.
    const isNewEntrance=file==="index.html" && await page.locator('script[src*="perfis-publicos.js?v="]').count()===1;
    const entrancePublished=isNewEntrance;
    if(entrancePublished){
      await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:7000});
      assert.equal(await page.locator("[data-profile-entry]").count(),4,"quatro perfis disponíveis no site publicado: "+view);
      if(isNewEntrance){
        assert.deepEqual(await page.locator("[data-profile-entry]").evaluateAll(nodes=>nodes.map(n=>n.dataset.profileEntry)),["visitante","estudante","docente","egresso"],"ordem da nova abertura publicada: "+view);
        assert.equal(await page.locator(".gi-entry-screen h2, .gi-entry-screen p, .gi-entry-screen .gi-entry-skip").count(),0,"somente marca e quatro botões: "+view);
        assert.equal(await page.locator(".gi-entry-brand").evaluate(el=>getComputedStyle(el).opacity),"1","logo permanece ao lado da escolha: "+view);
      }
      await page.locator('[data-profile-entry="visitante"]').click();
      await page.locator("[data-entry-screen]").waitFor({state:"hidden"});
      assert.ok(await page.locator(".gi-personal-panel h2").isVisible(),"conteúdo da escolha de perfil visível: "+view);
      const newStyle=await page.locator('link[href*="site.css?v=20261106-motion2"]').count()===1;
      if(newStyle){
       assert.deepEqual(await page.locator("#gi-profile-choice option").evaluateAll(options=>options.map(o=>o.value)),
         ["visitante","estudante","docente","egresso"],"perfis do seletor publicado: "+view);
       const box=await page.locator("#gi-profile-choice").boundingBox();
       assert.ok(box&&box.width<=148&&box.height<=38,"Mudar perfil compacto publicado: "+view);
       assert.equal(await page.locator("#gi-profile-choice").evaluate(el=>getComputedStyle(el).borderTopLeftRadius),"7px",
         "seletor padronizado com botões do site: "+view);
      }
      if(entrancePublished){
        await page.reload({waitUntil:"domcontentloaded"});
        await page.locator('[data-entry-screen][data-stage="intro"]').waitFor({timeout:3000});
        await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:7000});
        assert.deepEqual(await page.locator("[data-profile-entry] .gi-entry-card-label").allTextContents(),["Visitante","Estudante","Docente","Egresso"],"nova visita mostra a animação em "+view);
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
    if(file==="contato.html"){
      const phone=page.locator('.contact-phone-actions a.gi-contact-call[href="tel:+552226459500"]');
      const whatsapp=page.locator('.contact-phone-actions a.gi-contact-whatsapp[href="https://wa.me/552226459500"]');
      assert.equal(await phone.count(),1,"Link de ligação indisponível: "+view);
      assert.equal(await whatsapp.count(),1,"Link de WhatsApp indisponível: "+view);
      assert.ok(await phone.isVisible() && await whatsapp.isVisible(),"Ações de contato invisíveis: "+view);
      const boxes=await Promise.all([phone.boundingBox(),whatsapp.boundingBox()]);
      assert.ok(boxes.every(b=>b && b.width>0 && b.height>=40),"Ações de contato pequenas ou ocultas: "+view);
    }
    if(file==="revistas.html"){
      assert.ok(await page.getByText("Revista de Ciência de Alimentos e Gastronomia (RCAGT)",{exact:true}).count()>=1,
        "Revista brasileira IFPR não encontrada: "+view);
      assert.ok(await page.locator('a[href="https://revistas.ifpr.edu.br/index.php/rcagt/index"]').count()>=1,
        "Endereço original da revista IFPR ausente: "+view);
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
    }catch(error){
     const location="reports/site-publicado/"+view+"-"+file.replace(".html","")+"-falha";
     try{
      await page.screenshot({path:location+".png",fullPage:true,animations:"disabled",timeout:10000});
     }catch(snapshotError){
      console.error("Não foi possível capturar a tela com falha:",snapshotError.message);
     }
     fs.writeFileSync(location+".json",JSON.stringify({
      file,view,width,height,reason:error.message,javascriptErrors:errors
     },null,2));
     throw error;
    }finally{
     await page.close();
    }
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
  console.log("Portal publicado aprovado:",checks.length,"verificações de páginas em celular, tablet e desktop; manifesto e SW ativos");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
