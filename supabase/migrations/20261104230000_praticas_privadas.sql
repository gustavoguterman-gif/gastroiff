-- GASTROIFF: estrutura privada das disciplinas práticas.
-- Este arquivo é uma migração NÃO APLICADA: a implantação depende de projeto
-- Supabase autorizado, autenticação e conferência de custódia institucional.
begin;

-- Associação de identidade é feita exclusivamente por administrador do banco.
-- Clientes autenticados não podem criar ou alterar seu próprio papel.
create table if not exists public.gastroiff_practice_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('gestao','docente')),
  created_at timestamptz not null default now()
);

alter table public.gastroiff_practice_roles enable row level security;
revoke all on public.gastroiff_practice_roles from anon, authenticated;
grant select on public.gastroiff_practice_roles to authenticated;
drop policy if exists "roles_read_own" on public.gastroiff_practice_roles;
create policy "roles_read_own" on public.gastroiff_practice_roles
 for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.gastroiff_is_practice_manager()
returns boolean language sql stable security definer
set search_path = '' as $$
 select exists(select 1 from public.gastroiff_practice_roles r
               where r.user_id = (select auth.uid()) and r.role = 'gestao');
$$;
revoke all on function public.gastroiff_is_practice_manager() from public, anon;
grant execute on function public.gastroiff_is_practice_manager() to authenticated;

create table if not exists public.gastroiff_practice_cycles (
  id uuid primary key default gen_random_uuid(),
  course text not null,
  subject text not null,
  teacher_user_id uuid not null references auth.users(id),
  starts_on date not null,
  ends_on date not null,
  weekdays integer[] not null,
  begins_at time not null,
  ends_at time not null,
  location text not null,
  status text not null default 'rascunho' check (status in ('rascunho','conferencia','aprovado','arquivado')),
  version integer not null default 1 check (version > 0),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_cycle_dates check (starts_on <= ends_on),
  constraint valid_cycle_hours check (begins_at < ends_at),
  constraint valid_cycle_days check (
    weekdays <@ array[0,1,2,3,4,5,6]::integer[] and cardinality(weekdays)>0
  ),
  constraint approved_cycle_has_approval check (
    status <> 'aprovado' or (approved_by is not null and approved_at is not null)
  )
);

create index if not exists practice_cycles_teacher_idx
 on public.gastroiff_practice_cycles(teacher_user_id,starts_on);

create table if not exists public.gastroiff_practice_documents (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.gastroiff_practice_cycles(id) on delete cascade,
  kind text not null check(kind in ('cronograma','pedido_docente','pedido_fornecedor','resposta_fornecedor','recebimento_fisico')),
  filename text not null,
  storage_path text not null unique,
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  content_type text not null check(content_type in (
    'application/pdf','image/jpeg','image/png','image/webp',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv')),
  revision integer not null default 1 check (revision>0),
  reviewed boolean not null default false,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  uploaded_by uuid not null references auth.users(id),
  uploaded_at timestamptz not null default now(),
  constraint reviewed_file_has_reviewer check(not reviewed or (reviewed_by is not null and reviewed_at is not null))
);
create index if not exists practice_documents_cycle_idx on public.gastroiff_practice_documents(cycle_id,kind);

create table if not exists public.gastroiff_practice_items (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.gastroiff_practice_cycles(id) on delete cascade,
  description text not null,
  unit text not null,
  requested numeric(12,4) not null check(requested >= 0),
  forwarded numeric(12,4) check(forwarded >= 0),
  confirmed numeric(12,4) check(confirmed >= 0),
  received numeric(12,4) check(received >= 0),
  supplier_response_at timestamptz,
  source_document_id uuid references public.gastroiff_practice_documents(id),
  approved boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint unique_cycle_item_unit unique(cycle_id,description,unit)
);
create index if not exists practice_items_cycle_idx on public.gastroiff_practice_items(cycle_id);

create table if not exists public.gastroiff_practice_notifications (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.gastroiff_practice_cycles(id) on delete cascade,
  kind text not null default 'aviso_inicio_d7' check(kind = 'aviso_inicio_d7'),
  scheduled_on date not null,
  status text not null default 'pendente' check(status in ('pendente','aprovado','enviado','falhou','cancelado')),
  approved_by uuid references auth.users(id),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  constraint once_per_cycle_notice unique(cycle_id,kind)
);

create table if not exists public.gastroiff_practice_audit (
  id bigint generated always as identity primary key,
  cycle_id uuid references public.gastroiff_practice_cycles(id) on delete set null,
  actor_id uuid references auth.users(id),
  resource text not null,
  action text not null check (action in ('create','update','delete','approve','notify')),
  occurred_at timestamptz not null default now(),
  detail jsonb not null default '{}'::jsonb
);

-- RLS: docente consulta SOMENTE ciclos aprovados de sua própria identidade.
-- Gestor pode ler/gravar todos, mediante papel criado por administrador confiável.
do $$
declare t text;
begin
 foreach t in array array[
   'gastroiff_practice_cycles','gastroiff_practice_documents',
   'gastroiff_practice_items','gastroiff_practice_notifications']
 loop
   execute format('alter table public.%I enable row level security', t);
   execute format('revoke all on public.%I from anon, authenticated', t);
   execute format('grant select, insert, update, delete on public.%I to authenticated', t);
   execute format('drop policy if exists manager_all on public.%I', t);
   execute format('create policy manager_all on public.%I for all to authenticated using ((select public.gastroiff_is_practice_manager())) with check ((select public.gastroiff_is_practice_manager()))',t);
 end loop;
end $$;

-- Histórico apendável: consultas da Gestão, sem ALTERAR ou APAGAR eventos.
alter table public.gastroiff_practice_audit enable row level security;
revoke all on public.gastroiff_practice_audit from anon, authenticated;
grant select on public.gastroiff_practice_audit to authenticated;
drop policy if exists manager_read_audit on public.gastroiff_practice_audit;
create policy manager_read_audit on public.gastroiff_practice_audit
 for select to authenticated using ((select public.gastroiff_is_practice_manager()));

-- Cada gravação relevante recebe evento gerado pelo banco, não pelo navegador.
create or replace function public.gastroiff_write_practice_audit()
returns trigger language plpgsql security definer
set search_path = '' as $
declare v_cycle uuid;
begin
 if TG_TABLE_NAME='gastroiff_practice_cycles' then
   v_cycle:=case when TG_OP='DELETE' then OLD.id else NEW.id end;
 else
   v_cycle:=case when TG_OP='DELETE' then OLD.cycle_id else NEW.cycle_id end;
 end if;
 insert into public.gastroiff_practice_audit(cycle_id,actor_id,resource,action,detail)
 values(v_cycle,auth.uid(),TG_TABLE_NAME,
   case when TG_OP='INSERT' then 'create' when TG_OP='DELETE' then 'delete' else 'update' end,
   jsonb_build_object('operation',TG_OP,'time',now()));
 return coalesce(NEW,OLD);
end;
$;
revoke all on function public.gastroiff_write_practice_audit() from public, anon, authenticated;
drop trigger if exists audit_practice_cycle on public.gastroiff_practice_cycles;
create trigger audit_practice_cycle after insert or update on public.gastroiff_practice_cycles
 for each row execute function public.gastroiff_write_practice_audit();
drop trigger if exists audit_practice_documents on public.gastroiff_practice_documents;
create trigger audit_practice_documents after insert or update or delete on public.gastroiff_practice_documents
 for each row execute function public.gastroiff_write_practice_audit();
drop trigger if exists audit_practice_items on public.gastroiff_practice_items;
create trigger audit_practice_items after insert or update or delete on public.gastroiff_practice_items
 for each row execute function public.gastroiff_write_practice_audit();
drop trigger if exists audit_practice_notifications on public.gastroiff_practice_notifications;
create trigger audit_practice_notifications after insert or update or delete on public.gastroiff_practice_notifications
 for each row execute function public.gastroiff_write_practice_audit();

drop policy if exists teacher_read_approved_cycle on public.gastroiff_practice_cycles;
create policy teacher_read_approved_cycle on public.gastroiff_practice_cycles
 for select to authenticated using (
  teacher_user_id = (select auth.uid()) and status='aprovado'
 );

drop policy if exists teacher_read_approved_items on public.gastroiff_practice_items;
create policy teacher_read_approved_items on public.gastroiff_practice_items
 for select to authenticated using (
  approved and exists(
    select 1 from public.gastroiff_practice_cycles c
    where c.id=cycle_id and c.teacher_user_id=(select auth.uid()) and c.status='aprovado'
  )
 );

-- Não conceder ao docente leitura de anexos de fornecedor, registros de
-- auditoria, notificações ou dados ainda não aprovados.
-- O gestor acessa arquivos brutos pelo bucket privado após autenticação.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('gastroiff-praticas-privado','gastroiff-praticas-privado',false,8388608,
 array['application/pdf','image/jpeg','image/png','image/webp',
 'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv']::text[])
on conflict (id) do update set public=false,file_size_limit=8388608,allowed_mime_types=excluded.allowed_mime_types;

alter table storage.objects enable row level security;
drop policy if exists gastroiff_praticas_manager_storage on storage.objects;
create policy gastroiff_praticas_manager_storage on storage.objects
 for all to authenticated
 using (bucket_id='gastroiff-praticas-privado' and (select public.gastroiff_is_practice_manager()))
 with check (bucket_id='gastroiff-praticas-privado' and (select public.gastroiff_is_practice_manager()));

-- Nenhum papel em auth.users é criado por este script. Provisionamento de
-- gestor e docentes exige operação administrativa fora do GitHub Pages.
commit;
