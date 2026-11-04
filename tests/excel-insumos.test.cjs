const test=require("node:test");
const assert=require("node:assert/strict");
const XLSX=require("xlsx");
const excel=require("../assets/excel-insumos.js");
const make=(bookType,rows,other=false)=>{
 const wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),"Pedido");
 if(other)XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Resumo"]]),"Resumo");
 return XLSX.write(wb,{type:"array",bookType});
};
const data=[["DISCIPLINA DEMONSTRATIVA"],["Insumo","Unidade","Quantidade","Observações"],["Farinha de trigo","kg",10,"Pedido inicial"],["Ovos","un",30,""]];
for(const type of ["xlsx","xls"]){
 test("abre arquivo Excel real "+type+" e identifica cabeçalhos",()=>{
  const wb=excel.inspectWorkbook(make(type,data,true),XLSX);
  assert.equal(wb.sheets.length,2);
  assert.equal(wb.sheets[0].detected.score,3);
  const parsed=excel.extract(wb.sheets[0]);
  assert.equal(parsed.rows.length,2);
  assert.equal(parsed.rows[0].insumo,"Farinha de trigo");
  assert.equal(parsed.rows[0].quantidade,"10");
  assert.equal(parsed.rows[0].aba,"Pedido");
 });
}
test("lida com cabeçalhos fora da primeira linha",()=>{
 const wb=excel.inspectWorkbook(make("xlsx",data),XLSX);
 assert.equal(wb.sheets[0].detected.headerRow,1);
});
test("aceita cabeçalho em ordem diferente",()=>{
 const wb=excel.inspectWorkbook(make("xlsx",[["Qtd","Produto","Unid"],[5,"Sal","kg"]]),XLSX);
 assert.equal(excel.extract(wb.sheets[0]).rows[0].insumo,"Sal");
});
test("relata linhas incompletas sem inventar valores",()=>{
 const wb=excel.inspectWorkbook(make("xlsx",[["Produto","Unidade","Quantidade"],["Açúcar","kg",""],["Sal","kg",2]]),XLSX);
 const result=excel.extract(wb.sheets[0]);
 assert.equal(result.rows.length,1);assert.equal(result.warnings.length,1);
});
test("não interpreta coluna desconhecida como quantidade",()=>{
 const wb=excel.inspectWorkbook(make("xlsx",[["Descrição","Unidade","Preço"],["Sal","kg",2]]),XLSX);
 assert.throws(()=>excel.extract(wb.sheets[0]),/Confira as colunas/);
});
test("recusa planilha sem itens válidos",()=>{
 const wb=excel.inspectWorkbook(make("xlsx",[["Produto","Unidade","Quantidade"],["Sal","kg","erro"]]),XLSX);
 assert.throws(()=>excel.extract(wb.sheets[0]),/Nenhum item/);
});
test("rejeita livro com limite de abas excedido",()=>{
 const wb=XLSX.utils.book_new();
 for(let i=0;i<31;i++)XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Item","Unidade","Quantidade"]]),"A"+i);
 assert.throws(()=>excel.inspectWorkbook(XLSX.write(wb,{type:"array",bookType:"xlsx"}),XLSX),/Quantidade de abas/);
});
test("recusa arquivo sem extensão Excel e arquivos enormes",async()=>{
 await assert.rejects(excel.readFile({name:"arquivo.csv",size:10},XLSX),/Selecione/);
 await assert.rejects(excel.readFile({name:"arquivo.xlsx",size:excel.MAX_BYTES+1},XLSX),/8 MB/);
});
test("leitura assíncrona de arquivo imitado aceita bytes xlsx",async()=>{
 const bytes=make("xlsx",data);
 const file={name:"pedido.xlsx",size:bytes.byteLength,arrayBuffer:async()=>bytes};
 const wb=await excel.readFile(file,XLSX);
 assert.equal(excel.extract(wb.sheets[0]).rows.length,2);
});
