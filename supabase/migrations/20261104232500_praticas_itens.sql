-- Recepção estruturada de quantidades com referência a fornecedor revisado.
-- Deve ser aplicada após a migração de aprovação, somente em serviço autorizado.
begin;
create or replace function public.gastroiff_save_practice_items(
 p_cycle uuid,p_response_document uuid,p_items jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare entry jsonb; n integer:=0; v_text text; v_unit text;
declare v_requested text; v_forwarded text; v_confirmed text; v_received text;
begin
 if not public.gastroiff_is_practice_manager() then raise exception 'Acesso negado à Gestão'; end if;
 perform 1 from public.gastroiff_practice_cycles c where c.id=p_cycle
 and c.status in ('rascunho','conferencia') for update;
 if not found then raise exception 'Ciclo não editável ou inexistente'; end if;
 if not exists(select 1 from public.gastroiff_practice_documents d where
  d.id=p_response_document and d.cycle_id=p_cycle
  and d.kind='resposta_fornecedor' and d.reviewed) then
  raise exception 'Resposta de fornecedor ainda não conferida neste ciclo'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)<1 or
  jsonb_array_length(p_items)>250 then raise exception 'Quantidade de insumos inválida'; end if;
 delete from public.gastroiff_practice_items where cycle_id=p_cycle;
 for entry in select value from jsonb_array_elements(p_items) loop
  if jsonb_typeof(entry)<>'object' then raise exception 'Insumo inválido'; end if;
  v_text=trim(coalesce(entry->>'description',''));
  v_unit=trim(coalesce(entry->>'unit',''));
  v_requested=entry->>'requested';
  v_forwarded=entry->>'forwarded';
  v_confirmed=entry->>'confirmed';
  v_received=entry->>'received';
  if length(v_text) not between 2 and 180 or length(v_unit) not between 1 and 32 then
   raise exception 'Descrição ou unidade inválida'; end if;
  if v_requested is null or v_requested !~ '^[0-9]{1,8}(\.[0-9]{1,4})?$' or
     v_forwarded is null or v_forwarded !~ '^[0-9]{1,8}(\.[0-9]{1,4})?$' or
     (v_confirmed is not null and v_confirmed !~ '^[0-9]{1,8}(\.[0-9]{1,4})?$') or
     (v_received is not null and v_received !~ '^[0-9]{1,8}(\.[0-9]{1,4})?$')
  then raise exception 'Quantidade não numérica, negativa ou fora do limite'; end if;
  insert into public.gastroiff_practice_items
   (cycle_id,description,unit,requested,forwarded,confirmed,received,source_document_id,approved)
  values(p_cycle,v_text,v_unit,v_requested::numeric,v_forwarded::numeric,
   v_confirmed::numeric,v_received::numeric,p_response_document,false);
  n=n+1;
 end loop;
 return n;
end;
$$;
revoke all on function public.gastroiff_save_practice_items(uuid,uuid,jsonb) from public,anon;
grant execute on function public.gastroiff_save_practice_items(uuid,uuid,jsonb) to authenticated;
commit;
