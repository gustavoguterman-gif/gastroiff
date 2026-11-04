-- GASTROIFF | Estrutura inicial protegida
-- Preparação para banco Supabase/Postgres. NÃO foi executado em servidor.
-- As escritas são reservadas a serviço backend autorizado.
create extension if not exists pgcrypto;

create table if not exists public.gi_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  scope text not null default 'project' check (scope in ('project','course','reviewer')),
  created_at timestamptz not null default now()
);

create or replace function public.gi_is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.gi_admins
    where user_id = (select auth.uid()) and scope in ('project','course','reviewer')
  );
$$;

revoke all on function public.gi_is_admin() from public, anon;
grant execute on function public.gi_is_admin() to authenticated;

create table if not exists public.gi_requests (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique default ('GI-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  origin text not null check (origin in ('occurrence','suggestion','visit','project','other')),
  course text not null check (course in ('technical','technologist','both','external')),
  submitter_role text not null,
  category text not null,
  title text not null,
  description text not null,
  location text,
  observed_on date,
  impact text check (impact in ('urgent','disruptive','improvement')),
  proposed_action text,
  submitter_name text,
  submitter_email text,
  identification_consent boolean not null default false,
  status text not null default 'new' check
    (status in ('new','missing_info','review','forwarded','awaiting','completed','archived')),
  assigned_role text,
  due_at timestamptz,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gi_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.gi_requests(id) on delete cascade,
  object_path text not null unique,
  file_name text not null,
  content_type text not null,
  byte_size bigint not null check (byte_size between 1 and 12582912),
  uploaded_at timestamptz not null default now()
);

create table if not exists public.gi_request_actions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.gi_requests(id) on delete cascade,
  action_type text not null check
    (action_type in ('received','classified','asked_info','forwarded','replied','completed','reopened','archived')),
  responsible_role text,
  note text,
  evidence_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.gi_publication_queue (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check
    (content_type in ('event','opportunity','research','profile','document','project','other')),
  title text not null,
  source_url text,
  source_checked_at timestamptz,
  source_data jsonb not null default '{}'::jsonb,
  proposal_data jsonb not null default '{}'::jsonb,
  approval_state text not null default 'pending' check
    (approval_state in ('pending','needs_review','approved','rejected','published','expired')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.gi_recommendations (
  id uuid primary key default gen_random_uuid(),
  origin_type text not null check
    (origin_type in ('requests','curriculum','survey','alumni','extension','opportunities')),
  evidence_period text,
  finding text not null,
  suggested_measure text not null,
  recipient_role text,
  institutional_status text not null default 'draft' check
    (institutional_status in ('draft','submitted','under_review','approved','implemented','not_adopted','closed')),
  institutional_response text,
  forwarded_at timestamptz,
  assessed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.gi_notifications (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  category text not null,
  urgency text not null default 'digest' check (urgency in ('urgent','digest')),
  reference_type text,
  reference_id uuid,
  destination_role text not null,
  delivery_status text not null default 'pending' check
    (delivery_status in ('pending','sent','failed','suppressed')),
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists gi_requests_status_idx on public.gi_requests(status, received_at desc);
create index if not exists gi_requests_course_idx on public.gi_requests(course, received_at desc);
create index if not exists gi_actions_request_idx on public.gi_request_actions(request_id, created_at desc);
create index if not exists gi_attachments_request_idx on public.gi_attachments(request_id);
create index if not exists gi_queue_state_idx on public.gi_publication_queue(approval_state, created_at desc);
create index if not exists gi_recommendations_status_idx on public.gi_recommendations(institutional_status, created_at desc);
create index if not exists gi_notifications_status_idx on public.gi_notifications(delivery_status, created_at desc);

alter table public.gi_admins enable row level security;
alter table public.gi_requests enable row level security;
alter table public.gi_attachments enable row level security;
alter table public.gi_request_actions enable row level security;
alter table public.gi_publication_queue enable row level security;
alter table public.gi_recommendations enable row level security;
alter table public.gi_notifications enable row level security;

-- Revogar permissões que projetos existentes possam conceder por padrão.
revoke all on table public.gi_admins from anon, authenticated;
revoke all on table public.gi_requests from anon, authenticated;
revoke all on table public.gi_attachments from anon, authenticated;
revoke all on table public.gi_request_actions from anon, authenticated;
revoke all on table public.gi_publication_queue from anon, authenticated;
revoke all on table public.gi_recommendations from anon, authenticated;
revoke all on table public.gi_notifications from anon, authenticated;

-- Leitura autenticada apenas por perfis explicitamente registrados.
grant select on public.gi_requests to authenticated;
grant select on public.gi_attachments to authenticated;
grant select on public.gi_request_actions to authenticated;
grant select on public.gi_publication_queue to authenticated;
grant select on public.gi_recommendations to authenticated;
grant select on public.gi_notifications to authenticated;

create policy gi_admin_requests_read on public.gi_requests
  for select to authenticated using ((select public.gi_is_admin()));
create policy gi_admin_attachments_read on public.gi_attachments
  for select to authenticated using ((select public.gi_is_admin()));
create policy gi_admin_actions_read on public.gi_request_actions
  for select to authenticated using ((select public.gi_is_admin()));
create policy gi_admin_queue_read on public.gi_publication_queue
  for select to authenticated using ((select public.gi_is_admin()));
create policy gi_admin_recommendations_read on public.gi_recommendations
  for select to authenticated using ((select public.gi_is_admin()));
create policy gi_admin_notifications_read on public.gi_notifications
  for select to authenticated using ((select public.gi_is_admin()));

-- Arquivos privados: bucket sem leitura pública.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('gastroiff-private','gastroiff-private',false,12582912,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Objetos somente podem ser lidos pela administração autenticada.
create policy gi_private_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'gastroiff-private' and (select public.gi_is_admin()));

-- Não há políticas de gravação por usuário visitante.
-- Uploads e submissões exigirão uma função no servidor com validação, limite
-- de tamanho, proteção contra abuso e confirmação, ainda a construir.
