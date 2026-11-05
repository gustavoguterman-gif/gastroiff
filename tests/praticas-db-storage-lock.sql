\set ON_ERROR_STOP on
-- PostgreSQL descartável com identidades fictícias, sem arquivos reais.
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
do $$
begin
 if (select count(*) from storage.objects where bucket_id='gastroiff-praticas-privado')<>1 then
  raise exception 'Gestão perdeu leitura dos arquivos privados';
 end if;
 -- Exclusão de original vinculado deve atingir zero linhas.
 delete from storage.objects
 where bucket_id='gastroiff-praticas-privado'
 and name='10000000-0000-4000-8000-000000000001/a.xlsx';
 if found then raise exception 'Original cadastrado apagado pela Gestão'; end if;
end $$;
-- A gravação prévia ao cadastro do documento continua permitida.
insert into storage.objects(bucket_id,name)
values('gastroiff-praticas-privado','teste-ciclo/arquivo-orfa-o.pdf');
do $$
begin
 update storage.objects set name='teste-ciclo/trocado.pdf'
 where bucket_id='gastroiff-praticas-privado'
 and name='teste-ciclo/arquivo-orfa-o.pdf';
 if found then raise exception 'Arquivo privado substituído via UPDATE'; end if;
 delete from storage.objects
 where bucket_id='gastroiff-praticas-privado'
 and name='teste-ciclo/arquivo-orfa-o.pdf';
 if not found then raise exception 'Limpeza de upload órfão bloqueada'; end if;
end $$;
-- Registrar outro arquivo e comprovar que nem arquivo não revisado pode desaparecer.
insert into storage.objects(bucket_id,name)
values('gastroiff-praticas-privado','10000000-0000-4000-8000-000000000002/pedido.pdf');
insert into public.gastroiff_practice_documents
(cycle_id,kind,filename,storage_path,sha256,content_type,uploaded_by)
values('10000000-0000-4000-8000-000000000002',
'recebimento_fisico','pedido.pdf','10000000-0000-4000-8000-000000000002/pedido.pdf',
repeat('a',64),'application/pdf','00000000-0000-4000-8000-000000000001');
do $$
begin
 delete from storage.objects where bucket_id='gastroiff-praticas-privado'
 and name='10000000-0000-4000-8000-000000000002/pedido.pdf';
 if found then raise exception 'Original em revisão apagado'; end if;
end $$;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000002';
do $$
begin
 if exists(select 1 from storage.objects where bucket_id='gastroiff-praticas-privado') then
  raise exception 'Docente consultou arquivos administrativos';
 end if;
 delete from storage.objects where bucket_id='gastroiff-praticas-privado';
 if found then raise exception 'Docente apagou armazenamento da Gestão'; end if;
end $$;
reset role;
\echo 'Originais registrados imutáveis no bucket, limpeza órfã autorizada e docente bloqueado.'
