const test=require("node:test");
const assert=require("node:assert/strict");
const panel=require("../assets/praticas-quadro-docente.js");
const rules=require("../assets/praticas-regras.js");
const supply=require("../assets/conciliacao-insumos.js");
const cycle={teacher:"Docente Exemplo",course:"Tecnólogo em Gastronomia",subject:"Panificação",
 room:"Bloco G",start:"2026-11-11",end:"2026-12-18",weekdays:[3,4],timeStart:"08:00",timeEnd:"12:00"};
const doc=(stage,rows=[])=>({stage,reviewed:true,name:"Arquivo "+stage,rows,warnings:[]});
const item=(amount)=>({insumo:"Farinha",unidade:"kg",quantidade:amount});
const complete=(confirmed=6)=>[
 doc("cronograma"),doc("pedidoDocente",[item(10)]),
 doc("pedidoFornecedor",[item(10)]),doc("respostaFornecedor",[item(confirmed)])
];
const build=docs=>panel.build(cycle,docs,supply.compare,rules.validate);
test("produz visão administrativa com quantidades confirmadas e faltantes",()=>{
 const result=build(complete());
 assert.equal(result.schema,1);
 assert.equal(result.identificacao.disciplina,"Panificação");
 assert.equal(result.insumos[0].solicitado,10);
 assert.equal(result.insumos[0].confirmado,6);
 assert.equal(result.insumos[0].faltante,4);
 assert.equal(result.insumos[0].situacao,"Confirmado parcialmente");
 assert.equal(result.prontoParaRevisao,true);
 assert.equal(result.publicado,false);
 assert.equal(result.emailEnviado,false);
});
test("não confunde fornecedor com recebimento físico",()=>{
 const result=build(complete(10));
 assert.equal(result.insumos[0].confirmado,10);
 assert.equal(result.insumos[0].recebido,null);
});
test("bloqueia aviso sem resposta estruturada do fornecedor",()=>{
 const result=build(complete().slice(0,3));
 assert.equal(result.prontoParaRevisao,false);
 assert.ok(result.pendencias.some(x=>x.includes("Resposta do fornecedor")));
 assert.throws(()=>panel.makeEmailDraft(result,rules.dateMinusDays));
});
test("resposta incompleta não supõe que ingrediente será entregue",()=>{
 const docs=[doc("cronograma"),doc("pedidoDocente",[item(10),{insumo:"Ovos",unidade:"un",quantidade:30}]),doc("pedidoFornecedor",[item(10),{insumo:"Ovos",unidade:"un",quantidade:30}]),doc("respostaFornecedor",[item(10)])];
 const result=build(docs);
 assert.equal(result.prontoParaRevisao,false);
 assert.ok(result.pendencias.some(x=>x.includes("sem confirmação individual")));
 assert.equal(result.insumos.find(x=>x.insumo==="Ovos").confirmado,null);
});
test("registro zero explícito confirma indisponibilidade",()=>{
 const result=build(complete(0));
 assert.equal(result.insumos[0].atendimento,"indisponivel");
 assert.equal(result.insumos[0].faltante,10);
});
test("mantém unidades diferentes sem conversão arriscada",()=>{
 const docs=[doc("cronograma"),doc("pedidoDocente",[item(1),{insumo:"Farinha",unidade:"g",quantidade:500}]),doc("pedidoFornecedor",[item(1),{insumo:"Farinha",unidade:"g",quantidade:500}]),doc("respostaFornecedor",[item(1),{insumo:"Farinha",unidade:"g",quantidade:500}])];
 assert.equal(build(docs).insumos.length,2);
});
test("bloqueia confirmação com problemas de leitura",()=>{
 const docs=complete();docs[3].warnings=["Linha 4: quantidade ambígua"];
 assert.equal(build(docs).prontoParaRevisao,false);
});
test("rascunho de e-mail tem sete dias, horários e aviso sem envio",()=>{
 const result=build(complete());
 const draft=panel.makeEmailDraft(result,rules.dateMinusDays);
 assert.equal(draft.enviarEm,"2026-11-04");
 assert.equal(draft.enviado,false);
 assert.match(draft.corpo,/não atendido 4/);
 assert.match(draft.corpo,/08:00 às 12:00/);
 assert.match(draft.corpo,/nenhuma mensagem foi enviada/);
});
test("rejeita quantidades ilegíveis no documento estruturado",()=>{
 const docs=complete();
 docs[3].rows=[item("desconhecida")];
 const result=build(docs);
 assert.equal(result.prontoParaRevisao,false);
 assert.ok(result.pendencias.some(x=>x.includes("Falha ao comparar")));
});
test("sem identificação docente não gera quadro pronto",()=>{
 const result=panel.build({...cycle,teacher:""},complete(),supply.compare,rules.validate);
 assert.equal(result.prontoParaRevisao,false);
});
