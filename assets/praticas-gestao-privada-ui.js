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
 const msg=v=>{status.textContent=v};
 function hidePrivate(){
  area.hidden=true;area.querySelectorAll("select").forEach(s=>{if(s.id==="g-auth-teacher"||s.id==="g-secure-cycle")s.replaceChildren(new Option("Selecione",""))});
  q("g-secure-file").value="";q("g-confirm-file").checked=false;
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
   q("g-secure-file").value="";q("g-confirm-file").checked=false;
  }catch(e){msg("Falha no envio privado: "+e.message)}
  finally{q("g-upload-document").disabled=false}
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
