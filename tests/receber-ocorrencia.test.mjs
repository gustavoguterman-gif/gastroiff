import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
 validateOccurrence, inspectImage, validateOrigin, validateTurnstileProof, InputError,
 MAX_IMAGE_BYTES,
} from "../supabase/functions/receber-ocorrencia/validation.mjs";

const base = {
 course: "Tecnólogo em Gastronomia", role: "Estudante",
 kind: "Equipamento com defeito", place: "Laboratório Bloco G",
 priority: "Prejudica, mas permite continuar",
 details: "Forno não aquece regularmente durante a aula.",
};
const valid = overrides => ({...base,...overrides});
test("aceita ocorrência mínima e normaliza os dados",()=>{
 const data=validateOccurrence(valid({name:"Estudante Exemplo",contactConsent:true}));
 assert.equal(data.course,"technologist");
 assert.equal(data.submitter_role,"Estudante");
 assert.equal(data.impact,"disruptive");
 assert.equal(data.origin,"occurrence");
 assert.equal(data.submitter_email,null);
 assert.equal(data.status,undefined);
});
test("aceita modalidade técnica e ambos os cursos",()=>{
 assert.equal(validateOccurrence(valid({course:"Técnico em Gastronomia",name:"Estudante Exemplo",contactConsent:true})).course,"technical");
 assert.equal(validateOccurrence(valid({course:"Ambos os cursos",name:"Estudante Exemplo",contactConsent:true})).course,"both");
});
test("recusa modalidade, impacto e categoria desconhecidos",()=>{
 for(const key of ["course","priority","kind"]) assert.throws(()=>validateOccurrence(valid({[key]:"valor inventado"})),InputError);
});
test("recusa descrição curta ou campos extensos",()=>{
 assert.throws(()=>validateOccurrence(valid({details:"Curto"})),InputError);
 assert.throws(()=>validateOccurrence(valid({details:"a".repeat(4001)})),InputError);
 assert.throws(()=>validateOccurrence(valid({place:"b".repeat(171)})),InputError);
});
test("estudante e docente precisam informar nome no recebimento protegido",()=>{
 assert.throws(()=>validateOccurrence(valid()),InputError);
 assert.throws(()=>validateOccurrence(valid({role:"Docente"})),InputError);
 assert.equal(validateOccurrence(valid({name:"Estudante Exemplo",contactConsent:true})).submitter_name,"Estudante Exemplo");
 assert.equal(validateOccurrence(valid({role:"Docente",name:"Docente Exemplo",contactConsent:true})).submitter_name,"Docente Exemplo");
});
test("contato pessoal exige autorização explícita",()=>{
 assert.throws(()=>validateOccurrence(valid({reply:"estudante@exemplo.org"})),InputError);
 const data=validateOccurrence(valid({reply:"estudante@exemplo.org",name:"Estudante Exemplo",contactConsent:true}));
 assert.equal(data.submitter_email,"estudante@exemplo.org");
});
test("nome pessoal exige autorização explícita",()=>{
 assert.throws(()=>validateOccurrence(valid({name:"Estudante Exemplo"})),InputError);
 assert.equal(validateOccurrence(valid({name:"Estudante Exemplo",contactConsent:true})).submitter_name,"Estudante Exemplo");
});
test("e-mail inválido e data inexistente são rejeitados",()=>{
 assert.throws(()=>validateOccurrence(valid({reply:"invalid@",contactConsent:true})),InputError);
 assert.throws(()=>validateOccurrence(valid({when:"2026-02-31"})),InputError);
});
test("datas válidas são preservadas",()=>{
 assert.equal(validateOccurrence(valid({when:"2026-11-04",name:"Estudante Exemplo",contactConsent:true})).observed_on,"2026-11-04");
});
test("imagem PNG válida é identificada pela assinatura",()=>{
 const image=new Uint8Array([137,80,78,71,13,10,26,10,0,0]);
 assert.deepEqual(inspectImage(image,"image/png"),{mime:"image/png",extension:"png"});
});
test("arquivo com MIME falso ou sem assinatura é rejeitado",()=>{
 const image=new Uint8Array([137,80,78,71,13,10,26,10,0,0]);
 assert.throws(()=>inspectImage(image,"image/jpeg"),InputError);
 assert.throws(()=>inspectImage(new Uint8Array([60,115,118,103]),"image/png"),InputError);
});
test("foto acima do limite é recusada",()=>{
 assert.throws(()=>inspectImage(new Uint8Array(MAX_IMAGE_BYTES+1),"image/png"),InputError);
});
test("origem só aceita endereço publicado",()=>{
 assert.doesNotThrow(()=>validateOrigin("https://gustavoguterman-gif.github.io","https://gustavoguterman-gif.github.io"));
 assert.throws(()=>validateOrigin("https://site-falso.example","https://gustavoguterman-gif.github.io"),InputError);
});
test("desafio antiabuso exige sucesso, domínio e ação corretos",()=>{
 const ok={success:true,hostname:"gustavoguterman-gif.github.io",action:"gastroiff_ocorrencia"};
 assert.equal(validateTurnstileProof(ok,ok.hostname,ok.action),true);
 assert.equal(validateTurnstileProof({...ok,action:"outro"},ok.hostname,ok.action),false);
 assert.equal(validateTurnstileProof({...ok,hostname:"outro.example"},ok.hostname,ok.action),false);
 assert.equal(validateTurnstileProof({...ok,success:false},ok.hostname,ok.action),false);
});


test("endpoint de ocorrências permanece fechado até habilitação explícita",()=>{
 const source=fs.readFileSync(new URL("../supabase/functions/receber-ocorrencia/index.ts",import.meta.url),"utf8");
 const guard='Deno.env.get("GASTROIFF_OCCURRENCES_ENABLED") !== "true"';
 const gate=source.indexOf(guard);
 const credentials=source.indexOf('Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")');
 const parsing=source.indexOf('await limitedBytes(req, MAX_REQUEST_BYTES)');
 assert.ok(gate>0&&credentials>gate&&parsing>gate,
  "O envio deve ser bloqueado antes da leitura do conteúdo e de credenciais do serviço");
 assert.match(source.slice(gate,credentials),/return json\(503,/,
  "O endpoint não autorizado precisa responder 503");
});
