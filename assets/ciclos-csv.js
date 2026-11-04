/* GASTROIFF: leitura local de CSV exportado do Google Planilhas. Sem rede. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.GASTROIFF_CSV=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const MAX_BYTES=256*1024,MAX_ROWS=101;
 const REQUIRED=["id_ciclo","curso","disciplina","docente","inicio","fim","laboratorio","status_conferencia","data_conferencia","fonte"];
 function parseCsv(text){
  if(typeof text!=="string"||new TextEncoder().encode(text).length>MAX_BYTES)throw Error("O arquivo é muito grande.");
  text=text.replace(/^\uFEFF/,"");
  const first=text.split(/\r?\n/,1)[0]||"";
  const delimiter=first.includes(";")?";":",";
  let rows=[],row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i++){
   const ch=text[i],next=text[i+1];
   if(quoted){
    if(ch==='"'&&next==='"'){cell+='"';i++}
    else if(ch==='"')quoted=false;
    else cell+=ch;
   }else if(ch==='"'&&cell===""){quoted=true}
   else if(ch===delimiter){row.push(cell);cell=""}
   else if(ch==="\n"){row.push(cell.replace(/\r$/,""));rows.push(row);row=[];cell="";if(rows.length>MAX_ROWS)throw Error("O arquivo ultrapassa 100 registros.")}
   else cell+=ch;
  }
  if(quoted)throw Error("Aspas incompletas no arquivo CSV.");
  if(cell!==""||row.length){row.push(cell.replace(/\r$/,""));rows.push(row)}
  return rows.filter(row=>row.some(x=>String(x).trim()));
 }
 function parseCycles(text){
  const rows=parseCsv(text);if(rows.length<2)throw Error("A planilha precisa ter cabeçalho e pelo menos um ciclo.");
  const columns=rows[0].map(x=>x.trim().toLowerCase());
  if(REQUIRED.some(name=>!columns.includes(name)))throw Error("Cabeçalho incompatível. Exporte somente a aba Ciclos do modelo GASTROIFF.");
  const out=[];
  for(const [index,row] of rows.slice(1).entries()){
   const obj={};columns.forEach((key,i)=>obj[key]=String(row[i]||"").trim());
   if(!obj.id_ciclo||!obj.docente||!obj.disciplina||!obj.inicio||!obj.fim)throw Error("Linha "+(index+2)+": preencha os campos obrigatórios.");
   out.push(obj);
  }
  return out;
 }
 return {parseCsv,parseCycles,MAX_BYTES,REQUIRED};
});
