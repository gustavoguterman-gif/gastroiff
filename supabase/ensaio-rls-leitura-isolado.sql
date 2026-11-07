-- GASTROIFF | Ensaio de acesso NEGATIVO sem alterar dados.
-- Rodar SOMENTE em projeto Supabase isolado com as migrações aplicadas.
-- Execute cada bloco separadamente no SQL Editor com conta administrativa
-- ou no psql autorizado. Não rodar em um projeto com dados institucionais.
-- Esperado: todos os testes retornam PASS.
-- As transações são READ ONLY e não criam contas ou registros.

-- 1. Visitante anônimo: nenhuma tabela privada pode conceder privilégios.
begin transaction read only;
set local role anon;
with nomes(nome) as (
 values ('gi_admins'),('gi_requests'),('gi_attachments'),
 ('gi_request_actions'),('gi_publication_queue'),
 ('gi_recommendations'),('gi_notifications')
)
select nome,
 case when coalesce(
   has_table_privilege(current_user,to_regclass('public.'||nome),
     'SELECT,INSERT,UPDATE,DELETE'),true
 ) then 'FAIL' else 'PASS' end as resultado
from nomes;
rollback;

-- 2. Conta autenticada sem identidade/JWT: funções de escopo devem negar.
begin transaction read only;
set local role authenticated;
select 'Sem identidade autenticada no contexto' as verificacao,
 case when auth.uid() is null then 'PASS' else 'FAIL' end as resultado
union all
select 'Administrador não autorizado',
 case when public.gi_is_admin() then 'FAIL' else 'PASS' end
union all
select 'Sem papel de revisor',
 case when public.gi_has_scope(array['reviewer']::text[]) then 'FAIL' else 'PASS' end;
rollback;

-- 3. Conta autenticada sem identidade/JWT: nenhuma linha privada legível.
-- Mesmo que existam registros fictícios no banco isolado, o resultado é zero.
begin transaction read only;
set local role authenticated;
select 'gi_requests' as tabela, count(*) as linhas_visiveis from public.gi_requests
union all select 'gi_attachments',count(*) from public.gi_attachments
union all select 'gi_request_actions',count(*) from public.gi_request_actions
union all select 'gi_publication_queue',count(*) from public.gi_publication_queue
union all select 'gi_recommendations',count(*) from public.gi_recommendations
union all select 'gi_notifications',count(*) from public.gi_notifications;
rollback;

-- OBSERVAÇÃO: isto NÃO prova isolamento entre project, reviewer e course
-- quando há JWT com identidade. A homologação final exige pelo menos
-- três contas fictícias reais criadas em auth.users, registros de teste,
-- resultados permitidos/negados por perfil e auditoria de storage.
