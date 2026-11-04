/* Leitura de Excel no navegador, sem upload. Dependência SheetJS 0.20.3. */
(function(root,factory){
 const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;
 root.GASTROIFF_EXCEL=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const MAX_BYTES=8*1024*1024,MAX_ROWS=3000,MAX_SHEETS=30;
 const normalize=x=>String(x??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
 const names={
  insumo:["insumo","insumos","produto","material","descricao","descricaoitem","ingrediente","item","especificacao","nomedoitem"],
  unidade:["unidade","unid","und","un","u m","medida","unidadedemedida"],
  quantidade:["quantidade","quant","qtd","qtde","quantidadesolicitada","qtdsolicitada","quantidadetotal","quantidadeenviada","quantidadeconfirmada","qtdconfirmada","qtdefornecida","quantidadefornecida"],
  codigo:["codigo","cod","codigoproduto","codigoitem","iditem"],
  observacao:["observacao","observacoes","justificativa","situacao","status","informacao","comentario"]
 };
 function field(value){
  const n=normalize(value);return Object.entries(names).find(([,variants])=>variants.some(v=>normalize(v)===n))?.[0]||null;
 }
 function detect(matrix){
  let best=null;
  for(let i=0;i<Math.min(matrix.length,30);i++){
   const cells=(matrix[i]||[]).map(field);
   const maps={};
   cells.forEach((name,col)=>{if(name&&!Object.hasOwn(maps,name))maps[name]=col});
   const score=["insumo","unidade","quantidade"].filter(k=>Object.hasOwn(maps,k)).length;
   if(score>=2&&(!best||score>best.score))best={headerRow:i,maps,score};
   if(score===3)break;
  }
  return best;
 }
 function inspectWorkbook(buffer,XLSX){
  if(!XLSX?.read||!XLSX?.utils?.sheet_to_json)throw Error("Leitor Excel não carregado.");
  const wb=XLSX.read(buffer,{type:"array",cellFormula:false,cellHTML:false,cellStyles:false,cellDates:false,bookVBA:false});
  if(!wb.SheetNames.length||wb.SheetNames.length>MAX_SHEETS)throw Error("Quantidade de abas não permitida.");
  const sheets=wb.SheetNames.map(name=>{
   const matrix=XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,raw:false,defval:"",blankrows:false});
   if(matrix.length>MAX_ROWS)throw Error("A aba "+name+" ultrapassa o limite de linhas.");
   return {name,matrix,detected:detect(matrix),rows:matrix.length};
  });
  return {sheets};
 }
 function extract(sheet,overrides){
  const headerRow=overrides?.headerRow??sheet.detected?.headerRow;
  const maps=overrides?.maps??sheet.detected?.maps;
  if(!Number.isInteger(headerRow)||headerRow<0||!maps||!["insumo","unidade","quantidade"].every(k=>Number.isInteger(maps[k])&&maps[k]>=0))throw Error("Confira as colunas de descrição, unidade e quantidade.");
  const warnings=[],rows=[];
  for(let i=headerRow+1;i<sheet.matrix.length;i++){
   const cells=sheet.matrix[i],value=k=>String(cells[maps[k]]??"").trim();
   const insumo=value("insumo"),unidade=value("unidade"),quantidade=value("quantidade");
   if(!insumo&&!unidade&&!quantidade)continue;
   if(!insumo||!unidade||!quantidade){warnings.push("Linha "+(i+1)+": descrição, unidade ou quantidade ausente.");continue}
   const cleaned=quantidade.replace(/\s+/g,"");
   if(!/^\d+(?:[.,]\d+)?$/.test(cleaned)||Number(cleaned.replace(",","."))<0){warnings.push("Linha "+(i+1)+": quantidade não reconhecida.");continue}
   rows.push({insumo,unidade,quantidade:cleaned,codigo:maps.codigo===undefined?"":value("codigo"),
    observacao:maps.observacao===undefined?"":value("observacao"),aba:sheet.name,linha:i+1});
  }
  if(!rows.length)throw Error("Nenhum item válido encontrado na aba selecionada.");
  return {rows,warnings,headerRow,maps};
 }
 async function readFile(file,XLSX){
  if(!file||!(/\.xlsx?$/i).test(file.name))throw Error("Selecione um arquivo .xlsx ou .xls.");
  if(file.size>MAX_BYTES||file.size===0)throw Error("O arquivo deve ter de 1 byte a 8 MB.");
  const buffer=await file.arrayBuffer();
  return inspectWorkbook(buffer,XLSX);
 }
 return {readFile,inspectWorkbook,extract,detect,field,MAX_BYTES};
});
