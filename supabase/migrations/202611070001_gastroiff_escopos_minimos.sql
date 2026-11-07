-- GASTROIFF | Separação conservadora de acesso antes de ativar o banco.
-- NÃO executado em servidor. Aplicar após 202611040001_gastroiff_base.sql.
-- O papel "course" ainda não possui identificação de curso por linha;
-- portanto, permanece sem leitura de dados pessoais até que seja criada
-- e homologada uma política que limite os registros ao curso autorizado.

-- Um revisor pode examinar exclusivamente a fila editorial.
create or replace function public.gi_has_scope(allowed_scopes text[])
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.gi_admins
    where user_id = (select auth.uid())
      and scope = any(allowed_scopes)
  );
$$;

revoke all on function public.gi_has_scope(text[]) from public, anon;
grant execute on function public.gi_has_scope(text[]) to authenticated;

-- "Administrador" passa a significar apenas a responsabilidade pelo
-- projeto, e não qualquer conta de revisão ou coordenação.
create or replace function public.gi_is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.gi_admins
    where user_id = (select auth.uid()) and scope = 'project'
  );
$$;

revoke all on function public.gi_is_admin() from public, anon;
grant execute on function public.gi_is_admin() to authenticated;

-- A política original gi_admin_queue_read agora permite apenas project
-- porque gi_is_admin foi restringida. Uma política separada permite ao
-- perfil reviewer examinar a fila, sem acesso a solicitações, anexos,
-- respostas de pesquisa, notificações ou arquivos privados.
create policy gi_reviewer_queue_read on public.gi_publication_queue
for select to authenticated
using ((select public.gi_has_scope(array['reviewer']::text[])));

-- Não conceder leitura a scope='course' neste estágio.
-- Essa autorização depende de vínculo formal do usuário com o curso
-- e filtros por linha, não apenas da existência do perfil no cadastro.
