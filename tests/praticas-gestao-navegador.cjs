const {chromium}=require("playwright"),assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [name,width,height] of [["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
   const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:"block"});
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   const publicPage=await page.goto("http://127.0.0.1:8765/planejamento-docente.html",{waitUntil:"domcontentloaded"});
   assert.equal(publicPage.status(),200);
   assert.equal(await page.locator("#gi-cycle-form").count(),0,name+" sem cadastro público");
   assert.equal(await page.locator("#gi-import-file").count(),0,name+" sem importação docente");
   assert.match(await page.locator("main").innerText(),/informações de cada disciplina só serão disponibilizadas após autenticação/i);
   const response=await page.goto("http://127.0.0.1:8765/gestao-documentos-praticas.html",{waitUntil:"domcontentloaded"});
   assert.equal(response.status(),200);
   await page.locator("#p-teacher").waitFor({state:"visible"});
   assert.ok(await page.locator("#p-teacher option").count()>1,name+" docentes");
   const teacher=await page.locator("#p-teacher option").nth(1).getAttribute("value");
   await page.locator("#p-teacher").selectOption(teacher);
   await page.locator("#p-course").selectOption("Tecnólogo em Gastronomia");
   await page.locator("#p-subject").fill("Panificação fictícia");
   await page.locator("#p-room").fill("Bloco G");
   await page.locator("#p-start").fill("2026-11-11");
   await page.locator("#p-end").fill("2026-12-18");
   await page.locator("#p-timeStart").fill("08:00");
   await page.locator("#p-timeEnd").fill("12:00");
   await page.locator('#p-weekdays input[value="3"]').check();
   await page.locator("#p-check").click();
   assert.match(await page.locator("#p-notification").innerText(),/2026-11-04/);
   assert.match(await page.locator("#p-questions").innerText(),/lista de insumos solicitados/i);
   await page.locator("#p-build-snapshot").click();
   assert.match(await page.locator("#p-snapshot").innerText(),/Panificação fictícia/);
   assert.match(await page.locator("#p-snapshot").innerText(),/Falta conferir/);
   assert.match(await page.locator("#p-snapshot-status").innerText(),/Prévia incompleta/);
   assert.equal(await page.locator("#p-snapshot table").count(),0,"não inventar fornecimento sem documentação");
   await page.locator("#p-draft").click();
   assert.match(await page.locator("#p-email-preview").inputValue(),/Prévia bloqueada/);
   await page.locator("#p-compare").click();
   assert.match(await page.locator("#p-comparison").innerText(),/Comparação bloqueada/);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=4,name+" transbordamento "+overflow);
   assert.deepEqual(errors,[],name+" erros JavaScript");
   console.log("Gestão e painel somente leitura aprovados:",name);
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
