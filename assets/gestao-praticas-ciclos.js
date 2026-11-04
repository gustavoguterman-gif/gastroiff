/* Planejamento local de ciclos docentes: não consulta compras nem envia notificações. */
(() => {
"use strict";
const STORAGE_KEY = "gi-planejamento-docente-v1";
const MAX_CYCLES = 100;
const fields = ["teacher","course","subject","room","start","end"];
const $ = id => document.getElementById(id);
const teacher = $("gi-teacher"), form = $("gi-cycle-form"), host = $("gi-cycles");
const notice = $("gi-form-message"), counter = $("gi-cycle-count"), exportButton = $("gi-export");
const forbidden = new Set(["daiana-costa-pereira","lygia-oliveira"]);
const faculty = Array.isArray(window.GASTROIFF_FACULTY) ? window.GASTROIFF_FACULTY : [];
const records = faculty.filter(x => x && x.id && x.name && !forbidden.has(x.id));
records.sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
for(const teacherRecord of records) {
 const option=document.createElement("option");
 option.value=teacherRecord.full || teacherRecord.name;
 option.textContent=teacherRecord.name;
 teacher.append(option);
}
if(!records.length) {
 const option=document.createElement("option");
 option.textContent="Cadastro docente indisponível";
 teacher.append(option);
}
const allowed = new Set(records.map(x=>x.full||x.name));
const courses=new Set(["Técnico em Gastronomia","Tecnólogo em Gastronomia"]);
function validDate(value) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||""))return false;
 const d=new Date(value+"T12:00:00Z");
 return Number.isFinite(d.valueOf()) && d.toISOString().slice(0,10)===value;
}
function todayString() {
 const d=new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function compareDays(first,second) {
 return Math.round((Date.parse(first+"T12:00:00Z")-Date.parse(second+"T12:00:00Z"))/86400000);
}
function validate(input) {
 if(!input||!allowed.has(input.teacher)||!courses.has(input.course))return null;
 if(typeof input.subject!=="string"||!input.subject.trim()||input.subject.length>110)return null;
 if(typeof input.room!=="string"||input.room.length>110)return null;
 if(!validDate(input.start)||!validDate(input.end)||input.end<input.start)return null;
 return {id:typeof input.id==="string"&&/^[a-z0-9-]{8,40}$/i.test(input.id)?input.id:crypto.randomUUID(),
 teacher:input.teacher,course:input.course,subject:input.subject.trim(),room:input.room.trim(),
 start:input.start,end:input.end};
}
function load() {
 try {
   const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
   if(!Array.isArray(raw))return [];
   return raw.slice(0,MAX_CYCLES).map(validate).filter(Boolean);
 } catch {return []}
}
let cycles=load();
function save() {
 try {localStorage.setItem(STORAGE_KEY,JSON.stringify(cycles));return true}
 catch {notice.textContent="Este navegador não permitiu salvar os dados. Exporte uma cópia para não perder o planejamento.";return false}
}
function dateLabel(value) {
 return value.slice(8,10)+"/"+value.slice(5,7)+"/"+value.slice(0,4);
}
function cycleState(record,today) {
 if(record.end<today)return "Ciclo encerrado";
 if(record.start<=today)return "Ciclo em andamento";
 const remaining=compareDays(record.start,today);
 if(remaining<=7)return "Início em "+remaining+" dia"+(remaining===1?"":"s")+". Confira os insumos.";
 return "Início em "+remaining+" dias";
}
function element(tag,cls,text) {
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!==undefined)el.textContent=text;
 return el;
}
function render() {
 cycles.sort((a,b)=>a.start.localeCompare(b.start));
 host.replaceChildren();
 counter.textContent=cycles.length===1?"1 ciclo registrado.":cycles.length+" ciclos registrados.";
 exportButton.disabled=cycles.length===0;
 if(!cycles.length){host.append(element("p","gi-plan-empty","Nenhum ciclo registrado neste dispositivo."));return}
 const today=todayString();
 for(const cycle of cycles) {
  const card=element("article","gi-plan-card");
  card.append(element("h3","",cycle.subject),element("p","",cycle.teacher+" · "+cycle.course));
  card.append(element("p","gi-plan-date",dateLabel(cycle.start)+" a "+dateLabel(cycle.end)));
  if(cycle.room)card.append(element("p","",cycle.room));
  card.append(element("span","gi-plan-status",cycleState(cycle,today)));
  const message=element("p","gi-plan-muted","Compras e recebimentos: sem informações institucionais integradas.");
  card.append(message);
  const button=element("button","gi-plan-remove","Remover ciclo");
  button.type="button";
  button.setAttribute("aria-label","Remover ciclo "+cycle.subject);
  button.addEventListener("click",()=>{
    cycles=cycles.filter(x=>x.id!==cycle.id);
    save();render();
    notice.textContent="Ciclo retirado deste planejamento local.";
  });
  card.append(button);
  host.append(card);
 }
}
form.addEventListener("submit",event=>{
 event.preventDefault();
 if(!form.checkValidity()) {form.reportValidity();return}
 if(cycles.length>=MAX_CYCLES){notice.textContent="Limite de 100 ciclos neste dispositivo. Exporte seu planejamento.";return}
 const input=Object.fromEntries(fields.map(key=>[key,$("gi-"+key).value]));
 const value=validate(input);
 if(!value){notice.textContent="Confira os campos e as datas. O término não pode ser anterior ao início.";return}
 if(cycles.some(x=>x.teacher===value.teacher&&x.course===value.course&&x.subject.toLocaleLowerCase("pt-BR")===value.subject.toLocaleLowerCase("pt-BR")&&x.start===value.start&&x.end===value.end)){
   notice.textContent="Esse mesmo ciclo já está no planejamento.";return;
 }
 cycles.push(value);
 save();render();
 form.reset();
 notice.textContent="Ciclo adicionado ao planejamento deste navegador. Não houve envio para o IFF.";
});
$("gi-example-clear").addEventListener("click",()=>{
 if(!cycles.length)return;
 if(!confirm("Apagar os ciclos registrados neste dispositivo? Exporte uma cópia antes se quiser guardá-los."))return;
 cycles=[];save();render();notice.textContent="Planejamento local limpo.";
});
function escapeCsv(value) {
 const text=String(value??"");
 const safe=/^[\s\uFEFF]*[=+@-]/.test(text)?"'"+text:text;
 return '"'+safe.replaceAll('"','""')+'"';
}
const importFile=$("gi-import-file"),importStatus=$("gi-import-status"),importPreview=$("gi-import-preview");
const importConfirm=$("gi-import-confirm");let pending=[];
function isDuplicate(value,list){
 return list.some(x=>x.teacher===value.teacher&&x.course===value.course&&x.subject.toLocaleLowerCase("pt-BR")===value.subject.toLocaleLowerCase("pt-BR")&&x.start===value.start&&x.end===value.end);
}
function resetImport(){
 pending=[];importConfirm.disabled=true;importPreview.hidden=true;importPreview.replaceChildren();importFile.value="";
}
importFile.addEventListener("change",async()=>{
 resetImportPreviewOnly();
 const file=importFile.files?.[0];
 if(!file)return;
 if(!/\.csv$/i.test(file.name)||file.size>window.GASTROIFF_CSV.MAX_BYTES){
   importStatus.textContent="Escolha um arquivo CSV de até 256 KB, exportado da aba Ciclos.";return;
 }
 try{
  const rows=window.GASTROIFF_CSV.parseCycles(await file.text());
  const errors=[],candidates=[];
  for(const [i,row] of rows.entries()){
    if(row.id_ciclo.startsWith("TESTE-")||row.fonte.toUpperCase().includes("DADOS FICTÍCIOS")){
      errors.push("Linha "+(i+2)+": exemplo fictício não pode ser incluído.");continue;
    }
    const value=validate({teacher:row.docente,course:row.curso,subject:row.disciplina,room:row.laboratorio,start:row.inicio,end:row.fim});
    if(!value){errors.push("Linha "+(i+2)+": docente, curso ou data não reconhecidos.");continue}
    if(isDuplicate(value,cycles)||isDuplicate(value,candidates)){
      errors.push("Linha "+(i+2)+": ciclo já registrado.");continue;
    }
    candidates.push(value);
  }
  pending=candidates;
  const heading=document.createElement("p");
  heading.textContent=candidates.length+" ciclo(s) conferido(s). "+errors.length+" registro(s) recusado(s).";
  importPreview.append(heading);
  if(errors.length){const ul=document.createElement("ul");errors.slice(0,12).forEach(x=>{const li=document.createElement("li");li.textContent=x;ul.append(li)});importPreview.append(ul)}
  importPreview.hidden=false;
  importConfirm.disabled=!candidates.length||candidates.length+cycles.length>MAX_CYCLES;
  importStatus.textContent="Prévia concluída. Nenhum ciclo foi adicionado sem sua confirmação.";
 }catch(error){importStatus.textContent="Não foi possível importar: "+(error instanceof Error?error.message:"arquivo inválido");}
});
function resetImportPreviewOnly(){pending=[];importConfirm.disabled=true;importPreview.hidden=true;importPreview.replaceChildren()}
importConfirm.addEventListener("click",()=>{
 if(!pending.length||cycles.length+pending.length>MAX_CYCLES)return;
 const fresh=pending.filter(x=>!isDuplicate(x,cycles));
 cycles.push(...fresh);
 save();render();resetImport();
 importStatus.textContent=fresh.length+" ciclo(s) adicionado(s) ao dispositivo. O Drive e o site público não foram alterados.";
});
$("gi-import-cancel").addEventListener("click",()=>{resetImport();importStatus.textContent="Prévia descartada. Nenhum ciclo foi adicionado."});
exportButton.addEventListener("click",()=>{
 if(!cycles.length)return;
 const rows=[["Docente","Curso","Disciplina","Local","Início","Término"]];
 for(const x of cycles)rows.push([x.teacher,x.course,x.subject,x.room,x.start,x.end]);
 const csv="\uFEFF"+rows.map(r=>r.map(escapeCsv).join(";")).join("\r\n")+"\r\n";
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");
 a.href=url;a.download="gastroiff-planejamento-docente.csv";
 a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 notice.textContent="Cópia do planejamento exportada. Nenhuma informação foi enviada ao site ou à coordenação.";
});
render();
})();