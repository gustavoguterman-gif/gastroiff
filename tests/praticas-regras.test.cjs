const test=require("node:test"),assert=require("node:assert/strict");
const rules=require("../assets/praticas-regras.js");
const ready={teacher:"Docente Exemplo",course:"Tecnólogo em Gastronomia",subject:"Panificação",start:"2026-11-11",end:"2026-12-18",
 weekdays:[3,4,5],timeStart:"08:00",timeEnd:"12:00",room:"Bloco G"};
const doc=stage=>({stage,reviewed:true,rows:[{insumo:"Farinha",unidade:"kg",quantidade:5}]});
test("ciclo com data e dias completos aceita horários",()=>assert.deepEqual(rules.validate(ready).questions,[]));
test("solicita campos ausentes com perguntas claras",()=>{
 const questions=rules.validate({}).questions;
 assert.ok(questions.some(x=>/docente responsável/.test(x)));
 assert.ok(questions.some(x=>/dias da semana/.test(x)));
 assert.ok(questions.some(x=>/horário/.test(x)));
});
test("recusa data inexistente e horário invertido",()=>{
 const q=rules.validate({...ready,start:"2026-02-31",timeStart:"14:00",timeEnd:"09:00"}).questions;
 assert.ok(q.some(x=>/data inicial/.test(x)));
 assert.ok(q.some(x=>/horário/.test(x)));
});
test("notificação sete dias antes é calculada sem envio",()=>{
 const r=rules.notification(ready,["cronograma","pedidoDocente","pedidoFornecedor","respostaFornecedor"].map(doc),"2026-11-04");
 assert.equal(r.date,"2026-11-04");assert.equal(r.due,true);assert.equal(r.ready,true);assert.equal(r.canSend,false);
});
test("sem confirmação de fornecedor, aviso não fica pronto",()=>{
 const r=rules.notification(ready,["cronograma","pedidoDocente","pedidoFornecedor"].map(doc),"2026-11-04");
 assert.equal(r.ready,false);
 assert.ok(r.questions.some(x=>/resposta do fornecedor/.test(x)));
});
test("resposta sem quantidades produz pergunta",()=>{
 const r=rules.questions(ready,[doc("cronograma"),doc("pedidoDocente"),doc("pedidoFornecedor"),{stage:"respostaFornecedor",reviewed:true,rows:[]}]);
 assert.ok(r.some(x=>/quantidades confirmadas/.test(x)));
});
test("prévia distingue confirmado de recebido sem envio",()=>{
 const msg=rules.emailPreview(ready,[{insumo:"Farinha",unidade:"kg",solicitado:10,confirmado:6,recebido:null}]);
 assert.match(msg,/solicitado 10, confirmado 6, recebido a conferir/);
 assert.match(msg,/Não foi enviada/);
});
test("não cria prévia para ciclo incompleto",()=>assert.throws(()=>rules.emailPreview({...ready,teacher:""},[]),/incompletas/));
test("data atravessando meses calcula sete dias",()=>assert.equal(rules.dateMinusDays("2027-01-04",7),"2026-12-28"));
