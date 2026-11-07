// Rodada de conferência após correção do importador de calendários.
const { chromium } = require("playwright");
const fs=require("node:fs");
const path=require("node:path");
const root="http://127.0.0.1:8765/";
const files=fs.readdirSync(".").filter(x=>x.endsWith(".html")).sort();
(async()=>{
 fs.mkdirSync("reports",{recursive:true});
 const browser=await chromium.launch({headless:true});
 const findings=[],ok=[],designWarnings=[];
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
        const visible=el=>{
          const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
          return r.width>0&&r.height>0&&cs.visibility!=="hidden"&&cs.display!=="none";
        };
        const controls=[...document.querySelectorAll('main button,main select,main a.button,main a.editorial-action,main a.link')].filter(visible);
        const clipped=controls.filter(el=>{
          const cs=getComputedStyle(el);
          return (cs.overflowX==="hidden"||cs.textOverflow==="ellipsis")&&el.scrollWidth>el.clientWidth+4;
        }).slice(0,8).map(el=>({tag:el.tagName,text:el.textContent.trim().slice(0,75),width:Math.round(el.getBoundingClientRect().width)}));
        const wideSelects=controls.filter(el=>el.tagName==="SELECT"&&el.getBoundingClientRect().width>270)
          .slice(0,8).map(el=>({id:el.id,width:Math.round(el.getBoundingClientRect().width)}));
        const selector=document.querySelector(".gi-personal-choice select");
        const profileSelector=selector?{
          width:Math.round(selector.getBoundingClientRect().width),
          height:Math.round(selector.getBoundingClientRect().height),
          options:[...selector.options].map(o=>o.value),
          r:Math.round(selector.getBoundingClientRect().right)
        }:null;
        const motion=Boolean(document.querySelector(".gi-motion-ready, .gi-motion-visible"));
        return {overflow:document.documentElement.scrollWidth-innerWidth,title:document.title,
          brokenImages:localBroken,visual:{controls:controls.length,clipped,wideSelects,profileSelector,motion}};
      });
      if(r.status()!==200||obj.overflow>3||obj.brokenImages.length||errors.length)
        findings.push({file,view,http:r.status(),...obj,errors:errors.slice(0,5)});
      else ok.push(file+" "+view);
      if(obj.visual.clipped.length||obj.visual.wideSelects.length)
        designWarnings.push({file,view,...obj.visual});
      if(file==="index.html"){
        if(!obj.visual.profileSelector||obj.visual.profileSelector.width>148
          ||obj.visual.profileSelector.height>38
          ||obj.visual.profileSelector.r>width+1
          ||obj.visual.profileSelector.options.join(",")!=="visitante,estudante,docente,egresso")
          findings.push({file,view,error:"Seletor de perfil fora do padrão",metrics:obj.visual.profileSelector});
      }
      if(["index.html","cursos.html","docentes.html","pesquisa.html","revistas.html",
          "biblioteca.html","projetos.html","eventos.html","oportunidades.html",
          "laboratorios.html","planejamento-docente.html","gestao-praticas.html",
          "gestao.html","gestao-documentos-praticas.html"].includes(file)
          ||obj.visual.clipped.length>0||obj.visual.wideSelects.length>0){
        // Revelar os elementos para que a captura da página inteira não mostre
        // os elementos abaixo da dobra ainda à espera do IntersectionObserver.
        await page.addStyleTag({content:"main .gi-motion-ready{opacity:1!important;transform:none!important}"});
        await page.screenshot({path:"reports/"+view+"-"+file.replace(".html",".png"),fullPage:true,animations:"disabled"});
      }
    }catch(e){findings.push({file,view,error:String(e).slice(0,240)});}
    finally{await page.close()}
   }
   await context.close();
  }
 }finally{await browser.close()}
 fs.writeFileSync("reports/auditoria-geral.json",JSON.stringify({date:new Date().toISOString(),pages:files.length,viewports:3,passes:ok.length,findings,designWarnings},null,2));
 console.log("Páginas:",files.length,"testes:",files.length*3,"aprovados:",ok.length,"ocorrências:",findings.length);
 findings.slice(0,40).forEach(x=>console.log("ACHADO:",JSON.stringify(x)));
 console.log("Observações de desenho (não bloqueantes):",designWarnings.length);
 designWarnings.slice(0,18).forEach(x=>console.log("VISUAL:",JSON.stringify(x)));
 // Não permitir aprovação da implantação com falhas detectadas.
 if(findings.length) {
   console.error("AUDITORIA REPROVADA: "+findings.length+" problemas de navegação ou layout.");
   process.exitCode=1;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
