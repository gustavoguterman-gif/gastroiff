const { chromium }=require("playwright");
const assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  const resp=await page.goto("http://127.0.0.1:8765/gestao.html",{waitUntil:"domcontentloaded"});
  assert.equal(resp.status(),200);
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","BEGIN:VEVENT",
   "UID:teste-duracao-unica@gastroiff","DTSTART;VALUE=DATE:20261108",
   "DTEND;VALUE=DATE:20261111","SUMMARY:Atividade de tres dias",
   "DESCRIPTION:Evento exemplo para verificar importacao",
   "LOCATION:campus Cabo Frio","URL:https://example.org/evento",
   "END:VEVENT","END:VCALENDAR",""].join("\r\n");
  await page.locator("#file").setInputFiles({name:"teste-agenda.ics",mimeType:"text/calendar",buffer:Buffer.from(ics)});
  await page.waitForTimeout(250);
  const cards=await page.locator("#items article").count();
  assert.equal(cards,1,"um único compromisso para período completo");
  const overview=await page.locator("#items").innerText();
  assert.match(overview,/2026-11-08/);
  assert.match(overview,/2026-11-10/);
  const exported=page.waitForEvent("download");
  await page.locator("#export").click();
  const download=await exported;
  const stream=await download.createReadStream();
  let txt="";for await(const chunk of stream)txt+=chunk.toString();
  const saved=JSON.parse(txt);
  assert.equal(saved.events.length,1);
  assert.equal(saved.events[0].start,"2026-11-08");
  assert.equal(saved.events[0].end,"2026-11-10");
  assert.equal(saved.publicationStatus,"RASCUNHO_NAO_PUBLICADO");
  assert.deepEqual(errors,[]);
  console.log("Calendário: evento multidiário único, datas inclusivas e exportação de rascunho aprovados");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
