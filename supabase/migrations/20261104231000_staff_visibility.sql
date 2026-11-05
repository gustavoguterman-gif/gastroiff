-- Exibição dos docentes para a Gestão, sem permitir autoatribuição de perfil.
-- Só executar em ambiente institucional autorizado após a migração inicial.
begin;
alter table public.gastroiff_practice_roles
 add column if not exists display_name text;
alter table public.gastroiff_practice_roles
 drop constraint if exists practice_role_display_name_length;
alter table public.gastroiff_practice_roles
 add constraint practice_role_display_name_length check (
   display_name is null or (length(trim(display_name)) between 2 and 140)
 );
drop policy if exists manager_read_staff_roles on public.gastroiff_practice_roles;
create policy manager_read_staff_roles on public.gastroiff_practice_roles
 for select to authenticated using ((select public.gastroiff_is_practice_manager()));
-- Cada versão documental é única dentro de um ciclo e etapa.
alter table public.gastroiff_practice_documents
 drop constraint if exists unique_cycle_document_revision;
alter table public.gastroiff_practice_documents
 add constraint unique_cycle_document_revision unique(cycle_id,kind,revision);
-- Nenhum UPDATE ou INSERT de papéis é concedido a clientes autenticados.
commit;
