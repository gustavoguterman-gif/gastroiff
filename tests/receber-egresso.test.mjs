import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {validateSurveySubmission,SurveyInputError} from "../supabase/functions/receber-egresso/validation.mjs";
const id="b4492810-3b64-47b5-a2ea-b6a82ea0c7f1",token="A".repeat(43);
function sample(overrides={}){return {
 surveyId:id,course:"technical",instrumentVersion:1,invitationToken:token,
 consent:true,challengeToken:"verified-test-token",answers:{working:"yes",gastronomy_work:"no"},
 ...overrides
}}
test("aceita apenas respostas enumeradas do Técnico",()=>{
 const data=validateSurveySubmission(sample());
 assert.deepEqual(data.answers,{working:"yes",gastronomy_work:"no"});
 assert.equal(data.course,"technical");
});
test("aceita campo exclusivo da graduação somente no curso correspondente",()=>{
 assert.equal(validateSurveySubmission(sample({course:"technologist",answers:{research_extension:"yes"}})).answers.research_extension,"yes");
 assert.throws(()=>validateSurveySubmission(sample({answers:{research_extension:"yes"}})),SurveyInputError);
});
test("rejeita ausência de consentimento, token fraco, dados pessoais e conteúdo livre",()=>{
 for(const payload of [
  {consent:false},{invitationToken:"123"},{name:"Pessoa"},{answers:{name:"Pessoa"}},
  {answers:{working:"yes",suggestions:"texto individual"}},
  {answers:{working:"yes",gastronomy_work:"<script>alert(1)</script>"}},
  {course:"other"},{instrumentVersion:0},{challengeToken:"x"}
 ])assert.throws(()=>validateSurveySubmission(sample(payload)),SurveyInputError);
});
test("a submissão SQL é transacional e reservada ao servidor",()=>{
 const sql=fs.readFileSync("supabase/migrations/202611060002_egressos_submissao.sql","utf8");
 assert.match(sql,/security definer/i);
 assert.match(sql,/auth\.role\(\)/);
 assert.match(sql,/service_role/);
 assert.match(sql,/for update/i);
 assert.match(sql,/s\.course = p_course/);
 assert.match(sql,/i\.used_at is null/);
 assert.match(sql,/i\.revoked_at is null/);
 assert.match(sql,/i\.expires_at > pg_catalog\.now\(\)/);
 assert.match(sql,/insert into public\.gi_alumni_responses/);
 assert.match(sql,/update public\.gi_alumni_invitations/);
 assert.match(sql,/revoke all on function/);
 assert.match(sql,/grant execute on function[\s\S]*to service_role/);
});
test("endpoint é desativado por padrão e nunca oferece dados brutos",()=>{
 const code=fs.readFileSync("supabase/functions/receber-egresso/index.ts","utf8");
 assert.match(code,/GASTROIFF_EGRESSO_SUBMISSIONS_ENABLED/);
 assert.match(code,/!==\"true\"/);
 assert.match(code,/TURNSTILE_SECRET/);
 assert.match(code,/gi_submit_alumni_answer/);
 assert.doesNotMatch(code,/service_role\s*[:=]\s*['\"]/);
});
