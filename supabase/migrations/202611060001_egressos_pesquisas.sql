-- GASTROIFF: estrutura proposta para pesquisas de egressos.
-- Não executada no Supabase; testes reais de RLS são obrigatórios antes de ativar.
-- Selecionar o perfil Egresso no site NÃO concede acesso ou autentica.
create extension if not exists pgcrypto;

create table if not exists public.gi_alumni_surveys (
 id uuid primary key default gen_random_uuid(),
 course text not null check (course in ('technical','technologist')),
 title text not null,
 instrument_version integer not null default 1 check (instrument_version >= 1),
 state text not null default 'draft' check (state in ('draft','approved','open','closed','archived')),
 opened_at timestamptz,
 closed_at timestamptz,
 created_at timestamptz not null default now(),
 unique (id, course)
);

-- Uma convocação individual contém somente o hash do convite, nunca o token em claro.
-- A emissão, a validação de elegibilidade e os limites de tentativa serão feitos no backend.
create table if not exists public.gi_alumni_invitations (
 id uuid primary key default gen_random_uuid(),
 survey_id uuid not null references public.gi_alumni_surveys(id) on delete cascade,
 token_hash text not null unique check (length(token_hash) = 64),
 expires_at timestamptz not null,
 used_at timestamptz,
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);

-- Conteúdo individual: nunca disponibilizado via URL pública ou chave anon.
create table if not exists public.gi_alumni_responses (
 id uuid primary key default gen_random_uuid(),
 survey_id uuid not null references public.gi_alumni_surveys(id) on delete restrict,
 invitation_id uuid not null unique references public.gi_alumni_invitations(id) on delete restrict,
 instrument_version integer not null check (instrument_version >= 1),
 answers jsonb not null check (jsonb_typeof(answers) = 'object'),
 submitted_at timestamptz not null default now()
);

-- Só agregados aprovados poderão ser lidos pelo Observatório público.
-- Sem texto livre, contatos ou identificador de respondente.
create table if not exists public.gi_alumni_public_results (
 id uuid primary key default gen_random_uuid(),
 survey_id uuid not null references public.gi_alumni_surveys(id) on delete cascade,
 course text not null check (course in ('technical','technologist')),
 period_label text not null,
 metric_key text not null check (metric_key ~ '^[a-z][a-z0-9_]{1,79}$'),
 metric_label text not null,
 category_label text not null,
 responses_count integer not null check (responses_count >= 5),
 eligible_count integer check (eligible_count is null or eligible_count >= responses_count),
 measured_value numeric(12,3) not null check (measured_value >= 0),
 unit text not null check (unit in ('count','percent')),
 source_note text not null,
 methodology_note text not null,
 verified_at timestamptz not null,
 published_at timestamptz,
 state text not null default 'draft' check (state in ('draft','approved','published','withdrawn')),
 created_at timestamptz not null default now(),
 check (unit <> 'percent' or measured_value <= 100),
 unique(survey_id,period_label,metric_key,category_label)
);

create index if not exists gi_alumni_invitation_survey_idx on public.gi_alumni_invitations(survey_id);
create index if not exists gi_alumni_response_survey_idx on public.gi_alumni_responses(survey_id,submitted_at);
create index if not exists gi_alumni_public_results_state_idx on public.gi_alumni_public_results(state,course,published_at);

alter table public.gi_alumni_surveys enable row level security;
alter table public.gi_alumni_invitations enable row level security;
alter table public.gi_alumni_responses enable row level security;
alter table public.gi_alumni_public_results enable row level security;

revoke all on public.gi_alumni_surveys from public,anon,authenticated;
revoke all on public.gi_alumni_invitations from public,anon,authenticated;
revoke all on public.gi_alumni_responses from public,anon,authenticated;
revoke all on public.gi_alumni_public_results from public,anon,authenticated;

-- Nenhuma política de escrita ou leitura para respostas e convites.
-- O serviço protegido (service_role) deve aplicar autenticação, autorização,
-- validação de questões, consentimento e proteção contra abuso antes de gravar.
grant select on public.gi_alumni_public_results to anon,authenticated;
create policy gi_alumni_public_results_read on public.gi_alumni_public_results
 for select to anon,authenticated
 using (state = 'published' and published_at is not null and responses_count >= 5);

-- Não existem grants INSERT, UPDATE ou DELETE para visitantes ou egressos.
-- Antes de ativar, homologar RLS e a possibilidade de identificação indireta
-- por filtros e cruzamentos. O limiar de cinco é apenas salvaguarda inicial.
