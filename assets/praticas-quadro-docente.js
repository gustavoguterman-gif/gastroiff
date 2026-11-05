/* Quadro preparado pela Gestão, exclusivamente como prévia local.
 * Nunca constitui autorização para consultar dados de outro(a) docente.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.GASTROIFF_QUADRO_DOCENTE=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const REQUIRED=["cronograma","pedidoDocente","pedidoFornecedor","respostaFornecedor"];
 const label={cronograma:"Calendário e horários",pedidoDocente:"Pedido do(a) docente",
   pedidoFornecedor:"Pedido enviado ao fornecedor",respostaFornecedor:"Resposta do fornecedor",
   recebimentoFisico:"Recebimento físico"};
 const iso=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||"")&&Number.isFinite(Date.parse(s+"T12:00:00Z"))&&new Date(s+"T12:00:00Z").toISOString().slice(0,10)===s;
 function build(input,documents,compare,validation){
  if(typeof compare!=="function"||typeof validation!=="function")throw Error("Validação indisponível.");
  const {record,questions}=validation(input);
  const problems=[...questions];
  const docs=Array.isArray(documents)?documents:[];
  const sections={};
  const sourceNames={};
  for(const stage of [...REQUIRED,"recebimentoFisico"]){
   const group=docs.filter(d=>d?.stage===stage&&d.reviewed===true);
   sourceNames[stage]=group.map(d=>({arquivo:String(d.name||"Sem nome").slice(0,180),avisos:Array.isArray(d.warnings)?d.warnings.slice(0,20):[]}));
   sections[stage]=group.flatMap(d=>Array.isArray(d.rows)?d.rows:[]);
   if(REQUIRED.includes(stage)&&!group.length)problems.push("Falta conferir: "+label[stage]+".");
   if(REQUIRED.includes(stage)&&stage!=="cronograma"&&!sections[stage].length)
    problems.push("Falta lista estruturada com quantidades: "+label[stage]+".");
   if(group.some(d=>Array.isArray(d.warnings)&&d.warnings.length))
    problems.push("Revisar avisos de leitura: "+label[stage]+".");
  }
  if(docs.some(d=>!d?.reviewed))problems.push("Há documentos ainda sem aprovação da Gestão.");
  let items=[];
  if(!problems.length){
   try{
    items=compare({pedidoDocente:sections.pedidoDocente,pedidoFornecedor:sections.pedidoFornecedor,
     respostaFornecedor:sections.respostaFornecedor,recebimentoFisico:sections.recebimentoFisico});
   }catch(e){problems.push("Falha ao comparar quantidades: "+e.message)}
  }
  // A lista de confirmações precisa identificar cada insumo solicitado.
  // Ausência de resposta específica não significa fornecimento zero.
  const asked=items.filter(x=>x.solicitado>0);
  const noReply=asked.filter(x=>x.confirmado===null);
  if(noReply.length)problems.push(noReply.length+" insumo(s) solicitado(s) ainda sem confirmação individual do fornecedor.");
  const unresolved=Array.from(new Set(problems));
  const rows=items.map(x=>{
   const supply=x.confirmado===null?"Sem resposta registrada":
     x.confirmado===0?"Fornecedor informou que não fornecerá":
     x.confirmado<x.solicitado?"Confirmado parcialmente":"Confirmado integralmente";
   return {insumo:x.insumo,unidade:x.unidade,solicitado:x.solicitado,
    encaminhado:x.encaminhado,confirmado:x.confirmado,recebido:x.recebido,
    faltante:x.confirmado===null?null:Math.max(0,x.solicitado-x.confirmado),
    situacao:supply,atendimento:x.confirmado===null?"pendente":x.confirmado>=x.solicitado?"integral":x.confirmado===0?"indisponivel":"parcial"};
  });
  return {schema:1,identificacao:{docente:record.teacher,curso:record.course,disciplina:record.subject,
    inicio:record.start,fim:record.end,local:record.room,dias:record.weekdays,
    horarioInicial:record.timeStart,horarioFinal:record.timeEnd},
   documentos:sourceNames,insumos:rows,
   pendencias:unresolved,prontoParaRevisao:unresolved.length===0,
   acesso:"previsualizacao_administrativa_local",publicado:false,emailEnviado:false,
   aviso:"Esta prévia não autentica docentes, não é publicada e não comprova recebimento físico."};
 }
 function makeEmailDraft(snapshot,minusDays){
  if(!snapshot?.prontoParaRevisao)throw Error("Existem pendências que impedem a preparação do aviso.");
  const c=snapshot.identificacao;
  if(!iso(c.inicio))throw Error("Início do ciclo inválido.");
  const lines=snapshot.insumos.map(x=>
   x.insumo+" ("+x.unidade+"): solicitado "+x.solicitado+
   "; confirmado "+(x.confirmado===null?"sem resposta":x.confirmado)+
   "; não atendido "+(x.faltante===null?"a conferir":x.faltante)+
   "; recebido "+(x.recebido===null?"não informado":x.recebido));
  return {enviarEm:minusDays(c.inicio,7),enviado:false,
   assunto:"Início das práticas de "+c.disciplina+" em "+c.inicio,
   corpo:"Disciplina: "+c.disciplina+"\nCurso: "+c.curso+"\nInício: "+c.inicio+
    "\nTérmino: "+c.fim+"\nHorário: "+c.horarioInicial+" às "+c.horarioFinal+
    "\nLocal: "+c.local+"\n\nSituação informada pelo fornecedor:\n"+lines.join("\n")+
    "\n\nA confirmação do fornecedor não equivale ao recebimento físico. Esta é uma prévia para conferência; nenhuma mensagem foi enviada."};
 }
 return {REQUIRED,build,makeEmailDraft};
});
