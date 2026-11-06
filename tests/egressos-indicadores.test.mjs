import test from "node:test";
import assert from "node:assert/strict";
import {compileAlumniDraft} from "../supabase/functions/egressos-indicadores/aggregate.mjs";
const surveyId="survey-example",verifiedAt="2026-11-06T15:00:00Z";
const base={surveyId,course:"technical",instrumentVersion:1,periodLabel:"2026",verifiedAt};
function response(answer,id=surveyId,version=1){return {survey_id:id,instrument_version:version,answers:answer};}
test("cinco respostas em cada grupo geram somente rascunho agregado",()=>{
 const responses=[...Array.from({length:5},()=>response({working:"yes"})),...Array.from({length:5},()=>response({working:"no"}))];
 const result=compileAlumniDraft({...base,responses});
 assert.equal(result.status,"draft");
 assert.equal(result.rows.length,2);
 assert.deepEqual(result.rows.map(r=>r.measured_value),[50,50]);
 assert.ok(result.rows.every(r=>r.responses_count===10&&r.state==="draft"&&r.published_at===null));
 assert.ok(!JSON.stringify(result).includes("answers"));
});
test("supressão complementar oculta resultados de 9 para 1",()=>{
 const responses=[...Array.from({length:9},()=>response({working:"yes"})),response({working:"no"})];
 assert.equal(compileAlumniDraft({...base,responses}).rows.length,0);
});
test("desconsidera respostas ausentes e códigos não elegíveis",()=>{
 const responses=[
  ...Array.from({length:6},()=>response({working:"yes"})),
  ...Array.from({length:5},()=>response({working:"no"})),
  response({working:"prefer_not"}),response({working:"yes"},"another"),
  response({working:"yes"},surveyId,2),response({working:"invalid"})
 ];
 const r=compileAlumniDraft({...base,responses});
 assert.equal(r.rows.length,2);
 assert.ok(r.rows.every(x=>x.responses_count===11));
 assert.equal(r.rows[0].measured_value,54.545);
});
test("não calcula recortes temporais ou cursos sem escopo válido",()=>{
 assert.throws(()=>compileAlumniDraft({...base,course:"invalid",responses:[]}));
 assert.throws(()=>compileAlumniDraft({...base,periodLabel:"todas",responses:[]}));
 assert.throws(()=>compileAlumniDraft({...base,verifiedAt:"hoje",responses:[]}));
});
test("não gera porcentagem quando apenas um grupo alcança o limite",()=>{
 const responses=[...Array.from({length:7},()=>response({study_continuity:"yes"})),...Array.from({length:4},()=>response({study_continuity:"no"}))];
 assert.equal(compileAlumniDraft({...base,responses}).rows.length,0);
});
test("as coortes e as informações de identidade nunca são publicadas no resumo",()=>{
 const responses=[
  ...Array.from({length:5},()=>response({working:"yes",cohort:"2024_onward",name:"NOME TESTE"})),
  ...Array.from({length:5},()=>response({working:"no",cohort:"2024_onward"}))
 ];
 const out=JSON.stringify(compileAlumniDraft({...base,responses}));
 assert.doesNotMatch(out,/NOME TESTE|2024_onward|invitation_id|token_hash/);
});
