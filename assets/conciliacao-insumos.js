/* Núcleo puro de conciliação dos três momentos do pedido, sem publicar dados. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.GASTROIFF_CONCILIACAO=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const normalize=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 const number=v=>{
  const s=String(v??"").trim().replace(/\s/g,"");
  if(!s||!/^(?:\d+(?:[.,]\d+)?)$/.test(s))throw Error("Quantidade inválida: "+s);
  const n=Number(s.replace(",","."));
  if(!Number.isFinite(n)||n<0)throw Error("Quantidade inválida");
  return n;
 };
 function key(item){
  const id=normalize(item.codigo||"");
  if(id)return "codigo:"+id+"|"+normalize(item.unidade);
  return "item:"+normalize(item.insumo||item.descricao||item.item)+"|"+normalize(item.unidade);
 }
 function collect(rows,source){
  if(!Array.isArray(rows))throw Error("Planilha inválida");
  if(rows.length>5000)throw Error("A planilha excede 5000 itens");
  const out=new Map();
  for(const [index,item] of rows.entries()){
   const description=String(item.insumo||item.descricao||item.item||"").trim();
   const unit=String(item.unidade||"").trim();
   if(!description||!unit)throw Error(source+" linha "+(index+2)+": descrição ou unidade ausente");
   const k=key(item),qty=number(item.quantidade);
   if(out.has(k)){
    const prev=out.get(k);
    if(normalize(prev.insumo)!==normalize(description))throw Error("Código conflitante: "+k);
    prev.quantidade=+(prev.quantidade+qty).toFixed(4);
    prev.linhas.push(index+2);
   } else out.set(k,{chave:k,insumo:description,unidade:unit,quantidade:qty,linhas:[index+2]});
  }
  return out;
 }
 function compare({pedidoDocente,pedidoFornecedor,respostaFornecedor,recebimentoFisico}){
  const requested=collect(pedidoDocente||[],"Pedido docente");
  const sent=collect(pedidoFornecedor||[],"Pedido ao fornecedor");
  const confirmed=collect(respostaFornecedor||[],"Resposta do fornecedor");
  const received=collect(recebimentoFisico||[],"Recebimento físico");
  const keys=new Set([...requested.keys(),...sent.keys(),...confirmed.keys(),...received.keys()]);
  return [...keys].map(k=>{
   const d=requested.get(k),s=sent.get(k),c=confirmed.get(k),r=received.get(k);
   const asked=d?.quantidade??0,forwarded=s?.quantidade??null,reply=c?.quantidade??null,physical=r?.quantidade??null;
   const issue=forwarded===null?"pedido ao fornecedor não informado":forwarded<asked?"pedido parcialmente encaminhado":null;
   const supply=reply===null?"sem resposta registrada":reply===0?"fornecedor informou indisponibilidade":reply<asked?"fornecimento parcial":"fornecimento integral";
   const status=physical!==null?(physical>=asked?"recebido integralmente":"recebido parcialmente"):supply;
   return {chave:k,insumo:d?.insumo||s?.insumo||c?.insumo||r?.insumo,unidade:d?.unidade||s?.unidade||c?.unidade||r?.unidade,
    solicitado:asked,encaminhado:forwarded,confirmado:reply,recebido:physical,
    faltaConfirmar:reply===null?null:Math.max(asked-reply,0),
    faltaReceber:physical===null?null:Math.max(asked-physical,0),
    status,pendenciaEncaminhamento:issue,semPedidoDocente:!d,divergenciaFornecedor:reply!==null&&forwarded!==null&&reply>forwarded};
  }).sort((a,b)=>a.insumo.localeCompare(b.insumo,"pt-BR"));
 }
 return {compare,normalize,key,number};
});
