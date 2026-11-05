const {chromium}=require("playwright");
const assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  for(const [device,width,height] of [["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
   const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:"block"});
   const page=await ctx.newPage();
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   let requests=0;
   await page.route("**/data/oportunidades-monitoradas.json?**",route=>{
    requests++;
    return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
      versao:1,ultima_consulta:"2026-11-04",candidatas:[
       {cargo:"Cozinheiro(a)",empresa:"Grupo José",cidade:"Cabo Frio",url:"https://bancodetalentos.grupojose.com.br/",
        publicada_em:"2026-11-03",consulta_em:"2026-11-04",situacao:"encontrada_na_fonte_nao_verificada_individualmente"},
       {cargo:"CHEFE DE COZINHA",empresa:"Grupo BZ",cidade:"Armação dos Búzios",url:"https://grupobzbuzios.rhgestor.com.br/vagas/detalhes/F2Ucbz319700c7K9Qdx",
        publicada_em:null,consulta_em:"2026-11-04",situacao:"encontrada_na_fonte_nao_verificada_individualmente"},
       {cargo:"<img src=x onerror=alert(1)>",empresa:"Site malicioso",cidade:"Cabo Frio",url:"https://evil.invalid/",
        publicada_em:"2026-11-03",consulta_em:"2026-11-04",situacao:"encontrada_na_fonte_nao_verificada_individualmente"}
      ]})});
   });
   const response=await page.goto("http://127.0.0.1:8765/oportunidades.html",{waitUntil:"load"});
   assert.equal(response.status(),200);
   await page.waitForFunction(()=>document.querySelector("[data-monitor-summary]")?.textContent.includes("04/11/2026"));
   await page.waitForFunction(()=>!document.querySelector("[data-refresh-opportunities]").disabled && document.querySelector("[data-opportunities-status]")?.textContent.includes("Consulta concluída"));
   assert.equal(requests,1,"a primeira consulta precisa terminar antes do novo clique");
   // Conferir densidade sem perda de informações ou ações nos três formatos.
   const layout=await page.evaluate(()=>{
     const cards=[...document.querySelectorAll("[data-opportunities-content] .gi-vacancy:not([hidden])")];
     const monitored=[...document.querySelectorAll("[data-monitored-opportunities] article")];
     const grid=document.querySelector("[data-monitored-opportunities] .gi-vacancies");
     const first=cards[0];
     return {columns:getComputedStyle(grid).gridTemplateColumns.split(" ").length,
       padding:parseFloat(getComputedStyle(first).paddingTop),
       heading:parseFloat(getComputedStyle(first.querySelector("h3")).fontSize),
       sourceVisible:!!first.querySelector(".gi-vacancy-source"),
       actionVisible:!!first.querySelector(".gi-vacancy-apply"),
       mainCardCount:cards.length,monitoredCardCount:monitored.length};
   });
   assert.equal(layout.columns,width>1050?3:width>640?2:1,device+" colunas responsivas");
   assert.ok(layout.padding<=17,device+" preenchimento compacto");
   assert.ok(layout.heading>=16,device+" legibilidade");
   assert.ok(layout.sourceVisible&&layout.actionVisible,device+" fonte e ação preservadas");
   assert.ok(layout.mainCardCount>0&&layout.monitoredCardCount===2,device+" cartões presentes");
   const cardHeights=await page.locator("[data-opportunities-content] .gi-vacancy:not([hidden])").evaluateAll(nodes=>nodes.slice(0,2).map(n=>n.getBoundingClientRect().height));
   assert.ok(cardHeights[0]>cardHeights[1]+20,device+" cartões curtos não devem esticar até a altura do anúncio longo: "+cardHeights);
   assert.equal(await page.locator("[data-monitored-opportunities] article").count(),2,"somente origens autorizadas");
   assert.match(await page.locator("[data-monitored-opportunities]").innerText(),/confira se a seleção continua aberta/i);
   const links=await page.locator("[data-monitored-opportunities] article a").evaluateAll(nodes=>nodes.map(a=>a.getAttribute("href")));
   assert.deepEqual(links.sort(),["https://bancodetalentos.grupojose.com.br/","https://grupobzbuzios.rhgestor.com.br/vagas/detalhes/F2Ucbz319700c7K9Qdx"].sort());
   const refreshed=page.waitForResponse(response=>response.url().includes("/data/oportunidades-monitoradas.json"));
   await page.locator("[data-refresh-opportunities]").click();
   await refreshed;
   await page.waitForFunction(()=>document.querySelector("[data-opportunities-status]")?.textContent.includes("Consulta concluída"));
   assert.equal(requests,2,"botão deve consultar inventário atualizado");
   assert.deepEqual(errors,[],device+" erros JS");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<5,device+" transbordamento "+overflow);
   await ctx.close();
   console.log("Monitor de vagas aprovado:",device);
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
