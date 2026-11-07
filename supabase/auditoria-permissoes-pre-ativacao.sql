-- GASTROIFF | Auditoria SOMENTE LEITURA das permissões reais do Supabase.
-- Executar APÓS as migrações em um projeto isolado, antes de habilitar envios.
-- Nunca inserir credenciais nem registros pessoais neste arquivo.
-- Saída: linhas PASS/FAIL. Qualquer FAIL bloqueia a ativação.
with protected_tables(name) as (
 values ('gi_admins'),('gi_requests'),('gi_attachments'),
        ('gi_request_actions'),('gi_publication_queue'),
        ('gi_recommendations'),('gi_notifications')
),
checks as (
 select
  'RLS habilitado em '||t.name as verification,
  coalesce(c.relrowsecurity,false) as passed,
  'Tabela protegida deve ter row level security habilitado' as detail
 from protected_tables t
 left join pg_namespace ns on ns.nspname='public'
 left join pg_class c on c.relnamespace=ns.oid and c.relname=t.name and c.relkind in ('r','p')
 union all
 select
  'Anon sem leitura/escrita em '||t.name,
  coalesce(not (has_table_privilege('anon',to_regclass('public.'||t.name),'SELECT')
    or has_table_privilege('anon',to_regclass('public.'||t.name),'INSERT')
    or has_table_privilege('anon',to_regclass('public.'||t.name),'UPDATE')
    or has_table_privilege('anon',to_regclass('public.'||t.name),'DELETE')),false),
  'Perfil anônimo não deve ter privilégios em tabelas privadas'
 from protected_tables t
 union all
 select
  'Autenticado sem escrita direta em '||t.name,
  coalesce(not (has_table_privilege('authenticated',to_regclass('public.'||t.name),'INSERT')
    or has_table_privilege('authenticated',to_regclass('public.'||t.name),'UPDATE')
    or has_table_privilege('authenticated',to_regclass('public.'||t.name),'DELETE')),false),
  'Escrita de dados privados só pelo serviço autorizado'
 from protected_tables t
 union all
 select
  'Bucket privado',
  coalesce((select public=false from storage.buckets where id='gastroiff-private'),false),
  'Arquivos nunca podem estar em bucket público'
 union all
 select
  'Política editorial de reviewer restrita à fila',
  exists (
   select 1 from pg_policies p
   where p.schemaname='public' and p.tablename='gi_publication_queue'
     and p.policyname='gi_reviewer_queue_read'
     and p.cmd='SELECT'
     and 'authenticated'=any(p.roles)
     and p.qual like '%gi_has_scope%'
     and p.qual like '%reviewer%'
  ),
  'O revisor tem apenas a política explícita de leitura editorial'
 union all
 select
  'Administrador de projeto sem course/reviewer',
  coalesce((
    select
      pg_get_functiondef(p.oid) like '%scope = ''project''%'
      and pg_get_functiondef(p.oid) not like '%scope IN (''project'', ''course'', ''reviewer'')%'
    from pg_proc p
    join pg_namespace ns on ns.oid=p.pronamespace
    where ns.nspname='public' and p.proname='gi_is_admin' and p.pronargs=0
  ),false),
  'gi_is_admin deve reconhecer exclusivamente project'
 union all
 select
  'Revisor não pode consultar storage privado',
  not exists (
   select 1 from pg_policies p
   where p.schemaname='storage' and p.tablename='objects'
     and p.cmd in ('SELECT','ALL')
     and (p.qual like '%gi_has_scope%' and p.qual like '%reviewer%')
  ),
  'Política privada de arquivos não pode liberar reviewer'
)
select verification,
 case when passed then 'PASS' else 'FAIL' end as result,
 detail
from checks
order by case when passed then 1 else 0 end, verification;
