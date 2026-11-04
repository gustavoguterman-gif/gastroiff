/* Importacao local de insumos. Nenhuma atualizacao institucional automatica. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object" && module.exports) module.exports=api;
  root.GASTROIFF_INSUMOS=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const HEADERS=["id_item","id_ciclo","insumo_ou_material","quantidade","unidade","situacao","previsao_entrega","recebido_em","atualizado_em","fonte"];
  const MAX_BYTES=256*1024, MAX_ROWS=100;
  function validDate(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
    const d=new Date(value+"T12:00:00Z");
    return Number.isFinite(d.valueOf()) && d.toISOString().slice(0,10)===value;
  }
  function parseCsv(input){
    if(typeof input!=="string" || new TextEncoder().encode(input).length>MAX_BYTES)throw Error("CSV invalido ou maior que 256 KB.");
    const text=input.replace(/^\uFEFF/,"");
    const delimiter=(text.split(/\r?\n/,1)[0]||"").includes(";")?";":",";
    const rows=[];let row=[],value="",quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(quoted){
        if(ch==='"' && text[i+1]==='"'){value+='"';i++}
        else if(ch==='"')quoted=false;
        else value+=ch;
      }else if(ch==='"' && value==="")quoted=true;
      else if(ch===delimiter){row.push(value);value=""}
      else if(ch==="\n"){
        row.push(value.replace(/\r$/,""));rows.push(row);row=[];value="";
        if(rows.length>MAX_ROWS+1)throw Error("Limite de 100 insumos excedido.");
      }else value+=ch;
    }
    if(quoted)throw Error("Aspas incompletas.");
    if(value!=="" || row.length){row.push(value.replace(/\r$/,""));rows.push(row)}
    return rows.filter(r=>r.some(v=>String(v).trim()));
  }
  function parseSupplies(text){
    const rows=parseCsv(text);
    if(rows.length<2 || rows.length>MAX_ROWS+1)throw Error("Arquivo deve conter de 1 a 100 insumos.");
    const headers=rows[0].map(x=>x.trim().toLowerCase());
    if(headers.length!==HEADERS.length || new Set(headers).size!==HEADERS.length || HEADERS.some(h=>!headers.includes(h)))
      throw Error("Cabecalho incompativel com a aba Insumos.");
    const ids=new Set();
    return rows.slice(1).map((row,index)=>{
      const line=index+2;
      if(row.length!==headers.length)throw Error("Linha "+line+": colunas inconsistentes.");
      const item={};headers.forEach((header,i)=>item[header]=String(row[i]??"").trim());
      for(const key of ["id_item","id_ciclo","insumo_ou_material","quantidade","unidade","situacao"])
        if(!item[key])throw Error("Linha "+line+": campo obrigatorio ausente.");
      if(ids.has(item.id_item))throw Error("Linha "+line+": identificador duplicado.");
      ids.add(item.id_item);
      if(!/^\d+(?:[.,]\d+)?$/.test(item.quantidade) || Number(item.quantidade.replace(",","."))<=0)
        throw Error("Linha "+line+": quantidade invalida.");
      for(const key of ["previsao_entrega","recebido_em","atualizado_em"])
        if(item[key] && !validDate(item[key]))throw Error("Linha "+line+": data invalida em "+key+".");
      const demonstracao=/^TESTE-/i.test(item.id_item) || /^TESTE-/i.test(item.id_ciclo) || /DADOS FICT[IÍ]CIOS/i.test(item.fonte);
      const origemDocumentada=!demonstracao && !!item.atualizado_em && !!item.fonte;
      return {...item,demonstracao,origem_documentada:origemDocumentada};
    });
  }
  return {parseSupplies,HEADERS,MAX_BYTES};
});
