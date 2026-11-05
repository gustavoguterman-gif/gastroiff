// GASTROIFF: auditoria estática e conservadora de links locais e scripts.
// Não substitui testes visuais, acesso a URLs externas ou execução em navegador.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const root=process.cwd();
const pages=fs.readdirSync(root).filter(n=>n.endsWith(".html"));
const attrs=/\b(?:href|src)\s*=\s*(["'])(.*?)\1/g;
function localFile(url){
 if(!url||url.startsWith("#")||url.startsWith("//")||/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(url))return null;
 const pathname=url.split(/[?#]/)[0];if(!pathname||pathname==="/")return null;
 if(pathname.startsWith("/"))return null;
 return decodeURIComponent(pathname);
}
test("há páginas principais do portal e os módulos novos",()=>{
 for(const name of ["index.html","cursos.html","pesquisa.html","projetos.html","oportunidades.html","observatorio.html","participacao.html","ocorrencias.html","trajetorias.html","gastronomia-em-acao.html","gestao.html","painel.html"])
 assert.ok(pages.includes(name),name);
});
test("links e recursos locais diretamente declarados apontam para arquivos existentes",()=>{
 const broken=[];
 for(const page of pages){
  const text=fs.readFileSync(path.join(root,page),"utf8");
  for(const match of text.matchAll(attrs)){
   const ref=localFile(match[2].replaceAll("&amp;","&"));
   if(!ref)continue;
   const target=path.resolve(root,path.dirname(page),ref);
   if(!target.startsWith(root+path.sep)&&target!==root){broken.push(page+": fora da pasta "+ref);continue}
   if(!fs.existsSync(target))broken.push(page+": "+ref);
  }
 }
 assert.deepEqual(broken,[]);
});
test("scripts JS locais sem dependências externas têm sintaxe válida",()=>{
 const broken=[];
 const dir=path.join(root,"assets");
 for(const file of fs.readdirSync(dir).filter(n=>n.endsWith(".js"))){
  try{new vm.Script(fs.readFileSync(path.join(dir,file),"utf8"),{filename:file})}
  catch(e){broken.push(file+": "+e.message)}
 }
 assert.deepEqual(broken,[]);
});
test("personalização pública não exige nem armazena identificação pessoal",()=>{
 const js=fs.readFileSync(path.join(root,"assets/perfis-publicos.js"),"utf8");
 assert.match(js,/localStorage/);
 assert.match(js,/Object\.hasOwn\(profiles/);
 assert.doesNotMatch(js,/(?:fetch\(|XMLHttpRequest|sendBeacon|matr[ií]cula\s*:|siape\s*:)/i);
 assert.match(fs.readFileSync(path.join(root,"index.html"),"utf8"),/assets\/perfis-publicos\.js\?v=\d+/);
});
test("o cache do aplicativo inclui os recursos de personalização",()=>{
 const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
 assert.match(sw,/perfis-publicos\.js/);
 assert.match(sw,/perfis-publicos\.css/);
});

test("scripts embutidos das páginas possuem sintaxe válida",()=>{
 const failures=[];
 for(const page of pages){
   const html=fs.readFileSync(path.join(root,page),"utf8");
   for(const m of html.matchAll(/<script[^>]*>([^]*?)<\/script>/g)){
     if(!m[1].trim())continue;
     try{new vm.Script(m[1],{filename:page})}
     catch(e){failures.push(page+": "+e.message)}
   }
 }
 assert.deepEqual(failures,[]);
});


test("percurso docente e fontes institucionais estão conectados sem prometer inscrições abertas",()=>{
 const trajetorias=fs.readFileSync(path.join(root,"trajetorias.html"),"utf8");
 const oportunidades=fs.readFileSync(path.join(root,"oportunidades.html"),"utf8");
 assert.match(trajetorias,/href="oportunidades\.html#oportunidades-docencia"/);
 assert.match(oportunidades,/id="oportunidades-docencia"/);
 assert.match(oportunidades,/id="docencia-oportunidades-titulo"/);
 assert.match(oportunidades,/https:\/\/selecoes\.iff\.edu\.br\//);
 assert.match(oportunidades,/concursos-publicos-e-provimento-de-pessoal\/concursos-de-instituicoes-de-ensino-federais-vinculadas-ao-mec/);
 assert.match(oportunidades,/Não representam vagas abertas nem inscrições confirmadas/);
});


test("a abertura não recolhe identificadores e oferece saída acessível",()=>{
 const js=fs.readFileSync(path.join(root,"assets/perfis-publicos.js"),"utf8");
 const css=fs.readFileSync(path.join(root,"assets/perfis-publicos.css"),"utf8");
 assert.match(js,/gastroiff-entry-session-v1/);
 assert.match(js,/button\.dataset\.profileEntry\s*=\s*key/);
 assert.match(js,/aria-modal/);
 assert.doesNotMatch(js,/Pular animação|gi-entry-skip/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(css,/gi-entry-screen/);
 assert.match(css,/gi-entry-composition/);
 assert.match(css,/mix-blend-mode:multiply/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(js,/nome\s*completo\s*[:=]|matr[ií]cula\s*[:=]|siape\s*[:=]/i);
});
