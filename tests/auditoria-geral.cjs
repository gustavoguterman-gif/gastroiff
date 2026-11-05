// Rodada de conferência após correção do importador de calendários.
const { chromium } = require("playwright");
const fs=require("node:fs");
const path=require("node:path");
const root="http://127.0.0.1:8765/";
const files=fs.readdirSync(".").filter(x=>x.endsWith(".html")).sort();
(async()=>{
 fs.mkdirSync("reports",{recursive:true});
 const browser=await chromium.launch({headless:true});
 const findings=[],ok=[];
 try{
  for(const [view,width,height] of [["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
   const context=await browser.newContext({viewport:{width,height},ignoreHTTPSErrors:false,serviceWorkers:"block"});
   for(const file of files){
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    try{
      const r=await page.goto(root+file,{waitUntil:"domcontentloaded",timeout:15000});
      await page.waitForTimeout(260);
      if(file==="index.html"){
        await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:7000});
        await page.locator('[data-profile-entry="visitante"]').click();
        await page.locator("[data-entry-screen]").waitFor({state:"hidden"});
      }
      const obj=await page.evaluate(()=>{
        const localBroken=[...document.images].filter(img=>{
          try{return new URL(img.currentSrc||img.src).origin===location.origin&&img.complete&&img.naturalWidth===0;}catch{return false}
        }).map(img=>img.getAttribute("src"));
        return {overflow:document.documentElement.scrollWidth-innerWidth,title:document.title,brokenImages:localBroken};
      });
      if(r.status()!==200||obj.overflow>3||obj.brokenImages.length||errors.length)
        findings.push({file,view,http:r.status(),...obj,errors:errors.slice(0,5)});
      else ok.push(file+" "+view);
      if(["index.html","gestao.html","gestao-documentos-praticas.html","planejamento-docente.html","oportunidades.html"].includes(file)){
        await page.screenshot({path:"reports/"+view+"-"+file.replace(".html",".png"),fullPage:true,animations:"disabled"});
      }
    }catch(e){findings.push({file,view,error:String(e).slice(0,240)});}
    finally{await page.close()}
   }
   await context.close();
  }
 }finally{await browser.close()}
 fs.writeFileSync("reports/auditoria-geral.json",JSON.stringify({date:new Date().toISOString(),pages:files.length,viewports:3,passes:ok.length,findings},null,2));
 console.log("Páginas:",files.length,"testes:",files.length*3,"aprovados:",ok.length,"ocorrências:",findings.length);
 findings.slice(0,40).forEach(x=>console.log("ACHADO:",JSON.stringify(x)));
 // Não permitir aprovação da implantação com falhas detectadas.
 if(findings.length) {
   console.error("AUDITORIA REPROVADA: "+findings.length+" problemas de navegação ou layout.");
   process.exitCode=1;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
