-- Etapa de aprovação editorial e de fornecimento. Não aplicada em produção.
-- Operações sensíveis de revisão feitas exclusivamente por funções controladas.
begin;

-- Impede que credencial comum publique ou edite dados já aprovados diretamente.
create or replace function public.gastroiff_guard_practice_cycle()
returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP='DELETE' then
   if OLD.status='aprovado' and current_user='authenticated' then raise exception 'Não é permitido excluir ciclo aprovado'; end if;
   return OLD;
 end if;
 if TG_OP='INSERT' and NEW.status<>'rascunho' then
   raise exception 'Novo ciclo deve ser rascunho';
 end if;
 if TG_OP='UPDATE' and (
   NEW.status='aprovado' and OLD.status<>'aprovado' or
   OLD.status='aprovado' and to_jsonb(NEW) is distinct from to_jsonb(OLD)
 ) then
   -- As funções de revisão usam privilégios do proprietário do banco.
   if current_user='authenticated' then
     raise exception 'Ciclo aprovado exige revisão administrativa pelo procedimento autorizado';
   end if;
 end if;
 return NEW;
end;
$$;
drop trigger if exists gastroiff_guard_cycle on public.gastroiff_practice_cycles;
create trigger gastroiff_guard_cycle before insert or update or delete on public.gastroiff_practice_cycles
for each row execute function public.gastroiff_guard_practice_cycle();

create or replace function public.gastroiff_guard_practice_documents()
returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP='DELETE' then
   if current_user='authenticated' and exists(select 1 from public.gastroiff_practice_cycles c where c.id=OLD.cycle_id and c.status='aprovado') then
    raise exception 'Documento de ciclo aprovado não pode ser apagado'; end if;
   return OLD;
 end if;
 if TG_OP='INSERT' and (NEW.reviewed or NEW.reviewed_by is not null) then
   raise exception 'Documento novo deve aguardar conferência';
 end if;
 if TG_OP='INSERT' and exists(select 1 from public.gastroiff_practice_cycles c where c.id=NEW.cycle_id and c.status='aprovado') then
    raise exception 'Ciclo aprovado não aceita novos documentos'; end if;
 if TG_OP='UPDATE' and current_user='authenticated' and
    (OLD.reviewed or NEW.reviewed is distinct from OLD.reviewed or
     NEW.reviewed_by is distinct from OLD.reviewed_by or
     NEW.reviewed_at is distinct from OLD.reviewed_at) then
   raise exception 'Conferência deve ocorrer pela função de aprovação';
 end if;
 return NEW;
end;
$$;
drop trigger if exists gastroiff_guard_document on public.gastroiff_practice_documents;
create trigger gastroiff_guard_document before insert or update or delete on public.gastroiff_practice_documents
for each row execute function public.gastroiff_guard_practice_documents();

create or replace function public.gastroiff_guard_practice_items()
returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP='DELETE' then
   if current_user='authenticated' and exists(select 1 from public.gastroiff_practice_cycles c where c.id=OLD.cycle_id and c.status='aprovado') then
     raise exception 'Insumo de ciclo aprovado não pode ser apagado'; end if;
   return OLD;
 end if;
 if TG_OP='INSERT' and NEW.approved then
   raise exception 'Insumos novos aguardam aprovação do ciclo';
 end if;
 if TG_OP='INSERT' and exists(select 1 from public.gastroiff_practice_cycles c where c.id=NEW.cycle_id and c.status='aprovado') then
  raise exception 'Ciclo aprovado não aceita novos insumos'; end if;
 if TG_OP='UPDATE' and current_user='authenticated' and
    (NEW.approved is distinct from OLD.approved or OLD.approved) then
   raise exception 'Alteração de insumos aprovados exige revisão administrativa';
 end if;
 return NEW;
end;
$$;
drop trigger if exists gastroiff_guard_item on public.gastroiff_practice_items;
create trigger gastroiff_guard_item before insert or update or delete on public.gastroiff_practice_items
for each row execute function public.gastroiff_guard_practice_items();

-- O vínculo entre item e documento deve permanecer no mesmo ciclo.
create or replace function public.gastroiff_check_item_source()
returns trigger language plpgsql set search_path='' as $$
begin
 if NEW.source_document_id is not null and not exists(
   select 1 from public.gastroiff_practice_documents d
    where d.id=NEW.source_document_id and d.cycle_id=NEW.cycle_id
 ) then raise exception 'Documento de origem não pertence a este ciclo'; end if;
 return NEW;
end;
$$;
drop trigger if exists gastroiff_item_source on public.gastroiff_practice_items;
create trigger gastroiff_item_source before insert or update on public.gastroiff_practice_items
for each row execute function public.gastroiff_check_item_source();

create or replace function public.gastroiff_review_document(p_document uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_cycle uuid;
begin
 if not public.gastroiff_is_practice_manager() then raise exception 'Acesso negado à Gestão'; end if;
 select d.cycle_id into v_cycle from public.gastroiff_practice_documents d
 where d.id=p_document for update;
 if v_cycle is null then raise exception 'Documento não localizado'; end if;
 if not exists(select 1 from public.gastroiff_practice_cycles c
  where c.id=v_cycle and c.status in ('rascunho','conferencia')) then
  raise exception 'Ciclo já aprovado ou arquivado'; end if;
 update public.gastroiff_practice_documents
  set reviewed=true,reviewed_by=auth.uid(),reviewed_at=now()
  where id=p_document and not reviewed;
end;
$$;

-- Um conjunto estruturado é homologado em lote; o cliente não aprova por SELECT.
create or replace function public.gastroiff_approve_cycle(p_cycle uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_document_count integer;
declare v_item_count integer;
declare v_unresolved integer;
begin
 if not public.gastroiff_is_practice_manager() then raise exception 'Acesso negado à Gestão'; end if;
 perform 1 from public.gastroiff_practice_cycles c where c.id=p_cycle and c.status in
 ('rascunho','conferencia') for update;
 if not found then raise exception 'Ciclo não existe ou não está em conferência'; end if;
 select count(distinct d.kind) into v_document_count from public.gastroiff_practice_documents d
 where d.cycle_id=p_cycle and d.reviewed and d.kind in
 ('cronograma','pedido_docente','pedido_fornecedor','resposta_fornecedor');
 if v_document_count<>4 then raise exception 'Quatro documentos obrigatórios ainda não conferidos'; end if;
 if exists(select 1 from public.gastroiff_practice_documents d
  where d.cycle_id=p_cycle and d.kind in
  ('cronograma','pedido_docente','pedido_fornecedor','resposta_fornecedor') and not d.reviewed)
 then raise exception 'Existem documentos ainda não revisados'; end if;
 select count(*),count(*) filter (where
   forwarded is null or confirmed is null or source_document_id is null)
 into v_item_count,v_unresolved from public.gastroiff_practice_items
 where cycle_id=p_cycle;
 if v_item_count=0 then raise exception 'Nenhum insumo estruturado'; end if;
 if v_unresolved>0 then raise exception 'Insumos com resposta ou documento de origem pendente'; end if;
 if exists(
  select 1 from public.gastroiff_practice_items i
  join public.gastroiff_practice_documents d on d.id=i.source_document_id
  where i.cycle_id=p_cycle and (not d.reviewed or d.kind<>'resposta_fornecedor')
 ) then raise exception 'Insumo sem resposta do fornecedor validada'; end if;
 update public.gastroiff_practice_items set approved=true where cycle_id=p_cycle;
 update public.gastroiff_practice_cycles
  set status='aprovado',approved_by=auth.uid(),approved_at=now(),
      version=version+1,updated_at=now() where id=p_cycle;
end;
$$;

revoke all on function public.gastroiff_review_document(uuid) from public,anon;
revoke all on function public.gastroiff_approve_cycle(uuid) from public,anon;
grant execute on function public.gastroiff_review_document(uuid) to authenticated;
grant execute on function public.gastroiff_approve_cycle(uuid) to authenticated;

-- Impede alterar status de aprovação por API direta; alterações de conteúdo em
-- ciclo aprovado também ficam bloqueadas pelo gatilho.
commit;
