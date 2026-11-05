/* Gestão privada. Prévia local acima não envia dados automaticamente.
 * A autorização e o acesso aos arquivos são conferidos também pelo servidor.
 */
(function(){
 "use strict";
 const root=document.querySelector("[data-gestao-privada]");
 if(!root)return;
 const cfg=window.GASTROIFF_PRATICAS_CONFIG;
 const access=window.GASTROIFF_ACESSO_PRATICAS;
 const api=window.GASTROIFF_GESTAO_PRIVADA;
 const q=id=>document.getElementById(id);
 const status=root.querySelector("[data-manager-status]");
 const form=root.querySelector("[data-manager-form]");
 const area=root.querySelector("[data-manager-content]");
 let client=null;
 let cycles=[];
 let documents=[];
 let preview=null;
 const msg=v=>{status.textContent=v};
 function hidePrivate(){
  area.hidden=true;area.querySelectorAll("select").forEach(s=>{if(s.id==="g-auth-teacher"||s.id==="g-secure-cycle")s.replaceChildren(new Option("Selecione",""))});
  q("g-secure-file").value="";q("g-confirm-file").checked=false;
  preview=null;
  q("g-review-snapshot").textContent="Nenhuma prévia de insumos conferida nesta sessão.";
  q("g-save-items").disabled=true;
  q("g-document-overview").replaceChildren();
 }
 function fields(){
  return {course:q("p-course").value,subject:q("p-subject").value,room:q("p-room").value,
   start:q("p-start").value,end:q("p-end").value,timeStart:q("p-timeStart").value,
   timeEnd:q("p-timeEnd").value,
   weekdays:[...document.querySelectorAll("#p-weekdays input:checked")].map(n=>Number(n.value))};
 }
 function options(select,placeholder,rows,selected){
  select.replaceChildren(new Option(placeholder,""));
  rows.forEach(x=>select.add(new Option(x.label,x.id)));
  if(selected&&rows.some(x=>x.id===selected))select.value=selected;
 }
 async function loadCycles(preferred){
  const rows=await api.listCycles(client);
  cycles=rows;
  options(q("g-secure-cycle"),"Selecione um ciclo registrado",rows.map(x=>({
   id:x.id,label:x.subject+" · "+x.starts_on+" · "+x.status
  })),preferred||q("g-secure-cycle").value);
 }
 async function refresh(){
  hidePrivate();form.hidden=true;
  if(!client){msg("Serviço não configurado.");return}
  try{
   await api.ensureManager(client);
   const roster=await api.staff(client);
   options(q("g-auth-teacher"),"Selecione docente cadastrado(a)",roster.map(x=>({id:x.id,label:x.label})));
   await loadCycles();
   area.hidden=false;
   msg("Gestão autenticada. Arquivos só serão gravados após a sua ação explícita.");
   if(!roster.length)msg("Gestão autenticada. Nenhum(a) docente foi provisionado(a) por administrador.");
  }catch(e){
   hidePrivate();form.hidden=false;
   msg(e.message==="É necessário autenticar a Gestão"?
    "Acesse usando o e-mail previamente autorizado da Gestão.":"Acesso privado indisponível: "+e.message);
  }
 }
 function start(config,factory){
  hidePrivate();form.hidden=true;
  if(!access?.configValid(config)){
   msg("Armazenamento institucional ainda não ativado. O cadastro demonstrativo acima funciona apenas localmente.");
   return false;
  }
  if(typeof factory!=="function"){msg("Serviço de autenticação indisponível.");return false}
  client=factory(config.supabaseUrl,config.supabasePublishableKey,{auth:{
   autoRefreshToken:true,persistSession:true,detectSessionInUrl:true
  }});
  refresh();return true;
 }
 form.addEventListener("submit",async e=>{
  e.preventDefault();if(!client)return;
  const email=q("g-manager-email").value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){msg("Informe e-mail válido.");return}
  msg("Solicitando acesso institucional...");
  const result=await client.auth.signInWithOtp({email,options:{
   emailRedirectTo:location.origin+location.pathname,shouldCreateUser:false
  }});
  msg(result.error?"O acesso não pôde ser solicitado. Confirme seu cadastro com o administrador.":"Se o e-mail estiver autorizado, consulte a caixa de entrada.");
 });
 q("g-save-cycle").addEventListener("click",async()=>{
  if(!client||area.hidden)return;
  q("g-save-cycle").disabled=true;msg("Validando e gravando ciclo...");
  try{
   const result=await api.createCycle(client,q("g-auth-teacher").value,fields(),window.GASTROIFF_PRATICAS_REGRAS);
   await loadCycles(result.id);
   msg("Ciclo registrado como rascunho privado. Nenhuma informação foi publicada para docentes.");
  }catch(e){msg("Não foi possível registrar o ciclo: "+e.message)}
  finally{q("g-save-cycle").disabled=false}
 });
 q("g-refresh-cycles").addEventListener("click",async()=>{
  if(!client||area.hidden)return;
  try{await loadCycles();msg("Ciclos atualizados.");}catch(e){msg("Falha ao atualizar ciclos: "+e.message)}
 });
 q("g-upload-document").addEventListener("click",async()=>{
  if(!client||area.hidden)return;
  const file=q("g-secure-file").files?.[0];
  const cycle=q("g-secure-cycle").value;
  if(!cycle||!file){msg("Selecione um ciclo e um arquivo.");return}
  if(!q("g-confirm-file").checked){msg("Confirme que verificou a origem do documento.");return}
  q("g-upload-document").disabled=true;msg("Enviando arquivo ao armazenamento privado...");
  try{
   const result=await api.storeDocument(client,cycle,q("g-secure-kind").value,file,window.crypto);
   msg("Documento privado registrado, revisão "+result.revision+". Ele ainda não foi aprovado nem publicado.");
   await refreshDocuments();
   q("g-secure-file").value="";q("g-confirm-file").checked=false;
  }catch(e){msg("Falha no envio privado: "+e.message)}
  finally{q("g-upload-document").disabled=false}
 });
 async function refreshDocuments(){
  const cycleId=q("g-secure-cycle").value;
  documents=[];
  options(q("g-choose-document"),"Selecione documento para revisão",[]);
  options(q("g-review-source"),"Selecione resposta conferida",[]);
  q("g-document-overview").replaceChildren();
  if(!client||area.hidden||!cycleId)return;
  documents=await api.listDocuments(client,cycleId);
  const label=x=>x.filename+" · revisão "+x.revision+" · "+(x.reviewed?"Conferido":"Pendente");
  options(q("g-choose-document"),"Selecione documento para revisão",documents.map(x=>({id:x.id,label:label(x)})));
  options(q("g-review-source"),"Selecione resposta conferida",
   documents.filter(x=>x.kind==="resposta_fornecedor"&&x.reviewed).map(x=>({id:x.id,label:label(x)})));
  const overview=q("g-document-overview");
  for(const d of documents){
   const item=document.createElement("p");item.className="entry";
   item.textContent=d.kind+" · "+label(d);
   overview.append(item);
  }
  const items=await api.listItems(client,cycleId);
  const count=document.createElement("p");count.className="muted";
  count.textContent="Insumos estruturados gravados: "+items.length+
   ". Aprovados: "+items.filter(x=>x.approved).length+
   ". Itens com resposta pendente: "+items.filter(x=>x.confirmed===null).length+".";
  overview.append(count);
 }
 q("g-secure-cycle").addEventListener("change",async()=>{
  preview=null;q("g-save-items").disabled=true;
  q("g-review-snapshot").textContent="Gere nova prévia da disciplina antes de gravar insumos.";
  try{await refreshDocuments()}catch(e){msg("Falha ao listar documentos: "+e.message)}
 });
 q("g-refresh-documents").addEventListener("click",async()=>{
  if(!client||area.hidden)return;
  try{await refreshDocuments();msg("Documentos e insumos consultados.")}catch(e){msg("Falha de consulta: "+e.message)}
 });
 q("g-review-document").addEventListener("click",async()=>{
  if(!client||area.hidden)return;
  const id=q("g-choose-document").value;
  if(!id||!q("g-review-confirm").checked){msg("Selecione um documento e confirme sua revisão manual.");return}
  q("g-review-document").disabled=true;
  try{
   await api.reviewDocument(client,id);
   q("g-review-confirm").checked=false;
   await refreshDocuments();
   msg("Documento revisado pela Gestão. O ciclo permanece sem aprovação automática.");
  }catch(e){msg("Revisão recusada: "+e.message)}
  finally{q("g-review-document").disabled=false}
 });
 window.addEventListener("gastroiff:preview-reviewed",event=>{
  preview=event.detail?.prontoParaRevisao?event.detail:null;
  q("g-save-items").disabled=!preview||area.hidden;
  q("g-review-snapshot").textContent=preview?
   "Prévia de "+preview.insumos.length+" insumo(s) disponível. Selecione o mesmo ciclo e a resposta do fornecedor conferida.":
   "A prévia contém pendências e ainda não pode ser gravada no ciclo.";
 });
 q("g-save-items").addEventListener("click",async()=>{
  if(!client||area.hidden||!preview)return;
  const id=q("g-secure-cycle").value,cycle=cycles.find(x=>x.id===id);
  const source=q("g-review-source").value;
  if(!cycle||!source){msg("Selecione um ciclo e um documento de resposta do fornecedor conferido.");return}
  if(preview.identificacao.disciplina!==cycle.subject||
   preview.identificacao.curso!==cycle.course||
   preview.identificacao.inicio!==cycle.starts_on){
   msg("A prévia não corresponde à disciplina e à data inicial do ciclo selecionado.");return
  }
  if(!confirm("Gravar a lista conferida no rascunho selecionado? Os itens anteriores desse rascunho serão substituídos."))return;
  q("g-save-items").disabled=true;
  try{
   const count=await api.saveReviewedItems(client,id,source,preview.insumos);
   preview=null;await refreshDocuments();
   msg("Gravados "+count+" insumo(s) no rascunho protegido, aguardando aprovação do ciclo.");
  }catch(e){msg("Não foi possível gravar insumos: "+e.message)}
  finally{q("g-save-items").disabled=!preview}
 });
 q("g-approve-cycle").addEventListener("click",async()=>{
  if(!client||area.hidden)return;
  const id=q("g-secure-cycle").value;
  if(!id){msg("Selecione o ciclo a aprovar.");return}
  if(!confirm("Conferiu cronograma, pedidos, resposta do fornecedor e TODOS os insumos? A aprovação liberará os dados autorizados ao(a) docente."))return;
  q("g-approve-cycle").disabled=true;
  try{
   await api.approveCycle(client,id);
   await loadCycles(id);await refreshDocuments();
   msg("Ciclo aprovado. As informações autorizadas poderão aparecer no painel do(a) docente autenticado(a).");
  }catch(e){msg("Aprovação bloqueada: "+e.message)}
  finally{q("g-approve-cycle").disabled=false}
 });

 q("g-signout").addEventListener("click",async()=>{
  if(client)await client.auth.signOut();
  hidePrivate();form.hidden=false;msg("Sessão encerrada.");
 });
 window.GASTROIFF_GESTAO_PRIVADA_START=start;
 if(!access?.configValid(cfg)){start(cfg,null);return}
 const script=document.createElement("script");
 script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
 script.onload=()=>start(cfg,window.supabase?.createClient);
 script.onerror=()=>msg("O serviço de autenticação não pôde ser carregado.");
 document.head.append(script);
})();
