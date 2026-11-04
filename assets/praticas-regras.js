/* Regras locais de validação. Nunca autentica ou envia dados da Gestão. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.GASTROIFF_PRATICAS_REGRAS=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const iso=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||""))return false;const d=new Date(s+"T12:00:00Z");return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;};
 const time=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s||"");
 const limit=s=>String(s??"").trim().slice(0,180);
 const stages=["cronograma","pedidoDocente","pedidoFornecedor","respostaFornecedor","recebimentoFisico"];
 function validate(input){
  const r={teacher:limit(input?.teacher),course:limit(input?.course),subject:limit(input?.subject),
   start:limit(input?.start),end:limit(input?.end),weekdays:Array.isArray(input?.weekdays)?input.weekdays.filter(n=>Number.isInteger(n)&&n>=0&&n<=6):[],
   timeStart:limit(input?.timeStart),timeEnd:limit(input?.timeEnd),room:limit(input?.room),email:limit(input?.email)};
  const errors=[];
  if(!r.teacher)errors.push("Qual é o(a) docente responsável pelo ciclo?");
  if(!r.course)errors.push("A qual curso pertence a disciplina?");
  if(!r.subject)errors.push("Qual é a disciplina do ciclo?");
  if(!iso(r.start))errors.push("Qual é a data inicial do ciclo?");
  if(!iso(r.end)||iso(r.start)&&r.end<r.start)errors.push("Qual é a data final correta do ciclo?");
  if(!r.weekdays.length)errors.push("Em quais dias da semana haverá aulas práticas?");
  if(!time(r.timeStart)||!time(r.timeEnd)||r.timeEnd<=r.timeStart)errors.push("Qual é o horário de início e término das aulas?");
  if(!r.room)errors.push("Qual é o laboratório ou local das aulas?");
  return {record:r,questions:errors};
 }
 function questions(record,documents){
  const q=[...validate(record).questions];
  const has=(stage)=>Array.isArray(documents)&&documents.some(d=>d.stage===stage&&d.reviewed===true);
  if(!has("cronograma"))q.push("Qual documento confirma os dias, horários e datas das práticas?");
  if(!has("pedidoDocente"))q.push("A lista de insumos solicitados pelo(a) docente foi recebida e conferida?");
  if(!has("pedidoFornecedor"))q.push("Qual lista a administração efetivamente encaminhou ao fornecedor?");
  if(!has("respostaFornecedor"))q.push("Qual resposta do fornecedor confirma quantidades atendidas, parciais e não atendidas?");
  if(!Array.isArray(documents)||documents.some(d=>d.stage==="respostaFornecedor"&&d.reviewed&&!d.rows?.length))
   q.push("As quantidades confirmadas pelo fornecedor estão discriminadas por item e unidade?");
  return [...new Set(q)];
 }
 function dateMinusDays(date,n){
  if(!iso(date)||!Number.isInteger(n))throw Error("Data inválida");
  const d=new Date(date+"T12:00:00Z");d.setUTCDate(d.getUTCDate()-n);
  return d.toISOString().slice(0,10);
 }
 function notification(record,docs,reference){
  const validated=validate(record); const required=questions(record,docs);
  const on=dateMinusDays(validated.record.start,7);
  const same=reference===on;
  return {date:on,due:same,canSend:false,ready:required.length===0,questions:required,
   label:same?"Aviso a preparar hoje":"Aviso previsto para "+on,
   reason:"Sem envio automático: falta autenticação institucional, contatos autorizados e serviço de mensagens configurado."};
 }
 function emailPreview(record,items){
  const v=validate(record);
  if(v.questions.length)throw Error("Informações do ciclo incompletas.");
  const lines=(items||[]).map(x=>String(x.insumo||"")+" ("+String(x.unidade||"")+") : solicitado "+String(x.solicitado??"sem informação")+", confirmado "+(x.confirmado===null?"sem resposta":x.confirmado)+", recebido "+(x.recebido===null?"a conferir":x.recebido));
  return "Assunto: Início do ciclo de "+v.record.subject+" em "+v.record.start+"\n\n"+
    "O ciclo da disciplina "+v.record.subject+" inicia em "+v.record.start+" e termina em "+v.record.end+
    ". Horário: "+v.record.timeStart+" às "+v.record.timeEnd+". Local: "+v.record.room+".\n"+
    "A seguir, a situação documentada dos insumos. Confirmação do fornecedor não equivale ao recebimento físico.\n"+
    (lines.length?lines.join("\n"):"Não há lista validada de fornecimento. Solicite conferência à coordenação.")+
    "\n\nEsta mensagem é uma prévia para conferência da coordenação. Não foi enviada.";
 }
 return {stages,validate,questions,dateMinusDays,notification,emailPreview};
});
