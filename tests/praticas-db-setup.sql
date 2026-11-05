-- Fixtures exclusivas do banco temporário usado pelo GitHub Actions.
create extension if not exists pgcrypto;
create role anon nologin;
create role authenticated nologin;
create schema if not exists auth;
create schema if not exists storage;
create table auth.users (id uuid primary key);
create or replace function auth.uid()
returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
create table storage.buckets (
 id text primary key,name text not null,public boolean not null default false,
 file_size_limit bigint,allowed_mime_types text[]
);
create table storage.objects (
 id uuid primary key default gen_random_uuid(),
 bucket_id text not null references storage.buckets(id),
 name text not null
);
grant usage on schema public,auth,storage to authenticated,anon;
grant execute on function auth.uid() to authenticated,anon;
grant select,insert,update,delete on storage.objects to authenticated;
