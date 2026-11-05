const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const config=`window.GASTROIFF_PRATICAS_CONFIG={enabled:true,supabaseUrl:"https://homologacao.supabase.co/",supabasePublishableKey:"chave-publica-de-homologacao-12345678",redirectUrl:location.href};`;
const mock=`
window.__reviewed=false;window.__rpcCalls=[];window.__approvalError="Faltam dados do fornecedor";
window.__client={
 auth:{getUser:async()=>({data:{user:{id:"00000000-0000-4000-8000-000000000001"}},error:null}),
 signOut:async()=>({error:null}),signInWithOtp:async()=>({data:{},error:null})},
 from(table){
  const q={select(){return q},eq(){return q},order(){return q},limit(){return q},
   maybeSingle:async()=>({data:{role:"gestao"},error:null}),
   then(resolve,reject){
    const data=table==="gastroiff_practice_roles"?[{user_id:"00000000-0000-4000-8000-000000000002",role:"docente",display_name:"Docente Exemplo"}]:
     table==="gastroiff_practice_cycles"?[{id:"10000000-0000-4000-8000-000000000001",subject:"Panificação",course:"Tecnólogo em Gastronomia",starts_on:"2026-11-12",status:"rascunho"}]:
     table==="gastroiff_practice_documents"?[{id:"20000000-0000-4000-8000-000000000004",cycle_id:"10000000-0000-4000-8000-000000000001",kind:"resposta_fornecedor",filename:"resposta.xlsx",revision:1,reviewed:window.__reviewed}]:[];
    return Promise.resolve({data,error:null}).then(resolve,reject);
   }
  };return q;
 },
 rpc:async(name,payload)=>{
  window.__rpcCalls.push({name,payload});
  if(name==="gastroiff_review_document"){window.__reviewed=true;return {data:null,error:null}}
  if(name==="gastroiff_save_practice_items")return {data:1,error:null};
  if(name==="gastroiff_approve_cycle"&&window.__approvalError)return {data:null,error:{message:window.__approvalError}};
  return {data:null,error:null};
 }
};
window.supabase={createClient:()=>window.__client};
`;
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [view,width,height] of [["celular",390,844],["tablet",768,1024],["desktop",1440,900]]){
   const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:"block"});
   const p=await ctx.newPage(),errors=[];
   p.on("pageerror",e=>errors.push(e.message));
   await p.route("**/assets/praticas-config.js*",route=>route.fulfill({status:200,contentType:"application/javascript",body:config}));
   await p.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",route=>route.fulfill({status:200,contentType:"application/javascript",body:mock}));
   await p.goto("http://127.0.0.1:8765/gestao-documentos-praticas.html",{waitUntil:"domcontentloaded"});
   await p.locator("[data-manager-content]").waitFor({state:"visible",timeout:10000});
   await p.locator("#g-secure-cycle").selectOption("10000000-0000-4000-8000-000000000001");
   await p.locator("#g-choose-document").selectOption("20000000-0000-4000-8000-000000000004");
   await p.locator("#g-review-confirm").check();
   await p.locator("#g-review-document").click();
   await p.waitForFunction(()=>document.querySelector("[data-manager-status]")?.textContent.includes("Documento revisado"));
   await p.locator("#g-review-source").selectOption("20000000-0000-4000-8000-000000000004");
   await p.evaluate(()=>window.dispatchEvent(new CustomEvent("gastroiff:preview-reviewed",{detail:{
     prontoParaRevisao:true,identificacao:{disciplina:"Panificação",curso:"Tecnólogo em Gastronomia",inicio:"2026-11-12"},
     insumos:[{insumo:"Farinha",unidade:"kg",solicitado:10,encaminhado:10,confirmado:6,recebido:null}]
   }})));
   assert.equal(await p.locator("#g-save-items").isEnabled(),true);
   p.once("dialog",d=>d.accept());
   await p.locator("#g-save-items").click();
   await p.waitForFunction(()=>document.querySelector("[data-manager-status]")?.textContent.includes("Gravados 1 insumo"));
   p.once("dialog",d=>d.accept());
   await p.locator("#g-approve-cycle").click();
   await p.waitForFunction(()=>document.querySelector("[data-manager-status]")?.textContent.includes("Aprovação bloqueada"));
   const calls=await p.evaluate(()=>window.__rpcCalls.map(x=>x.name));
   assert.deepEqual(calls,["gastroiff_review_document","gastroiff_save_practice_items","gastroiff_approve_cycle"]);
   const horizontal=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(horizontal<=3,view+" overflow "+horizontal);
   assert.deepEqual(errors,[],view+" erros de script");
   console.log("Revisão e aprovação simulada protegidas:",view);
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
