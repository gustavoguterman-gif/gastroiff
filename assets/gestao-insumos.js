/* Conferência administrativa local e reversível: não transmite arquivos. */
(() => {
 "use strict";
 const stages=["pedidoDocente","pedidoFornecedor","respostaFornecedor","recebimentoFisico"];
 const state=Object.fromEntries(stages.map(key=>[key,{sheets:[],parsed:null,errors:[],overrides:{},ready:false}]));
 const $=id=>document.getElementById(id);
 const sections=Object.fromEntries(stages.map(key=>[key,document.querySelector('[data-stage="'+key+'"]')]));
 const msg=(key,value)=>{sections[key].querySelector(".status").textContent=value};
 function invalidate(){
  $("result").hidden=true;$("items").replaceChildren();
  $("compare").disabled=!state.pedidoDocente.ready||stages.some(k=>state[k].sheets.length>0&&!state[k].ready);
 }
 function setOptions(select,values,selected){
  select.replaceChildren();
  values.forEach(([value,label])=>{
   const opt=document.createElement("option");opt.value=value;opt.textContent=label;select.append(opt);
  });
  if(selected!==undefined)select.value=String(selected);
 }
 function configureMapping(key){
  const current=state[key],section=sections[key],selected=section.querySelector(".sheet-select").value;
  const editor=section.querySelector(".mapping");
  editor.hidden=true;
  const entry=current.sheets[Number(selected)];
  if(selected==="all"||!entry)return;
  const sheet=entry.sheet,override=current.overrides[selected],detected=sheet.detected;
  const rowIndex=override?.headerRow??detected?.headerRow??0;
  const rowSelect=section.querySelector(".header-row");
  setOptions(rowSelect,sheet.matrix.slice(0,Math.min(sheet.matrix.length,30)).map((row,i)=>[String(i),"Linha "+(i+1)+": "+row.slice(0,5).join(" | ").slice(0,95)]),rowIndex);
  const mapping=override?.maps??detected?.maps??{};
  for(const field of ["insumo","unidade","quantidade"]){
   const select=section.querySelector(".map-"+field);
   const cols=Array.from({length:Math.min(60,Math.max(1,...sheet.matrix.slice(0,30).map(r=>r.length)))},(_,i)=>[String(i),"Coluna "+(i+1)+": "+String((sheet.matrix[rowIndex]||[])[i]??"").slice(0,65)]);
   setOptions(select,[["","Escolha uma coluna"],...cols],mapping[field]===undefined?"":mapping[field]);
  }
  editor.hidden=false;
 }
 function review(key){
  const current=state[key],section=sections[key],selected=section.querySelector(".sheet-select").value;
  current.parsed=null;current.ready=false;invalidate();configureMapping(key);
  if(!current.sheets.length)return;
  const chosen=selected==="all"?current.sheets.map((entry,i)=>({entry,i})).filter(({entry,i})=>entry.sheet.detected?.score===3||current.overrides[i]):
   current.sheets.map((entry,i)=>({entry,i})).filter(({i})=>String(i)===selected);
  if(!chosen.length){msg(key,"Nenhuma aba reconhecida. Selecione uma aba e defina as colunas.");return}
  const rows=[],warnings=[];
  for(const {entry,i} of chosen){
   try{
    const parsed=window.GASTROIFF_EXCEL.extract(entry.sheet,current.overrides[i]);
    rows.push(...parsed.rows.map(r=>({...r,arquivo:entry.file})));
    warnings.push(...parsed.warnings.map(w=>entry.file+" / "+entry.sheet.name+": "+w));
   }catch(error){warnings.push(entry.file+" / "+entry.sheet.name+": "+error.message)}
  }
  current.parsed={rows,warnings};
  // Uma extração parcial nunca deve fundamentar uma conclusão sobre fornecimento.
  current.ready=rows.length>0&&warnings.length===0&&current.errors.length===0&&(selected!=="all"||chosen.length===current.sheets.length);
  const ignored=current.sheets.length-chosen.length;
  let report=rows.length+" item(ns) lido(s) em "+chosen.length+" aba(s).";
  if(ignored)report+=" "+ignored+" aba(s) não reconhecida(s). Para comparar, revise as colunas ou selecione uma aba específica.";
  if(current.errors.length)report+=" Arquivo(s) recusado(s): "+current.errors.join(" ");
  if(warnings.length)report+=" "+warnings.length+" inconsistência(s): "+warnings.slice(0,5).join(" ");
  report+=current.ready?" Conferência pronta para comparação.":" Comparação bloqueada até corrigir os problemas.";
  msg(key,report);invalidate();
 }
 async function load(key,files){
  const section=sections[key],sheetSelect=section.querySelector(".sheet-select");
  state[key]={sheets:[],parsed:null,errors:[],overrides:{},ready:false};
  invalidate();section.querySelector(".mapping").hidden=true;sheetSelect.disabled=true;sheetSelect.replaceChildren();
  const selectedFiles=Array.from(files||[]);
  if(!selectedFiles.length){msg(key,"Nenhum arquivo selecionado.");return}
  if(selectedFiles.length>20){msg(key,"Selecione no máximo 20 arquivos por etapa.");return}
  msg(key,"Conferindo os arquivos Excel localmente...");
  for(const file of selectedFiles){
   try{
    const wb=await window.GASTROIFF_EXCEL.readFile(file,window.XLSX);
    for(const sheet of wb.sheets)state[key].sheets.push({sheet,file:file.name});
   }catch(error){state[key].errors.push(file.name+": "+error.message)}
  }
  if(!state[key].sheets.length){msg(key,"Nenhuma planilha válida: "+state[key].errors.join(" "));return}
  setOptions(sheetSelect,[["all","Todas as abas reconhecidas"],...state[key].sheets.map((entry,i)=>[String(i),entry.file+" / "+entry.sheet.name+(entry.sheet.detected?.score===3?" (identificada)":" (revisar colunas)")])],"all");
  sheetSelect.disabled=false;review(key);
 }
 for(const key of stages){
  const section=sections[key];
  section.querySelector("input[type=file]").addEventListener("change",e=>load(key,e.target.files));
  section.querySelector(".sheet-select").addEventListener("change",()=>review(key));
  section.querySelector(".header-row").addEventListener("change",()=>{
   const index=section.querySelector(".sheet-select").value;
   const row=Number(section.querySelector(".header-row").value);
   const overrides=state[key].overrides[index]||{};
   overrides.headerRow=row;
   overrides.maps={};
   state[key].overrides[index]=overrides;
   review(key);
  });
  section.querySelector(".mapping-apply").addEventListener("click",()=>{
   const index=section.querySelector(".sheet-select").value;
   if(index==="all")return;
   const maps={};
   for(const field of ["insumo","unidade","quantidade"]){
    const value=section.querySelector(".map-"+field).value;
    if(value===""){msg(key,"Defina as três colunas antes de aplicar.");state[key].ready=false;invalidate();return}
    maps[field]=Number(value);
   }
   if(new Set(Object.values(maps)).size!==3){msg(key,"Selecione colunas diferentes para descrição, unidade e quantidade.");state[key].ready=false;invalidate();return}
   state[key].overrides[index]={headerRow:Number(section.querySelector(".header-row").value),maps};
   review(key);
  });
 }
 $("compare").addEventListener("click",()=>{
  if($("compare").disabled)return;
  const data=Object.fromEntries(stages.map(key=>[key,state[key].parsed?.rows||[]]));
  try{
   const result=window.GASTROIFF_CONCILIACAO.compare(data);
   $("items").replaceChildren();
   for(const item of result){
    const tr=document.createElement("tr");
    [item.insumo,item.unidade,item.solicitado,item.encaminhado,item.confirmado,item.recebido,item.status].forEach((v,index)=>{
     const td=document.createElement("td");td.textContent=v===null?"Sem informação":String(v);
     if(index>=2&&index<=5)td.className="num";
     tr.append(td);
    });$("items").append(tr);
   }
   $("summary").textContent=result.length+" item(ns) comparado(s). Resultado demonstrativo, sem publicação institucional.";
   $("result").hidden=false;
  }catch(error){$("summary").textContent="Falha na comparação: "+error.message;$("result").hidden=true}
 });
 $("clear").addEventListener("click",()=>{
  for(const key of stages){
   state[key]={sheets:[],parsed:null,errors:[],overrides:{},ready:false};
   const section=sections[key];section.querySelector("input[type=file]").value="";
   const select=section.querySelector(".sheet-select");select.replaceChildren();select.disabled=true;
   section.querySelector(".mapping").hidden=true;msg(key,"Nenhum arquivo selecionado.");
  }
  $("summary").textContent="Adicione pelo menos o pedido docente para iniciar a comparação.";invalidate();
 });
})();
