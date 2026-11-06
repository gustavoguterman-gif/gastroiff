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
      assert.equal(await page.locator("[data-profile-entry]").count(),4,"quatro perfis sem cadastro: "+name);
      assert.deepEqual(await page.locator("[data-profile-entry]").evaluateAll(buttons=>buttons.map(b=>b.dataset.profileEntry)),["visitante","estudante","docente","egresso"],"ordem dos perfis: "+name);
      assert.deepEqual((await page.locator("[data-profile-entry]").allTextContents()).map(t=>t.trim().replace(/\s*›$/,"")),["Visitante","Estudante","Docente","Egresso"],"rótulos e indicação visual dos quatro perfis");
      assert.equal(await page.locator(".gi-entry-screen p, .gi-entry-screen h2, .gi-entry-screen .gi-entry-skip").count(),0,"sem texto ou botão extra");
      assert.equal(await page.locator(".gi-entry-brand").evaluate(el=>getComputedStyle(el).opacity),"1","marca permanece integrada às opções");
      assert.equal(await page.locator(".gi-entry-brand").evaluate(el=>getComputedStyle(el).position),"static","marca e botões ocupam a mesma composição");

      assert.equal(await page.locator("[data-entry-screen] input").count(),0,"sem coleta de identificação: "+name);
      assert.equal(await page.locator("#gi-profile-choice").inputValue(),"visitante");
      assert.deepEqual(
        await page.locator("#gi-profile-choice option").evaluateAll(opts=>opts.map(o=>o.value)),
        ["visitante","estudante","docente","egresso"],
        "mesmos quatro perfis em todos os formatos: "+name
      );

      assert.equal(await page.locator(".gi-profile-entrance-logo").count(),1,"marca da abertura: "+name);
      assert.equal(await page.locator(".gi-profile-entrance-logo").evaluate(img=>img.complete&&img.naturalWidth>0),true,"logo carregada: "+name);
      const layout=await page.locator(".gi-profile-entrance-options").evaluate(node=>({display:getComputedStyle(node).display,columns:getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length}));
      assert.deepEqual(layout.display,"grid","mosaico de perfis: "+name);
      assert.equal(layout.columns,2,"mosaico deve ter duas colunas em todos os formatos: "+name);
      const introOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(introOverflow<=2,"sem rolagem horizontal na entrada: "+name+" = "+introOverflow);
      await page.screenshot({path:"reports/entrada-"+name+".png",fullPage:false});
      // A revelação suave do conteúdo só começa depois de encerrar a entrada.
      // Verificação feita nos quatro tamanhos, inclusive desktop.
      assert.equal(await page.locator("main .gi-motion-ready").count(),0,
        "conteúdo não pode animar atrás da tela inicial: "+name);
      await page.locator('[data-profile-entry="docente"]').click();
      await entry.waitFor({state:"hidden",timeout:5000});
      await page.waitForFunction(()=>document.querySelector("main .section-head")?.classList.contains("gi-motion-ready") ||
        document.querySelector("main .section-head")?.classList.contains("gi-motion-visible"),null,{timeout:3000});
      assert.ok(await page.locator("main .gi-motion-ready").count()>0,
        "seções precisam iniciar revelação após a entrada: "+name);
      // Confere os estilos de transição sem depender de classes temporárias.
      const transition=await page.locator("main .section-head").first().evaluate(el=>{
        const originalReady=el.classList.contains("gi-motion-ready");
        const originalVisible=el.classList.contains("gi-motion-visible");
        el.classList.add("gi-motion-ready","gi-motion-visible");
        const css=getComputedStyle(el);
        const result={duration:css.transitionDuration};
        if(!originalReady)el.classList.remove("gi-motion-ready");
        if(!originalVisible)el.classList.remove("gi-motion-visible");
        return result;
      });
      assert.match(transition.duration,/0\.76s|760ms/,
        "transição suave não configurada: "+name+" "+JSON.stringify(transition));
      await page.waitForTimeout(850);
      const settled=await page.locator("main .gi-personal-panel").evaluate(el=>
        Number(getComputedStyle(el).opacity)
      );
      assert.ok(settled>=0.99,"conteúdo continua invisível após transição: "+name);
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
      // "Mudar perfil" deve ter a escala do botão padrão e nunca ocupar a linha toda.
      // Afasta o ponteiro e conclui a transição de hover antes de comparar as cores.
      await page.mouse.move(0,0);
      await page.waitForTimeout(320);
      const switcherMetrics=await page.locator(".gi-personal-choice").evaluate(group=>{
        const select=group.querySelector("select"),label=group.querySelector("label");
        const b=select.getBoundingClientRect(),l=label.getBoundingClientRect();
        const css=getComputedStyle(select);
        const button=document.querySelector(".gi-personal-links a");
        const bs=button?getComputedStyle(button):null;
        return {width:b.width,height:b.height,right:b.right,top:b.top,
          labelRight:l.right,labelTop:l.top,
          radius:parseFloat(css.borderTopLeftRadius),
          background:css.backgroundColor,buttonBackground:bs?.backgroundColor,
          groupWidth:group.getBoundingClientRect().width,
          clipped:select.scrollWidth>select.clientWidth+2
        };
      });
      assert.ok(switcherMetrics.width<=146&&switcherMetrics.height<=38,
        "seletor fora do padrão compacto: "+name+" "+JSON.stringify(switcherMetrics));
      assert.ok(switcherMetrics.groupWidth<=265,
        "grupo Mudar perfil largo demais: "+name);
      assert.ok(switcherMetrics.right<=width+1,
        "seletor fora da tela: "+name);
      assert.ok(switcherMetrics.labelRight<=switcherMetrics.right,
        "texto Mudar perfil desalinhado: "+name);
      assert.ok(Math.abs(switcherMetrics.labelTop-switcherMetrics.top)<16,
        "rótulo desalinhado verticalmente: "+name);
      assert.ok(switcherMetrics.radius>=6&&switcherMetrics.radius<=10,
        "raio do seletor fora do padrão: "+name);
      assert.equal(switcherMetrics.background,switcherMetrics.buttonBackground,
        "seletor não usa o mesmo fundo dos botões: "+name);
      assert.equal(switcherMetrics.clipped,false,
        "texto do perfil cortado: "+name);
      await page.locator("#gi-profile-choice").selectOption("estudante");
      assert.equal(await page.locator(".gi-personal-panel h2").innerText(),"Estou estudando Gastronomia");
      await page.locator("#gi-profile-choice").selectOption("docente");
      assert.equal(await page.locator(".gi-personal-panel h2").innerText(),"Sou docente");
      await page.locator("#gi-profile-choice").selectOption("egresso");
      assert.equal(await page.locator(".gi-personal-panel h2").innerText(),"Concluí minha formação");
      assert.ok(await page.locator('.gi-personal-links a[href="observatorio.html#pesquisa-tecnico"]').count(),"pesquisa Técnico: "+name);
      assert.ok(await page.locator('.gi-personal-links a[href="observatorio.html#pesquisa-graduacao"]').count(),"pesquisa graduação: "+name);
      assert.ok(await page.locator('.gi-personal-links a[href="observatorio.html#resultados"]').count(),"resultados para todos: "+name);
      await page.locator("#gi-profile-choice").selectOption("visitante");
      assert.ok(await page.locator('.gi-personal-links a[href="eventos.html"]').count(),"calendário público visitante: "+name);
      assert.equal(await page.locator('[data-profile-entry="visitante"]').getAttribute("aria-pressed"),"true");
      assert.equal(await page.locator("header .gastrobrand img").evaluate(img=>img.complete&&img.naturalWidth>0),true,"marca do cabeçalho carregada: "+name);

      // Grupo do cabeçalho: três ações iguais, alinhadas e sem sobreposição.
      const headerActions=await page.locator(".header-refined .headerline>.quick-access").evaluate(el=>{
       const actions=[...el.children];
       return {
        count:actions.length,
        outer:el.getBoundingClientRect().toJSON(),
        boxes:actions.map(node=>{
         const control=node.matches("details")?node.querySelector("summary"):node;
         return control.getBoundingClientRect().toJSON();
        }),
        logo:document.querySelector(".header-refined .headerline>.gastrobrand").getBoundingClientRect().toJSON(),
        menu:document.querySelector(".header-refined .headerline>.menu-toggle").getBoundingClientRect().toJSON()
       };
      });
      assert.equal(headerActions.count,3,"três ações no cabeçalho: "+name);
      const areas=headerActions.boxes;
      for(const box of areas){
       assert.ok(box.width>=35&&box.height>=42,"botão pequeno demais para toque: "+name);
       assert.ok(box.x>=-1&&box.right<=width+1,"botão fora da tela: "+name);
      }
      for(let i=1;i<areas.length;i++){
       assert.ok(Math.abs(areas[i].width-areas[0].width)<=1,"larguras inconsistentes: "+name);
       assert.ok(Math.abs(areas[i].height-areas[0].height)<=1,"alturas inconsistentes: "+name);
       assert.ok(Math.abs(areas[i].y-areas[0].y)<=1,"desalinhamento vertical: "+name);
       assert.ok(areas[i-1].right<=areas[i].x+1,"botões sobrepostos: "+name);
      }
      if(width<=700){
       assert.ok(areas[0].width<=43&&areas[0].height<=45,"grupo deve ser compacto no celular: "+name);
       assert.ok(headerActions.logo.right<=areas[0].x+3,"logo sobreposta às ações: "+name);
       assert.ok(headerActions.menu.right<=headerActions.logo.x+3,"menu sobreposto à marca: "+name);
       assert.equal(await page.locator(".gi-quick-label-short").isVisible(),true,"Local abreviada: "+name);
      }
      if(width===768){
       assert.ok(areas[0].width<=55,"botões proporcionais no tablet");
      }
      if(width===1440){
       assert.ok(areas[0].width<=64,"botões proporcionais no desktop");
      }
      await page.locator(".quick-item").first().locator("summary").click();
      assert.equal(await page.locator(".quick-item").first().getAttribute("open"),"","Contato abre: "+name);
      await page.locator(".quick-item").first().locator(".quick-close").click();
      assert.equal(await page.locator(".quick-item").first().getAttribute("open"),null,"Contato fecha: "+name);

      await page.locator("#gi-profile-choice").selectOption("docente");
      assert.match(await page.locator(".gi-personal-panel").innerText(),/Livro de Ocorrências/);
      await page.reload({waitUntil:"domcontentloaded"});
      await page.locator("#gi-profile-choice").waitFor({state:"attached"});
      await page.locator('[data-entry-screen][data-stage="intro"]').waitFor({timeout:3000});
      assert.equal(await page.locator("[data-entry-screen]").isVisible(),true,"a abertura reaparece no mesmo navegador: "+name);
      assert.equal(await page.locator("#gi-profile-choice").inputValue(),"docente","preferência do conteúdo preservada sem pular escolha: "+name);
      await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:7000});
      await page.locator('[data-profile-entry="estudante"]').click();
      await page.locator("[data-entry-screen]").waitFor({state:"hidden",timeout:5000});
      assert.equal(await page.locator("#gi-profile-choice").inputValue(),"estudante","nova escolha aplicada após reabrir: "+name);
      assert.match(await page.locator(".gi-personal-panel").innerText(),/Gastronomia em ação/);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(overflow<=2,"rolagem horizontal na página inicial: "+name+" = "+overflow);
      assert.deepEqual(errors,[],"erros JS na entrada e no perfil: "+name);
      await page.screenshot({path:"reports/perfis-"+name+".png",fullPage:false});
      // Movimento reduzido deve exibir escolhas imediatamente, sem animação obrigatória.
      await page.emulateMedia({reducedMotion:"reduce"});
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
      // Retornar de uma página interna também deve apresentar a entrada
      // no mesmo navegador, tanto no computador quanto no aplicativo.
      await page.emulateMedia({reducedMotion:"no-preference"});
      const homeAgain=await page.goto(root+"index.html",{waitUntil:"domcontentloaded"});
      assert.equal(homeAgain.status(),200);
      await page.locator('[data-entry-screen][data-stage="intro"]').waitFor({timeout:3000});
      await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:7000});
      await page.locator('[data-profile-entry="visitante"]').click();
      await page.locator("[data-entry-screen]").waitFor({state:"hidden",timeout:5000});
      // Verifica também Observatório e Gestão nas mesmas larguras.
      const review=await context.newPage();
      const observed=await review.goto(root+"observatorio.html",{waitUntil:"domcontentloaded"});
      assert.equal(observed.status(),200,"Observatório: "+name);
      for(const id of ["pesquisas-egressos","pesquisa-tecnico","pesquisa-graduacao","resultados"])
        assert.equal(await review.locator("#"+id).count(),1,"seção ausente "+id+": "+name);
      assert.match(await review.locator("#resultados").innerText(),/Nenhum indicador de egressos publicado/);
      assert.ok((await review.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,"Observatório excedeu largura: "+name);
      const managed=await review.goto(root+"gestao.html",{waitUntil:"domcontentloaded"});
      assert.equal(managed.status(),200,"Gestão: "+name);
      assert.equal(await review.locator("#central-pesquisa").count(),1);
      assert.ok((await review.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,"Gestão excedeu largura: "+name);
      await review.close();
      results.push({viewport:name,profilePersistence:true,reopenOnReload:true,reopenOnReturn:true,teacherOptions,overflow,ocOverflow,errors});
      await context.close();
    }
    fs.writeFileSync("reports/teste-perfis.json",JSON.stringify(results,null,2));
    console.log("Navegador: testes aprovados para",results.map(x=>x.viewport).join(", "));
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
