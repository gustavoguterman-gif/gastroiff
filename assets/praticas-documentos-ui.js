/* Documentos e perguntas administrativos, apenas em memória durante esta sessão. */
(() => {
 "use strict";
 const $=id=>document.getElementById(id),rules=window.GASTROIFF_PRATICAS_REGRAS;
 const faculty=Array.isArray(window.GASTROIFF_FACULTY)?window.GASTROIFF_FACULTY:[];
 const teacher=$("p-teacher");
 for(const person of faculty.filter(x=>x?.name&&(x.full||x.name)).sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"))){
  const option=document.createElement("option");option.value=person.full||person.name;option.textContent=person.name;teacher.append(option);
 }
 const state={documents:[],pending:null};
 const input=()=>({
  teacher:teacher.value,course:$("p-course").value,subject:$("p-subject").value,
  room:$("p-room").value,start:$("p-start").value,end:$("p-end").value,
  timeStart:$("p-timeStart").value,timeEnd:$("p-timeEnd").value,
  weekdays:[...document.querySelectorAll("#p-weekdays input:checked")].map(x=>Number(x.value))
 });
 const append=(host,tag,value,css)=>{
  const el=document.createElement(tag);if(css)el.className=css;el.textContent=value;host.append(el);return el;
 };
 function update(){
  const list=$("p-documents");list.replaceChildren();
  state.documents.forEach((d,index)=>{
   const card=append(list,"article","", "entry");
   append(card,"strong",d.name+" · "+({cronograma:"Horários e ciclos",pedidoDocente:"Pedido docente",pedidoFornecedor:"Encaminhamento ao fornecedor",respostaFornecedor:"Resposta do fornecedor",recebimentoFisico:"Recebimento físico"}[d.stage]||d.stage));
   append(card,"p",d.rows?.length?d.rows.length+" insumos estruturados e conferidos.":"Texto registrado para conferência. Quantidades ainda dependem de planilha estruturada.");
   const button=append(card,"button","Retirar documento");
   button.type="button";button.addEventListener("click",()=>{state.documents.splice(index,1);update()});
  });
  const missing=rules.questions(input(),state.documents),host=$("p-questions");host.replaceChildren();
  if(!missing.length)append(host,"p","Os campos mínimos e os documentos foram conferidos. Confirme o conteúdo e as permissões antes de utilizar institucionalmente.");
  else missing.forEach(q=>append(host,"p",q,"entry"));
  const record=rules.validate(input()).record;
  if(record.start && /^\d{4}-\d{2}-\d{2}$/.test(record.start)){
   try{
    const n=rules.notification(record,state.documents,new Date().toLocaleDateString("en-CA"));
    $("p-notification").textContent="Data prevista da comunicação: "+n.date+". "+(n.ready?"Dados mínimos disponíveis para preparar a prévia.":"Informações pendentes: "+n.questions.length+".")+" Nenhum e-mail será enviado nesta versão.";
   }catch{ $("p-notification").textContent="Informe uma data válida de início para calcular o aviso." }
  }else $("p-notification").textContent="Informe a data de início para calcular a antecedência de sete dias.";
 }
 function abortPreview(){
  state.pending=null;$("p-preview").hidden=true;$("p-file").value="";
  $("p-extracted").value="";$("p-warnings").textContent="";
 }
 function libraries(){
  const pdfjs=window.pdfjsLib;
  if(pdfjs?.GlobalWorkerOptions)pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  return {XLSX:window.XLSX,excel:window.GASTROIFF_EXCEL,csv:window.GASTROIFF_CSV,pdfjs,ocr:window.Tesseract,canvasFactory:()=>document.createElement("canvas")};
 }
 $("p-file").addEventListener("change",async()=>{
  state.pending=null;$("p-preview").hidden=true;
  const file=$("p-file").files?.[0];
  if(!file)return;
  $("p-file-status").textContent="Interpretando documento localmente. Confira o resultado antes de aceitar.";
  try{
   const value=await window.GASTROIFF_DOCUMENTOS.read(file,$("p-stage").value,libraries());
   state.pending=value;
   $("p-extracted").value=value.text;
   $("p-warnings").textContent=value.warnings.length?value.warnings.join(" "):"Texto identificado automaticamente. Confira a origem, datas, quantidades e unidades.";
   $("p-preview").hidden=false;
   $("p-approve").disabled=value.warnings.some(x=>/lido parcialmente|sem texto legível|colunas .*não identificadas|nenhum item|Linha \d+:/.test(x));
   $("p-file-status").textContent="Arquivo lido localmente. Revise e registre a interpretação.";
  }catch(error){$("p-file-status").textContent="Falha ao interpretar arquivo: "+error.message;}
 });
 $("p-approve").addEventListener("click",()=>{
  if(!state.pending||$("p-approve").disabled)return;
  const item={...state.pending,text:$("p-extracted").value.trim(),reviewed:true};
  if(!item.text&&!item.rows.length)return;
  state.documents.push(item);
  abortPreview();
  $("p-file-status").textContent="Documento conferido na prévia local. Não foi publicado e não foi enviado.";
  update();
 });
 $("p-cancel").addEventListener("click",()=>{abortPreview();$("p-file-status").textContent="Leitura descartada."});
 $("p-check").addEventListener("click",update);
 for(const el of document.querySelectorAll(".panel input:not([type=file]),.panel select,#p-weekdays input"))el.addEventListener("change",update);
 function comparisons(){
  const result={};for(const stage of ["pedidoDocente","pedidoFornecedor","respostaFornecedor","recebimentoFisico"]){
   result[stage]=state.documents.filter(d=>d.stage===stage&&d.reviewed).flatMap(d=>d.rows||[]);
  }
  return result;
 }
 function eligibleRows(){
  const stages=["pedidoDocente","pedidoFornecedor","respostaFornecedor"];
  return stages.every(stage=>state.documents.some(d=>d.stage===stage&&d.reviewed&&d.rows?.length>0));
 }
 function compare(){
  const host=$("p-comparison");host.replaceChildren();
  if(!eligibleRows()){append(host,"p","Comparação bloqueada: faltam listas estruturadas e conferidas do pedido docente, envio ao fornecedor ou resposta do fornecedor. PDFs e imagens são prévias textuais e não confirmam quantidades.","warning");return null}
  try{
   const result=window.GASTROIFF_CONCILIACAO.compare(comparisons());
   const table=append(host,"table","");const heading=append(table,"thead",""),row=append(heading,"tr","");
   ["Insumo","Unidade","Solicitado","Encaminhado","Confirmado","Recebido","Situação"].forEach(k=>append(row,"th",k));
   const body=append(table,"tbody","");
   result.forEach(item=>{const tr=append(body,"tr","");[item.insumo,item.unidade,item.solicitado,item.encaminhado,item.confirmado,item.recebido,item.status].forEach(v=>append(tr,"td",v===null?"Sem informação":String(v)))});
   return result;
  }catch(error){append(host,"p","Não foi possível comparar as listas: "+error.message,"warning");return null}
 }
 $("p-compare").addEventListener("click",compare);
 function snapshot(){
  const result=window.GASTROIFF_QUADRO_DOCENTE.build(input(),state.documents,window.GASTROIFF_CONCILIACAO.compare,rules.validate);
  const host=$("p-snapshot");host.replaceChildren();
  append(host,"h3",result.identificacao.disciplina||"Disciplina ainda não identificada");
  append(host,"p",result.identificacao.docente||"Docente não informado");
  append(host,"p","Curso: "+(result.identificacao.curso||"A conferir")+" · Início: "+(result.identificacao.inicio||"A conferir")+" · Término: "+(result.identificacao.fim||"A conferir"));
  append(host,"p","Dias: "+(result.identificacao.dias.join(", ")||"A conferir")+" · Horário: "+(result.identificacao.horarioInicial||"A conferir")+" às "+(result.identificacao.horarioFinal||"A conferir")+" · Local: "+(result.identificacao.local||"A conferir"));
  if(result.insumos.length){
   const wrapper=append(host,"div","","tablewrap");
   const table=append(wrapper,"table","");
   const thead=append(table,"thead",""),tr=append(thead,"tr","");
   ["Insumo","Unidade","Solicitado","Confirmado","Não atendido","Recebido","Fornecimento"].forEach(v=>append(tr,"th",v));
   const body=append(table,"tbody","");
   result.insumos.forEach(item=>{
    const line=append(body,"tr","");
    [item.insumo,item.unidade,item.solicitado,item.confirmado,item.faltante,item.recebido,item.situacao].forEach(value=>append(line,"td",value===null?"Sem informação":String(value)));
   });
  }
  const pending=append(host,"section","","entry");
  append(pending,"h3",result.pendencias.length?"Questões pendentes":"Dados mínimos conferidos");
  if(result.pendencias.length)result.pendencias.forEach(q=>append(pending,"p",q));
  else append(pending,"p","Quadro local preparado. Sua disponibilização depende de autenticação, autorização e infraestrutura protegida.");
  $("p-snapshot-status").textContent=result.prontoParaRevisao?
   "Prévia preparada para revisão administrativa. Nenhum dado foi publicado.":"Prévia incompleta. Responda às perguntas antes de autorizar futura publicação.";
  window.dispatchEvent(new CustomEvent("gastroiff:preview-reviewed",{detail:result}));
  return result;
 }
 $("p-build-snapshot").addEventListener("click",snapshot);
 $("p-draft").addEventListener("click",()=>{
  const q=rules.questions(input(),state.documents);
  if(q.length||!eligibleRows()){$("p-email-preview").value="Prévia bloqueada. Responda às pendências e confirme as três listas de insumos.";return}
  const items=compare();if(!items)return;
  $("p-email-preview").value=rules.emailPreview(input(),items);
 });
 $("p-reset").addEventListener("click",()=>{
  if(!confirm("Descartar todos os documentos desta conferência local?"))return;
  state.documents=[];abortPreview();$("p-email-preview").value="";update();
 });
 update();
})();
