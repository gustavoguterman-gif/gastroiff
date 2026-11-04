import test from "node:test";
import assert from "node:assert/strict";
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
 const data=validateOccurrence(valid());
 assert.equal(data.course,"technologist");
 assert.equal(data.submitter_role,"Estudante");
 assert.equal(data.impact,"disruptive");
 assert.equal(data.origin,"occurrence");
 assert.equal(data.submitter_email,null);
 assert.equal(data.status,undefined);
});
test("aceita modalidade técnica e ambos os cursos",()=>{
 assert.equal(validateOccurrence(valid({course:"Técnico em Gastronomia"})).course,"technical");
 assert.equal(validateOccurrence(valid({course:"Ambos os cursos"})).course,"both");
});
test("recusa modalidade, impacto e categoria desconhecidos",()=>{
 for(const key of ["course","priority","kind"]) assert.throws(()=>validateOccurrence(valid({[key]:"valor inventado"})),InputError);
});
test("recusa descrição curta ou campos extensos",()=>{
 assert.throws(()=>validateOccurrence(valid({details:"Curto"})),InputError);
 assert.throws(()=>validateOccurrence(valid({details:"a".repeat(4001)})),InputError);
 assert.throws(()=>validateOccurrence(valid({place:"b".repeat(171)})),InputError);
});
test("contato pessoal exige autorização explícita",()=>{
 assert.throws(()=>validateOccurrence(valid({reply:"estudante@exemplo.org"})),InputError);
 const data=validateOccurrence(valid({reply:"estudante@exemplo.org",contactConsent:true}));
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
 assert.equal(validateOccurrence(valid({when:"2026-11-04"})).observed_on,"2026-11-04");
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
