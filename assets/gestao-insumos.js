/* Conferência local. Não salva, publica ou transmite planilhas. */
(() => {
 "use strict";
 const stages=["pedidoDocente","pedidoFornecedor","respostaFornecedor","recebimentoFisico"];
 const state=Object.fromEntries(stages.map(key=>[key,{sheet:null,parsed:null}]));
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
  if(!current.sheet)return;
  try{
   const sheet=current.sheet.sheets[Number(selected)];
   if(!sheet)throw Error("Aba não encontrada.");
   const parsed=window.GASTROIFF_EXCEL.extract(sheet);
   current.parsed=parsed;
   msg(key,"Aba "+sheet.name+": "+parsed.rows.length+" itens reconhecidos. "+
     (parsed.warnings.length?parsed.warnings.length+" linhas precisam de revisão: "+parsed.warnings.slice(0,3).join(" "):"Confira os itens antes de comparar."));
  }catch(e){msg(key,"Não foi possível interpretar a aba: "+e.message)}
  invalidate();
 }
 async function load(key,file){
  const select=sections[key].querySelector("select");
  state[key]={sheet:null,parsed:null};invalidate();select.disabled=true;select.replaceChildren();
  if(!file){msg(key,"Nenhum arquivo selecionado.");return}
  msg(key,"Lendo arquivo localmente...");
  try{
   const wb=await window.GASTROIFF_EXCEL.readFile(file,window.XLSX);
   state[key].sheet=wb;
   wb.sheets.forEach((sheet,i)=>{
    const opt=document.createElement("option");opt.value=String(i);
    opt.textContent=sheet.name+" ("+sheet.rows+" linhas"+(sheet.detected?", cabeçalho localizado":"")+ ")";
    select.append(opt);
   });
   select.disabled=false;
   const recommended=wb.sheets.findIndex(s=>s.detected?.score===3);
   if(recommended>=0)select.value=String(recommended);
   showSheet(key);
  }catch(e){msg(key,"Falha ao ler Excel: "+e.message)}
 }
 for(const key of stages){
  const section=sections[key];
  section.querySelector("input").addEventListener("change",e=>load(key,e.target.files[0]));
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
   state[key]={sheet:null,parsed:null};const section=sections[key];
   section.querySelector("input").value="";
   const select=section.querySelector("select");select.replaceChildren();select.disabled=true;
   msg(key,"Nenhum arquivo selecionado.");
  }
  $("summary").textContent="Adicione pelo menos o pedido docente para iniciar a comparação.";invalidate();
 });
})();
