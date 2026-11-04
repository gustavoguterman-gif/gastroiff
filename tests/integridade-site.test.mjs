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
 assert.match(fs.readFileSync(path.join(root,"index.html"),"utf8"),/assets\/perfis-publicos\.js\?v=1/);
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
