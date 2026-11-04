const test=require("node:test");
const assert=require("node:assert/strict");
const {parseSupplies,HEADERS,MAX_BYTES}=require("../assets/insumos-csv.js");
const header=HEADERS.join(",");
const record=(overrides={})=>({
 id_item:"ITEM-001",id_ciclo:"CICLO-001",insumo_ou_material:"Farinha de trigo",
 quantidade:"2",unidade:"kg",situacao:"Não informado",previsao_entrega:"",
 recebido_em:"",atualizado_em:"",fonte:"",...overrides
});
const csv=(rows,sep=",")=>HEADERS.join(sep)+"\n"+rows.map(item=>HEADERS.map(key=>item[key]).join(sep)).join("\n");
test("aceita insumo com origem ainda nao confirmada sem inventar previsao",()=>{
 const item=parseSupplies(csv([record()]))[0];
 assert.equal(item.situacao,"Não informado");
 assert.equal(item.previsao_entrega,"");
 assert.equal(item.origem_documentada,false);
 assert.equal(item.demonstracao,false);
});
test("identifica registros demonstrativos mesmo que tenham fonte e data",()=>{
 const item=parseSupplies(csv([record({id_item:"TESTE-ITEM-001",fonte:"DADOS FICTÍCIOS. NÃO PUBLICAR",atualizado_em:"2026-11-04"})]))[0];
 assert.equal(item.demonstracao,true);
 assert.equal(item.origem_documentada,false);
});
test("exige fonte e data para marcar origem documentada",()=>{
 assert.equal(parseSupplies(csv([record({fonte:"Setor de compras"})]))[0].origem_documentada,false);
 assert.equal(parseSupplies(csv([record({atualizado_em:"2026-11-04"})]))[0].origem_documentada,false);
 assert.equal(parseSupplies(csv([record({fonte:"Setor de compras",atualizado_em:"2026-11-04"})]))[0].origem_documentada,true);
});
test("lê CSV com ponto e virgula e finais Windows",()=>{
 const input="\uFEFF"+csv([record()],";").replaceAll("\n","\r\n")+"\r\n";
 assert.equal(parseSupplies(input).length,1);
});
test("rejeita cabeçalho alterado, duplicado ou incompleto",()=>{
 assert.throws(()=>parseSupplies("id_item,foo\n1,2"));
 assert.throws(()=>parseSupplies(header.replace("fonte","id_item")+"\n"+HEADERS.map(()=>"a").join(",")));
});
test("rejeita quantidade invalida ou zerada",()=>{
 for(const quantidade of ["-1","0","abc","1e100"]){
  assert.throws(()=>parseSupplies(csv([record({quantidade})])));
 }
});
test("rejeita datas impossiveis e preserva data valida",()=>{
 assert.throws(()=>parseSupplies(csv([record({previsao_entrega:"2026-02-31"})])));
 assert.equal(parseSupplies(csv([record({recebido_em:"2026-11-04"})]))[0].recebido_em,"2026-11-04");
});
test("rejeita identificadores repetidos e linhas com colunas a mais",()=>{
 assert.throws(()=>parseSupplies(csv([record(),record()])));
 assert.throws(()=>parseSupplies(csv([record()])+",extra"));
});
test("limita tamanho e exige pelo menos um insumo",()=>{
 assert.throws(()=>parseSupplies(header));
 assert.throws(()=>parseSupplies("x".repeat(MAX_BYTES+1)));
});
test("permite ordem diferente de colunas no cabeçalho",()=>{
 const order=[...HEADERS].reverse();
 const input=order.join(",")+"\n"+order.map(key=>record()[key]).join(",");
 assert.equal(parseSupplies(input)[0].insumo_ou_material,"Farinha de trigo");
});
