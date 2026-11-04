const {chromium}=require("playwright");
const XLSX=require("xlsx");
const assert=require("node:assert/strict");
const sheetFile=(type,quantity)=>{
 const wb=XLSX.utils.book_new();
 const rows=[["Turma fictícia"],["Produto","Unidade","Quantidade"],["Farinha de trigo","kg",quantity]];
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),"Disciplina");
 return {name:"insumos."+type,mimeType:type==="xls"?"application/vnd.ms-excel":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",buffer:Buffer.from(XLSX.write(wb,{type:"buffer",bookType:type}))};
};

const customFile=(rows,name="planilha-customizada.xlsx")=>{
 const wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),"Itens");
 return {name,mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",buffer:Buffer.from(XLSX.write(wb,{type:"buffer",bookType:"xlsx"}))};
};

(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [name,width,height] of [["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
   const context=await browser.newContext({viewport:{width,height}});
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.route("https://cdn.sheetjs.com/**",route=>route.fulfill({status:200,path:require.resolve("xlsx/dist/xlsx.full.min.js"),contentType:"application/javascript"}));
   const response=await page.goto("http://127.0.0.1:8765/gestao-insumos.html",{waitUntil:"load"});
   assert.equal(response.status(),200,name);
   await page.locator('[data-stage="pedidoDocente"] input').setInputFiles(sheetFile("xlsx",10));
   await page.waitForFunction(()=>document.querySelector('[data-stage="pedidoDocente"] .status')?.textContent.includes("1 itens reconhecidos"));
   await page.locator('[data-stage="pedidoFornecedor"] input').setInputFiles(sheetFile("xls",8));
   await page.waitForFunction(()=>document.querySelector('[data-stage="pedidoFornecedor"] .status')?.textContent.includes("1 itens reconhecidos"));
   await page.locator('[data-stage="respostaFornecedor"] input').setInputFiles(sheetFile("xlsx",6));
   await page.waitForFunction(()=>document.querySelector('[data-stage="respostaFornecedor"] .status')?.textContent.includes("1 itens reconhecidos"));
   await page.locator("#compare").click();
   assert.equal(await page.locator("#items tr").count(),1,name+" conciliação");
   const line=await page.locator("#items tr").innerText();
   assert.match(line,/Farinha de trigo/);
   assert.match(line,/fornecimento parcial/);
   assert.match(line,/Sem informação/);
   assert.deepEqual(errors,[],name+" JS");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=3,name+" rolagem horizontal "+overflow);
   await page.locator('[data-stage="pedidoDocente"] input').setInputFiles([sheetFile("xlsx",10),sheetFile("xls",2)]);
   await page.waitForFunction(()=>document.querySelector('[data-stage="pedidoDocente"] .status')?.textContent.includes("2 itens reconhecidos"));
   await page.locator("#compare").click();
   assert.match(await page.locator("#items tr").innerText(),/12/,"somar pedidos de arquivos distintos");

   // A leitura parcial ou ambígua precisa bloquear conclusões sobre fornecimento.
   await page.locator('[data-stage="pedidoDocente"] input').setInputFiles(customFile([
    ["Produto","Unidade","Quantidade"],["Farinha de trigo","kg",10],["Sal","kg","valor inválido"]
   ]));
   await page.waitForFunction(()=>document.querySelector('[data-stage="pedidoDocente"] .status')?.textContent.includes("inconsistência"));
   assert.equal(await page.locator("#compare").isDisabled(),true,name+" bloqueia linha incorreta");
   assert.match(await page.locator('[data-stage="pedidoDocente"] .status').innerText(),/bloqueada/i);
   await page.locator('[data-stage="pedidoDocente"] input').setInputFiles(customFile([
    ["Ingrediente personalizado","Medida manual","Volume solicitado"],["Farinha de trigo","kg",10]
   ]));
   await page.locator('[data-stage="pedidoDocente"] .sheet-select').selectOption("0");
   await page.locator('[data-stage="pedidoDocente"] .map-insumo').selectOption("0");
   await page.locator('[data-stage="pedidoDocente"] .map-unidade').selectOption("1");
   await page.locator('[data-stage="pedidoDocente"] .map-quantidade').selectOption("2");
   await page.locator('[data-stage="pedidoDocente"] .mapping-apply').click();
   await page.waitForFunction(()=>document.querySelector('[data-stage="pedidoDocente"] .status')?.textContent.includes("pronta para comparação"));
   assert.equal(await page.locator("#compare").isDisabled(),false,name+" mapeamento manual");
   await page.locator("#compare").click();
   assert.match(await page.locator("#items tr").innerText(),/Farinha de trigo/);

   await page.locator("#clear").click();
   assert.equal(await page.locator("#items tr").count(),0);
   await context.close();
   console.log("Excel administrativo aprovado:",name);
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
