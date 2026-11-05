/* Ferramentas da Gestão protegida. Nunca coloca arquivos em páginas públicas.
 * Todas as decisões de acesso são novamente verificadas pela RLS do servidor.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.GASTROIFF_GESTAO_PRIVADA=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const TABLES={roles:"gastroiff_practice_roles",cycles:"gastroiff_practice_cycles",docs:"gastroiff_practice_documents",items:"gastroiff_practice_items"};
 const BUCKET="gastroiff-praticas-privado";
 const STAGES={cronograma:"cronograma",pedidoDocente:"pedido_docente",
  pedidoFornecedor:"pedido_fornecedor",respostaFornecedor:"resposta_fornecedor",
  recebimentoFisico:"recebimento_fisico"};
 const EXT={pdf:"application/pdf",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",
  xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",csv:"text/csv"};
 function fail(result,label){if(result?.error)throw Error(label+": "+result.error.message)}
 async function ensureManager(client){
  if(!client?.auth?.getUser||!client.from)throw Error("Acesso institucional indisponível");
  const current=await client.auth.getUser();
  const uid=current.data?.user?.id;
  if(current.error||!uid)throw Error("É necessário autenticar a Gestão");
  const role=await client.from(TABLES.roles).select("role").eq("user_id",uid).maybeSingle();
  fail(role,"Consulta do perfil");
  if(role.data?.role!=="gestao")throw Error("Perfil não autorizado para a Gestão");
  return uid;
 }
 async function staff(client){
  await ensureManager(client);
  const result=await client.from(TABLES.roles).select("user_id,role,display_name").eq("role","docente").order("display_name");
  fail(result,"Consulta de docentes");
  return (result.data||[]).filter(p=>p.role==="docente"&&typeof p.user_id==="string"&&p.user_id)
   .map(p=>({id:p.user_id,label:String(p.display_name||"Docente sem nome cadastrado").slice(0,140)}));
 }
 function cyclePayload(fields,teacherId,rules){
  if(typeof rules?.validate!=="function")throw Error("Regras de ciclo indisponíveis");
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(String(teacherId||"")))throw Error("Selecione um(a) docente autenticado(a)");
  const checked=rules.validate({...fields,teacher:teacherId});
  if(checked.questions.length)throw Error("Informações incompletas: "+checked.questions.join(" "));
  const c=checked.record;
  return {course:c.course,subject:c.subject,teacher_user_id:teacherId,
   starts_on:c.start,ends_on:c.end,weekdays:c.weekdays,begins_at:c.timeStart,ends_at:c.timeEnd,
   location:c.room,status:"rascunho"};
 }
 async function createCycle(client,teacherId,fields,rules){
  const uid=await ensureManager(client);
  const roster=await staff(client);
  if(!roster.some(p=>p.id===teacherId))throw Error("Docente não cadastrado no serviço protegido");
  const payload=cyclePayload(fields,teacherId,rules);
  const result=await client.from(TABLES.cycles).insert(payload).select("id,status,version").single();
  fail(result,"Registro do ciclo");
  if(!result.data?.id||result.data.status!=="rascunho")throw Error("Retorno inválido do registro do ciclo");
  return {id:result.data.id,status:result.data.status,version:result.data.version,createdBy:uid};
 }
 function inspectFile(file){
  const ext=String(file?.name||"").toLowerCase().split(".").pop();
  if(!Object.hasOwn(EXT,ext))throw Error("Formato não aceito. Use Excel, CSV, PDF ou imagem.");
  if(!(file.size>0&&file.size<=8*1024*1024))throw Error("Arquivo vazio ou acima de 8 MB.");
  if(file.type&&file.type!==EXT[ext]&&!(ext==="csv"&&file.type==="application/vnd.ms-excel"))
   throw Error("Formato do conteúdo não corresponde à extensão do arquivo.");
  return {extension:ext,contentType:EXT[ext]};
 }
 async function storeDocument(client,cycleId,stage,file,cryptoApi){
  const uid=await ensureManager(client);
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(String(cycleId||"")))throw Error("Ciclo inválido");
  if(!Object.hasOwn(STAGES,stage))throw Error("Tipo de documento inválido");
  const metadata=inspectFile(file);
  if(!cryptoApi?.subtle?.digest||!cryptoApi?.randomUUID)throw Error("Verificação de integridade indisponível");
  const raw=await file.arrayBuffer();
  const digest=await cryptoApi.subtle.digest("SHA-256",raw);
  const sha=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,"0")).join("");
  const path=cycleId+"/"+cryptoApi.randomUUID()+"."+metadata.extension;
  const upload=await client.storage.from(BUCKET).upload(path,file,{contentType:metadata.contentType,upsert:false});
  fail(upload,"Armazenamento privado");
  const list=await client.from(TABLES.docs).select("revision").eq("cycle_id",cycleId)
   .eq("kind",STAGES[stage]).order("revision",{ascending:false}).limit(1);
  if(list.error){
   await client.storage.from(BUCKET).remove([path]);throw Error("Falha ao consultar histórico de documentos");
  }
  const revision=Number(list.data?.[0]?.revision||0)+1;
  const document={
   cycle_id:cycleId,kind:STAGES[stage],filename:String(file.name||"Arquivo").slice(0,180),
   storage_path:path,sha256:sha,content_type:metadata.contentType,revision,reviewed:false,uploaded_by:uid
  };
  const result=await client.from(TABLES.docs).insert(document).select("id,cycle_id,kind,revision,reviewed").single();
  if(result.error||!result.data?.id){
   await client.storage.from(BUCKET).remove([path]);
   throw Error("Falha ao registrar documento: "+(result.error?.message||"retorno inválido"));
  }
  return {id:result.data.id,revision,reviewed:false,sha256:sha};
 }
 async function listCycles(client){
  await ensureManager(client);
  const result=await client.from(TABLES.cycles).select("id,subject,course,teacher_user_id,starts_on,ends_on,status,version")
   .order("starts_on",{ascending:false}).limit(100);
  fail(result,"Consulta dos ciclos");
  return result.data||[];
 }
 async function listDocuments(client,cycleId){
  await ensureManager(client);
  const result=await client.from(TABLES.docs)
   .select("id,cycle_id,kind,filename,revision,reviewed,reviewed_at,uploaded_at")
   .eq("cycle_id",cycleId).order("uploaded_at",{ascending:false}).limit(100);
  fail(result,"Consulta de documentos privados");
  return result.data||[];
 }
 async function reviewDocument(client,documentId){
  await ensureManager(client);
  if(!documentId)throw Error("Selecione o documento a revisar");
  const result=await client.rpc("gastroiff_review_document",{p_document:documentId});
  fail(result,"Revisão do documento");
  return true;
 }
 async function listItems(client,cycleId){
  await ensureManager(client);
  const result=await client.from(TABLES.items)
   .select("id,cycle_id,description,unit,requested,forwarded,confirmed,received,approved")
   .eq("cycle_id",cycleId).order("description");
  fail(result,"Consulta de insumos estruturados");
  return result.data||[];
 }
 function normalizedRows(rows){
  if(!Array.isArray(rows)||rows.length<1||rows.length>250)throw Error("Quantidade de insumos inválida");
  return rows.map((r,index)=>{
   const n=v=>{
    if(v===null||v===undefined||v==="")return null;
    const x=Number(v);if(!Number.isFinite(x)||x<0||x>99999999.9999)throw Error("Quantidade inválida na linha "+(index+1));
    return x;
   };
   const description=String(r.description??r.insumo??"").trim(),unit=String(r.unit??r.unidade??"").trim();
   const requested=n(r.requested??r.solicitado),forwarded=n(r.forwarded??r.encaminhado),
    confirmed=n(r.confirmed??r.confirmado),received=n(r.received??r.recebido);
   if(description.length<2||description.length>180||!unit||unit.length>32||requested===null||forwarded===null)
    throw Error("Insuficiência de dados da linha "+(index+1));
   return {description,unit,requested,forwarded,confirmed,received};
  });
 }
 async function saveReviewedItems(client,cycleId,responseId,items){
  await ensureManager(client);
  const payload=normalizedRows(items);
  const result=await client.rpc("gastroiff_save_practice_items",{
   p_cycle:cycleId,p_response_document:responseId,p_items:payload
  });
  fail(result,"Gravação dos insumos conferidos");
  return result.data;
 }
 async function approveCycle(client,cycleId){
  await ensureManager(client);
  const result=await client.rpc("gastroiff_approve_cycle",{p_cycle:cycleId});
  fail(result,"Aprovação do ciclo");
  return true;
 }

 return {TABLES,BUCKET,STAGES,ensureManager,staff,cyclePayload,createCycle,inspectFile,storeDocument,listCycles,listDocuments,reviewDocument,listItems,normalizedRows,saveReviewedItems,approveCycle};
});
