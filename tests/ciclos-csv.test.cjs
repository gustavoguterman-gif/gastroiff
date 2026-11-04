const test=require("node:test");
const assert=require("node:assert/strict");
const {parseCsv,parseCycles,MAX_BYTES}=require("../assets/ciclos-csv.js");
const header="id_ciclo,curso,disciplina,docente,inicio,fim,laboratorio,status_conferencia,data_conferencia,fonte";
test("CSV do Google Planilhas é lido com colunas na ordem esperada",()=>{
 const rows=parseCycles(header+"\nID-001,Tecnólogo em Gastronomia,Cozinha de teste,Docente de teste,2026-11-12,2026-11-16,Bloco G,A conferir,,Fonte de teste");
 assert.equal(rows.length,1);
 assert.equal(rows[0].inicio,"2026-11-12");
 assert.equal(rows[0].disciplina,"Cozinha de teste");
});
test("campos com vírgulas e aspas permanecem íntegros",()=>{
 const raw=header+'\nID-002,Técnico em Gastronomia,"Cozinha, ""pesquisa""",Docente de teste,2026-11-12,2026-11-16,Bloco G,A conferir,,Fonte de teste';
 const rows=parseCycles(raw);assert.equal(rows[0].disciplina,'Cozinha, "pesquisa"');
});
test("arquivo com ponto e vírgula, BOM e final de linha Windows",()=>{
 const raw="\uFEFF"+header.replaceAll(",",";")+"\r\nID-003;Tecnólogo em Gastronomia;Panificação;Docente de teste;2026-11-12;2026-11-16;Bloco G;A conferir;;Fonte de teste\r\n";
 assert.equal(parseCycles(raw)[0].disciplina,"Panificação");
});
test("não admite cabeçalho estranho e CSV incompleto",()=>{
 assert.throws(()=>parseCycles("nome,data\nJoão,2026-11-12"),/Cabeçalho incompatível/);
 assert.throws(()=>parseCycles(header+'\nID-004,Técnico em Gastronomia,,Docente de teste,2026-11-12,2026-11-16,Bloco G,A conferir,,Fonte'),/Linha 2/);
 assert.throws(()=>parseCsv('a,"b'),/Aspas incompletas/);
});
test("rejeita excesso de linhas e tamanho",()=>{
 assert.throws(()=>parseCsv("a\n".repeat(103)),/100 registros/);
 assert.throws(()=>parseCsv("a".repeat(MAX_BYTES+1)),/muito grande/);
});
