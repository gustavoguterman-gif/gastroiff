const test=require("node:test"),assert=require("node:assert/strict");
const auth=require("../assets/praticas-acesso.js");
const U="00000000-0000-4000-8000-000000000002";
function client({user=U,role="docente",cycles=[],items=[],error}={}){
 const queried=[];
 return {
  queried,
  auth:{getUser:async()=>({data:{user:user?{id:user}:null},error:null})},
  from(table){
   queried.push(table);
   const filters=[];
   const query={
    select(){return query},
    eq(key,value){filters.push([key,value]);return query},
    in(key,value){filters.push([key,value]);return query},
    order(){return query},
    maybeSingle:async()=>({data:table==="gastroiff_practice_roles"?{role}:null,error:null}),
    then(ok,fail){
     if(error)return Promise.resolve({data:null,error:{message:"failed"}}).then(ok,fail);
     let result=table==="gastroiff_practice_cycles"?cycles:items;
     return Promise.resolve({data:result,error:null}).then(ok,fail);
    }
   };
   return query;
  }
 };
}
const cycle={id:"cycle-a",subject:"Panificação",teacher_user_id:U,status:"aprovado",starts_on:"2026-11-10",ends_on:"2026-12-10",weekdays:[1],begins_at:"08:00",ends_at:"12:00"};
const item={id:"insumo-1",cycle_id:"cycle-a",description:"Farinha",unit:"kg",requested:10,confirmed:6,received:null,approved:true};
test("acesso desativado sem configuração institucional",()=>{
 assert.equal(auth.configValid({enabled:false}),false);
 assert.equal(auth.configValid({enabled:true,supabaseUrl:"http://example.com",supabasePublishableKey:"abc".repeat(10)}),false);
 assert.equal(auth.configValid({enabled:true,supabaseUrl:"https://projeto.supabase.co/",supabasePublishableKey:"chave-publica-de-homologacao-123"}),true);
 assert.equal(auth.configValid({enabled:true,supabaseUrl:"https://projeto.supabase.co/",supabasePublishableKey:"service_role_privada_123456789"}),false);
});
test("sem sessão não consulta tabelas",async()=>{
 const c=client({user:null});await assert.rejects(auth.getTeacherDashboard(c),/não autenticado/);
 assert.deepEqual(c.queried,[]);
});
test("identidade sem papel docente não lê ciclos",async()=>{
 const c=client({role:"gestao"});await assert.rejects(auth.getTeacherDashboard(c),/perfil docente/);
 assert.deepEqual(c.queried,["gastroiff_practice_roles"]);
});
test("docente sem ciclo aprovado recebe lista vazia",async()=>{
 const c=client();
 const result=await auth.getTeacherDashboard(c);
 assert.deepEqual(result.cycles,[]);assert.deepEqual(result.items,[]);
 assert.ok(!c.queried.includes("gastroiff_practice_items"));
});
test("retorna apenas ciclo e insumo autorizados",async()=>{
 const c=client({cycles:[cycle],items:[item]});
 const dashboard=await auth.getTeacherDashboard(c);
 assert.equal(dashboard.cycles.length,1);
 assert.equal(dashboard.items[0].missing,4);
 assert.equal(dashboard.items[0].received,null);
 assert.equal(auth.viewModel(dashboard)[0].items.length,1);
 assert.ok(!c.queried.includes("gastroiff_practice_documents"));
 assert.ok(!c.queried.includes("gastroiff_practice_audit"));
});
test("rejeita ciclo de outra identidade mesmo se servidor devolver",async()=>{
 const c=client({cycles:[{...cycle,teacher_user_id:"outro"}]});
 await assert.rejects(auth.getTeacherDashboard(c),/autorização inconsistente/);
});
test("rejeita rascunho mesmo se servidor devolver",async()=>{
 const c=client({cycles:[{...cycle,status:"rascunho"}]});
 await assert.rejects(auth.getTeacherDashboard(c),/autorização inconsistente/);
});
test("rejeita insumo não aprovado ou ligado a outro ciclo",async()=>{
 for(const invalid of [{...item,approved:false},{...item,cycle_id:"outra-disciplina"}]){
  const c=client({cycles:[cycle],items:[invalid]});
  await assert.rejects(auth.getTeacherDashboard(c),/insumos inconsistente/);
 }
});
test("ausência de resposta continua sem informação, não vira zero",()=>{
 assert.equal(auth.normItem({...item,confirmed:null}).missing,null);
 assert.match(auth.normItem({...item,confirmed:null}).status,/Aguardando resposta/);
 assert.equal(auth.normItem({...item,confirmed:0}).missing,10);
});
test("erro de origem não expõe dados parciais",async()=>{
 const c=client({cycles:[cycle],error:true});
 await assert.rejects(auth.getTeacherDashboard(c),/consulta/);
});
