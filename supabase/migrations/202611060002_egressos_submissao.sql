-- Preparação, sem implantação. Executar somente em ambiente isolado após revisão.
-- Uma submissão e o consumo de seu convite acontecem na mesma transação.
-- Executada exclusivamente pelo papel service_role, nunca pelo navegador.
create or replace function public.gi_submit_alumni_answer(
 p_survey_id uuid,
 p_token_hash text,
 p_instrument_version integer,
 p_answers jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
 v_invitation_id uuid;
begin
 if (select auth.role()) is distinct from 'service_role' then
   raise exception 'not authorized' using errcode = '42501';
 end if;
 if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$'
   or p_answers is null or jsonb_typeof(p_answers) <> 'object'
   or pg_catalog.length(p_answers::text) > 12000 then
   raise exception 'invalid submission' using errcode = '22023';
 end if;
 if not exists (
   select 1 from public.gi_alumni_surveys s
   where s.id = p_survey_id
     and s.state = 'open'
     and s.instrument_version = p_instrument_version
     and (s.opened_at is null or s.opened_at <= pg_catalog.now())
     and (s.closed_at is null or s.closed_at > pg_catalog.now())
 ) then
   return false;
 end if;

 -- Bloqueia o convite enquanto valida expiração, revogação e uso anterior.
 select i.id into v_invitation_id
 from public.gi_alumni_invitations i
 where i.survey_id = p_survey_id
   and i.token_hash = p_token_hash
   and i.used_at is null
   and i.revoked_at is null
   and i.expires_at > pg_catalog.now()
 for update;
 if v_invitation_id is null then return false; end if;

 insert into public.gi_alumni_responses
   (survey_id, invitation_id, instrument_version, answers)
 values (p_survey_id, v_invitation_id, p_instrument_version, p_answers);
 update public.gi_alumni_invitations
 set used_at = pg_catalog.now()
 where id = v_invitation_id and used_at is null;
 return true;
end;
$$;
revoke all on function public.gi_submit_alumni_answer(uuid,text,integer,jsonb)
 from public, anon, authenticated;
grant execute on function public.gi_submit_alumni_answer(uuid,text,integer,jsonb)
 to service_role;
