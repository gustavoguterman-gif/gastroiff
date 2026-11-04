const test=require("node:test"),assert=require("node:assert/strict");
const parser=require("../assets/praticas-documentos-leitor.js");
const file=(name,text="conteúdo")=>({name,size:100,arrayBuffer:async()=>new TextEncoder().encode(text).buffer,text:async()=>text});
test("aceita extensões Excel, PDF, JPEG, PNG, WebP e CSV",()=>{
 for(const kind of ["xlsx","xls","csv","pdf","jpg","jpeg","png","webp"])assert.equal(parser.ext("pedido."+kind),kind);
 assert.equal(parser.ext("invasor.exe"),"");
});
test("bloqueia arquivo vazio, acima de 8 MB ou extensão inválida",async()=>{
 await assert.rejects(parser.read(file("arquivo.exe"),"cronograma"),/Formato/);
 await assert.rejects(parser.read({...file("x.pdf"),size:0},"cronograma"),/vazio/);
 await assert.rejects(parser.read({...file("x.pdf"),size:parser.MAX_BYTES+1},"cronograma"),/8 MB/);
});
test("leitura de Excel preserva itens e avisos",async()=>{
 const mock={XLSX:{},excel:{inspectWorkbook:()=>({sheets:[{name:"Pedidos",detected:{score:3},matrix:[["Insumo","Unidade","Quantidade"],["Farinha","kg",10]]}]}),extract:()=>({rows:[{insumo:"Farinha",unidade:"kg",quantidade:"10"}],warnings:[]})}};
 const out=await parser.read(file("pedido.xlsx"),"pedidoDocente",mock);
 assert.equal(out.rows.length,1);assert.match(out.text,/Farinha/);
 assert.equal(out.reviewed,false);
});
test("planilha de horários pode ter estrutura diferente",async()=>{
 const mock={XLSX:{},excel:{inspectWorkbook:()=>({sheets:[{name:"Calendário",matrix:[["Ciclo","Inicio","Fim"],["Prática","11/11","18/12"]]}]})}};
 const out=await parser.read(file("horarios.xls"),"cronograma",mock);
 assert.match(out.text,/Ciclo/);assert.equal(out.rows.length,0);
});
test("Excel sem colunas necessárias avisa e não inventa quantidade",async()=>{
 const mock={XLSX:{},excel:{inspectWorkbook:()=>({sheets:[{name:"Insumos",matrix:[["Material","Descrição"],["Farinha","10"]]}]})}};
 const out=await parser.read(file("resposta.xlsx"),"respostaFornecedor",mock);
 assert.equal(out.rows.length,0);assert.match(out.warnings.join(" "),/colunas/);
});
test("PDF com texto extrai páginas",async()=>{
 const pdfjs={getDocument:()=>({promise:Promise.resolve({numPages:2,getPage:async i=>({getTextContent:async()=>({items:[{str:"Página "+i+" - Insumos"}]})})})})};
 const out=await parser.read(file("documento.pdf"),"cronograma",{pdfjs});
 assert.match(out.text,/Página 2 - Insumos/);assert.equal(out.warnings.length,0);
});
test("PDF digitalizado avisa se não houver OCR",async()=>{
 const pdfjs={getDocument:()=>({promise:Promise.resolve({numPages:1,getPage:async()=>({getTextContent:async()=>({items:[]})})})})};
 await assert.rejects(parser.read(file("documento.pdf"),"cronograma",{pdfjs}),/Nenhuma informação legível/);
});
test("imagem interpreta OCR, mas exige revisão humana",async()=>{
 const out=await parser.read(file("horarios.jpg"),"cronograma",{ocr:{recognize:async()=>({data:{text:"Práticas às 13 horas"}})}});
 assert.match(out.text,/13 horas/);assert.match(out.warnings.join(" "),/revisão humana/);
});
test("leitura incompleta de PDF sinaliza limite de páginas",async()=>{
 const pdfjs={getDocument:()=>({promise:Promise.resolve({numPages:8,getPage:async()=>({getTextContent:async()=>({items:[{str:"Exemplo"}]})})})})};
 const out=await parser.read(file("arquivo.pdf"),"cronograma",{pdfjs});
 assert.match(out.warnings.join(" "),/lido parcialmente/);
});
