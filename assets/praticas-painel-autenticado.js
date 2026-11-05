/* Interface de consulta: nenhum dado privado entra no HTML ou no GitHub Pages. */
(function(){
 "use strict";
 const root=document.querySelector("[data-docente-privado]");
 if(!root)return;
 const access=window.GASTROIFF_ACESSO_PRATICAS;
 const cfg=window.GASTROIFF_PRATICAS_CONFIG;
 const message=root.querySelector("[data-private-status]");
 const login=root.querySelector("[data-private-login]");
 const authForm=root.querySelector("[data-private-form]");
 const email=root.querySelector("[data-private-email]");
 const logout=root.querySelector("[data-private-logout]");
 const body=root.querySelector("[data-private-results]");
 let client=null;
 let requestGeneration=0;
 let signedOut=false;
 const setMessage=s=>{message.textContent=s};
 function reset(){
  body.replaceChildren();body.hidden=true;login.hidden=true;logout.hidden=true;
 }
 function text(parent,tag,value){
  const node=document.createElement(tag);node.textContent=String(value??"");
  parent.append(node);return node;
 }
 function format(v){
  return /^\d{4}-\d{2}-\d{2}$/.test(v||"")?v.split("-").reverse().join("/"):String(v||"A conferir");
 }
 function render(data){
  reset();
  logout.hidden=false;body.hidden=false;
  const cycles=access.viewModel(data);
  setMessage(cycles.length?"Ciclos aprovados vinculados à sua identidade.":"Nenhum ciclo aprovado disponível para esta identidade.");
  for(const c of cycles){
   const card=document.createElement("section");card.className="gi-private-cycle";
   text(card,"h3",c.subject);
   text(card,"p",c.course+" · "+format(c.start)+" a "+format(c.end));
   text(card,"p","Dias: "+c.days.map(d=>["domingo","segunda","terça","quarta","quinta","sexta","sábado"][d]||"a conferir").join(", "));
   text(card,"p","Horário: "+String(c.startTime||"")+" às "+String(c.endTime||"")+" · "+c.location);
   text(card,"h4","Insumos aprovados para consulta");
   if(c.items.length){
    const holder=document.createElement("div");holder.className="gi-private-scroll";
    const table=document.createElement("table");
    const head=document.createElement("thead"),tr=document.createElement("tr");
    ["Insumo","Unidade","Solicitado","Confirmado","Não atendido","Recebido","Situação"].forEach(v=>text(tr,"th",v));
    head.append(tr);table.append(head);
    const tbody=document.createElement("tbody");
    for(const i of c.items){
     const row=document.createElement("tr");
     [i.description,i.unit,i.requested,i.confirmed,i.missing,i.received,i.status].forEach(v=>
      text(row,"td",v===null?"Sem informação":v));
     tbody.append(row);
    }
    table.append(tbody);holder.append(table);card.append(holder);
   }else text(card,"p","Ainda não há lista de insumos aprovada para consulta.");
   text(card,"p","Confirmação do fornecedor não equivale ao recebimento físico. A revisão das fichas técnicas é decisão do(a) docente.");
   body.append(card);
  }
 }
 async function refresh(){
  const current=++requestGeneration;
  signedOut=false;
  reset();setMessage("Conferindo sessão e permissões...");
  try{
   const dashboard=await access.getTeacherDashboard(client);
   if(current!==requestGeneration||signedOut)return;
   render(dashboard);
  }catch(e){
   if(current!==requestGeneration||signedOut)return;
   reset();setMessage(e.message==="Acesso não autenticado"?"Entre com seu e-mail autorizado para consultar os ciclos.":"Consulta indisponível: "+e.message);
   login.hidden=false;
  }
 }
 function start(config,supabaseFactory){
  ++requestGeneration;
  signedOut=false;
  reset();
  if(!access.configValid(config)){
   setMessage("Acesso institucional ainda não ativado. O quadro individual permanece indisponível até a implantação e homologação da base privada.");
   return false;
  }
  if(typeof supabaseFactory!=="function"){
   setMessage("Serviço de autenticação temporariamente indisponível.");
   return false;
  }
  client=supabaseFactory(config.supabaseUrl,config.supabasePublishableKey,{
   auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}
  });
  refresh();
  return true;
 }
 authForm.addEventListener("submit",async e=>{
  e.preventDefault();
  if(!client)return;
  const value=email.value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){setMessage("Informe um endereço de e-mail válido.");return}
  const current=requestGeneration;
  const activeClient=client;
  setMessage("Solicitando link de entrada...");
  try{
   const result=await activeClient.auth.signInWithOtp({email:value,options:{
    emailRedirectTo:cfg.redirectUrl,shouldCreateUser:false
   }});
   if(current!==requestGeneration||signedOut||client!==activeClient)return;
   setMessage(result?.error?"Não foi possível enviar o link. Confirme seu cadastro com a coordenação.":"Se o endereço estiver autorizado, confira o e-mail para entrar.");
  }catch{
   if(current!==requestGeneration||signedOut||client!==activeClient)return;
   setMessage("Não foi possível solicitar o link de entrada. Tente novamente mais tarde.");
  }
 });
 logout.addEventListener("click",async()=>{
  // Invalida consultas pendentes antes de contactar o provedor de autenticação.
  ++requestGeneration;
  signedOut=true;
  reset();
  setMessage("Encerrando sessão...");
  try{
   if(!client)throw Error("Cliente de autenticação indisponível");
   const result=await client.auth.signOut();
   if(result?.error)throw result.error;
   setMessage("Sessão encerrada. Entre novamente para consultar seus ciclos.");
  }catch{
   setMessage("Não foi possível confirmar o encerramento da sessão. Tente novamente antes de sair do dispositivo.");
  }
  login.hidden=false;
 });
 window.GASTROIFF_PAINEL_START=start;
 if(!access.configValid(cfg)){start(cfg,null);return}
 const script=document.createElement("script");
 script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
 script.onload=()=>start(cfg,window.supabase?.createClient);
 script.onerror=()=>{reset();setMessage("Não foi possível carregar o serviço seguro. Tente novamente mais tarde.")};
 document.head.append(script);
})();
