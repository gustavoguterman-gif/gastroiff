#!/usr/bin/env node
/* Ensaio SOMENTE LEITURA em Supabase isolado. Nenhuma credencial no repositório.
 * Não importa migrações, não cadastra usuários, não cria nem apaga documentos.
 */
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");

function settings(env=process.env,readFile=p=>fs.readFileSync(p,"utf8")){
 const must=["GASTROIFF_STAGING_CONFIRM","GASTROIFF_STAGING_PROJECT_REF",
  "GASTROIFF_STAGING_URL","GASTROIFF_STAGING_ANON_KEY",
  "GASTROIFF_MANAGER_EMAIL","GASTROIFF_MANAGER_PASSWORD",
  "GASTROIFF_TEACHER_A_EMAIL","GASTROIFF_TEACHER_A_PASSWORD",
  "GASTROIFF_TEACHER_B_EMAIL","GASTROIFF_TEACHER_B_PASSWORD"];
 const missing=must.filter(k=>!env[k]);if(missing.length)throw Error("Variáveis ausentes: "+missing.join(", "));
 if(env.GASTROIFF_STAGING_CONFIRM!=="SIM_AMBIENTE_DESCARTAVEL")throw Error("Confirmação de homologação ausente");
 if(!/^[a-z0-9]{20}$/.test(env.GASTROIFF_STAGING_PROJECT_REF))
  throw Error("Identificador do projeto de homologação inválido");
 const url=new URL(env.GASTROIFF_STAGING_URL);
 if(url.protocol!=="https:"||url.hostname!==env.GASTROIFF_STAGING_PROJECT_REF+".supabase.co"||
    url.pathname!=="/"||url.search||url.hash||url.username||url.password)
  throw Error("URL não corresponde exatamente ao projeto isolado informado");
 if(/(service_role|sb_secret_)/i.test(env.GASTROIFF_STAGING_ANON_KEY))
  throw Error("Chave secreta de serviço proibida neste teste");
 const local=readFile("assets/praticas-config.js");
 if(!/enabled:\\s*false\\b/.test(local)||!/supabaseUrl:\\s*""/.test(local))
  throw Error("Configuração pública não está desativada. Ensaio cancelado");
 for(const k of ["GASTROIFF_MANAGER_EMAIL","GASTROIFF_TEACHER_A_EMAIL","GASTROIFF_TEACHER_B_EMAIL"]){
  if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(env[k]))throw Error("Conta de teste inválida: "+k);
 }
 const emails=[env.GASTROIFF_MANAGER_EMAIL,env.GASTROIFF_TEACHER_A_EMAIL,env.GASTROIFF_TEACHER_B_EMAIL];
 if(new Set(emails).size!==3)throw Error("As três contas de teste precisam ser distintas");
 return {url:url.origin,key:env.GASTROIFF_STAGING_ANON_KEY,
  manager:{email:emails[0],password:env.GASTROIFF_MANAGER_PASSWORD},
  a:{email:emails[1],password:env.GASTROIFF_TEACHER_A_PASSWORD},
  b:{email:emails[2],password:env.GASTROIFF_TEACHER_B_PASSWORD}};
}
async function request(base,key,method,path,token,body,fetcher=fetch){
 const res=await fetcher(base+path,{method,headers:{
  apikey:key,...(token?{Authorization:"Bearer "+token}:{}),
  ...(body?{"Content-Type":"application/json"}:{})},
  ...(body?{body:JSON.stringify(body)}:{})});
 const raw=await res.text();
 let data;try{data=JSON.parse(raw)}catch{data=raw}
 return {status:res.status,ok:res.ok,data};
}
async function run(cfg,fetcher=fetch){
 const http=(method,path,token,body)=>request(cfg.url,cfg.key,method,path,token,body,fetcher);
 async function login(person){
  const r=await http("POST","/auth/v1/token?grant_type=password",null,{
   email:person.email,password:person.password});
  assert.equal(r.ok,true,"Login de conta fictícia falhou (HTTP "+r.status+")");
  assert.ok(r.data?.access_token&&r.data?.refresh_token&&r.data?.user?.id,"Sessão inválida");
  return r.data;
 }
 async function rows(table,token,columns="*"){
  const r=await http("GET","/rest/v1/"+table+"?select="+encodeURIComponent(columns),token);
  assert.equal(r.ok,true,"Consulta não autorizada ou falhou: "+table+" HTTP "+r.status);
  assert.ok(Array.isArray(r.data),"Resposta não é coleção");
  return r.data;
 }
 const anon=await http("GET","/rest/v1/gastroiff_practice_cycles?select=id",null);
 assert.ok(!anon.ok||(Array.isArray(anon.data)&&anon.data.length===0),"Anônimo recebeu ciclos privados");
 const [m,a,b]=await Promise.all([login(cfg.manager),login(cfg.a),login(cfg.b)]);
 try{
  const managerRoles=await rows("gastroiff_practice_roles",m.access_token,"user_id,role");
  assert.ok(managerRoles.some(r=>r.user_id===m.user.id&&r.role==="gestao"),"Gestão não provisionada");
  const ar=await rows("gastroiff_practice_roles",a.access_token,"user_id,role");
  const br=await rows("gastroiff_practice_roles",b.access_token,"user_id,role");
  for(const [u,rs] of [[a,ar],[b,br]]){
   assert.equal(rs.length,1,"Docente consultou perfis de terceiros");
   assert.equal(rs[0].user_id,u.user.id);
   assert.equal(rs[0].role,"docente");
  }
  const [managerCycles,ac,bc]=await Promise.all([
   rows("gastroiff_practice_cycles",m.access_token,"id,teacher_user_id,status"),
   rows("gastroiff_practice_cycles",a.access_token,"id,teacher_user_id,status"),
   rows("gastroiff_practice_cycles",b.access_token,"id,teacher_user_id,status")
  ]);
  assert.ok(ac.length&&bc.length,"Providencie ao menos um ciclo APROVADO fictício para cada docente");
  for(const [user,cycles] of [[a,ac],[b,bc]]){
   assert.ok(cycles.every(c=>c.teacher_user_id===user.user.id&&c.status==="aprovado"),
    "Isolamento dos ciclos docentes violado");
  }
  const ownA=new Set(ac.map(c=>c.id)),ownB=new Set(bc.map(c=>c.id));
  assert.ok([...ownA].every(id=>!ownB.has(id)),"Docentes enxergam o mesmo ciclo de teste");
  assert.ok(managerCycles.length>=ac.length+bc.length,"Gestão não enxerga ciclos esperados");
  for(const t of [a,b]){
   assert.equal((await rows("gastroiff_practice_documents",t.access_token,"id")).length,0,
    "Documento administrativo exposto ao docente");
   assert.equal((await rows("gastroiff_practice_audit",t.access_token,"id")).length,0,
    "Histórico administrativo exposto ao docente");
  }
  const docs=await rows("gastroiff_practice_documents",m.access_token,"storage_path,sha256");
  assert.ok(docs.length,"Providencie ao menos um documento fictício no bucket privado");
  const doc=docs[0];
  assert.match(doc.sha256,/^[0-9a-f]{64}$/,"Hash inválido no registro");
  const objectPath="/storage/v1/object/authenticated/gastroiff-praticas-privado/"+
   doc.storage_path.split("/").map(encodeURIComponent).join("/");
  const managerFile=await http("GET",objectPath,m.access_token);
  assert.ok(managerFile.ok,"Gestão não recuperou arquivo original do serviço");
  const blocked=await http("GET",objectPath,a.access_token);
  assert.ok(!blocked.ok,"Docente baixou arquivo bruto restrito");
  const blockedB=await http("GET",objectPath,b.access_token);
  assert.ok(!blockedB.ok,"Outro docente baixou arquivo bruto restrito");
  return {passed:true,managerCycles:managerCycles.length,teacherACycles:ac.length,
   teacherBCycles:bc.length,documents:docs.length,
   note:"Teste não prova revogação imediata do access token, apenas leitura com sessão autenticada"};
 }finally{
  const all=[m,a,b];for(const user of all){
   const res=await http("POST","/auth/v1/logout",user.access_token);
   assert.ok(res.ok,"Encerramento da sessão falhou (HTTP "+res.status+")");
  }
 }
}
if(require.main===module){
 (async()=>{const cfg=settings();const result=await run(cfg);console.log("Homologação de leitura:",JSON.stringify(result))})()
 .catch(e=>{console.error("Homologação recusada/falhou:",e.message);process.exitCode=1});
}
module.exports={settings,run,request};
