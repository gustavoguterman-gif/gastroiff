// Preparação não implantada. Requer revisão, limites de tráfego e homologação real.
import {validateSurveySubmission,SurveyInputError,MAX_BODY_BYTES} from "./validation.mjs";
const ORIGIN="https://gustavoguterman-gif.github.io";
const HOST="gustavoguterman-gif.github.io";
const ACTION="gastroiff_egresso";
function respond(status:number,body:object){
 return new Response(JSON.stringify(body),{status,headers:{
  "Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",
  "Access-Control-Allow-Origin":ORIGIN,"Vary":"Origin",
  "Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, OPTIONS"
 }});
}
async function bytes(req:Request){
 const reader=req.body?.getReader();if(!reader)throw new SurveyInputError("Envio vazio.");
 const all:Uint8Array[]=[];let sum=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;
  sum+=value.byteLength;if(sum>MAX_BODY_BYTES){await reader.cancel();throw new SurveyInputError("Envio muito grande.",413)}all.push(value);
 }}finally{reader.releaseLock()}
 const result=new Uint8Array(sum);let at=0;for(const chunk of all){result.set(chunk,at);at+=chunk.length}
 return result;
}
async function verifyChallenge(token:string,secret:string){
 const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
  method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
  body:new URLSearchParams({secret,response:token}),signal:AbortSignal.timeout(8000)});
 if(!r.ok)return false;
 const data=await r.json();
 return data.success===true&&data.hostname===HOST&&data.action===ACTION;
}
async function sha256(token:string){
 const bytes=new TextEncoder().encode(token);
 const dig=new Uint8Array(await crypto.subtle.digest("SHA-256",bytes));
 return [...dig].map(b=>b.toString(16).padStart(2,"0")).join("");
}
Deno.serve(async req=>{
 try{
  if(req.headers.get("Origin")!==ORIGIN) return respond(403,{error:"Origem não autorizada."});
  if(req.method==="OPTIONS")return respond(200,{ok:true});
  if(req.method!=="POST")return respond(405,{error:"Método não permitido."});
  // Inativo até homologação, inclusive quando função for disponibilizada por engano.
  if(Deno.env.get("GASTROIFF_EGRESSO_SUBMISSIONS_ENABLED")!=="true")
   return respond(503,{error:"Pesquisa ainda não aberta."});
  const base=Deno.env.get("SUPABASE_URL");
  const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const challengeSecret=Deno.env.get("TURNSTILE_SECRET");
  if(!base||!secret||!challengeSecret)
   return respond(503,{error:"Recebimento não configurado."});
  if(!(req.headers.get("Content-Type")||"").toLowerCase().startsWith("application/json"))
   throw new SurveyInputError("Formato de envio inválido.");
  const length=Number(req.headers.get("Content-Length")||0);
  if(length>MAX_BODY_BYTES)throw new SurveyInputError("Envio muito grande.",413);
  let raw;
  try{raw=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(await bytes(req)));}
  catch(e){if(e instanceof SurveyInputError)throw e;throw new SurveyInputError("Dados inválidos.");}
  const payload=validateSurveySubmission(raw);
  if(!await verifyChallenge(payload.challengeToken,challengeSecret))
   return respond(403,{error:"Não foi possível validar a solicitação."});
  const hash=await sha256(payload.invitationToken);
  const baseUrl=new URL(base);
  if(baseUrl.protocol!=="https:")return respond(503,{error:"Serviço indisponível."});
  const endpoint=new URL("/rest/v1/rpc/gi_submit_alumni_answer",baseUrl);
  const r=await fetch(endpoint,{method:"POST",headers:{
   "Content-Type":"application/json","apikey":secret,"Authorization":"Bearer "+secret
  },body:JSON.stringify({
   p_survey_id:payload.surveyId,p_course:payload.course,
   p_token_hash:hash,p_instrument_version:payload.instrumentVersion,
   p_answers:payload.answers
  }),signal:AbortSignal.timeout(12000)});
  if(!r.ok){console.error("Erro do banco na submissão",r.status);return respond(503,{error:"Não foi possível registrar a resposta."});}
  const accepted=await r.json();
  if(accepted!==true)return respond(409,{error:"O convite não está válido para esta pesquisa ou já foi usado."});
  return respond(201,{ok:true,message:"Resposta registrada."});
 }catch(e){
  if(e instanceof SurveyInputError)return respond(e.status,{error:e.message});
  console.error("Erro de recebimento de egresso",e instanceof Error?e.name:"unknown");
  return respond(503,{error:"Não foi possível registrar a resposta."});
 }
});
