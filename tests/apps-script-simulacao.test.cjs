const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const code=fs.readFileSync("apps-script/simular-avisos.gs","utf8");
const ctx={
 Date,
 Utilities:{formatDate(date,tz,fmt){assert.equal(tz,"America/Sao_Paulo");assert.equal(fmt,"yyyy-MM-dd");return date.toISOString().slice(0,10)}},
 Logger:{log(){}},
};
vm.createContext(ctx);vm.runInContext(code,ctx);
const cycles=[
 ["id_ciclo","curso","disciplina","docente","inicio","fim"],
 ["1","Tecnólogo em Gastronomia","Panificação","DOCENTE TESTE","2026-11-11","2026-11-30"],
 ["2","Técnico em Gastronomia","Cozinha","DOCENTE TESTE","2026-11-10","2026-11-20"],
 ["3","Técnico em Gastronomia","Cozinha","DOCENTE TESTE","2026-11-12","2026-11-21"],
];
const supplies=[
 ["id_ciclo","insumo_ou_material","situacao","fonte"],
 ["1","Farinha","Não informado",""],
 ["1","Sal","Recebido confirmado","Registro de teste"],
 ["3","Água","Recebido confirmado",""],
];
test("dia de lembrete é exatamente sete dias antes",()=>{
 const x=ctx.giAvisosDeTeste(cycles,supplies,"2026-11-04");
 assert.equal(x.length,1);
 assert.equal(x[0].id,"1");assert.equal(x[0].dias_ate_inicio,7);
 assert.equal(x[0].itens_para_conferir,1);
});
test("status informado sem fonte não é considerado confirmado",()=>{
 const x=ctx.giAvisosDeTeste(cycles,supplies,"2026-11-05");
 assert.equal(x.length,1);assert.equal(x[0].id,"3");
 assert.equal(x[0].itens_para_conferir,1);
});
test("datas inválidas ou cabeçalhos incompletos falham sem mensagens",()=>{
 assert.equal(ctx.giDiasEntre("2026-02-31","2026-11-11"),null);
 assert.throws(()=>ctx.giAvisosDeTeste([["id_ciclo"]],supplies,"2026-11-04"),/Coluna/);
});
test("nenhuma chamada de email ou escrita institucional no modo simulação",()=>{
 assert.doesNotMatch(code,/MailApp|GmailApp|sendEmail|appendRow|setValues|createTrigger/i);
});
