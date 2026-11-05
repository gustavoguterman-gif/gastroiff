const test=require("node:test"),assert=require("node:assert/strict");
const api=require("../assets/praticas-gestao-privada.js");
const rules=require("../assets/praticas-regras.js");
const manager="00000000-0000-4000-8000-000000000001";
const teacher="00000000-0000-4000-8000-000000000002";
const cycleId="10000000-0000-4000-8000-000000000001";
function client({role="gestao",session=manager,failDocument=false,failUpload=false}={}){
 const calls={tables:[],inserts:[],uploads:[],removed:[]};
 return {
  calls,
  auth:{getUser:async()=>({data:{user:session?{id:session}:null},error:null})},
  storage:{from(bucket){
   assert.equal(bucket,api.BUCKET);
   return {
    async upload(path,file,opts){calls.uploads.push({path,file,opts});return {data:failUpload?null:{path},error:failUpload?{message:"storage fail"}:null}},
    async remove(paths){calls.removed.push(...paths);return {data:paths,error:null}}
   };
  }},
  from(table){
   calls.tables.push(table);
   const query={
    select(){return query},eq(){return query},order(){return query},limit(){return query},
    insert(payload){calls.inserts.push({table,payload});query.didInsert=true;return query},
    maybeSingle:async()=>({data:{role},error:null}),
    single:async()=>table===api.TABLES.cycles?{data:{id:cycleId,status:"rascunho",version:1},error:null}:
      {data:failDocument?null:{id:"document-id"},error:failDocument?{message:"insert fail"}:null},
    then(resolve,reject){
      const rows=table===api.TABLES.roles?[{user_id:teacher,role:"docente",display_name:"Docente Exemplo"}]:
       table===api.TABLES.docs?[{revision:2}]:table===api.TABLES.cycles?[]:[];
      return Promise.resolve({data:rows,error:null}).then(resolve,reject);
    }
   };return query;
  }
 };
}
const fields={course:"Tecnólogo em Gastronomia",subject:"Panificação",room:"Bloco G",start:"2026-11-12",end:"2026-12-18",
 weekdays:[1,3],timeStart:"08:00",timeEnd:"12:00"};
const excel={name:"insumos.xlsx",size:10,type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer};
const fakeCrypto={subtle:{digest:async()=>new Uint8Array(32).fill(10).buffer},randomUUID:()=> "f0bbabcd-1111-4444-8888-aabbccddeeff"};
test("nega Gestão a usuário sem sessão",async()=>{
 const c=client({session:null});
 await assert.rejects(api.ensureManager(c),/autenticar/);
 assert.deepEqual(c.calls.tables,[]);
});
test("nega Gestão a docente e não oferece relação de pessoas",async()=>{
 const c=client({role:"docente"});
 await assert.rejects(api.staff(c),/não autorizado/);
 assert.deepEqual(c.calls.tables,[api.TABLES.roles]);
});
test("gestor pode consultar somente docentes cadastrados",async()=>{
 const c=client();
 const people=await api.staff(c);
 assert.deepEqual(people,[{id:teacher,label:"Docente Exemplo"}]);
});
test("cadastra rascunho com identidade docente e datas válidas",async()=>{
 const c=client();
 const out=await api.createCycle(c,teacher,fields,rules);
 assert.equal(out.status,"rascunho");assert.equal(out.createdBy,manager);
 const row=c.calls.inserts.find(x=>x.table===api.TABLES.cycles).payload;
 assert.equal(row.teacher_user_id,teacher);
 assert.equal(row.subject,"Panificação");
 assert.equal(row.status,"rascunho");
 assert.equal(row.starts_on,"2026-11-12");
});
test("não permite atribuir ciclo a identidade não cadastrada",async()=>{
 await assert.rejects(api.createCycle(client(),"00000000-0000-4000-8000-000000000099",fields,rules),/não cadastrado/);
});
test("não cadastra ciclo com datas ou horários incompletos",async()=>{
 await assert.rejects(api.createCycle(client(),teacher,{...fields,timeStart:"",start:"2026-02-31"},rules),/incompletas/);
});
test("recusa extensão, MIME divergente e tamanho de arquivo",()=>{
 assert.throws(()=>api.inspectFile({...excel,name:"script.exe"}),/Formato/);
 assert.throws(()=>api.inspectFile({...excel,type:"text/html"}),/não corresponde/);
 assert.throws(()=>api.inspectFile({...excel,size:9*1024*1024}),/8 MB/);
});
test("grava arquivo privado sem aprovar nem publicá-lo",async()=>{
 const c=client();
 const out=await api.storeDocument(c,cycleId,"pedidoDocente",excel,fakeCrypto);
 assert.equal(out.revision,3);
 assert.equal(out.reviewed,false);
 assert.equal(out.sha256,"0a".repeat(32));
 assert.equal(c.calls.uploads.length,1);
 assert.equal(c.calls.uploads[0].opts.upsert,false);
 assert.match(c.calls.uploads[0].path,/^10000000.*\.xlsx$/);
 const doc=c.calls.inserts.find(x=>x.table===api.TABLES.docs).payload;
 assert.equal(doc.kind,"pedido_docente");
 assert.equal(doc.uploaded_by,manager);
 assert.equal(doc.reviewed,false);
 assert.equal(c.calls.removed.length,0);
});
test("falha de registro apaga arquivo recém-enviado",async()=>{
 const c=client({failDocument:true});
 await assert.rejects(api.storeDocument(c,cycleId,"pedidoDocente",excel,fakeCrypto),/Falha ao registrar/);
 assert.equal(c.calls.removed.length,1);
});
test("falha de upload impede criar referência de documento",async()=>{
 const c=client({failUpload:true});
 await assert.rejects(api.storeDocument(c,cycleId,"pedidoDocente",excel,fakeCrypto),/Armazenamento privado/);
 assert.equal(c.calls.inserts.length,0);
});
test("gestor não consegue enviar arquivo com estágio desconhecido",async()=>{
 await assert.rejects(api.storeDocument(client(),cycleId,"misterioso",excel,fakeCrypto),/Tipo de documento/);
});

test("somente Gestão autenticada pode baixar o documento original",async()=>{
 const calls=[];
 const makeClient=role=>({
  auth:{getUser:async()=>({data:{user:{id:manager}},error:null})},
  from:table=>{
   const query={select(){return query},eq(){return query},async single(){return {data:{id:"20000000-0000-4000-8000-000000000001",filename:"original.pdf",storage_path:"privado/original.pdf"},error:null}},async maybeSingle(){return {data:{role},error:null}}};
   return query;
  },
  storage:{from(bucket){calls.push("bucket:"+bucket);return {async download(path){calls.push("download:"+path);return {data:new Blob(["teste"]),error:null}}}}}
 });
 const id="20000000-0000-4000-8000-000000000001";
 await assert.rejects(api.downloadDocument(makeClient("docente"),id),/não autorizado/);
 assert.deepEqual(calls,[]);
 const file=await api.downloadDocument(makeClient("gestao"),id);
 assert.equal(file.filename,"original.pdf");
 assert.equal(file.blob.size,5);
 assert.deepEqual(calls,["bucket:"+api.BUCKET,"download:privado/original.pdf"]);
 await assert.rejects(api.downloadDocument(makeClient("gestao"),"id-invalido"),/Documento inválido/);
});
