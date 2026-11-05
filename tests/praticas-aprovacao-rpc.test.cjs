const test=require("node:test");
const assert=require("node:assert/strict");
const api=require("../assets/praticas-gestao-privada.js");
function mock(role="gestao",error=null){
 const calls=[];
 return {
  calls,
  auth:{getUser:async()=>({data:{user:{id:"gestor-id"}},error:null})},
  from(table){
   const q={select(){return q},eq(){return q},maybeSingle:async()=>({data:{role},error:null})};return q;
  },
  rpc:async(name,payload)=>{
   calls.push({name,payload});return error?{data:null,error:{message:error}}:{data:name==="gastroiff_save_practice_items"?1:null,error:null};
  }
 };
}
test("revisão, importação e homologação exigem papel Gestão",async()=>{
 const c=mock();
 assert.equal(await api.reviewDocument(c,"doc-1"),true);
 const count=await api.saveReviewedItems(c,"ciclo-1","doc-4",
  [{description:"Farinha de trigo",unit:"kg",requested:10,forwarded:10,confirmed:6,received:null}]);
 assert.equal(count,1);
 assert.equal(await api.approveCycle(c,"ciclo-1"),true);
 assert.deepEqual(c.calls.map(x=>x.name),[
  "gastroiff_review_document","gastroiff_save_practice_items","gastroiff_approve_cycle"]);
 assert.equal(c.calls[1].payload.p_items[0].confirmed,6);
});
test("identidade docente não pode confirmar arquivos nem aprovar ciclos",async()=>{
 const c=mock("docente");
 await assert.rejects(api.reviewDocument(c,"doc-1"),/Perfil não autorizado/);
 await assert.rejects(api.approveCycle(c,"ciclo-1"),/Perfil não autorizado/);
 assert.equal(c.calls.length,0);
});
test("erro de banco nunca retorna aprovação falsa",async()=>{
 await assert.rejects(api.approveCycle(mock("gestao","Resposta incompleta"),"ciclo-1"),/Resposta incompleta/);
});
test("validação de insumos não troca ausência de informação por zero",()=>{
 const items=api.normalizedRows([{insumo:"Açúcar",unidade:"kg",solicitado:6,encaminhado:6,confirmado:null}]);
 assert.equal(items[0].confirmed,null);
 assert.throws(()=>api.normalizedRows([{insumo:"Açúcar",unidade:"kg",solicitado:6,encaminhado:-1}]),/Quantidade inválida/);
});
