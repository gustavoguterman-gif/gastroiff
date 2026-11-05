/* Dados docentes: sem configuração ou sem sessão, nenhuma consulta.
 * A autorização verdadeira é a RLS do banco, nunca a seleção visual.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.GASTROIFF_ACESSO_PRATICAS=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function configValid(cfg){
  if(!cfg||cfg.enabled!==true)return false;
  try{
   const u=new URL(cfg.supabaseUrl);
   return u.protocol==="https:"&&u.username===""&&u.password===""&&
    /^[a-z0-9-]+\.supabase\.co$/.test(u.hostname)&&u.pathname==="/"&&
    typeof cfg.supabasePublishableKey==="string"&&cfg.supabasePublishableKey.length>=20&&
    !/(service_role|secret)/i.test(cfg.supabasePublishableKey);
  }catch{return false}
 }
 function normItem(item){
  const finite=v=>v===null||v===undefined?null:Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null;
  const requested=finite(item.requested),confirmed=finite(item.confirmed),received=finite(item.received);
  return {id:String(item.id||""),description:String(item.description||"").slice(0,180),
   unit:String(item.unit||"").slice(0,32),requested,confirmed,received,
   missing:requested===null||confirmed===null?null:Math.max(0,requested-confirmed),
   status:confirmed===null?"Aguardando resposta":confirmed===0?"Sem fornecimento confirmado":
    confirmed<requested?"Fornecimento parcial":"Fornecimento confirmado"};
 }
 async function getTeacherDashboard(client){
  if(!client?.auth?.getUser||!client.from)throw Error("Cliente de autenticação indisponível");
  const {data:userData,error:userError}=await client.auth.getUser();
  const uid=userData?.user?.id;
  if(userError||!uid)throw Error("Acesso não autenticado");
  const roleResult=await client.from("gastroiff_practice_roles").select("role").eq("user_id",uid).maybeSingle();
  if(roleResult.error)throw Error("Não foi possível confirmar a permissão");
  if(roleResult.data?.role!=="docente")throw Error("O usuário não possui perfil docente autorizado");
  const cycles=await client.from("gastroiff_practice_cycles")
   .select("id,course,subject,teacher_user_id,starts_on,ends_on,weekdays,begins_at,ends_at,location,status")
   .eq("teacher_user_id",uid).eq("status","aprovado").order("starts_on",{ascending:true});
  if(cycles.error)throw Error("Falha na consulta dos ciclos autorizados");
  const rows=Array.isArray(cycles.data)?cycles.data:[];
  if(rows.some(x=>x.teacher_user_id!==uid||x.status!=="aprovado"))throw Error("Resposta de autorização inconsistente");
  const ids=rows.map(x=>x.id);
  if(!ids.length)return {userId:uid,cycles:[],items:[]};
  const items=await client.from("gastroiff_practice_items")
   .select("id,cycle_id,description,unit,requested,forwarded,confirmed,received,approved")
   .in("cycle_id",ids).eq("approved",true).order("description",{ascending:true});
  if(items.error)throw Error("Falha na consulta dos insumos aprovados");
  const validIds=new Set(ids);
  if((items.data||[]).some(x=>!validIds.has(x.cycle_id)||x.approved!==true))throw Error("Resposta de insumos inconsistente");
  return {userId:uid,cycles:rows,items:(items.data||[]).map(x=>({...normItem(x),cycle_id:x.cycle_id}))};
 }
 function viewModel(dashboard){
  return (dashboard.cycles||[]).map(c=>({
   id:c.id,subject:String(c.subject||"").slice(0,180),course:String(c.course||"").slice(0,180),
   start:c.starts_on,end:c.ends_on,
   days:Array.isArray(c.weekdays)?c.weekdays:[],
   startTime:c.begins_at,endTime:c.ends_at,location:String(c.location||"").slice(0,180),
   items:(dashboard.items||[]).filter(item=>item.cycle_id===c.id)
  }));
 }
 return {configValid,getTeacherDashboard,normItem,viewModel};
});
