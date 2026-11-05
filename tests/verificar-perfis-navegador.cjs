const { chromium } = require("playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const root = "http://127.0.0.1:8765/";
(async()=>{
  fs.mkdirSync("reports",{recursive:true});
  const browser=await chromium.launch({headless:true});
  const results=[];
  try{
    for(const [name,width,height] of [["celular-compacto",360,780],["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
      const context=await browser.newContext({viewport:{width,height}});
      const page=await context.newPage();
      const errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      const response=await page.goto(root+"index.html",{waitUntil:"domcontentloaded"});
      assert.equal(response.status(),200,"index: "+name);
      await page.locator("#gi-profile-choice").waitFor({state:"attached"});
      const entry=page.locator("[data-entry-screen]");
      await entry.locator('[data-profile-entry="visitante"]').waitFor({state:"attached"});
      if(width===360){
        await page.locator('[data-entry-screen][data-stage="intro"]').waitFor({timeout:3000});
        await page.waitForTimeout(1150);
        assert.equal(await entry.getAttribute("data-stage"),"intro","a logo não deve desaparecer depressa");
      }
      await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:7000});
      assert.equal(await page.locator("[data-profile-entry]").count(),3,"três perfis sem cadastro: "+name);
      assert.deepEqual(await page.locator("[data-profile-entry]").evaluateAll(buttons=>buttons.map(b=>b.dataset.profileEntry)),["visitante","estudante","docente"],"ordem dos perfis: "+name);
      assert.deepEqual(await page.locator("[data-profile-entry]").allTextContents(),["Visitante","Estudante","Docente"],"botões sem informações adicionais");
      assert.equal(await page.locator(".gi-entry-screen p, .gi-entry-screen h2, .gi-entry-screen .gi-entry-skip").count(),0,"sem texto ou botão extra");
      assert.equal(await page.locator(".gi-entry-brand").evaluate(el=>getComputedStyle(el).opacity),"1","marca permanece integrada às opções");
      assert.equal(await page.locator(".gi-entry-brand").evaluate(el=>getComputedStyle(el).position),"static","marca e botões ocupam a mesma composição");

      assert.equal(await page.locator("[data-entry-screen] input").count(),0,"sem coleta de identificação: "+name);
      assert.equal(await page.locator("#gi-profile-choice").inputValue(),"visitante");
      assert.equal(await page.locator(".gi-profile-entrance-logo").count(),1,"marca da abertura: "+name);
      assert.equal(await page.locator(".gi-profile-entrance-logo").evaluate(img=>img.complete&&img.naturalWidth>0),true,"logo carregada: "+name);
      const layout=await page.locator(".gi-profile-entrance-options").evaluate(node=>({display:getComputedStyle(node).display,direction:getComputedStyle(node).flexDirection}));
      assert.deepEqual(layout,{display:"flex",direction:"column"},"lista vertical de três perfis: "+name);
      const introOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(introOverflow<=2,"sem rolagem horizontal na entrada: "+name+" = "+introOverflow);
      await page.screenshot({path:"reports/entrada-"+name+".png",fullPage:false});
      await page.locator('[data-profile-entry="docente"]').click();
      await entry.waitFor({state:"hidden",timeout:5000});
      assert.equal(await page.locator("#gi-profile-choice").inputValue(),"docente","perfil docente: "+name);
      assert.equal(await page.locator(".gi-personal-panel h2").innerText(),"Sou docente");
      assert.ok(await page.locator('.gi-personal-links a[href="planejamento-docente.html"]').count());
      if(width===768){
        assert.equal(await page.locator(".headerline>.navbar.gi-unified-desktop").isVisible(),false,"sem menu desktop cortado no tablet");
        assert.equal(await page.locator(".headerline>.menu-toggle").isVisible(),true,"botão do menu tablet visível");
        await page.locator(".headerline>.menu-toggle").click();
        assert.equal(await page.locator("[data-mobile-menu]").isVisible(),true,"menu tablet abre");
        await page.locator(".headerline>.menu-toggle").click();
      }
      await page.locator("#gi-profile-choice").selectOption("visitante");
      assert.ok(await page.locator('.gi-personal-links a[href="eventos.html"]').count(),"calendário público visitante: "+name);
      assert.equal(await page.locator('[data-profile-entry="visitante"]').getAttribute("aria-pressed"),"true");
      assert.equal(await page.locator("header .gastrobrand img").evaluate(img=>img.complete&&img.naturalWidth>0),true,"marca do cabeçalho carregada: "+name);
      await page.locator("#gi-profile-choice").selectOption("docente");
      assert.match(await page.locator(".gi-personal-panel").innerText(),/Livro de Ocorrências/);
      await page.reload({waitUntil:"domcontentloaded"});
      await page.locator("#gi-profile-choice").waitFor();
      assert.equal(await page.locator("[data-entry-screen]").isHidden(),true,"sem repetição intrusiva na mesma sessão: "+name);
      assert.equal(await page.locator("#gi-profile-choice").inputValue(),"docente","preferência preservada: "+name);
      await page.locator("#gi-profile-choice").selectOption("estudante");
      assert.match(await page.locator(".gi-personal-panel").innerText(),/Gastronomia em ação/);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(overflow<=2,"rolagem horizontal na página inicial: "+name+" = "+overflow);
      assert.deepEqual(errors,[],"erros JS na entrada e no perfil: "+name);
      await page.screenshot({path:"reports/perfis-"+name+".png",fullPage:false});
      // Movimento reduzido deve exibir escolhas imediatamente, sem animação obrigatória.
      await page.emulateMedia({reducedMotion:"reduce"});
      await page.evaluate(()=>sessionStorage.removeItem("gastroiff-entry-session-v1"));
      await page.reload({waitUntil:"domcontentloaded"});
      await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:4000});
      await page.locator('[data-profile-entry="visitante"]').click();
      await page.locator("[data-entry-screen]").waitFor({state:"hidden",timeout:4000});
      assert.equal(await page.locator("#gi-profile-choice").inputValue(),"visitante");
      const oc=await page.goto(root+"ocorrencias.html",{waitUntil:"domcontentloaded"});
      assert.equal(oc.status(),200);
      await page.locator("#role").selectOption("Docente");
      assert.equal(await page.locator("#teacher").isVisible(),true);
      const teacherOptions=await page.locator("#teacher option").count();
      assert.ok(teacherOptions>10,"lista docente carregada: "+name);
      await page.locator("#teacher").selectOption({index:1});
      await page.locator("#role").selectOption("Estudante");
      assert.equal(await page.locator("#name").isVisible(),true);
      assert.equal(await page.locator("#name").getAttribute("required"),"");
      assert.equal(await page.locator("#teacher").isVisible(),false);
      const ocOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(ocOverflow<=2,"rolagem horizontal nas ocorrências: "+name+" = "+ocOverflow);
      assert.deepEqual(errors,[],"erros JS: "+name);
      await page.screenshot({path:"reports/ocorrencias-"+name+".png",fullPage:false});
      results.push({viewport:name,profilePersistence:true,teacherOptions,overflow,ocOverflow,errors});
      await context.close();
    }
    fs.writeFileSync("reports/teste-perfis.json",JSON.stringify(results,null,2));
    console.log("Navegador: testes aprovados para",results.map(x=>x.viewport).join(", "));
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
