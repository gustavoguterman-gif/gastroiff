#!/usr/bin/env node
/* Ensaio SOMENTE LEITURA em Supabase isolado. Nenhuma credencial no repositório.
 * Não importa migrações, não cadastra usuários, não cria nem apaga documentos.
 */
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const {createHash}=require("node:crypto");

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
 if(!/enabled:\s*false\b/.test(local)||!/supabaseUrl:\s*""/.test(local))
  throw Error("Configuração pública não está desativada. Ensaio cancelado");
 for(const k of ["GASTROIFF_MANAGER_EMAIL","GASTROIFF_TEACHER_A_EMAIL","GASTROIFF_TEACHER_B_EMAIL"]){
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env[k]))throw Error("Conta de teste inválida: "+k);
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

function privateObjectPath(storagePath){
 if(typeof storagePath!=="string")throw Error("Caminho do original inválido");
 const parts=storagePath.split("/");
 if(parts.length<2||parts.some(s=>!s||s==="."||s===".."||/[\\?#\u0000-\u001f]/.test(s)))
  throw Error("Caminho do original inválido");
 return "/storage/v1/object/authenticated/gastroiff-praticas-privado/"+
  parts.map(encodeURIComponent).join("/");
}
async function verifiedDownload(base,key,path,token,expectedSha,fetcher=fetch){
 assert.match(expectedSha,/^[0-9a-f]{64}$/,"Assinatura SHA-256 inválida");
 const res=await fetcher(base+path,{
  method:"GET",headers:{apikey:key,Authorization:"Bearer "+token}
 });
 assert.equal(res.ok,true,"Gestão não recuperou arquivo original do serviço (HTTP "+res.status+")");
 const buffer=Buffer.from(await res.arrayBuffer());
 assert.ok(buffer.length>0&&buffer.length<=8388608,"Original fictício vazio ou acima do limite de 8 MB");
 const actualSha=createHash("sha256").update(buffer).digest("hex");
 assert.equal(actualSha,expectedSha,"Integridade SHA-256 do original diverge do registro");
 return buffer.length;
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
 for(const table of ["gastroiff_practice_roles","gastroiff_practice_cycles",
  "gastroiff_practice_documents","gastroiff_practice_items",
  "gastroiff_practice_notifications","gastroiff_practice_audit"]){
  const anon=await http("GET","/rest/v1/"+table+"?select=id",null);
  assert.ok(!anon.ok||(Array.isArray(anon.data)&&anon.data.length===0),
   "Anônimo recebeu dados privados: "+table);
 }
 const sessions=[];
 let m,a,b;
 try{
  // Autenticação sequencial: até um login parcialmente concluído será encerrado.
  m=await login(cfg.manager);sessions.push(m);
  a=await login(cfg.a);sessions.push(a);
  b=await login(cfg.b);sessions.push(b);
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
  // Itens por identidade em RLS real: não expor ciclos alheios nem pendências.
  const [managerItems,itemsA,itemsB]=await Promise.all([
   rows("gastroiff_practice_items",m.access_token,"id,cycle_id,approved"),
   rows("gastroiff_practice_items",a.access_token,"id,cycle_id,approved"),
   rows("gastroiff_practice_items",b.access_token,"id,cycle_id,approved")
  ]);
  assert.ok(itemsA.length&&itemsB.length,
   "Cadastre ao menos um insumo fictício aprovado por docente na homologação");
  assert.ok(managerItems.some(item=>item.approved===false),
   "Cadastre também um insumo fictício não aprovado para testar a RLS");
  for(const [items,own] of [[itemsA,ownA],[itemsB,ownB]]){
   assert.ok(items.every(item=>own.has(item.cycle_id)),
    "Insumos de outra disciplina foram expostos a docente");
   assert.ok(items.every(item=>item.approved===true),
    "Insumos não aprovados foram expostos a docente");
  }
  assert.ok(managerItems.length>=itemsA.length+itemsB.length,
   "Gestão não conseguiu ler todos os insumos visíveis aos docentes");
  const itemIdsB=new Set(itemsB.map(item=>item.id));
  assert.ok(itemsA.every(item=>!itemIdsB.has(item.id)),
   "O mesmo insumo foi entregue a dois docentes sem vínculo comum");
  for(const t of [a,b]){
   assert.equal((await rows("gastroiff_practice_documents",t.access_token,"id")).length,0,
    "Documento administrativo exposto ao docente");
   assert.equal((await rows("gastroiff_practice_audit",t.access_token,"id")).length,0,
    "Histórico administrativo exposto ao docente");
   assert.equal((await rows("gastroiff_practice_notifications",t.access_token,"id")).length,0,
    "Notificações administrativas expostas ao docente");
  }
  const docs=await rows("gastroiff_practice_documents",m.access_token,"storage_path,sha256");
  assert.ok(docs.length,"Providencie ao menos um documento fictício no bucket privado");
  const doc=docs[0];
  assert.match(doc.sha256,/^[0-9a-f]{64}$/,"Hash inválido no registro");
  const objectPath=privateObjectPath(doc.storage_path);
  const verifiedBytes=await verifiedDownload(cfg.url,cfg.key,objectPath,m.access_token,doc.sha256,fetcher);
  const blockedAnon=await http("GET",objectPath,null);
  assert.ok(!blockedAnon.ok,"Visitante baixou arquivo bruto restrito");
  const blocked=await http("GET",objectPath,a.access_token);
  assert.ok(!blocked.ok,"Docente baixou arquivo bruto restrito");
  const blockedB=await http("GET",objectPath,b.access_token);
  assert.ok(!blockedB.ok,"Outro docente baixou arquivo bruto restrito");
  return {passed:true,managerCycles:managerCycles.length,teacherACycles:ac.length,
   teacherBCycles:bc.length,approvedItems:itemsA.length+itemsB.length,
   documents:docs.length,verifiedOriginalBytes:verifiedBytes,
   note:"Integridade SHA-256 e bloqueio dos originais confirmados; refresh tokens revogados após logout; access tokens não são revogados imediatamente"};
 }finally{
  // Encerrar todas as sessões obtidas, inclusive após falhas intermediárias.
  // Não interromper a limpeza quando um logout isolado falhar.
  const failures=[];
  for(const user of sessions){
   try{
    const res=await http("POST","/auth/v1/logout",user.access_token);
    if(!res.ok)failures.push("logout HTTP "+res.status);
   }catch(e){failures.push("logout sem conexão")}
  }
  if(failures.length)throw Error("Falha ao encerrar "+failures.length+" sessão(ões) fictícias");
  // Os access tokens (JWT) podem permanecer válidos até expirar.
  // O critério verificável do logout é a impossibilidade de renovar a sessão
  // com os REFRESH TOKENS anteriormente emitidos, sem usar conta real.
  for(const user of sessions){
   try{
    const renewed=await http("POST","/auth/v1/token?grant_type=refresh_token",null,{
     refresh_token:user.refresh_token
    });
    if(renewed.ok||![400,401,403].includes(renewed.status))
     failures.push("renovação antiga não foi comprovadamente bloqueada");
   }catch(e){failures.push("renovação antiga sem resposta verificável")}
  }
  if(failures.length)throw Error("A sessão fictícia ainda pode ser renovada ou sua revogação não foi confirmada");
 }
}
if(require.main===module){
 (async()=>{const cfg=settings();const result=await run(cfg);console.log("Homologação de leitura:",JSON.stringify(result))})()
 .catch(e=>{console.error("Homologação recusada/falhou:",e.message);process.exitCode=1});
}
module.exports={settings,run,request,privateObjectPath,verifiedDownload};
