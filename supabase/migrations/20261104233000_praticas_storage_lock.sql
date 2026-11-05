-- Protege originais registrados contra exclusão e substituição por clientes da Gestão.
-- O serviço real permanece desativado até autorização e homologação.
begin;
drop policy if exists gastroiff_praticas_manager_storage on storage.objects;
drop policy if exists gastroiff_praticas_storage_read on storage.objects;
drop policy if exists gastroiff_praticas_storage_insert on storage.objects;
drop policy if exists gastroiff_praticas_storage_delete_orphan on storage.objects;

create policy gastroiff_praticas_storage_read on storage.objects
 for select to authenticated
 using (bucket_id='gastroiff-praticas-privado' and (select public.gastroiff_is_practice_manager()));

create policy gastroiff_praticas_storage_insert on storage.objects
 for insert to authenticated
 with check (bucket_id='gastroiff-praticas-privado' and (select public.gastroiff_is_practice_manager()));

-- Remoção somente de upload órfão, para compensação de inserção de metadados falha.
-- Nunca apagar pelo cliente o conteúdo de um documento já registrado.
create policy gastroiff_praticas_storage_delete_orphan on storage.objects
 for delete to authenticated
 using (
  bucket_id='gastroiff-praticas-privado'
  and (select public.gastroiff_is_practice_manager())
  and not exists (
   select 1 from public.gastroiff_practice_documents d
   where d.storage_path = name
  )
 );
-- Não há política UPDATE para este bucket: impedir sobrescrita e renomeação.
commit;
