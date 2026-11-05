const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const configActive=`window.GASTROIFF_PRATICAS_CONFIG={enabled:true,supabaseUrl:"https://homologacao.supabase.co/",supabasePublishableKey:"chave-publica-de-homologacao-12345678",redirectUrl:location.href};`;
const mockClient=`
window.__fakeClient={
 auth:{
  getUser:async()=>({data:{user:{id:"teacher-1"}},error:null}),
  signOut:async()=>({error:null}),
  signInWithOtp:async()=>({data:{},error:null})
 },
 from(table){
  const query={
   select(){return query},eq(){return query},in(){return query},order(){return query},
   maybeSingle:async()=>({data:{role:"docente"},error:null}),
   then(resolve,reject){
    const data=table==="gastroiff_practice_cycles"?[{
      id:"ciclo-1",teacher_user_id:"teacher-1",status:"aprovado",
      subject:"Panificação",course:"Tecnólogo em Gastronomia",
      starts_on:"2026-11-12",ends_on:"2026-12-18",weekdays:[1,3],
      begins_at:"08:00",ends_at:"12:00",location:"Bloco G"
    }]:[{
      id:"item-1",cycle_id:"ciclo-1",description:"Farinha de trigo",
      unit:"kg",requested:10,confirmed:6,received:null,approved:true
    }];
    return Promise.resolve({data,error:null}).then(resolve,reject);
   }
  };return query;
 }
};
window.supabase={createClient:()=>window.__fakeClient};
`;
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [device,width,height] of [["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
   const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:"block"});
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8765/planejamento-docente.html",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>document.querySelector("[data-private-status]")?.textContent.includes("não ativado"),null,{timeout:10000});
   assert.equal(await page.locator("[data-private-results] section").count(),0,device+" bloqueio inicial");
   assert.equal(await page.locator("[data-private-login]").isVisible(),false,device+" sem login público falso");
   assert.equal(await page.locator("#gi-cycle-form").count(),0,device+" sem cadastro administrativo");
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=3,true,device+" largura");
   assert.deepEqual(errors,[],device+" erros iniciais");
   await ctx.close();

   const active=await browser.newContext({viewport:{width,height},serviceWorkers:"block"});
   const p=await active.newPage(),activeErrors=[];
   p.on("pageerror",e=>activeErrors.push(e.message));
   await p.route("**/assets/praticas-config.js*",route=>route.fulfill({status:200,contentType:"application/javascript",body:configActive}));
   await p.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",route=>route.fulfill({status:200,contentType:"application/javascript",body:mockClient}));
   const response=await p.goto("http://127.0.0.1:8765/planejamento-docente.html",{waitUntil:"domcontentloaded"});
   assert.equal(response.status(),200);
   await p.locator(".gi-private-cycle").waitFor({timeout:10000});
   const panel=await p.locator("[data-private-results]").innerText();
   assert.match(panel,/Panificação/);
   assert.match(panel,/Farinha de trigo/);
   assert.match(panel,/6/);
   assert.match(panel,/4/);
   assert.match(panel,/Sem informação/);
   assert.doesNotMatch(panel,/Senha|service_role|dados de outro docente/);
   assert.equal(await p.locator("[data-private-logout]").isVisible(),true);
   await p.locator("[data-private-logout]").click();
   assert.equal(await p.locator(".gi-private-cycle").count(),0);
   assert.equal(await p.locator("[data-private-login]").isVisible(),true);
   // Uma resposta antiga nunca pode reabrir o quadro após encerramento de sessão.
   await p.evaluate(()=>{
    const previous=window.__fakeClient.from.bind(window.__fakeClient);
    window.__fakeClient.from=table=>{
     if(table!=="gastroiff_practice_cycles")return previous(table);
     const query={
      select(){return query},eq(){return query},order(){return query},
      then(ok,fail){return new Promise(resolve=>{window.__finishOldCycleRequest=resolve})
       .then(ok,fail)}
     };
     return query;
    };
    window.GASTROIFF_PAINEL_START(window.GASTROIFF_PRATICAS_CONFIG,()=>window.__fakeClient);
   });
   await p.waitForFunction(()=>typeof window.__finishOldCycleRequest==="function");
   await p.evaluate(()=>document.querySelector("[data-private-logout]").click());
   await p.evaluate(()=>{
    window.__finishOldCycleRequest({data:[{
     id:"late-cycle",teacher_user_id:"teacher-1",status:"aprovado",
     subject:"Ciclo atrasado",course:"Tecnólogo",starts_on:"2026-11-01",
     ends_on:"2026-11-30",weekdays:[1],begins_at:"08:00",ends_at:"12:00",location:"Laboratório"
    }],error:null});
   });
   await p.waitForTimeout(50);
   assert.equal(await p.locator(".gi-private-cycle").count(),0,device+" resposta atrasada após logout");
   assert.equal(await p.locator("[data-private-results]").isVisible(),false,device+" quadro protegido oculto");
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=3,true,device+" largura autenticada");
   assert.deepEqual(activeErrors,[],device+" erros em acesso");
   console.log("Painel docente seguro aprovado:",device);
   await active.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
