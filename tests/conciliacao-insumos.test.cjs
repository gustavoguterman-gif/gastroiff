const test=require("node:test");
const assert=require("node:assert/strict");
const {compare,number,key}=require("../assets/conciliacao-insumos.js");
const item=(quantidade,insumo="Farinha de trigo",unidade="kg")=>({insumo,unidade,quantidade});
test("separa pedido, encaminhamento, confirmação e recebimento",()=>{
 const x=compare({pedidoDocente:[item(10)],pedidoFornecedor:[item(8)],respostaFornecedor:[item(6)],recebimentoFisico:[item(3)]})[0];
 assert.equal(x.solicitado,10);assert.equal(x.encaminhado,8);assert.equal(x.confirmado,6);assert.equal(x.recebido,3);
 assert.equal(x.faltaConfirmar,4);assert.equal(x.faltaReceber,7);assert.equal(x.status,"recebido parcialmente");
 assert.equal(x.pendenciaEncaminhamento,"pedido parcialmente encaminhado");
});
test("resposta ausente não é igual a indisponibilidade",()=>{
 const x=compare({pedidoDocente:[item(10)]})[0];
 assert.equal(x.confirmado,null);assert.equal(x.faltaConfirmar,null);
 assert.equal(x.status,"sem resposta registrada");
});
test("confirmação zero representa indisponibilidade informada",()=>{
 const x=compare({pedidoDocente:[item(10)],respostaFornecedor:[item(0)]})[0];
 assert.equal(x.status,"fornecedor informou indisponibilidade");assert.equal(x.faltaConfirmar,10);
});
test("fornecimento completo não significa recebido",()=>{
 const x=compare({pedidoDocente:[item(10)],pedidoFornecedor:[item(10)],respostaFornecedor:[item(10)]})[0];
 assert.equal(x.status,"fornecimento integral");assert.equal(x.recebido,null);
});
test("junta linhas iguais mantendo unidade e identifica discrepância",()=>{
 const x=compare({pedidoDocente:[item(2),item(3)],pedidoFornecedor:[item(4)],respostaFornecedor:[item(5)]})[0];
 assert.equal(x.solicitado,5);assert.equal(x.divergenciaFornecedor,true);
});
test("não mistura gramas e quilogramas automaticamente",()=>{
 const xs=compare({pedidoDocente:[item(1,"Farinha","kg"),item(500,"Farinha","g")]});
 assert.equal(xs.length,2);
});
test("detecta itens sem correspondência no pedido do docente",()=>{
 const x=compare({pedidoDocente:[item(1)],pedidoFornecedor:[item(2,"Sal")]});
 assert.equal(x.find(v=>v.insumo==="Sal").semPedidoDocente,true);
});
test("rejeita quantidade ambígua, negativa ou código conflitante",()=>{
 for(const value of ["1.000,50","-1","abc",""])assert.throws(()=>number(value));
 assert.throws(()=>compare({pedidoDocente:[{codigo:"A1",...item(1,"Farinha")},{codigo:"A1",...item(2,"Sal")}]}));
});
test("normaliza diferenças de acentuação e espaços",()=>{
 assert.equal(key(item(1," Açúcar  refinado ")),key(item(2,"acucar refinado")));
});
test("rejeita planilha não tabular ou extensa",()=>{
 assert.throws(()=>compare({pedidoDocente:"texto"}));
 assert.throws(()=>compare({pedidoDocente:Array.from({length:5001},()=>item(1))}));
});
