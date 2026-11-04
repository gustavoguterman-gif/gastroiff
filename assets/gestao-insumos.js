/* Conferência local. Não salva, publica ou transmite planilhas. */
(() => {
 "use strict";
 const stages=["pedidoDocente","pedidoFornecedor","respostaFornecedor","recebimentoFisico"];
 const state=Object.fromEntries(stages.map(key=>[key,{sheets:[],parsed:null}]));
 const $=id=>document.getElementById(id);
 const sections=Object.fromEntries(stages.map(key=>[key,document.querySelector('[data-stage="'+key+'"]')]));
 const msg=(key,value)=>{sections[key].querySelector(".status").textContent=value};
 function invalidate(){
  $("result").hidden=true;$("items").replaceChildren();
  $("compare").disabled=!state.pedidoDocente.parsed;
 }
 function showSheet(key){
  const current=state[key],select=sections[key].querySelector("select"),selected=select.value;
  current.parsed=null;invalidate();
  if(!current.sheets.length)return;
  try{
   const chosen=selected==="all"?current.sheets.filter(x=>x.sheet.detected?.score===3):
    current.sheets.filter((_,i)=>String(i)===selected);
   if(!chosen.length)throw Error("Nenhuma aba com três colunas reconhecidas. Escolha uma aba e confira o cabeçalho.");
   const rows=[],warnings=[];
   for(const entry of chosen){
    try{
     const parsed=window.GASTROIFF_EXCEL.extract(entry.sheet);
     rows.push(...parsed.rows);warnings.push(...parsed.warnings.map(x=>entry.file+": "+x));
    }catch(e){warnings.push(entry.file+" / "+entry.sheet.name+": "+e.message)}
   }
   if(!rows.length)throw Error("Nenhum item válido nas abas selecionadas. "+warnings.slice(0,2).join(" "));
   current.parsed={rows,warnings};
   msg(key,rows.length+" itens reconhecidos de "+chosen.length+" aba(s). "+
     (warnings.length?warnings.length+" avisos de revisão: "+warnings.slice(0,2).join(" "):"Confira os itens antes de comparar."));
  }catch(e){msg(key,"Não foi possível interpretar: "+e.message)}
  invalidate();
 }
 async function load(key,files){
  const select=sections[key].querySelector("select");
  state[key]={sheets:[],parsed:null};invalidate();select.disabled=true;select.replaceChildren();
  const fileList=Array.from(files||[]);
  if(!fileList.length){msg(key,"Nenhum arquivo selecionado.");return}
  if(fileList.length>20){msg(key,"Selecione no máximo 20 arquivos por etapa.");return}
  msg(key,"Lendo os arquivos localmente...");
  const errors=[];
  for(const file of fileList){
   try{
    const wb=await window.GASTROIFF_EXCEL.readFile(file,window.XLSX);
    wb.sheets.forEach(sheet=>state[key].sheets.push({sheet,file:file.name}));
   }catch(e){errors.push(file.name+": "+e.message)}
  }
  if(!state[key].sheets.length){msg(key,"Falha ao ler Excel: "+errors.join(" "));return}
  const all=document.createElement("option");all.value="all";all.textContent="Todas as abas com colunas reconhecidas";select.append(all);
  state[key].sheets.forEach((entry,i)=>{
   const opt=document.createElement("option");opt.value=String(i);
   opt.textContent=entry.file+" / "+entry.sheet.name+(entry.sheet.detected?.score===3?" (reconhecida)":" (conferir)");
   select.append(opt);
  });
  select.disabled=false;select.value="all";showSheet(key);
  if(errors.length)msg(key,sections[key].querySelector(".status").textContent+" Arquivos recusados: "+errors.join(" "));
 }
 for(const key of stages){
  const section=sections[key];
  section.querySelector("input").addEventListener("change",e=>load(key,e.target.files));
  section.querySelector("select").addEventListener("change",()=>showSheet(key));
 }
 $("compare").addEventListener("click",()=>{
  const data=Object.fromEntries(stages.map(key=>[key,state[key].parsed?.rows||[]]));
  if(!data.pedidoDocente.length)return;
  try{
   const result=window.GASTROIFF_CONCILIACAO.compare(data);
   const host=$("items");host.replaceChildren();
   for(const item of result){
    const tr=document.createElement("tr");
    const fields=[item.insumo,item.unidade,item.solicitado,item.encaminhado,item.confirmado,item.recebido,item.status];
    fields.forEach((value,index)=>{
     const td=document.createElement("td");
     td.textContent=value===null?"Sem informação":String(value);
     if(index>=2&&index<=5)td.className="num";
     tr.append(td);
    });host.append(tr);
   }
   $("summary").textContent=result.length+" itens na conferência. Revise as diferenças e as unidades antes de utilizar o resultado.";
   $("result").hidden=false;
  }catch(e){$("summary").textContent="Não foi possível comparar: "+e.message;$("result").hidden=true}
 });
 $("clear").addEventListener("click",()=>{
  for(const key of stages){
   state[key]={sheets:[],parsed:null};const section=sections[key];
   section.querySelector("input").value="";
   const select=section.querySelector("select");select.replaceChildren();select.disabled=true;
   msg(key,"Nenhum arquivo selecionado.");
  }
  $("summary").textContent="Adicione pelo menos o pedido docente para iniciar a comparação.";invalidate();
 });
})();
