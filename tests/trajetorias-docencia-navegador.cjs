const {chromium}=require("playwright");
const fs=require("node:fs");
const assert=require("node:assert/strict");
(async()=>{
 fs.mkdirSync("reports",{recursive:true});
 const browser=await chromium.launch({headless:true});
 const results=[];
 try{
  for(const [name,width,height] of [["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
   const context=await browser.newContext({viewport:{width,height}});
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   const response=await page.goto("http://127.0.0.1:8765/trajetorias.html",{waitUntil:"domcontentloaded"});
   assert.equal(response.status(),200,"Página trajetórias: "+name);
   const heading=page.locator("#gi-docencia-heading");
   assert.ok(await heading.isVisible(),"Percurso docente visível: "+name);
   assert.equal(await page.locator('.gi-card[data-group~="pesquisa"] h3', {hasText:"Educação e docência em Gastronomia"}).count(),1);
   const cards=page.locator(".gi-teaching-grid>.gi-card");
   assert.equal(await cards.count(),3,"Três etapas do percurso docente");
   const fieldColumns=await page.locator("#fields").evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").length);
   assert.equal(fieldColumns,width<=640?1:width<=1000?2:3,"Colunas dos campos profissionais: "+name);
   const fieldHeights=await page.locator("#fields>.gi-card:not([hidden])").evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));
   assert.ok(new Set(fieldHeights.map(Math.round)).size>1,"Cartões de conteúdo diferente não podem ser esticados: "+name);
   const columns=await page.locator(".gi-teaching-grid").evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").length);
   assert.equal(columns,width<=640?1:width<=950?2:3,"Colunas responsivas: "+name);
   const details=page.locator(".gi-teaching-details").first();
   assert.equal(await details.getAttribute("open"),null,"Informação detalhada recolhida de início");
   await details.locator("summary").click();
   assert.ok(await details.locator(".gi-teaching-details-body").isVisible(),"Expansão acessível");
   assert.match(await details.innerText(),/Lei nº 12.772/);
   assert.equal(await page.locator('#percurso-docencia a[href="oportunidades.html#oportunidades-docencia"]').count(),1);
   const opportunityLink=page.locator('#percurso-docencia a[href="oportunidades.html#oportunidades-docencia"]');
   const opportunityDetails=page.locator('.gi-teaching-details').filter({has:opportunityLink});
   await opportunityDetails.locator('summary').click();
   assert.ok(await opportunityLink.isVisible(),"Link de concursos visível após expandir detalhes: "+name);
   await opportunityLink.click();
   await page.waitForURL(/oportunidades\.html#oportunidades-docencia$/);
   assert.ok(await page.locator('#oportunidades-docencia').isVisible(),"A seção de concursos e seleções docentes abre: "+name);
   assert.equal(await page.locator('#oportunidades-docencia a[href="trajetorias.html#percurso-docencia"]').count(),1);
   const teachingOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(teachingOverflow<=2,"Oportunidades docentes sem rolagem horizontal: "+name+" "+teachingOverflow);
   await page.goBack({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator('#percurso-docencia a[href^="https://cncst.mec.gov.br/"]').count(),1);
   await page.locator('[data-filter="producao"]').click();
   assert.equal(await page.locator('article[data-group="pesquisa"]').first().isVisible(),false);
   await page.locator('[data-filter="pesquisa"]').click();
   assert.ok(await page.locator('article[data-group="pesquisa"] h3', {hasText:"Educação e docência em Gastronomia"}).isVisible(),"Filtro pesquisa mantém a docência");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=2,"Sem rolagem horizontal: "+name+" "+overflow);
   assert.deepEqual(errors,[],"Nenhum erro JavaScript: "+name);
   await page.screenshot({path:"reports/docencia-"+name+".png",fullPage:false});
   results.push({name,columns,overflow,errors});
   await context.close();
  }
  fs.writeFileSync("reports/docencia-trajetorias.json",JSON.stringify(results,null,2));
  console.log("Trajetórias docentes testadas:",results.map(x=>x.name).join(", "));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
