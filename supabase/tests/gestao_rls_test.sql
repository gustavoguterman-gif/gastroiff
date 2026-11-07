-- GASTROIFF | Prova de isolamento RLS com registros e identidades fictícios.
-- SOMENTE num Supabase local ou ambiente de testes descartável, após migrações.
-- Executar pelo Supabase CLI: supabase test db
-- O ROLLBACK final descarta os dados e as contas usados no ensaio.
begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

-- Identidades de ensaio. IDs e contatos inventados; jamais usar usuários reais.
insert into auth.users (id,email) values
 ('10000000-0000-4000-8000-000000000001','gastroiff-project@example.invalid'),
 ('10000000-0000-4000-8000-000000000002','gastroiff-reviewer@example.invalid'),
 ('10000000-0000-4000-8000-000000000003','gastroiff-course@example.invalid'),
 ('10000000-0000-4000-8000-000000000004','gastroiff-unassigned@example.invalid');

insert into public.gi_admins (user_id,scope) values
 ('10000000-0000-4000-8000-000000000001','project'),
 ('10000000-0000-4000-8000-000000000002','reviewer'),
 ('10000000-0000-4000-8000-000000000003','course');

insert into public.gi_requests
 (id,origin,course,submitter_role,category,title,description)
 values
 ('20000000-0000-4000-8000-000000000001','occurrence','technical','Docente',
  'Ensaios','Registro inteiramente fictício','Texto criado apenas para a prova de acesso.');

insert into public.gi_publication_queue
 (id,content_type,title)
 values ('30000000-0000-4000-8000-000000000001','event','Publicação fictícia');

-- Sem identidade: a pessoa anônima não pode sequer receber SELECT.
set local role anon;
select ok(
 not has_table_privilege(current_user,'public.gi_requests','SELECT'),
 '01. Visitante anônimo não tem privilégio de ler solicitações');
select ok(
 not has_table_privilege(current_user,'public.gi_publication_queue','SELECT'),
 '02. Visitante anônimo não tem privilégio de ler fila editorial');
reset role;

-- Administrador do projeto: leitura permitida dos dois registros fictícios.
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select is((select count(*)::integer from public.gi_requests
 where id='20000000-0000-4000-8000-000000000001'),1,
 '03. Administrador consulta solicitação');
select is((select count(*)::integer from public.gi_publication_queue
 where id='30000000-0000-4000-8000-000000000001'),1,
 '04. Administrador consulta fila editorial');

-- Revisor: pode consultar fila editorial, não os dados de ocorrências.
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select is((select count(*)::integer from public.gi_publication_queue
 where id='30000000-0000-4000-8000-000000000001'),1,
 '05. Revisor consulta fila editorial');
select is((select count(*)::integer from public.gi_requests
 where id='20000000-0000-4000-8000-000000000001'),0,
 '06. Revisor não consulta solicitação');

-- Coordenação: sem filtro por curso homologado, leitura fica negada.
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select is((select count(*)::integer from public.gi_requests
 where id='20000000-0000-4000-8000-000000000001'),0,
 '07. Coordenação não consulta solicitação sem filtro por curso');
select is((select count(*)::integer from public.gi_publication_queue
 where id='30000000-0000-4000-8000-000000000001'),0,
 '08. Coordenação não consulta fila editorial');

-- Conta válida sem papel: nenhum acesso às linhas privadas.
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
select is((select count(*)::integer from public.gi_requests
 where id='20000000-0000-4000-8000-000000000001'),0,
 '09. Conta sem função não consulta solicitação');
select is((select count(*)::integer from public.gi_publication_queue
 where id='30000000-0000-4000-8000-000000000001'),0,
 '10. Conta sem função não consulta fila editorial');

select * from finish();
rollback;
