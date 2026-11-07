const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const base = fs.readFileSync(path.join(root,"supabase/migrations/202611040001_gastroiff_base.sql"),"utf8");
const scopes = fs.readFileSync(path.join(root,"supabase/migrations/202611070001_gastroiff_escopos_minimos.sql"),"utf8");

function functionBody(sql, name) {
  const marker = new RegExp("create\\s+or\\s+replace\\s+function\\s+public\\."+name+"\\s*\\([^)]*\\)[\\s\\S]*?as\\s+\\$\\$([\\s\\S]*?)\\$\\$\\s*;", "i");
  const match = sql.match(marker);
  assert.ok(match,"Função não encontrada: "+name);
  return match[1];
}

test("uma nova migração restringe o administrador de projeto exclusivamente ao scope project",()=>{
  const body=functionBody(scopes,"gi_is_admin");
  assert.match(body,/scope\s*=\s*'project'/i);
  assert.doesNotMatch(body,/scope\s+in\s*\([^)]*(?:course|reviewer)/i);
  assert.match(scopes,/revoke\s+all\s+on\s+function\s+public\.gi_is_admin\(\)\s+from\s+public\s*,\s*anon/i);
  assert.match(scopes,/grant\s+execute\s+on\s+function\s+public\.gi_is_admin\(\)\s+to\s+authenticated/i);
});

test("revisor acessa somente a fila editorial por política explícita",()=>{
  const body=functionBody(scopes,"gi_has_scope");
  assert.match(body,/user_id\s*=\s*\(select\s+auth\.uid\(\)\)/i);
  assert.match(body,/scope\s*=\s*any\s*\(allowed_scopes\)/i);
  assert.match(scopes,/create\s+policy\s+gi_reviewer_queue_read\s+on\s+public\.gi_publication_queue/i);
  assert.match(scopes,/gi_has_scope\s*\(array\s*\[\s*'reviewer'\s*\]/i);
  const policies=[...scopes.matchAll(/create\s+policy\s+\w+\s+on\s+public\.(\w+)/gi)].map(x=>x[1]);
  assert.deepEqual(policies,["gi_publication_queue"],"Não liberar novos dados privados para reviewer sem ensaio específico");
});

test("nenhuma política da base fornece acesso anônimo a dados pessoais",()=>{
  const protectedTables=["gi_requests","gi_attachments","gi_request_actions","gi_publication_queue","gi_recommendations","gi_notifications"];
  for(const table of protectedTables){
    assert.match(base,new RegExp("revoke\\s+all\\s+on\\s+table\\s+public\\."+table+"\\s+from\\s+anon\\s*,\\s*authenticated","i"));
    assert.match(base,new RegExp("create\\s+policy\\s+\\w+\\s+on\\s+public\\."+table+"\\s+for\\s+select\\s+to\\s+authenticated","i"));
  }
  assert.match(base,/storage\.buckets\s*\(id,name,public,file_size_limit,allowed_mime_types\)/i);
  assert.match(base,/'gastroiff-private'\s*,\s*'gastroiff-private'\s*,\s*false/i);
  assert.match(scopes,/não\s+possui\s+identificação\s+de\s+curso/i);
});

test("auditoria de pré-ativação é somente leitura e cobre barreiras essenciais",()=>{
  const audit=fs.readFileSync(path.join(root,"supabase/auditoria-permissoes-pre-ativacao.sql"),"utf8");
  for(const table of ["gi_admins","gi_requests","gi_attachments","gi_request_actions","gi_publication_queue","gi_recommendations","gi_notifications"]){
    assert.ok(audit.includes("'"+table+"'"),"Tabela ausente da auditoria: "+table);
  }
  assert.match(audit,/relrowsecurity/i);
  assert.match(audit,/has_table_privilege\('anon'/i);
  assert.match(audit,/has_table_privilege\('authenticated'/i);
  assert.match(audit,/storage\.buckets/i);
  assert.match(audit,/gi_reviewer_queue_read/i);
  assert.match(audit,/pg_get_functiondef/i);
  assert.match(audit,/Sem políticas extras de leitura nas tabelas privadas/);
  assert.match(audit,/Sem políticas adicionais que mencionem bucket privado/);
  assert.match(audit,/Política privada de storage presente e restrita/);
  assert.match(audit,/gi_private_admin_read/);
  assert.match(audit,/p\\.cmd in \\('SELECT','ALL'\\)/);

  assert.match(audit,/to_regclass/i);
  assert.match(audit,/case when passed then 'PASS' else 'FAIL' end/i);
  const executable=audit.replace(/--[^\n]*/g,"").replace(/'(?:''|[^'])*'/g,"''");
  assert.doesNotMatch(executable,/\b(create|alter|drop|insert|update|delete|grant|revoke|truncate|execute|call)\b/i,
    "Auditoria de pré-ativação não deve modificar o banco");
});
