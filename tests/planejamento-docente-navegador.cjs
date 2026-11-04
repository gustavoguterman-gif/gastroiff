const { chromium }=require("playwright");
const assert=require("node:assert/strict");
const origin="http://127.0.0.1:8765/";
async function waitForImportPreview(page,errors){
 try {await page.locator("#gi-import-preview").waitFor({state:"visible",timeout:8000});}
 catch(error){
  const snapshot=await page.evaluate(()=>({
   importStatus:document.getElementById("gi-import-status")?.textContent,
   fileCount:document.getElementById("gi-import-file")?.files?.length,
   fileName:document.getElementById("gi-import-file")?.files?.[0]?.name,
   csvReady:!!window.GASTROIFF_CSV,
   previewHidden:document.getElementById("gi-import-preview")?.hidden,
   previewText:document.getElementById("gi-import-preview")?.textContent
  }));
  throw new Error("Falha na prévia de importação: "+JSON.stringify({snapshot,pageErrors:errors})+"; "+error.message);
 }
}

(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [view,width,height] of [["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
   const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   const res=await page.goto(origin+"planejamento-docente.html",{waitUntil:"domcontentloaded"});
   assert.equal(res.status(),200,"abertura "+view);
   assert.ok(await page.locator("#gi-teacher option").count()>10,"lista docente "+view);
   assert.equal(await page.locator("#gi-export").isDisabled(),true);
   const teacher=await page.locator("#gi-teacher option").nth(1).getAttribute("value");
   await page.locator("#gi-teacher").selectOption(teacher);
   await page.locator("#gi-course").selectOption("Tecnólogo em Gastronomia");
   await page.locator("#gi-subject").fill("Disciplina de teste");
   await page.locator("#gi-room").fill("Laboratório teste");
   await page.locator("#gi-start").fill("2026-11-10");
   await page.locator("#gi-end").fill("2026-11-09");
   await page.locator("#gi-cycle-form button[type=submit]").click();
   assert.match(await page.locator("#gi-form-message").innerText(),/término não pode ser anterior/i);
   assert.equal(await page.locator(".gi-plan-card").count(),0);
   await page.locator("#gi-end").fill("2026-11-14");
   await page.locator("#gi-cycle-form button[type=submit]").click();
   assert.equal(await page.locator(".gi-plan-card").count(),1);
   assert.match(await page.locator(".gi-plan-card").innerText(),/Compras e recebimentos: sem informações institucionais/);
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".gi-plan-card").count(),1,"persistência após recarga");
   await page.locator("#gi-teacher").selectOption(teacher);
   await page.locator("#gi-course").selectOption("Tecnólogo em Gastronomia");
   await page.locator("#gi-subject").fill("Disciplina de teste");
   await page.locator("#gi-room").fill("Laboratório teste");
   await page.locator("#gi-start").fill("2026-11-10");
   await page.locator("#gi-end").fill("2026-11-14");
   await page.locator("#gi-cycle-form button[type=submit]").click();
   assert.match(await page.locator("#gi-form-message").innerText(),/já está no planejamento/i);
   assert.equal(await page.locator(".gi-plan-card").count(),1);
   const [download]=await Promise.all([page.waitForEvent("download"),page.locator("#gi-export").click()]);
   const stream=await download.createReadStream();let csv="";
   for await(const chunk of stream)csv+=chunk.toString("utf8");
   assert.match(csv,/Disciplina de teste/);
   assert.match(csv,/2026-11-10/);
   assert.match(csv,/2026-11-14/);
   assert.deepEqual(errors,[]);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=3,"largura excedida em "+view+" : "+overflow);
   await page.locator(".gi-plan-remove").click();
   assert.equal(await page.locator(".gi-plan-card").count(),0);
   const columns="id_ciclo,curso,disciplina,docente,inicio,fim,laboratorio,status_conferencia,data_conferencia,fonte";
   const demo=columns+"\nTESTE-CICLO-001,Tecnólogo em Gastronomia,DISCIPLINA DEMONSTRATIVA,DOCENTE DE TESTE,2026-11-12,2026-11-16,LABORATÓRIO DE TESTE,A conferir,,DADOS FICTÍCIOS. NÃO PUBLICAR";
   await page.locator("#gi-import-file").setInputFiles({name:"ciclos-teste.csv",mimeType:"text/csv",buffer:Buffer.from(demo)});
   await waitForImportPreview(page,errors);
   assert.match(await page.locator("#gi-import-preview").innerText(),/exemplo fictício não pode ser incluído/i);
   assert.equal(await page.locator("#gi-import-confirm").isDisabled(),true);
   const valid=columns+"\nCICLO-001,Tecnólogo em Gastronomia,Disciplina importada,"+teacher+",2026-11-12,2026-11-16,Bloco G,A conferir,,Fonte de teste";
   await page.locator("#gi-import-file").setInputFiles({name:"ciclos-revisao.csv",mimeType:"text/csv",buffer:Buffer.from(valid)});
   await waitForImportPreview(page,errors);
   assert.match(await page.locator("#gi-import-preview").innerText(),/1 ciclo\(s\) conferido\(s\)/);
   assert.equal(await page.locator(".gi-plan-card").count(),0,"prévia não publica ciclos automaticamente");
   await page.locator("#gi-import-confirm").click();
   assert.equal(await page.locator(".gi-plan-card").count(),1);
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".gi-plan-card").count(),1,"ciclo importado permanece no dispositivo");
   await page.locator(".gi-plan-remove").click();
   assert.equal(await page.locator(".gi-plan-card").count(),0);
   console.log("Planejamento docente aprovado:",view,"importação local, persistência, validação, duplicata, exportação, exclusão");
   await context.close();
  }
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
