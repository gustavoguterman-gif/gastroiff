import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html=readFileSync(new URL("../ocorrencias.html",import.meta.url),"utf8");
const facultySource=readFileSync(new URL("../assets/faculty.js",import.meta.url),"utf8");
const scope={window:{}};
vm.runInNewContext(facultySource,scope);
const faculty=scope.window.GASTROIFF_FACULTY;
const teaching=faculty.filter(person=>person?.id&&!new Set(["daiana-costa-pereira","lygia-oliveira"]).has(person.id));
test("lista de docentes usa cadastro existente e exclui perfis administrativos",()=>{
  assert.ok(faculty.length>=10);
  assert.ok(teaching.length>=10);
  assert.ok(teaching.every(person=>person.name&&person.full));
  assert.equal(new Set(teaching.map(person=>person.full)).size,teaching.length);
  assert.match(html,/assets\/faculty\.js\?v=/);
  assert.match(html,/exclude=new Set\(\['daiana-costa-pereira','lygia-oliveira'\]\)/);
});
test("o formulario escolhe docente e exige nome completo somente do estudante",()=>{
  assert.match(html,/id="teacher"/);
  assert.match(html,/id="name"/);
  assert.match(html,/teacher\.required=isTeacher;name\.required=student/);
  assert.match(html,/teacher\.addEventListener\('change'/);
  assert.match(html,/name\.value=teacher\.value/);
  assert.doesNotMatch(html,/matr[ií]cula/i);
});
test("foto segue sendo anexo manual no modo atual",()=>{
  assert.match(html,/type="file"/);
  assert.match(html,/anex[aá]-la manualmente/i);
  assert.match(html,/mailto:/);
});
test("javascript embutido do formulario nao apresenta erro de sintaxe",()=>{
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(s=>s.trim());
  assert.ok(scripts.length);
  scripts.forEach(script=>assert.doesNotThrow(()=>new vm.Script(script)));
});
