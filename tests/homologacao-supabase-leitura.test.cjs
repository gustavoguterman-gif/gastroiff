const test=require("node:test"),assert=require("node:assert/strict");
const {settings}=require("./homologacao-supabase-leitura.cjs");
const ref="abcdefghijklmnopqrst";
const cfg='window.GASTROIFF_PRATICAS_CONFIG = {enabled: false, supabaseUrl: "", supabasePublishableKey: ""}';
function env(){
 return {
  GASTROIFF_STAGING_CONFIRM:"SIM_AMBIENTE_DESCARTAVEL",
  GASTROIFF_STAGING_PROJECT_REF:ref,
  GASTROIFF_STAGING_URL:"https://"+ref+".supabase.co/",
  GASTROIFF_STAGING_ANON_KEY:"sb_publishable_teste_ficticio_publico",
  GASTROIFF_MANAGER_EMAIL:"gestao@example.invalid",GASTROIFF_MANAGER_PASSWORD:"ficticio-gestao",
  GASTROIFF_TEACHER_A_EMAIL:"a@example.invalid",GASTROIFF_TEACHER_A_PASSWORD:"ficticio-a",
  GASTROIFF_TEACHER_B_EMAIL:"b@example.invalid",GASTROIFF_TEACHER_B_PASSWORD:"ficticio-b"
 };
}
test("reprova sem autorização explícita",()=>assert.throws(()=>settings({...env(),GASTROIFF_STAGING_CONFIRM:""},()=>cfg),/ausentes/));
test("reprova projeto que não coincide exatamente com o endereço",()=>{
 assert.throws(()=>settings({...env(),GASTROIFF_STAGING_PROJECT_REF:"12345678901234567890"},()=>cfg),/não corresponde/);
});
test("reprova URL com credenciais ou caminho estranho",()=>{
 for(const bad of ["http://"+ref+".supabase.co/","https://"+ref+".supabase.co/x",
  "https://user:password@"+ref+".supabase.co/"]){
  assert.throws(()=>settings({...env(),GASTROIFF_STAGING_URL:bad},()=>cfg),/não corresponde/);
 }
});
test("reprova chave secreta",()=>assert.throws(()=>settings({...env(),GASTROIFF_STAGING_ANON_KEY:"sb_secret_indevida"},()=>cfg),/secreta/));
test("reprova plataforma pública ativada",()=>assert.throws(()=>settings(env(),()=>cfg.replace("enabled: false","enabled: true")),/desativada/));
test("reprova identidade docente repetida",()=>assert.throws(()=>settings({...env(),GASTROIFF_TEACHER_B_EMAIL:"a@example.invalid"},()=>cfg),/distintas/));
test("aceita somente configuração isolada e três contas distintas",()=>{
 const got=settings(env(),()=>cfg);assert.equal(got.url,"https://"+ref+".supabase.co");assert.notEqual(got.a.email,got.b.email);
});

test("falha no segundo login encerra sessão já aberta",async()=>{
 const {run}=require("./homologacao-supabase-leitura.cjs");
 const events=[];
 const mock=async(url,options)=>{
  const route=new URL(url).pathname;
  if(route.startsWith("/rest/v1/gastroiff_practice_")&&!options.headers.Authorization)return new Response("[]",{status:200});
  if(route==="/auth/v1/token"&&new URL(url).searchParams.get("grant_type")==="refresh_token"){
   events.push("refresh-revoked");
   return new Response('{"error":"invalid_refresh_token"}',{status:401});
  }
  if(route==="/auth/v1/token"){
   const email=JSON.parse(options.body).email;
   events.push("login:"+email);
   if(email==="a@example.invalid")return new Response('{"error":"invalid_credentials"}',{status:400});
   return new Response(JSON.stringify({access_token:"token-gestao",refresh_token:"refresh-falso",user:{id:"gestor-id"}}),{status:200});
  }
  if(route==="/auth/v1/logout"){
   events.push("logout:"+options.headers.Authorization);
   return new Response(null,{status:204});
  }
  throw Error("Rota inesperada: "+route);
 };
 await assert.rejects(run(settings(env(),()=>cfg),mock),/Login de conta fictícia falhou/);
 assert.deepEqual(events,[
  "login:gestao@example.invalid",
  "login:a@example.invalid",
  "logout:Bearer token-gestao",
  "refresh-revoked"
 ]);
});
test("logout de todas as sessões mesmo quando o primeiro encerramento falha",async()=>{
 const {run}=require("./homologacao-supabase-leitura.cjs");
 const events=[];
 const mock=async(url,options)=>{
  const route=new URL(url).pathname;
  if(route.startsWith("/rest/v1/gastroiff_practice_")&&!options.headers.Authorization)return new Response("[]",{status:200});
  if(route==="/auth/v1/token"&&new URL(url).searchParams.get("grant_type")==="refresh_token"){
   events.push("refresh-revoked");
   return new Response('{"error":"invalid_refresh_token"}',{status:401});
  }
  if(route==="/auth/v1/token"){
   const email=JSON.parse(options.body).email;
   const token="token-"+email.split("@")[0];
   return new Response(JSON.stringify({access_token:token,refresh_token:"refresh-falso",user:{id:token}}),{status:200});
  }
  if(route==="/rest/v1/gastroiff_practice_roles"){
   const token=options.headers.Authorization.replace("Bearer ","");
   const role=token==="token-gestao"?"gestao":"docente";
   return new Response(JSON.stringify([{user_id:token,role}]),{status:200});
  }
  if(route==="/rest/v1/gastroiff_practice_cycles"){
   return new Response("[]",{status:200});
  }
  if(route==="/auth/v1/logout"){
   events.push(options.headers.Authorization);
   if(events.length===1)return new Response('{"error":"forced"}',{status:503});
   return new Response(null,{status:204});
  }
  throw Error("Rota inesperada: "+route);
 };
 await assert.rejects(run(settings(env(),()=>cfg),mock),/Falha ao encerrar 1 sessão/);
 assert.deepEqual(events,[
  "Bearer token-gestao",
  "Bearer token-a",
  "Bearer token-b"
 ]);
});


const {createHash}=require("node:crypto");
const {run,privateObjectPath}=require("./homologacao-supabase-leitura.cjs");
function scenario({corrupt=false,leakAnon=false,leakTeacher=false,leakRefresh=false,refreshError=false,leakOtherItems=false,leakPendingItems=false,leakNotifications=false,pathOverride}={}){
 const bytes=Buffer.from("Documento de homologação inteiramente fictício","utf8");
 const actualSha=createHash("sha256").update(bytes).digest("hex");
 const fakeDoc={
  storage_path:pathOverride??"10000000-0000-4000-8000-000000000001/original.pdf",
  sha256:actualSha
 };
 const ids={gestao:"00000000-0000-4000-8000-000000000001",a:"00000000-0000-4000-8000-000000000002",b:"00000000-0000-4000-8000-000000000003"};
 const calls={logout:[],downloads:[],refreshes:[],anons:[]};
 const respond=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{"Content-Type":"application/json"}});
 const fetcher=async(url,options)=>{
  const target=new URL(url),route=target.pathname,auth=options.headers.Authorization||"";
  const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  if(route==="/auth/v1/token"&&target.searchParams.get("grant_type")==="refresh_token"){
   calls.refreshes.push(JSON.parse(options.body).refresh_token);
   if(leakRefresh)return respond({access_token:"sessao-indevidamente-renovada",refresh_token:"renovado"},200);
   if(refreshError)return respond({message:"indisponivel"},503);
   return respond({error:"invalid_refresh_token"},401);
  }
  if(route==="/auth/v1/token"){
   const email=JSON.parse(options.body).email;
   const user=email==="gestao@example.invalid"?"gestao":email==="a@example.invalid"?"a":"b";
   return respond({access_token:user,refresh_token:"refresh-"+user,user:{id:ids[user]}});
  }
  if(route==="/auth/v1/logout"){calls.logout.push(token);return new Response(null,{status:204});}
  if(route.startsWith("/rest/v1/gastroiff_practice_")&&!token){
   calls.anons.push(route);
   return respond([]);
  }
  if(route==="/rest/v1/gastroiff_practice_roles"){
   const role=token==="gestao"?"gestao":"docente";
   return respond([{user_id:ids[token],role}]);
  }
  if(route==="/rest/v1/gastroiff_practice_cycles"){
   if(!token)return respond([]);
   if(token==="gestao")return respond([
    {id:"ciclo-a",teacher_user_id:ids.a,status:"aprovado"},
    {id:"ciclo-b",teacher_user_id:ids.b,status:"aprovado"}
   ]);
   return respond([{id:"ciclo-"+token,teacher_user_id:ids[token],status:"aprovado"}]);
  }
  if(route==="/rest/v1/gastroiff_practice_items"){
   const aItem={id:"item-a",cycle_id:"ciclo-a",approved:true};
   const bItem={id:"item-b",cycle_id:"ciclo-b",approved:true};
   const pending={id:"item-pendente",cycle_id:"ciclo-a",approved:false};
   if(token==="gestao")return respond([aItem,bItem,pending]);
   if(token==="a")return respond([aItem,...(leakOtherItems?[bItem]:[]),...(leakPendingItems?[pending]:[])]);
   if(token==="b")return respond([bItem]);
   return respond([]);
  }
  if(route==="/rest/v1/gastroiff_practice_notifications")
   return respond(token==="gestao"||leakNotifications?[{id:"aviso-privado"}]:[]);
  if(route==="/rest/v1/gastroiff_practice_documents")return respond(token==="gestao"?[fakeDoc]:[]);
  if(route==="/rest/v1/gastroiff_practice_audit")return respond([]);
  if(route.startsWith("/storage/v1/object/authenticated/")){
   calls.downloads.push(token||"anon");
   if(token==="gestao")return new Response(corrupt?Buffer.from("alterado", "utf8"):bytes,{status:200});
   if(!token&&leakAnon||token!=="gestao"&&token&&leakTeacher)return new Response(bytes,{status:200});
   return respond({message:"permission denied"},403);
  }
  throw Error("Rota inesperada no teste: "+route);
 };
 return {fetcher,calls,bytes};
}
test("homologação fictícia confere conteúdo SHA-256 e bloqueia três acessos",async()=>{
 const s=scenario();
 const result=await run(settings(env(),()=>cfg),s.fetcher);
 assert.equal(result.passed,true);
 assert.equal(result.verifiedOriginalBytes,s.bytes.length);
 assert.equal(result.approvedItems,2);
 assert.deepEqual(s.calls.downloads,["gestao","anon","a","b"]);
 assert.deepEqual(s.calls.logout,["gestao","a","b"]);
 assert.deepEqual(s.calls.refreshes,["refresh-gestao","refresh-a","refresh-b"]);
 assert.deepEqual(s.calls.anons,[
  "/rest/v1/gastroiff_practice_roles","/rest/v1/gastroiff_practice_cycles",
  "/rest/v1/gastroiff_practice_documents","/rest/v1/gastroiff_practice_items",
  "/rest/v1/gastroiff_practice_notifications","/rest/v1/gastroiff_practice_audit"
 ]);
});
test("arquivo adulterado bloqueia homologação e encerra três sessões",async()=>{
 const s=scenario({corrupt:true});
 await assert.rejects(run(settings(env(),()=>cfg),s.fetcher),/Integridade SHA-256/);
 assert.deepEqual(s.calls.logout,["gestao","a","b"]);
});
test("visitante com acesso indevido ao original impede aprovação",async()=>{
 const s=scenario({leakAnon:true});
 await assert.rejects(run(settings(env(),()=>cfg),s.fetcher),/Visitante baixou arquivo/);
 assert.deepEqual(s.calls.logout,["gestao","a","b"]);
});
test("docente com acesso indevido ao original impede aprovação",async()=>{
 const s=scenario({leakTeacher:true});
 await assert.rejects(run(settings(env(),()=>cfg),s.fetcher),/Docente baixou arquivo/);
 assert.deepEqual(s.calls.logout,["gestao","a","b"]);
});
test("recusa caminho manipulado antes de solicitar arquivo",()=>{
 for(const path of ["../x.pdf","ciclo/../x.pdf","/x.pdf","ciclo//x.pdf","ciclo/a\\x.pdf","ciclo/a?b.pdf"]){
  assert.throws(()=>privateObjectPath(path),/Caminho do original inválido/);
 }
 assert.equal(privateObjectPath("ciclo/teste original.pdf"),
  "/storage/v1/object/authenticated/gastroiff-praticas-privado/ciclo/teste%20original.pdf");
});


test("renovação de sessão após logout bloqueia aprovação quando ainda funciona",async()=>{
 const s=scenario({leakRefresh:true});
 await assert.rejects(run(settings(env(),()=>cfg),s.fetcher),/sessão fictícia ainda pode ser renovada/);
 assert.deepEqual(s.calls.logout,["gestao","a","b"]);
 assert.deepEqual(s.calls.refreshes,["refresh-gestao","refresh-a","refresh-b"]);
});
test("resposta inconclusiva do servidor de autenticação não é aprovada",async()=>{
 const s=scenario({refreshError:true});
 await assert.rejects(run(settings(env(),()=>cfg),s.fetcher),/sessão fictícia ainda pode ser renovada/);
 assert.deepEqual(s.calls.logout,["gestao","a","b"]);
});


test("reprova exposição de insumos de outra disciplina",async()=>{
 const mock=scenario({leakOtherItems:true});
 await assert.rejects(run(settings(env(),()=>cfg),mock.fetcher),/Insumos de outra disciplina/);
 assert.deepEqual(mock.calls.logout,["gestao","a","b"]);
});
test("reprova exposição de insumos ainda não aprovados",async()=>{
 const mock=scenario({leakPendingItems:true});
 await assert.rejects(run(settings(env(),()=>cfg),mock.fetcher),/Insumos não aprovados/);
 assert.deepEqual(mock.calls.logout,["gestao","a","b"]);
});
test("reprova leitura de notificações administrativas por docente",async()=>{
 const mock=scenario({leakNotifications:true});
 await assert.rejects(run(settings(env(),()=>cfg),mock.fetcher),/Notificações administrativas/);
 assert.deepEqual(mock.calls.logout,["gestao","a","b"]);
});
