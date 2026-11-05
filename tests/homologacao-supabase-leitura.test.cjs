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
  if(route==="/rest/v1/gastroiff_practice_cycles")return new Response("[]",{status:200});
  if(route==="/auth/v1/token"){
   const email=JSON.parse(options.body).email;
   events.push("login:"+email);
   if(email==="a@example.invalid")return new Response('{"error":"invalid_credentials"}',{status:400});
   return new Response(JSON.stringify({access_token:"token-gestao",refresh_token:"refresh-falso",user:{id:"gestor-id"}}),{status:200});
  }
  if(route==="/auth/v1/logout"){
   events.push("logout:"+options.headers.Authorization);
   return new Response("",{status:204});
  }
  throw Error("Rota inesperada: "+route);
 };
 await assert.rejects(run(settings(env(),()=>cfg),mock),/Login de conta fictícia falhou/);
 assert.deepEqual(events,[
  "login:gestao@example.invalid",
  "login:a@example.invalid",
  "logout:Bearer token-gestao"
 ]);
});
test("logout de todas as sessões mesmo quando o primeiro encerramento falha",async()=>{
 const {run}=require("./homologacao-supabase-leitura.cjs");
 const events=[];
 const mock=async(url,options)=>{
  const route=new URL(url).pathname;
  if(route==="/rest/v1/gastroiff_practice_cycles")return new Response("[]",{status:200});
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
   return new Response("",{status:204});
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
