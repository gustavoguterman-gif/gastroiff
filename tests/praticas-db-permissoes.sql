-- Testes de acesso no banco PostgreSQL isolado do CI.
\set ON_ERROR_STOP on
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000001'), -- gestão
 ('00000000-0000-4000-8000-000000000002'), -- docente do ciclo
 ('00000000-0000-4000-8000-000000000003'); -- outro docente
insert into public.gastroiff_practice_roles(user_id,role,display_name) values
 ('00000000-0000-4000-8000-000000000001','gestao','Coordenação de Gestão'),
 ('00000000-0000-4000-8000-000000000002','docente','Docente A'),
 ('00000000-0000-4000-8000-000000000003','docente','Docente B');

set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
insert into public.gastroiff_practice_cycles
 (id,course,subject,teacher_user_id,starts_on,ends_on,weekdays,begins_at,ends_at,location,status,approved_by,approved_at)
values
 ('10000000-0000-4000-8000-000000000001','Tecnólogo','Confeitaria','00000000-0000-4000-8000-000000000002',
  '2026-11-10','2026-12-10',array[1,2,3],'08:00','12:00','Bloco G','aprovado','00000000-0000-4000-8000-000000000001',now()),
 ('10000000-0000-4000-8000-000000000002','Tecnólogo','Panificação','00000000-0000-4000-8000-000000000003',
  '2026-11-10','2026-12-10',array[1,2,3],'13:00','17:00','Bloco G','rascunho',null,null);
insert into public.gastroiff_practice_items(cycle_id,description,unit,requested,confirmed,approved)
values
 ('10000000-0000-4000-8000-000000000001','Farinha','kg',10,6,true),
 ('10000000-0000-4000-8000-000000000002','Ovos','un',20,20,true);
insert into public.gastroiff_practice_notifications(cycle_id,scheduled_on,status)
values ('10000000-0000-4000-8000-000000000001','2026-11-03','pendente');
insert into public.gastroiff_practice_documents
 (cycle_id,kind,filename,storage_path,sha256,content_type,uploaded_by)
values
 ('10000000-0000-4000-8000-000000000001','pedido_docente','exemplo.xlsx','10000000-0000-4000-8000-000000000001/a.xlsx',
 repeat('a',64),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 '00000000-0000-4000-8000-000000000001');
insert into storage.objects(bucket_id,name) values
 ('gastroiff-praticas-privado','10000000-0000-4000-8000-000000000001/a.xlsx');
do $$
begin
 if (select count(*) from public.gastroiff_practice_roles)<>3 then
   raise exception 'gestor não consegue localizar identidades docentes cadastradas';
 end if;
 if (select count(*) from public.gastroiff_practice_cycles)<>2 then
   raise exception 'gestor não visualiza ciclos vinculados';
 end if;
 if (select count(*) from public.gastroiff_practice_notifications)<>1 then
   raise exception 'Gestão não visualiza notificações administrativas';
 end if;
 if (select count(*) from public.gastroiff_practice_audit)<4 then
   raise exception 'histórico de alterações não foi registrado automaticamente';
 end if;
end $$;

-- Não permitir que o próprio gestor altere ou apague o histórico.
do $$
begin
 begin
   delete from public.gastroiff_practice_audit;
   raise exception 'gestor conseguiu apagar histórico!';
 exception when insufficient_privilege then null;
 end;
end $$;

set request.jwt.claim.sub='00000000-0000-4000-8000-000000000002';
do $$
begin
 if (select count(*) from public.gastroiff_practice_roles)<>1 then
   raise exception 'docente consegue listar outras identidades';
 end if;
 if (select count(*) from public.gastroiff_practice_cycles)<>1 then
   raise exception 'docente teve acesso a ciclo de outro ou não recebeu próprio ciclo aprovado';
 end if;
 if (select count(*) from public.gastroiff_practice_items)<>1 then
   raise exception 'docente recebeu insumos não autorizados';
 end if;
 if (select count(*) from public.gastroiff_practice_documents)<>0 then
   raise exception 'documentos administrativos expostos para docente';
 end if;
 if (select count(*) from storage.objects)<>0 then
   raise exception 'arquivos privados acessíveis a docente';
 end if;
 if (select count(*) from public.gastroiff_practice_audit)<>0 then
   raise exception 'histórico administrativo exposto a docente';
 end if;
 if (select count(*) from public.gastroiff_practice_notifications)<>0 then
   raise exception 'notificação administrativa exposta a docente';
 end if;
 begin
  update public.gastroiff_practice_roles set role='gestao';
  raise exception 'docente conseguiu promover seu próprio perfil';
 exception when insufficient_privilege then null;
 end;
 update public.gastroiff_practice_items set confirmed=100;
 if found then raise exception 'docente alterou quantidade'; end if;
end $$;

-- Outro docente não pode consultar ciclo ainda não aprovado nem dados de colegas.
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000003';
do $$
begin
 if (select count(*) from public.gastroiff_practice_cycles)<>0 then
   raise exception 'docente visualiza rascunho ou outro ciclo';
 end if;
 if (select count(*) from public.gastroiff_practice_items)<>0 then
   raise exception 'docente visualiza insumos de outra disciplina';
 end if;
 if (select count(*) from public.gastroiff_practice_notifications)<>0 then
   raise exception 'outro docente visualiza notificação administrativa';
 end if;
end $$;

set role anon;
do $$
begin
 begin
   perform 1 from public.gastroiff_practice_cycles;
   raise exception 'anon conseguiu consultar ciclo privado';
 exception when insufficient_privilege then null;
 end;
end $$;

reset role;
\echo 'Permissões da Gestão, docentes, visitante e trilha de auditoria verificadas.'

-- Ensaios de perda de sessão e tentativas de escrita no bucket privado.
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000002';
do $$
begin
 begin
  insert into storage.objects(bucket_id,name)
  values('gastroiff-praticas-privado','tentativa-docente.pdf');
  raise exception 'Docente criou arquivo em armazenamento restrito';
 exception when insufficient_privilege or check_violation then null;
 end;
 begin
  delete from storage.objects where bucket_id='gastroiff-praticas-privado';
  if found then raise exception 'Docente apagou arquivo administrativo'; end if;
 end;
end $$;

-- Um usuário que perdeu o JWT não pode reaproveitar o papel autenticado.
reset request.jwt.claim.sub;
do $$
begin
 if (select count(*) from public.gastroiff_practice_cycles)<>0 then
  raise exception 'Consulta de ciclos permitida sem identidade';
 end if;
 if (select count(*) from storage.objects where bucket_id='gastroiff-praticas-privado')<>0 then
  raise exception 'Consulta do bucket permitida sem identidade';
 end if;
 if (select count(*) from public.gastroiff_practice_roles)<>0 then
  raise exception 'Lista de papéis visível sem identidade';
 end if;
end $$;
reset role;
\echo 'Tentativas de escrita, perda de sessão e bloqueios do armazenamento validados.'
