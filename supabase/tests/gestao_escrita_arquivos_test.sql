-- GASTROIFF | Verificações efetivas dos privilégios de escrita e storage.
-- Usa o PostgreSQL local, sem conexão com serviços institucionais.
-- Nenhuma operação de upload, escrita ou modificação de dados é realizada.
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select ok(not has_table_privilege('anon','public.gi_requests','INSERT'),
 '01. Visitante não insere ocorrências diretamente');
select ok(not has_table_privilege('authenticated','public.gi_requests','INSERT'),
 '02. Conta autenticada não insere ocorrências diretamente');
select ok(not has_table_privilege('authenticated','public.gi_requests','UPDATE'),
 '03. Conta autenticada não altera ocorrências diretamente');
select ok(not has_table_privilege('authenticated','public.gi_requests','DELETE'),
 '04. Conta autenticada não apaga ocorrências diretamente');
select ok(not has_table_privilege('authenticated','public.gi_attachments','INSERT'),
 '05. Anexos privados não aceitam gravação direta');
select ok(not has_table_privilege('authenticated','public.gi_request_actions','INSERT'),
 '06. Histórico privado não aceita gravação direta');

select is((select public from storage.buckets where id='gastroiff-private'),
 false, '07. Bucket de ocorrências não é público');
select is((select public from storage.buckets where id='gastroiff-praticas-privado'),
 false, '08. Bucket de práticas não é público');
select ok((select relrowsecurity from pg_class where oid='storage.objects'::regclass),
 '09. Storage aplica segurança por linha');

select ok(exists(
 select 1 from pg_policies
 where schemaname='storage' and tablename='objects'
   and policyname='gi_private_admin_read' and cmd='SELECT'
   and 'authenticated'=any(roles)
   and qual like '%gastroiff-private%'
   and qual like '%gi_is_admin%'
), '10. Leitura dos anexos de ocorrências exige administrador');
select ok(exists(
 select 1 from pg_policies
 where schemaname='storage' and tablename='objects'
   and policyname='gastroiff_praticas_manager_storage'
   and cmd='ALL' and 'authenticated'=any(roles)
   and qual like '%gastroiff-praticas-privado%'
   and qual like '%gastroiff_is_practice_manager%'
   and with_check like '%gastroiff_is_practice_manager%'
), '11. Bucket de práticas depende da autorização do gestor');
select ok(not exists(
 select 1 from pg_policies
 where schemaname='storage' and tablename='objects'
   and policyname in ('gi_private_admin_read','gastroiff_praticas_manager_storage')
   and 'anon'=any(roles)
), '12. Nenhuma política GASTROIFF de arquivos autoriza visitante');

select * from finish();
rollback;
