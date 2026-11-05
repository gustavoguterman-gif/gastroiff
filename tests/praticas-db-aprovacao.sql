\set ON_ERROR_STOP on
-- Executado após as permissões da fase anterior. Todas as pessoas são fictícias.
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
-- A disciplina Panificação ainda está em rascunho.
do $$
begin
 begin
  update public.gastroiff_practice_cycles set status='aprovado',
  approved_by=auth.uid(),approved_at=now()
  where id='10000000-0000-4000-8000-000000000002';
  raise exception 'Aprovação direta de ciclo indevidamente permitida';
 exception when raise_exception then
  if sqlerrm='Aprovação direta de ciclo indevidamente permitida' then raise; end if;
 end;
end $$;

-- Documento e itens novos não podem nascer com status aprovado.
do $$
begin
 begin
  insert into public.gastroiff_practice_items(cycle_id,description,unit,requested,forwarded,confirmed,approved)
  values('10000000-0000-4000-8000-000000000002','Tentativa','kg',5,5,5,true);
  raise exception 'Insumo nasceu aprovado sem revisão';
 exception when raise_exception then
  if sqlerrm='Insumo nasceu aprovado sem revisão' then raise; end if;
 end;
end $$;

-- Documentos da disciplina em rascunho, com identificação por fase.
insert into public.gastroiff_practice_documents
(id,cycle_id,kind,filename,storage_path,sha256,content_type,uploaded_by)
values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',
 'cronograma','horarios.pdf','ciclo-2/horarios.pdf',repeat('a',64),'application/pdf',auth.uid()),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',
 'pedido_docente','pedido.xlsx','ciclo-2/pedido.xlsx',repeat('b',64),
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',auth.uid()),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002',
 'pedido_fornecedor','fornecedor.pdf','ciclo-2/fornecedor.pdf',repeat('c',64),'application/pdf',auth.uid()),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002',
 'resposta_fornecedor','resposta.xlsx','ciclo-2/resposta.xlsx',repeat('d',64),
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',auth.uid());

-- A aprovação com documentos não conferidos e sem insumos falha.
do $$
begin
 begin
  perform public.gastroiff_approve_cycle('10000000-0000-4000-8000-000000000002');
  raise exception 'Ciclo aprovado antes da conferência';
 exception when raise_exception then
  if sqlerrm='Ciclo aprovado antes da conferência' then raise; end if;
 end;
end $$;
do $$
begin
 begin
  update public.gastroiff_practice_documents set reviewed=true
  where id='20000000-0000-4000-8000-000000000001';
  raise exception 'Revisão direta do documento permitida';
 exception when raise_exception then
  if sqlerrm='Revisão direta do documento permitida' then raise; end if;
 end;
end $$;

-- Aprovação individual dos quatro arquivos pela função administrativa.
select public.gastroiff_review_document('20000000-0000-4000-8000-000000000001');
select public.gastroiff_review_document('20000000-0000-4000-8000-000000000002');
select public.gastroiff_review_document('20000000-0000-4000-8000-000000000003');
select public.gastroiff_review_document('20000000-0000-4000-8000-000000000004');
do $$
begin
 if (select count(*) from public.gastroiff_practice_documents
  where cycle_id='10000000-0000-4000-8000-000000000002'
  and reviewed and reviewed_by=auth.uid() and reviewed_at is not null)<>4
 then raise exception 'Documentos não têm revisor e data'; end if;
end $$;

-- Mesmo documentos revisados não bastam sem quantidades de fornecimento.
do $$
begin
 begin
  perform public.gastroiff_approve_cycle('10000000-0000-4000-8000-000000000002');
  raise exception 'Ciclo aprovado sem insumos estruturados';
 exception when raise_exception then
  if sqlerrm='Ciclo aprovado sem insumos estruturados' then raise; end if;
 end;
end $$;
insert into public.gastroiff_practice_items
 (cycle_id,description,unit,requested,forwarded,confirmed,source_document_id)
values('10000000-0000-4000-8000-000000000002','Farinha integral','kg',10,10,null,
 '20000000-0000-4000-8000-000000000004');
do $$
begin
 begin
  perform public.gastroiff_approve_cycle('10000000-0000-4000-8000-000000000002');
  raise exception 'Ciclo aprovado com fornecedor sem resposta';
 exception when raise_exception then
  if sqlerrm='Ciclo aprovado com fornecedor sem resposta' then raise; end if;
 end;
end $$;

update public.gastroiff_practice_items set confirmed=6 where
 cycle_id='10000000-0000-4000-8000-000000000002';
select public.gastroiff_approve_cycle('10000000-0000-4000-8000-000000000002');
do $$
begin
 if not exists(select 1 from public.gastroiff_practice_cycles
  where id='10000000-0000-4000-8000-000000000002' and status='aprovado'
  and approved_by=auth.uid() and approved_at is not null) then
   raise exception 'Homologação administrativa não publicada'; end if;
 if not exists(select 1 from public.gastroiff_practice_items
  where cycle_id='10000000-0000-4000-8000-000000000002' and approved and confirmed=6)
 then raise exception 'Insumos não foram homologados em transação'; end if;
end $$;

-- Após homologação não se pode sobrescrever dados nem excluir o histórico.
do $$
begin
 begin
  update public.gastroiff_practice_items set confirmed=10
   where cycle_id='10000000-0000-4000-8000-000000000002';
  raise exception 'Item homologado alterado diretamente';
 exception when raise_exception then
  if sqlerrm='Item homologado alterado diretamente' then raise; end if;
 end;
 begin
  delete from public.gastroiff_practice_items where
   cycle_id='10000000-0000-4000-8000-000000000002';
  raise exception 'Item homologado apagado';
 exception when raise_exception then
  if sqlerrm='Item homologado apagado' then raise; end if;
 end;
 begin
  delete from public.gastroiff_practice_cycles where
   id='10000000-0000-4000-8000-000000000002';
  raise exception 'Ciclo aprovado apagado';
 exception when raise_exception then
  if sqlerrm='Ciclo aprovado apagado' then raise; end if;
 end;
end $$;

-- O(a) docente responsável agora consulta apenas o ciclo aprovado.
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000003';
do $$
begin
 if not exists(select 1 from public.gastroiff_practice_cycles where
 id='10000000-0000-4000-8000-000000000002')
 then raise exception 'Docente não recebeu ciclo homologado';end if;
 if not exists(select 1 from public.gastroiff_practice_items where
 cycle_id='10000000-0000-4000-8000-000000000002' and approved)
 then raise exception 'Docente não recebeu insumos aprovados';end if;
 begin
  perform public.gastroiff_review_document('20000000-0000-4000-8000-000000000004');
  raise exception 'Docente revisou documento administrativo';
 exception when raise_exception then
  if sqlerrm='Docente revisou documento administrativo' then raise; end if;
 end;
end $$;
reset role;
\echo 'Revisão, liberação atômica, bloqueios e consulta docente comprovados.'
