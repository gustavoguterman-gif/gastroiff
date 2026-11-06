const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("node:fs");
const active=`window.GASTROIFF_PRATICAS_CONFIG={enabled:true,supabaseUrl:"https://homologacao.supabase.co/",supabasePublishableKey:"chave-publica-de-homologacao-12345678",redirectUrl:location.href};`;
const mock=`
window.__calls={uploads:[],documents:[],cycles:[]};
window.__client={
 auth:{getUser:async()=>({data:{user:{id:"00000000-0000-4000-8000-000000000001"}},error:null}),
  signOut:async()=>({error:null}),signInWithOtp:async()=>({data:{},error:null})},
 storage:{from:()=>({upload:async(path,file)=>{window.__calls.uploads.push(path);return {data:{path},error:null}},
  remove:async()=>({data:[],error:null})})},
 from(table){
  const q={
   table,payload:null,select(){return q},eq(){return q},order(){return q},limit(){return q},in(){return q},
   insert(payload){q.payload=payload;window.__calls.documents.push({table,payload});return q},
   maybeSingle:async()=>({data:{role:"gestao"},error:null}),
   single:async()=>({data:table==="gastroiff_practice_cycles"?{
      id:"10000000-0000-4000-8000-000000000001",status:"rascunho",version:1
    }:{id:"documento-1"},error:null}),
   then(resolve,reject){
    const data=table==="gastroiff_practice_roles"?[
      {user_id:"00000000-0000-4000-8000-000000000002",display_name:"Docente Exemplo",role:"docente"}
    ]:table==="gastroiff_practice_cycles"?[
      {id:"10000000-0000-4000-8000-000000000001",subject:"Panificação",course:"Tecnólogo em Gastronomia",starts_on:"2026-11-12",status:"rascunho",teacher_user_id:"00000000-0000-4000-8000-000000000002"}
    ]:table==="gastroiff_practice_documents"?[{revision:0}]:[];
    return Promise.resolve({data,error:null}).then(resolve,reject);
   }
  };return q;
 }
};
window.supabase={createClient:()=>window.__client};
`;
(async()=>{
 fs.mkdirSync("reports/gestao-privada",{recursive:true});
 const browser=await chromium.launch({headless:true});
 try{
  for(const [device,width,height] of [["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
   const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:"block"});
   const p=await ctx.newPage(),errors=[];
   p.on("pageerror",e=>errors.push(e.message));
   await p.goto("http://127.0.0.1:8765/gestao-documentos-praticas.html",{waitUntil:"domcontentloaded"});
   await p.waitForFunction(()=>document.querySelector("[data-manager-status]")?.textContent.includes("não ativado"),null,{timeout:10000});
   assert.equal(await p.locator("[data-manager-content]").isVisible(),false);
   assert.equal(await p.locator("[data-manager-form]").isVisible(),false);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=3,device+" default");
   assert.deepEqual(errors,[],device+" JS");
   await p.screenshot({path:"reports/gestao-privada/"+device+"-desativado.png",fullPage:true,animations:"disabled"});
   await ctx.close();

   const auth=await browser.newContext({viewport:{width,height},serviceWorkers:"block"});
   const page=await auth.newPage(),activeErrors=[];
   page.on("pageerror",e=>activeErrors.push(e.message));
   await page.route("**/assets/praticas-config.js*",route=>route.fulfill({status:200,contentType:"application/javascript",body:active}));
   await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",route=>route.fulfill({status:200,contentType:"application/javascript",body:mock}));
   await page.goto("http://127.0.0.1:8765/gestao-documentos-praticas.html",{waitUntil:"domcontentloaded"});
   await page.locator("[data-manager-content]").waitFor({state:"visible",timeout:10000});
   await page.locator("#g-auth-teacher").selectOption("00000000-0000-4000-8000-000000000002");
   await page.locator("#p-course").selectOption("Tecnólogo em Gastronomia");
   await page.locator("#p-subject").fill("Panificação");
   await page.locator("#p-room").fill("Bloco G");
   await page.locator("#p-start").fill("2026-11-12");
   await page.locator("#p-end").fill("2026-12-18");
   await page.locator("#p-timeStart").fill("08:00");
   await page.locator("#p-timeEnd").fill("12:00");
   await page.locator('#p-weekdays input[value="1"]').check();
   await page.locator("#g-save-cycle").click();
   await page.waitForFunction(()=>document.querySelector("[data-manager-status]")?.textContent.includes("rascunho privado"),null,{timeout:10000});
   assert.equal(await page.locator("#g-secure-cycle").inputValue(),"10000000-0000-4000-8000-000000000001");
   await page.locator("#g-secure-file").setInputFiles({name:"insumos.xlsx",mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",buffer:Buffer.from([1,2,3])});
   await page.locator("#g-confirm-file").check();
   await page.locator("#g-upload-document").click();
   await page.waitForFunction(()=>document.querySelector("[data-manager-status]")?.textContent.includes("Documento privado registrado"),null,{timeout:10000});
   await page.screenshot({path:"reports/gestao-privada/"+device+"-gestao-ficticia.png",fullPage:true,animations:"disabled"});
   const sent=await page.evaluate(()=>window.__calls);
   assert.equal(sent.uploads.length,1);
   assert.equal(sent.documents.filter(x=>x.table==="gastroiff_practice_cycles").length,1);
   assert.equal(sent.documents.filter(x=>x.table==="gastroiff_practice_documents").length,1);
   assert.equal(sent.documents.find(x=>x.table==="gastroiff_practice_documents").payload.reviewed,false);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=3,device+" logged");
   await page.locator("#g-signout").click();
   assert.equal(await page.locator("[data-manager-content]").isVisible(),false);
   assert.equal(await page.locator("[data-manager-form]").isVisible(),true);
   assert.deepEqual(activeErrors,[],device+" JS logged");
   await page.screenshot({path:"reports/gestao-privada/"+device+"-apos-logout.png",fullPage:true,animations:"disabled"});
   console.log("Gestão privada aprovada:",device);
   await auth.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
